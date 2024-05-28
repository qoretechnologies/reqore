import {
  getLocalTimeZone,
  isSameDay,
  parseAbsoluteToLocal,
  Time,
  toCalendarDateTime,
  toZoned,
  ZonedDateTime,
} from '@internationalized/date';
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Calendar,
  CalendarCell,
  CalendarGrid,
  DateInput,
  DatePickerProps,
  DateSegment,
  DatePicker as RADatePicker,
  TimeField,
} from 'react-aria-components';
import styled from 'styled-components';
import { ReqorePanel, ReqorePopover } from '../..';
import { changeLightness } from '../../helpers/colors';
import { IPopoverControls } from '../../hooks/usePopover';
import { useReqoreTheme } from '../../hooks/useTheme';
import { useTooltip } from '../../hooks/useTooltip';
import { DisabledElement } from '../../styles';
import {
  IReqoreIntent,
  IWithReqoreCustomTheme,
  IWithReqoreFlat,
  IWithReqoreFluid,
  IWithReqoreMinimal,
  IWithReqoreSize,
  IWithReqoreTooltip,
  TReqoreTooltipProp,
} from '../../types/global';
import ReqoreButton, { IReqoreButtonProps } from '../Button';
import ReqoreControlGroup from '../ControlGroup';
import ReqoreDropdown from '../Dropdown';
import { IReqoreTextEffectProps } from '../Effect';
import ReqoreInput from '../Input';
import { IReqorePanelProps } from '../Panel';
import { IReqorePopoverProps } from '../Popover';

type TDateValue = string | Date | null;
export interface IDatePickerProps<T extends TDateValue>
  extends Omit<DatePickerProps<ZonedDateTime>, 'value' | 'onChange' | 'defaultValue'>,
    IWithReqoreSize,
    IWithReqoreTooltip,
    IWithReqoreFlat,
    IWithReqoreMinimal,
    IWithReqoreFluid,
    IWithReqoreCustomTheme,
    IReqoreIntent {
  value: T;
  onChange(value: T): void;

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

const StyledTimeField: typeof TimeField = styled(TimeField)`
  display: flex;
  flex: 1 auto;
`;

// utility to convert date to ZonedDateTime because datepicker can't use Date
const toDate = (date?: Date | string) => {
  if (date) {
    return parseAbsoluteToLocal(typeof date === 'string' ? date : date.toISOString());
  }
  return undefined;
};

const StyledCalendarCell: typeof CalendarCell = styled(CalendarCell)`
  &[data-disabled='true']:not([data-selected='true']) {
    ${DisabledElement}
  }
  &:focus {
    outline: none;
  }
`;

const DatePickerTooltip = ({
  targetElement,
  tooltip,
}: {
  targetElement: HTMLElement | undefined;
  tooltip?: TReqoreTooltipProp;
}) => {
  useTooltip(targetElement, tooltip);

  return null;
};

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
  granularity = 'minute',
  hourCycle = 24,
  hideTimeZone = true,
  shouldForceLeadingZeros = true,
  onClearClick,
  closeOnSelect = true,
  tooltip,
  popoverProps,
  inputProps,
  pickerProps,
  timeInputProps,
  timeFieldProps,
  pickerActiveDayProps,
  pickerDayProps,
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

  const theme = useReqoreTheme('main', customTheme, intent);
  const popoverData = useRef({} as IPopoverControls);
  const [containerRef, setContainerRef] = useState<HTMLElement>(undefined);
  const showTime = granularity === 'minute' || granularity === 'second' || granularity === 'hour';
  // use ref to save value type since datepicker can have null values
  const isStringRef = useRef(typeof _value === 'string');
  useLayoutEffect(() => {
    if (value) isStringRef.current = typeof _value === 'string';
  });

  const handleDateChange: DatePickerProps<ZonedDateTime>['onChange'] = (value) => {
    let date: Date;
    // if previous value is null apply saved time state
    if (!_value && time) {
      date = toZoned(toCalendarDateTime(value, time), getLocalTimeZone()).toDate();
    } else {
      // set date and time from changed value
      date = value ? value.toDate() : null;
      if (date) setTime(new Time(value?.hour, value?.minute, value?.second, value?.millisecond));
    }
    onChange?.((isStringRef.current ? date?.toISOString() : date) as T);

    // if (closeOnSelect && !showTime) {
    //   popoverData.current?.close();
    // }
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

  return (
    <StyledRADatePicker
      value={value}
      onChange={handleDateChange}
      granularity={granularity}
      hideTimeZone={hideTimeZone}
      shouldForceLeadingZeros={shouldForceLeadingZeros}
      hourCycle={hourCycle}
      data-fluid={fluid}
      aria-label='Date'
      ref={(node) => setContainerRef(node)}
      {...props}
    >
      <DatePickerTooltip targetElement={containerRef} tooltip={tooltip} />
      <ReqorePopover
        component={ReqoreInput}
        componentProps={{
          as: StyledDateInput,
          onClearClick: handleClearClick,
          fluid,
          value,
          rounded,
          size,
          pill,
          minimal,
          intent,
          flat,
          icon: 'CalendarLine',
          ...inputProps,
        }}
        passPopoverData={(data) => (popoverData.current = data)}
        isReqoreComponent
        noWrapper
        handler='click'
        placement='bottom-start'
        noArrow
        {...popoverProps}
        content={
          <Calendar<ZonedDateTime> value={value} onChange={handleDateChange}>
            <ReqorePanel
              responsiveActionsWrapperProps={{ fluid: false }}
              minimal
              size='small'
              responsiveTitle={false}
              intent={intent}
              label={<MonthYear value={value} onValueChange={handleDateChange} />}
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
              <CalendarGrid style={{ width: '100%' }}>
                {(date) => {
                  const isSelected = value && isSameDay(date, value);
                  return (
                    <StyledCalendarCell
                      data-selected={isSelected}
                      date={date}
                      key={date.toString()}
                    >
                      <ReqoreButton
                        key={date.toString()}
                        customTheme={isSelected ? theme : { main: 'transparent' }}
                        label={date.day}
                        onClick={() => handleDateChange(toZoned(date, getLocalTimeZone()))}
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
              </CalendarGrid>
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
        }
      >
        {(segment) => <StyledDateSegment segment={segment} />}
      </ReqorePopover>
    </StyledRADatePicker>
  );
};

function MonthYear({
  value,
  onValueChange,
}: {
  value: ZonedDateTime;
  onValueChange(date: ZonedDateTime): void;
}) {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const currentYear = new Date().getFullYear();
  const years = new Array(currentYear - 1900 + 1).fill(null).map((_, index) => currentYear - index);
  return (
    <ReqoreControlGroup style={{ width: 'fit-content' }}>
      <ReqoreDropdown
        filterable
        compact
        caretPosition='right'
        scrollToSelected
        label={months[value.month - 1]}
        items={months.map((month, index) => ({
          value: month,
          selected: index === value.month - 1,
        }))}
        onItemSelect={(item) =>
          onValueChange(value.set({ month: months.findIndex((m) => m === item.value) + 1 }))
        }
      />
      <ReqoreDropdown
        compact
        filterable
        caretPosition='right'
        scrollToSelected
        label={value.year}
        items={years.map((year) => ({
          value: year,
          selected: year === value.year,
        }))}
        onItemSelect={(item) => {
          onValueChange(value.set({ year: item.value }));
        }}
      />
    </ReqoreControlGroup>
  );
}
