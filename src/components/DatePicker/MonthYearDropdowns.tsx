import { ZonedDateTime } from '@internationalized/date';
import { TDateValue } from '.';
import { getPreviousYears, months, toDate } from '../../helpers/dates';
import { IReqoreButtonProps } from '../Button';
import ReqoreControlGroup from '../ControlGroup';
import ReqoreDropdown from '../Dropdown';

export interface IYearMonthDropdownsProps extends IReqoreButtonProps {
  value?: ZonedDateTime;
  onValueChange(value: ZonedDateTime, close: boolean): void;
  setIsMonthDropdownOpen(open: boolean): void;
  setIsYearDropdownOpen(open: boolean): void;
  minValue: TDateValue;
  maxValue: TDateValue;
  /**
   * Localised month names shown in the month dropdown (12 entries,
   * January-first). Defaults to the built-in English month names.
   */
  monthNames?: string[];
  /**
   * Fallback label shown on the month trigger when no month is selected.
   * Defaults to `'Month'`.
   */
  monthLabel?: string;
}
export const YearMonthDropdowns = ({
  value: _value,
  onValueChange,
  setIsYearDropdownOpen,
  setIsMonthDropdownOpen,
  minValue: _minValue = new Date(1970, 0, 1),
  maxValue: _maxValue = new Date(new Date().getFullYear() + 5, 11, 31),
  monthNames,
  monthLabel = 'Month',
  ...rest
}: IYearMonthDropdownsProps) => {
  const value = _value ?? toDate(new Date());

  const minValue = toDate(_minValue);
  const maxValue = toDate(_maxValue);
  const currentYear = new Date().getFullYear();
  const years = getPreviousYears(minValue.year, maxValue.year);
  const resolvedMonthNames = monthNames && monthNames.length === 12 ? monthNames : months;

  return (
    <ReqoreControlGroup gapSize='small'>
      <ReqoreDropdown
        delay={0}
        compact
        filterable
        caretPosition='right'
        label={resolvedMonthNames[value?.month - 1] ?? monthLabel}
        inputProps={{
          focusRules: {
            type: 'auto',
          },
        }}
        {...rest}
        scrollToSelected
        items={resolvedMonthNames.map((month, index) => ({
          value: month,
          selected: index === value?.month - 1,
          disabled:
            value.set({ month: index + 1 }).compare(minValue) < 1 ||
            value.set({ month: index + 1 }).compare(maxValue) > 1,
        }))}
        onItemSelect={(item) =>
          onValueChange(
            value.set({ month: resolvedMonthNames.findIndex((m) => m === item.value) + 1 }),
            false
          )
        }
        onToggleChange={setIsMonthDropdownOpen}
      />
      <ReqoreDropdown
        delay={0}
        compact
        filterable
        caretPosition='right'
        label={value?.year ?? currentYear}
        inputProps={{
          focusRules: {
            type: 'auto',
          },
        }}
        {...rest}
        scrollToSelected
        items={years.map((year) => ({
          value: year,
          selected: year === value?.year,
          disabled:
            value.set({ year }).compare(minValue) < 1 || value.set({ year }).compare(maxValue) > 1,
        }))}
        onItemSelect={(item) => onValueChange(value.set({ year: item.value }), false)}
        onToggleChange={setIsYearDropdownOpen}
      />
    </ReqoreControlGroup>
  );
};
