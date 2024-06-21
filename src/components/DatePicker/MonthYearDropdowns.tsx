import { ZonedDateTime } from '@internationalized/date';
import { toDate } from '.';
import { getPreviousYears, months } from '../../helpers/dates';
import ReqoreControlGroup from '../ControlGroup';
import ReqoreDropdown from '../Dropdown';

export const YearMonthDropdowns = ({
  value: _value,
  onValueChange,
  setIsYearDropdownOpen,
  setIsMonthDropdownOpen,
}: {
  value?: ZonedDateTime;
  onValueChange(value: ZonedDateTime, close: boolean): void;
  setIsMonthDropdownOpen(open: boolean): void;
  setIsYearDropdownOpen(open: boolean): void;
}) => {
  const value = _value ?? toDate(new Date());

  const currentYear = new Date().getFullYear();
  const years = getPreviousYears(1900);

  return (
    <ReqoreControlGroup gapSize='small'>
      <ReqoreDropdown
        delay={0}
        compact
        filterable
        caretPosition='right'
        scrollToSelected
        label={<span>{months[value?.month - 1] ?? 'Month'}</span>}
        items={months.map((month, index) => ({
          value: month,
          selected: index === value?.month - 1,
        }))}
        inputProps={{
          focusRules: {
            type: 'auto',
          },
        }}
        onItemSelect={(item) =>
          onValueChange(value.set({ month: months.findIndex((m) => m === item.value) + 1 }), false)
        }
        onToggleChange={setIsMonthDropdownOpen}
      />
      <ReqoreDropdown
        delay={0}
        compact
        filterable
        caretPosition='right'
        scrollToSelected
        label={value?.year ?? currentYear}
        items={years.map((year) => ({
          value: year,
          selected: year === value?.year,
        }))}
        inputProps={{
          focusRules: {
            type: 'auto',
          },
        }}
        onItemSelect={(item) => onValueChange(value.set({ year: item.value }), false)}
        onToggleChange={setIsYearDropdownOpen}
      />
    </ReqoreControlGroup>
  );
};
