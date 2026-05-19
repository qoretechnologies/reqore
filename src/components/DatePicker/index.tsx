import {
  getLocalTimeZone,
  isSameDay,
  Time,
  toCalendarDateTime,
  toZoned,
  ZonedDateTime,
} from '@internationalized/date';
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Calendar,
  CalendarCell,
  CalendarGrid,
  DateInput,
  DatePickerProps,
  DateSegment,
  I18nProvider,
  DatePicker as RADatePicker,
  TimeField,
} from 'react-aria-components';
import styled from 'styled-components';
import { ReqoreErrorBoundary, ReqorePanel, ReqorePopover } from '../..';
import { changeLightness } from '../../helpers/colors';
import { formatDateToType, TDateFormat, toDate } from '../../helpers/dates';
import { useComponentTooltip } from '../../hooks/useComponentTooltip';
import { useReqoreTheme } from '../../hooks/useTheme';
import { DisabledElement } from '../../styles';
import {
  IReqoreComponent,
  IReqoreIntent,
  IWithReqoreCustomTheme,
  IWithReqoreFlat,
  IWithReqoreFluid,
  IWithReqoreMinimal,
  IWithReqoreSize,
  IWithReqoreTooltip,
} from '../../types/global';
import ReqoreButton, { IReqoreButtonProps } from '../Button';
import ReqoreControlGroup from '../ControlGroup';
import { IReqoreTextEffectProps } from '../Effect';
import ReqoreInput from '../Input';
import { IReqorePanelProps } from '../Panel';
import { IPopoverControls, IReqorePopoverProps } from '../Popover';
import { YearMonthDropdowns } from './MonthYearDropdowns';

export type TDateValue = string | Date | null;
export interface IDatePickerProps<T extends TDateValue>
  extends Omit<
      DatePickerProps<ZonedDateTime>,
      'value' | 'onChange' | 'defaultValue' | 'minValue' | 'maxValue'
    >,
    IWithReqoreSize,
    IWithReqoreTooltip,
    IWithReqoreFlat,
    IWithReqoreMinimal,
    IWithReqoreFluid,
    IWithReqoreCustomTheme,
    IReqoreIntent,
    IReqoreComponent {
  value: T;
  onChange(value: T): void;

  dateType?: TDateFormat;

  rounded?: boolean;
  pill?: boolean;
  isClearable?: boolean;
  onClearClick?(): void;

  closeOnSelect?: boolean;

  popoverProps?: Partial<IReqorePopoverProps>;
  inputProps?: IReqoreTextEffectProps;
  timeInputProps?: IReqoreTextEffectProps;
  pickerProps?: IReqorePanelProps;
  calendarProps?: React.ComponentProps<typeof Calendar>;
  timeFieldProps?: React.ComponentProps<typeof TimeField<Time>>;
  pickerDayProps?: IReqoreButtonProps;
  pickerActiveDayProps?: IReqoreButtonProps;
  yearMonthPickerProps?: IReqoreButtonProps;

  minValue?: TDateValue;
  maxValue?: TDateValue;
  readOnlyInputOnTouch?: boolean;
  /** BCP 47 locale string (e.g. 'cs', 'en-US') used to format dates.
   * Defaults to the first non-English entry in navigator.languages, falling
   * back to navigator.language. Pass explicitly to override. */
  locale?: string;
  /** When true, renders a button trigger instead of a text input.
   *  The date can only be selected via the calendar popover — no manual typing. */
  selectOnly?: boolean;
  /** Placeholder text shown on the button trigger when there is no value.
   *  Only used when `selectOnly` is true. */
  placeholder?: string;
  /** Props for the button trigger. Only used when `selectOnly` is true. */
  buttonProps?: IReqoreButtonProps;
}

const StyledRADatePicker: typeof RADatePicker = styled(RADatePicker)`
  &[data-fluid='false'] {
    min-width: 220px;
    width: fit-content;
  }
`;
const StyledDateSegment: typeof DateSegment = styled(DateSegment)`
  padding: 2px;

  &:focus {
    background-color: ${(props) => changeLightness(props.theme.main, 0.1)};
    outline: none;
    border-radius: 4px;
  }
`;
const StyledDateInput: typeof DateInput = styled(DateInput)`
  display: inline-flex;
  align-items: center;
`;
const StyledCalendarGrid = styled(CalendarGrid)`
  width: 100%;
`;
const StyledTimeField: typeof TimeField = styled(TimeField)`
  display: flex;
  flex: 1 auto;
`;
const StyledCalendarCell: typeof CalendarCell = styled(CalendarCell)`
  &[data-disabled='true']:not([data-selected='true']) {
    ${DisabledElement}
  }
  &:focus {
    outline: none;
  }
`;

interface ITriggerPopoverProps extends Partial<IReqoreButtonProps> {
  buttonProps?: IReqoreButtonProps;
  label?: React.HTMLAttributes<HTMLButtonElement>['children'];
  closeOnOutsideClick: boolean;
  passPopoverData: (data: IPopoverControls) => void;
  onToggleChange?: (isOpen: boolean) => void;
  popoverProps?: Partial<IReqorePopoverProps>;
  calendarContent: JSX.Element | string;
}

const TriggerPopover = ({
  buttonProps,
  label,
  closeOnOutsideClick,
  passPopoverData,
  onToggleChange,
  popoverProps,
  calendarContent,
  // The rest are injected by ReqoreControlGroup (style, rounded, size, etc.)
  // and forwarded into componentProps so they reach the inner ReqoreButton.
  ...controlGroupProps
}: ITriggerPopoverProps) => (
  <ReqorePopover
    component={ReqoreButton}
    componentProps={{
      icon: 'CalendarLine',
      ...buttonProps,
      ...controlGroupProps,
      label,
    }}
    closeOnOutsideClick={closeOnOutsideClick}
    closeOnAnyClick={false}
    closeOnInsideClick={false}
    passPopoverData={passPopoverData}
    noWrapper
    handler='click'
    placement='auto-start'
    noArrow
    onToggleChange={onToggleChange}
    {...popoverProps}
    content={calendarContent}
  />
);

export const DatePicker = <T extends TDateValue>({
  value: _value,
  onChange,
  fluid = true,
  flat,
  rounded,
  minimal,
  size = 'normal',
  pill,
  intent,
  customTheme,
  inheritCustomTheme,
  granularity = 'minute',
  hourCycle = 24,
  hideTimeZone = true,
  shouldForceLeadingZeros = true,
  onClearClick,
  closeOnSelect = true,
  isClearable,
  tooltip,
  popoverProps,
  inputProps,
  pickerProps,
  timeInputProps,
  timeFieldProps,
  pickerActiveDayProps,
  pickerDayProps,
  yearMonthPickerProps,
  minValue,
  maxValue,
  readOnlyInputOnTouch = true,
  dateType = 'iso',
  errorBoundaryOptions,
  locale,
  selectOnly,
  placeholder,
  buttonProps,
  ...props
}: IDatePickerProps<T>) => {
  const value = useMemo(() => (_value ? toDate(_value) : null), [_value]);
  // save time in separate state because date can be cleared and equals to null
  const [time, setTime] = useState<Time>(() => {
    if (!value) return undefined;
    return new Time(
      value?.hour ?? 0,
      value?.minute ?? 0,
      value?.second ?? 0,
      value?.millisecond ?? 0
    );
  });
  const [focusedValue, setFocusedValue] = useState(value);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [hasTouchPrimaryInput, setHasTouchPrimaryInput] = useState(false);

  const ref = useRef(null);

  const theme = useReqoreTheme('main', customTheme, intent, undefined, inheritCustomTheme);
  const popoverData = useRef({} as IPopoverControls);
  // use ref to save value type since datepicker can have null values
  const isStringRef = useRef(typeof _value === 'string');

  useLayoutEffect(() => {
    if (value) {
      isStringRef.current = typeof _value === 'string';
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const updateTouchPrimaryInput = () => {
      const hasCoarsePointer = window.matchMedia?.('(pointer: coarse)').matches;
      const hasNoHover = window.matchMedia?.('(hover: none)').matches;
      const hasTouchPoints =
        typeof navigator !== 'undefined' && typeof navigator.maxTouchPoints === 'number'
          ? navigator.maxTouchPoints > 0
          : false;

      setHasTouchPrimaryInput(Boolean(hasCoarsePointer || (hasNoHover && hasTouchPoints)));
    };

    updateTouchPrimaryInput();

    const coarsePointerQuery = window.matchMedia?.('(pointer: coarse)');
    const noHoverQuery = window.matchMedia?.('(hover: none)');

    coarsePointerQuery?.addEventListener?.('change', updateTouchPrimaryInput);
    noHoverQuery?.addEventListener?.('change', updateTouchPrimaryInput);

    return () => {
      coarsePointerQuery?.removeEventListener?.('change', updateTouchPrimaryInput);
      noHoverQuery?.removeEventListener?.('change', updateTouchPrimaryInput);
    };
  }, []);

  const showTime = granularity === 'minute' || granularity === 'second' || granularity === 'hour';

  const handleDateChange = (value: ZonedDateTime, close = true) => {
    let date: Date;
    // if previous value is null apply saved time state
    if (!_value && time) {
      date = toZoned(toCalendarDateTime(value, time), getLocalTimeZone()).toDate();
    } else {
      // set date and time from changed value
      date = value ? value.toDate() : null;
      if (date) setTime(new Time(value?.hour, value?.minute, value?.second, value?.millisecond));
    }

    onChange?.((isStringRef.current ? date?.toISOString() : formatDateToType(date, dateType)) as T);
    setFocusedValue(value);

    if (closeOnSelect && !showTime && close) {
      popoverData.current?.close();
    }
  };

  const onTimeChange = (time: Time | null) => {
    if (!time) return;

    setTime(time);
    if (value) {
      const date = toZoned(toCalendarDateTime(value, time), getLocalTimeZone());
      handleDateChange?.(date);
    }
  };

  const handleClearClick = () => {
    if (value) onChange(null);
    if (time) setTime(new Time(0, 0, 0, 0));
    onClearClick?.();
  };

  const onMonthYearChange = (date) => {
    handleDateChange(date, false);
  };

  const onToggleChange = (open: boolean) => {
    // reset focused value state on popover close
    if (!open) {
      setFocusedValue(null);
    }
  };

  const handleCalendarDateChange = (date: ZonedDateTime) => {
    handleDateChange(value ? toZoned(toCalendarDateTime(date, time), getLocalTimeZone()) : date);
  };

  const { Component, props: finalProps } = useComponentTooltip<any>(
    {
      value,
      onChange: handleDateChange,
      granularity,
      tooltip,
      hideTimeZone,
      shouldForceLeadingZeros,
      hourCycle,
      'data-fluid': fluid,
      'aria-label': 'Date',
      minValue: toDate(minValue),
      maxValue: toDate(maxValue),
      ...props,
    },
    StyledRADatePicker,
    ref
  );

  const resolvedLocale =
    locale ??
    (typeof navigator !== 'undefined'
      ? navigator.languages?.find((l) => !l.startsWith('en')) ?? navigator.language
      : undefined);

  const formattedDate = useMemo(() => {
    if (!value) return undefined;
    const dateObj = value.toDate();
    const options: Intl.DateTimeFormatOptions =
      granularity === 'day'
        ? { year: 'numeric', month: 'short', day: 'numeric' }
        : { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Intl.DateTimeFormat(resolvedLocale, options).format(dateObj);
  }, [value, granularity, resolvedLocale]);

  const calendarContent = useMemo(
    () => (
      <Calendar<ZonedDateTime>
        defaultFocusedValue={value}
        onChange={handleCalendarDateChange}
        focusedValue={focusedValue}
        onFocusChange={(date) => setFocusedValue(toZoned(date, getLocalTimeZone()))}
        minValue={toDate(minValue)}
        maxValue={toDate(maxValue)}
      >
        <ReqorePanel
          responsiveActionsWrapperProps={{ fluid: false }}
          minimal
          size='small'
          responsiveTitle={false}
          intent={intent}
          label={
            <YearMonthDropdowns
              value={focusedValue}
              onValueChange={onMonthYearChange}
              setIsMonthDropdownOpen={setIsMonthDropdownOpen}
              setIsYearDropdownOpen={setIsYearDropdownOpen}
              minValue={minValue}
              maxValue={maxValue}
              intent={intent}
              customTheme={theme}
              {...yearMonthPickerProps}
            />
          }
          {...pickerProps}
          actions={[
            {
              group: [
                {
                  as: ReqoreButton,
                  props: {
                    as: Button,
                    customTheme: theme,
                    slot: 'previous',
                    icon: 'ArrowLeftFill',
                    size: 'normal',
                    compact: true,
                  },
                },
                {
                  as: ReqoreButton,
                  props: {
                    as: Button,
                    customTheme: theme,
                    slot: 'next',
                    icon: 'ArrowRightFill',
                    size: 'normal',
                    compact: true,
                  },
                },
              ],
            },
          ]}
        >
          <StyledCalendarGrid>
            {(date) => {
              const isSelected = value && isSameDay(date, value);
              return (
                <StyledCalendarCell data-selected={isSelected} date={date}>
                  <ReqoreButton
                    key={date.toString()}
                    customTheme={isSelected ? theme : { main: 'transparent' }}
                    label={date.day}
                    active={isSelected}
                    textAlign='center'
                    circle
                    minimal
                    flat
                    compact
                    {...(isSelected ? pickerActiveDayProps : pickerDayProps)}
                  />
                </StyledCalendarCell>
              );
            }}
          </StyledCalendarGrid>
          {showTime && (
            <ReqoreControlGroup fluid>
              <StyledTimeField
                value={time}
                onChange={onTimeChange}
                granularity={granularity}
                hideTimeZone={hideTimeZone}
                shouldForceLeadingZeros={shouldForceLeadingZeros}
                hourCycle={hourCycle}
                aria-label='Time'
                {...timeFieldProps}
              >
                <ReqoreInput
                  icon='TimeLine'
                  fluid
                  as={StyledDateInput}
                  flat={flat}
                  rounded={rounded}
                  minimal={minimal}
                  size={size}
                  pill={pill}
                  intent={intent}
                  theme={theme}
                  {...timeInputProps}
                >
                  {(segment) => <StyledDateSegment segment={segment} />}
                </ReqoreInput>
              </StyledTimeField>
            </ReqoreControlGroup>
          )}
        </ReqorePanel>
      </Calendar>
    ),
    [value, !isMonthDropdownOpen && !isYearDropdownOpen, focusedValue, time]
  );

  if (selectOnly) {
    const triggerProps: ITriggerPopoverProps = {
      buttonProps,
      fluid,
      size,
      intent,
      flat,
      minimal,
      pill,
      rounded,
      label: formattedDate ?? placeholder ?? buttonProps?.label,
      closeOnOutsideClick: !isMonthDropdownOpen && !isYearDropdownOpen,
      passPopoverData: (data) => (popoverData.current = data),
      onToggleChange,
      popoverProps,
      calendarContent,
    };

    return (
      <ReqoreErrorBoundary {...errorBoundaryOptions}>
        <I18nProvider locale={resolvedLocale}>
          {isClearable && value ? (
            <ReqoreControlGroup fluid={fluid} size={size} stack>
              <TriggerPopover {...triggerProps} />
              <ReqoreButton
                fixed
                icon='CloseLine'
                size={size}
                intent={intent}
                flat={flat}
                minimal={minimal}
                rounded={rounded}
                onClick={handleClearClick}
              />
            </ReqoreControlGroup>
          ) : (
            <TriggerPopover {...triggerProps} />
          )}
        </I18nProvider>
      </ReqoreErrorBoundary>
    );
  }

  return (
    <ReqoreErrorBoundary {...errorBoundaryOptions}>
      <I18nProvider locale={resolvedLocale}>
        <Component {...finalProps}>
          <ReqorePopover
            component={ReqoreInput}
            componentProps={{
              as: StyledDateInput,
              onClearClick: handleClearClick,
              fluid,
              value,
              readOnly: readOnlyInputOnTouch && hasTouchPrimaryInput,
              inputMode: readOnlyInputOnTouch && hasTouchPrimaryInput ? 'none' : undefined,
              rounded,
              size,
              pill,
              minimal,
              intent,
              flat,
              icon: 'CalendarLine',
              ...inputProps,
            }}
            closeOnOutsideClick={!isMonthDropdownOpen && !isYearDropdownOpen}
            closeOnAnyClick={false}
            closeOnInsideClick={false}
            passPopoverData={(data) => (popoverData.current = data)}
            isReqoreComponent
            noWrapper
            handler='click'
            placement='auto-start'
            noArrow
            onToggleChange={onToggleChange}
            {...popoverProps}
            content={calendarContent}
          >
            {(segment) => <StyledDateSegment segment={segment} />}
          </ReqorePopover>
        </Component>
      </I18nProvider>
    </ReqoreErrorBoundary>
  );
};
