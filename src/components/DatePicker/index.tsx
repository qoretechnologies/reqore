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
  Dialog,
  Group,
  Heading,
  Popover,
  DatePicker as RADatePicker,
  TimeField,
} from 'react-aria-components';
import styled from 'styled-components';
import { ReqorePanel, ReqorePopover, ReqoreTag } from '../..';
import { TSizes } from '../../constants/sizes';
import { IReqoreCustomTheme, TReqoreIntent } from '../../constants/theme';
import { changeLightness } from '../../helpers/colors';
import { useReqoreTheme } from '../../hooks/useTheme';
import { TReqoreTooltipProp } from '../../types/global';
import ReqoreButton, { IReqoreButtonProps } from '../Button';
import ReqoreControlGroup from '../ControlGroup';
import { IReqoreTextEffectProps } from '../Effect';
import ReqoreInput, { StyledInput, StyledInputWrapper } from '../Input';
import ReqoreInputClearButton from '../InputClearButton';
import { StyledPopoverContent, StyledPopoverWrapper } from '../InternalPopover';
import { IReqoreLabelProps, ReqoreLabel } from '../Label';
import ReqoreMessage from '../Message';

type TDateValue = string | Date | null;
export interface IDatePickerProps<T extends TDateValue>
  extends Omit<DatePickerProps<ZonedDateTime>, 'value' | 'onChange' | 'defaultValue'> {
  value: T;
  onChange(value: T): void;

  size?: TSizes;
  fluid?: boolean;
  rounded?: boolean;
  pill?: boolean;
  minimal?: boolean;
  flat?: boolean;
  customTheme?: IReqoreCustomTheme;
  intent?: TReqoreIntent;
  isClearable?: boolean;
  onClearClick?(): void;
  tooltip?: TReqoreTooltipProp;
  inline?: boolean;

  inputProps?: IReqoreTextEffectProps;
  timeInputProps?: IReqoreTextEffectProps;
  popoverTriggerProps?: IReqoreButtonProps;
  popoverProps?: React.ComponentProps<typeof Popover>;
  calendarProps?: React.ComponentProps<typeof Calendar>;
  timeLabelProps?: IReqoreLabelProps;
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
const StyledGroup: typeof Group = styled(Group)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-grow: 1;

  .reqore-clear-input-button {
    position: static;
  }
`;
const StyledCalendarMessage: typeof ReqoreMessage = styled(ReqoreMessage)`
  width: 300px;

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    padding-bottom: 16px;
  }
  h2 {
    font-size: 1.25rem;
    margin: 0;
  }
  .react-aria-CalendarHeaderCell {
    padding-bottom: 12px;
    font-size: 14px;
  }
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
  ${StyledInput} {
    height: auto;
  }
`;

// utility to convert date to ZonedDateTime because datepicker can't use Date
const toDate = (date?: Date | string) => {
  if (date) {
    return parseAbsoluteToLocal(typeof date === 'string' ? date : date.toISOString());
  }
  return undefined;
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
  inline,
  tooltip,
  inputProps,
  popoverTriggerProps,
  popoverProps,
  calendarProps,
  timeInputProps,
  timeFieldProps,
  timeLabelProps,
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
  //useTooltip(containerRef, tooltip);

  // use ref to save value type since datepicker can have null values
  const isStringRef = useRef(typeof _value === 'string');
  useLayoutEffect(() => {
    if (value) isStringRef.current = typeof _value === 'string';
  });

  const onDateChange: DatePickerProps<ZonedDateTime>['onChange'] = (value) => {
    console.log('value', value);
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
      onDateChange?.(date);
    }
  };
  const onClear = () => {
    if (value) onChange(null);
    if (time) setTime(new Time(0, 0, 0, 0));
    onClearClick?.();
  };

  return (
    <StyledRADatePicker
      value={value}
      onChange={onDateChange}
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
          onClearClick: onClear,
          fluid,
          value,
          rounded,
          size,
          pill,
          minimal,
          intent,
          flat,
        }}
        isReqoreComponent
        noWrapper
        handler='click'
        noArrow
        content={
          <Calendar onChange={(val) => onDateChange(val as ZonedDateTime)}>
            <ReqorePanel
              minimal
              size='small'
              responsiveTitle={false}
              intent={intent}
              label={<Heading />}
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
                <ReqoreControlGroup stack>
                  <ReqoreTag
                    customTheme={theme}
                    label='Time'
                    minimal
                    color='transparent'
                    intent={intent}
                    {...timeLabelProps}
                  />

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
                      fluid={fluid}
                      as={StyledDateInput}
                      flat={flat}
                      rounded={rounded}
                      minimal={minimal}
                      size={size}
                      pill={pill}
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
      <StyledInputWrapper fluid={fluid} rounded={rounded} _size={size} pill={pill}>
        <StyledInput
          fluid={fluid}
          flat={flat}
          rounded={rounded}
          minimal={minimal}
          _size={size}
          pill={pill}
          as={StyledGroup}
          theme={theme}
          {...inputProps}
        >
          <StyledDateInput>{(segment) => <StyledDateSegment segment={segment} />}</StyledDateInput>

          <ReqoreControlGroup gapSize='tiny'>
            {value && (
              <ReqoreInputClearButton
                customTheme={theme}
                enabled={isClearable && !props.isReadOnly && !props?.isDisabled && !!onChange}
                onClick={onClear}
                size={size}
                show={true}
              />
            )}
            {!inline && (
              <ReqoreButton
                customTheme={theme}
                size='small'
                as={Button}
                icon={'Calendar2Fill'}
                {...popoverTriggerProps}
              />
            )}
          </ReqoreControlGroup>
        </StyledInput>
      </StyledInputWrapper>

      <Popover {...popoverProps}>
        <Dialog>
          <Calendar {...calendarProps}>
            <StyledPopoverWrapper>
              <StyledPopoverContent>
                <StyledCalendarMessage>
                  <ReqoreControlGroup fluid vertical>
                    <header>
                      <ReqoreButton
                        customTheme={theme}
                        as={Button}
                        slot='previous'
                        icon='ArrowLeftFill'
                      />
                      <Heading />
                      <ReqoreButton
                        customTheme={theme}
                        as={Button}
                        slot='next'
                        icon='ArrowRightFill'
                      />
                    </header>
                    <CalendarGrid>
                      {(date) => <StyledCalendarCell theme={theme} date={date} />}
                    </CalendarGrid>
                    {(granularity === 'minute' ||
                      granularity === 'second' ||
                      granularity === 'hour') && (
                      <ReqoreControlGroup vertical>
                        <div>
                          <ReqoreLabel
                            customTheme={theme}
                            label='Time'
                            minimal
                            color='transparent'
                            intent={intent}
                            {...timeLabelProps}
                          />
                        </div>
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
                          <StyledInput
                            fluid={fluid}
                            flat={flat}
                            rounded={rounded}
                            minimal={minimal}
                            _size={size}
                            pill={pill}
                            theme={theme}
                            {...timeInputProps}
                          >
                            <StyledDateInput>
                              {(segment) => <StyledDateSegment segment={segment} />}
                            </StyledDateInput>
                          </StyledInput>
                        </StyledTimeField>
                      </ReqoreControlGroup>
                    )}
                  </ReqoreControlGroup>
                </StyledCalendarMessage>
              </StyledPopoverContent>
            </StyledPopoverWrapper>
          </Calendar>
        </Dialog>
      </Popover>
    </StyledRADatePicker>
  );
};
