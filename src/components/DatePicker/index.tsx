import {
  getLocalTimeZone,
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
  HeadingContext,
  HeadingProps,
  DatePicker as RADatePicker,
  TimeField,
  useContextProps,
} from 'react-aria-components';
import styled from 'styled-components';
import { ReqorePanel, ReqorePopover } from '../..';
import { changeLightness } from '../../helpers/colors';
import { useReqoreTheme } from '../../hooks/useTheme';
import { useTooltip } from '../../hooks/useTooltip';
import {
  IReqoreIntent,
  IWithReqoreCustomTheme,
  IWithReqoreFlat,
  IWithReqoreFluid,
  IWithReqoreMinimal,
  IWithReqoreSize,
  IWithReqoreTooltip,
} from '../../types/global';
import ReqoreButton from '../Button';
import ReqoreControlGroup from '../ControlGroup';
import { IReqoreTextEffectProps } from '../Effect';
import ReqoreInput from '../Input';
import { IReqorePanelProps } from '../Panel';

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

  inputProps?: IReqoreTextEffectProps;
  timeInputProps?: IReqoreTextEffectProps;
  pickerProps?: IReqorePanelProps;
  calendarProps?: React.ComponentProps<typeof Calendar>;
  timeFieldProps?: React.ComponentProps<typeof TimeField<Time>>;
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
  display: flex;
  align-items: center;
`;

const StyledCalendarCell = styled(CalendarCell)`
  display: flex;
  justify-content: center;
  align-items: center;
  aspect-ratio: 1;
  border-radius: 9999px;
  transition: all 0.2s ease-out;
  font-size: 14px;
  outline: none;
  width: 32px;
  height: 32px;

  &[aria-disabled='true'] {
    opacity: 0.5;
    cursor: not-allowed;
  }
  &[data-selected='true'] {
    background-color: ${(props) => changeLightness(props.theme.main, 0.2)};
    border: 1px solid ${(props) => changeLightness(props.theme.main)};
    font-weight: bold;
    border-radius: 9999px;
  }
  &:not([aria-disabled='true']) {
    cursor: pointer;
    &:hover {
      background-color: ${(props) => changeLightness(props.theme.main, 0.2)};
    }
  }
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

const Heading = (props: HeadingProps) => {
  [props] = useContextProps(props, undefined, HeadingContext);

  return <>{props.children}</>;
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
  isClearable = true,
  onClearClick,
  tooltip,
  inputProps,
  pickerProps,
  calendarProps,
  timeInputProps,
  timeFieldProps,
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
  const [containerRef, setContainerRef] = useState<HTMLElement>(undefined);
  useTooltip(containerRef, tooltip);

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
        isReqoreComponent
        noWrapper
        handler='click'
        placement='bottom-start'
        noArrow
        content={
          <Calendar onChange={(val) => handleDateChange(val as ZonedDateTime)}>
            <ReqorePanel
              minimal
              size='small'
              responsiveTitle={false}
              intent={intent}
              label={<Heading />}
              {...pickerProps}
              actions={[
                {
                  as: ReqoreButton,
                  props: {
                    as: Button,
                    customTheme: theme,
                    slot: 'previous',
                    icon: 'ArrowLeftFill',
                  },
                },
                {
                  as: ReqoreButton,
                  props: {
                    as: Button,
                    customTheme: theme,
                    slot: 'next',
                    icon: 'ArrowRightFill',
                  },
                },
              ]}
            >
              <CalendarGrid>
                {(date) => <StyledCalendarCell theme={theme} date={date} />}
              </CalendarGrid>
              {(granularity === 'minute' || granularity === 'second' || granularity === 'hour') && (
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
