import {
  CalendarDateTime,
  getLocalTimeZone,
  Time,
  toCalendarDateTime,
} from '@internationalized/date';
import React, { useMemo, useState } from 'react';
import {
  Button,
  Calendar,
  CalendarCell,
  CalendarGrid,
  DateInput,
  DatePicker as RADatePicker,
  DatePickerProps,
  DateSegment,
  Dialog,
  Group,
  Heading,
  Popover,
  TimeField,
} from 'react-aria-components';
import styled from 'styled-components';
import { TSizes } from '../../constants/sizes';
import { IReqoreCustomTheme, TReqoreIntent } from '../../constants/theme';
import { changeLightness } from '../../helpers/colors';
import { useReqoreTheme } from '../../hooks/useTheme';
import ReqoreButton, { IReqoreButtonProps } from '../Button';
import ReqoreControlGroup from '../ControlGroup';
import { IReqoreTextEffectProps } from '../Effect';
import { StyledInput, StyledInputWrapper } from '../Input';
import ReqoreInputClearButton from '../InputClearButton';
import { StyledPopoverContent, StyledPopoverWrapper } from '../InternalPopover';
import { ReqoreLabel } from '../Label';
import ReqoreMessage from '../Message';

export interface IDatePickerProps
  extends Omit<DatePickerProps<CalendarDateTime>, 'value' | 'onChange' | 'defaultValue'> {
  value: Date;
  onChange(value: Date): void;

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

  inputProps?: IReqoreTextEffectProps;
  timeInputProps?: IReqoreTextEffectProps;
  popoverTriggerProps?: IReqoreButtonProps;
  popoverProps?: React.ComponentProps<typeof Popover>;
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

// utility to convert date to calendardatetime because datepicker can't use Date
const toDate = (date?: Date) => {
  if (date) {
    return new CalendarDateTime(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds()
    );
  }
  return undefined;
};

export const DatePicker = ({
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
  inputProps,
  popoverTriggerProps,
  popoverProps,
  calendarProps,
  timeInputProps,
  timeFieldProps,
  granularity = 'minute',
  hourCycle = 24,
  hideTimeZone = true,
  shouldForceLeadingZeros = true,
  isClearable = true,
  onClearClick,
  ...props
}: IDatePickerProps) => {
  const value = useMemo(() => (_value ? toDate(_value) : null), [_value]);
  const [time, setTime] = useState<Time>(() => {
    if (!value) return undefined;
    return new Time(value?.hour, value?.minute, value?.second, value?.millisecond);
  });
  const theme = useReqoreTheme('main', customTheme, intent);

  const onDateChange: DatePickerProps<CalendarDateTime>['onChange'] = (value) => {
    onChange?.(value ? value.toDate(getLocalTimeZone()) : null);
    setTime(new Time(value?.hour, value.minute, value.second, value.millisecond));
  };
  const onTimeChange = (time: Time | null) => {
    if (!time) return;
    setTime(time);
    onChange?.(toCalendarDateTime(value, time).toDate(getLocalTimeZone()));
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
      {...props}
    >
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
            <ReqoreInputClearButton
              customTheme={theme}
              enabled={isClearable && !props.isReadOnly && !props?.isDisabled && !!onChange}
              onClick={() => {
                onDateChange(null);
                onTimeChange(null);
                onClearClick?.();
              }}
              size={size}
              show={true}
            />
            <ReqoreButton
              customTheme={theme}
              size='small'
              as={Button}
              icon={'Calendar2Fill'}
              {...popoverTriggerProps}
            />
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
                          />
                        </div>
                        <StyledTimeField
                          value={time}
                          onChange={onTimeChange}
                          granularity={granularity}
                          hideTimeZone={hideTimeZone}
                          shouldForceLeadingZeros={shouldForceLeadingZeros}
                          hourCycle={hourCycle}
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
