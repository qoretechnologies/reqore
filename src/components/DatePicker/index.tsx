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
import { changeLightness } from '../../helpers/colors';
import ReqoreButton, { IReqoreButtonProps } from '../Button';
import ReqoreControlGroup from '../ControlGroup';
import { IReqoreTextEffectProps } from '../Effect';
import { StyledInput } from '../Input';
import { StyledPopoverContent, StyledPopoverWrapper } from '../InternalPopover';
import { ReqoreLabel } from '../Label';
import ReqoreMessage from '../Message';

const StyledRADatePicker: typeof RADatePicker = styled(RADatePicker)`
  &[data-fluid='false'] {
    width: fit-content;
  }
  .react-aria-DateSegment {
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

  .react-aria-DateInput {
    display: flex;
    align-items: center;
    padding: 4px 2.5rem 4px 8px;
  }
  .react-aria-DateSegment {
    padding: 0 2px;
    &:focus {
      background-color: ${(props) => changeLightness(props.theme.main, 0.1)};
      outline: none;
      border-radius: 4px;
    }
  }
`;
const StyledCalendarCell: typeof CalendarCell = styled(CalendarCell)`
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
    border: 1px solid ${(props) => changeLightness(props.theme.main, 0.5)};
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

  .react-aria-DateSegment {
    padding: 0 2px;
    &:focus {
      background-color: ${(props) => changeLightness(props.theme.main, 0.2)};
      outline: none;
      border-radius: 4px;
    }
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

  inputProps?: IReqoreTextEffectProps;
  popoverTriggerProps?: IReqoreButtonProps;
  popoverProps?: React.ComponentProps<typeof Popover>;
  calendarProps?: React.ComponentProps<typeof Calendar>;
}
export const DatePicker = ({
  value: _value,
  onChange,
  fluid = true,
  flat,
  rounded,
  minimal,
  size = 'normal',
  pill,
  inputProps,
  popoverTriggerProps,
  popoverProps,
  calendarProps,
  ...props
}: IDatePickerProps) => {
  const value = useMemo(() => (_value ? toDate(_value) : null), [_value]);
  const [time, setTime] = useState<Time>(() => {
    if (!value) return undefined;
    return new Time(value?.hour, value?.minute, value?.second, value?.millisecond);
  });

  return (
    <StyledRADatePicker
      value={value}
      onChange={(value) => {
        onChange?.(value ? value.toDate(getLocalTimeZone()) : null);
        setTime(new Time(value?.hour, value.minute, value.second, value.millisecond));
      }}
      granularity='minute'
      hideTimeZone
      shouldForceLeadingZeros
      hourCycle={24}
      data-fluid={fluid}
      {...props}
    >
      <StyledInput
        fluid={fluid}
        flat={flat}
        rounded={rounded}
        minimal={minimal}
        _size={size}
        pill={pill}
        as={StyledGroup}
        {...inputProps}
      >
        <StyledDateInput>{(segment) => <StyledDateSegment segment={segment} />}</StyledDateInput>
        <ReqoreButton size='small' as={Button} icon={'Calendar2Fill'} {...popoverTriggerProps} />
      </StyledInput>
      <Popover {...popoverProps}>
        <Dialog>
          <Calendar {...calendarProps}>
            <StyledPopoverWrapper>
              <StyledPopoverContent>
                <StyledCalendarMessage>
                  <ReqoreControlGroup fluid vertical>
                    <header>
                      <ReqoreButton as={Button} slot='previous' icon='ArrowLeftFill' />
                      <Heading />
                      <ReqoreButton as={Button} slot='next' icon='ArrowRightFill' />
                    </header>
                    <CalendarGrid>{(date) => <StyledCalendarCell date={date} />}</CalendarGrid>
                    <ReqoreControlGroup vertical>
                      <div>
                        <ReqoreLabel label='Time' minimal color='transparent' />
                      </div>
                      <div>
                        <StyledTimeField
                          shouldForceLeadingZeros
                          value={time}
                          onChange={(time) => {
                            if (!time) return;
                            setTime(time);
                            onChange?.(toCalendarDateTime(value, time).toDate(getLocalTimeZone()));
                          }}
                          granularity={'minute'}
                        >
                          <StyledInput
                            fluid={fluid}
                            flat={flat}
                            rounded={rounded}
                            minimal={minimal}
                            _size={size}
                            pill={pill}
                          >
                            <StyledDateInput>
                              {(segment) => <StyledDateSegment segment={segment} />}
                            </StyledDateInput>
                          </StyledInput>
                        </StyledTimeField>
                      </div>
                    </ReqoreControlGroup>
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
