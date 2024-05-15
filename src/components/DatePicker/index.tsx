import { CalendarDateTime, Time, toCalendarDateTime } from '@internationalized/date';
import { useState } from 'react';
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
import { changeLightness, getReadableColor } from '../../helpers/colors';
import ReqoreButton from '../Button';
import { StyledInput, StyledInputWrapper } from '../Input';
import { StyledPopoverContent, StyledPopoverWrapper } from '../InternalPopover';
import ReqoreMessage from '../Message';

const StyledWrapper = styled.div`
  .react-aria-DatePicker {
    color: ${(props) => getReadableColor(props.theme, undefined, undefined, true)};
    .react-aria-Group {
      display: flex;
      width: fit-content;
      align-items: center;
    }

    .react-aria-Button {
      background: ${(props) => changeLightness(props.theme.main, 0.2)};
      color: ${(props) => changeLightness(props.theme.main, 0.5)};
      border: 2px solid ${(props) => changeLightness(props.theme.main, 0.2)};
      forced-color-adjust: none;
      border-radius: 4px;
      border: none;
      margin-left: -1.929rem;
      width: 1.429rem;
      height: 1.429rem;
      padding: 0;
      font-size: 0.857rem;
      box-sizing: content-box;

      &[data-pressed] {
        box-shadow: none;
        background: ${(props) => changeLightness(props.theme.main, 0.2)};
      }
    }
    .react-aria-DateInput {
      display: flex;
      align-items: center;
    }
    .react-aria-DateSegment {
      padding: 2px;
      &:focus {
        background-color: ${(props) => changeLightness(props.theme.main, 0.1)};
        outline: none;
        border-radius: 4px;
      }
    }
  }

  .react-aria-Popover[data-trigger='DatePicker'] {
    max-width: unset;
  }

  ${StyledInput} {
    display: flex;
    padding: 4px 8px;
    border-radius: 4px;
    min-width: 280px;
    justify-content: space-between;
  }
`;

const StyledCalendarMessage = styled(ReqoreMessage)`
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
  margin-top: 12px;

  .react-aria-DateSegment {
    padding: 0 2px;
    &:focus {
      background-color: ${(props) => changeLightness(props.theme.main, 0.2)};
      outline: none;
      border-radius: 4px;
    }
  }
  ${StyledInput} {
    display: flex;
    padding: 2px 0;
    border-radius: 4px;
    justify-content: space-between;
  }
`;
const toDate = (date: Date) =>
  new CalendarDateTime(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds()
  );
export const DatePicker = ({ value, onChange, ...props }: DatePickerProps<CalendarDateTime>) => {
  const [time, setTime] = useState<Time>(
    () => new Time(value?.hour, value?.minute, value?.second, value?.millisecond)
  );
  return (
    <StyledWrapper>
      <RADatePicker
        value={value}
        onChange={(value) => {
          onChange?.(value);
          setTime(new Time(value?.hour, value.minute, value.second, value.millisecond));
        }}
        granularity='minute'
        hideTimeZone
        shouldForceLeadingZeros
        {...props}
      >
        <StyledInputWrapper fluid>
          <Group>
            <StyledInput>
              <DateInput>{(segment) => <DateSegment segment={segment} />}</DateInput>
              <ReqoreButton as={Button} icon={'Calendar2Fill'} />
            </StyledInput>
          </Group>
          <Popover>
            <Dialog>
              <Calendar>
                <StyledPopoverWrapper>
                  <StyledPopoverContent>
                    <StyledCalendarMessage>
                      <header>
                        <ReqoreButton as={Button} slot='previous' icon='ArrowLeftFill' />
                        <Heading />
                        <ReqoreButton as={Button} slot='previous' icon='ArrowRightFill' />
                      </header>
                      <CalendarGrid>{(date) => <StyledCalendarCell date={date} />}</CalendarGrid>
                      <StyledTimeField
                        value={time}
                        onChange={(time) => {
                          if (!time) return;
                          setTime(time);
                          onChange?.(toCalendarDateTime(value ?? toDate(new Date()), time));
                        }}
                        granularity={'minute'}
                      >
                        <StyledInput>
                          <DateInput>{(segment) => <DateSegment segment={segment} />}</DateInput>
                        </StyledInput>
                      </StyledTimeField>
                    </StyledCalendarMessage>
                  </StyledPopoverContent>
                </StyledPopoverWrapper>
              </Calendar>
            </Dialog>
          </Popover>
        </StyledInputWrapper>
      </RADatePicker>
    </StyledWrapper>
  );
};
