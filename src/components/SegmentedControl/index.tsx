import React, {
  forwardRef,
  memo,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useMeasure, useUpdateEffect } from 'react-use';
import styled, { css } from 'styled-components';
import {
  CONTROL_HORIZONTAL_PADDING_FROM_SIZE,
  CONTROL_TEXT_FROM_SIZE,
  ICON_FROM_SIZE,
  PADDING_FROM_SIZE,
  PILL_RADIUS_MODIFIER,
  RADIUS_FROM_SIZE,
  TSizes,
} from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import { changeLightness, getReadableColorFrom } from '../../helpers/colors';
import { calculateStringSizeInPixels } from '../../helpers/utils';
import { useReqoreProperty } from '../../hooks/useReqoreContext';
import { useReqoreTheme } from '../../hooks/useTheme';
import {
  IReqoreDisabled,
  IReqoreIntent,
  IReqoreReadOnly,
  IWithReqoreCustomTheme,
  IWithReqoreEffect,
  IWithReqoreFluid,
  IWithReqoreSize,
  TReqoreTooltipProp,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import { TReqoreBadge } from '../Button';
import ReqoreButton from '../Button';
import { IReqoreEffect } from '../Effect';
import ReqoreMenu from '../Menu';
import ReqoreMenuItem from '../Menu/item';
import { ReqorePopover } from '../Popover';

export interface IReqoreSegmentedControlItem {
  /** Unique value used for selection tracking */
  value: string;
  /** Display label text */
  label?: string | number;
  /** Left icon */
  icon?: IReqoreIconName;
  /** Right icon */
  rightIcon?: IReqoreIconName;
  /** Per-item disabled state */
  disabled?: boolean;
  /** Tooltip for this segment */
  tooltip?: TReqoreTooltipProp;
  /** Per-item intent override when selected */
  activeIntent?: TReqoreIntent;
  /** Per-item effect override */
  effect?: IReqoreEffect;
  /** Badge content on the segment */
  badge?: TReqoreBadge | TReqoreBadge[];
}

export interface IReqoreSegmentedControlProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'>,
    IWithReqoreSize,
    IWithReqoreEffect,
    IReqoreDisabled,
    IReqoreReadOnly,
    IReqoreIntent,
    IWithReqoreCustomTheme,
    IWithReqoreFluid {
  /** Array of segment items */
  items: IReqoreSegmentedControlItem[];
  /** Currently selected value (controlled mode) */
  value?: string;
  /** Initial value for uncontrolled mode */
  defaultValue?: string;
  /** Change handler, receives the new value */
  onChange?: (value: string | undefined) => void;
  /** No border on container */
  flat?: boolean;
  /** Fully rounded corners */
  pill?: boolean;
  /** Allow deselecting by clicking active item */
  allowDeselect?: boolean;
  /** Intent applied to the selected item */
  activeIntent?: TReqoreIntent;
  /**
   * Label shown on the overflow ("More") button that appears when the control
   * runs out of horizontal space and folds trailing items into a menu. Defaults
   * to `'More'` — override to translate. When a hidden item is currently
   * selected, its own label wins over this default so the selection stays
   * visible.
   */
  overflowLabel?: string;
  /** Override width for testing responsive behavior */
  _testWidth?: number;
}

interface IStyledSegmentedControlProps {
  theme: IReqoreTheme;
  size: TSizes;
  flat?: boolean;
  pill?: boolean;
  fluid?: boolean;
  disabled?: boolean;
}

interface IStyledIndicatorProps {
  theme: IReqoreTheme;
  size: TSizes;
  pill?: boolean;
  animate?: boolean;
}

const CONTAINER_PADDING = 3;

const StyledSegmentedControl = styled.div<IStyledSegmentedControlProps>`
  display: inline-flex;
  align-items: center;
  position: relative;
  box-sizing: border-box;
  padding: ${CONTAINER_PADDING}px;
  background-color: ${({ theme }) => changeLightness(theme.main, 0.03)};
  border: ${({ theme, flat }) =>
    !flat ? `1px solid ${changeLightness(theme.main, 0.07)}` : 'none'};
  border-radius: ${({ size, pill }) =>
    `${RADIUS_FROM_SIZE[size] * (pill ? PILL_RADIUS_MODIFIER : 1) + 1}px`};
  width: ${({ fluid }) => (fluid ? '100%' : undefined)};
  overflow: hidden;
  gap: 0;

  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.5;
      pointer-events: none;
    `}
`;

const StyledSegmentedControlIndicator = styled.div<IStyledIndicatorProps>`
  position: absolute;
  top: ${CONTAINER_PADDING}px;
  bottom: ${CONTAINER_PADDING}px;
  left: 0;
  background-color: ${({ theme }) => theme.main};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06);
  border-radius: ${({ size, pill }) =>
    `${RADIUS_FROM_SIZE[size] * (pill ? PILL_RADIUS_MODIFIER : 1)}px`};
  z-index: 0;
  pointer-events: none;

  ${({ animate }) =>
    animate
      ? css`
          transition: transform 0.2s ease-out, width 0.2s ease-out;
        `
      : undefined}
`;

const StyledItemWrapper = styled.div<{
  isSelected?: boolean;
  isBeforeSelected?: boolean;
  isLast?: boolean;
  theme: IReqoreTheme;
  fluid?: boolean;
}>`
  position: relative;
  z-index: 1;
  display: flex;
  flex: ${({ fluid }) => (fluid ? '1 1 0' : '0 0 auto')};

  &::after {
    content: '';
    position: absolute;
    right: 0;
    top: 20%;
    height: 60%;
    width: 1px;
    background-color: ${({ theme }) => changeLightness(theme.main, 0.1)};
    transition: opacity 0.15s ease-out;
    opacity: ${({ isSelected, isBeforeSelected, isLast }) =>
      isSelected || isBeforeSelected || isLast ? 0 : 1};
  }
`;

/**
 * Estimate the pixel width of a segment item based on its content.
 * Same approach as Tabs: calculates width from label text size, icons, badges, and padding.
 */
const estimateItemWidth = (
  item: IReqoreSegmentedControlItem,
  itemSize: TSizes = 'normal'
): number => {
  const hPad = CONTROL_HORIZONTAL_PADDING_FROM_SIZE[itemSize];
  let width = hPad * 2;

  if (item.label) {
    width += calculateStringSizeInPixels(
      item.label.toString(),
      CONTROL_TEXT_FROM_SIZE[itemSize]
    );
  }

  if (item.icon) {
    width += ICON_FROM_SIZE[itemSize] + PADDING_FROM_SIZE[itemSize] / 2;
  }

  if (item.rightIcon) {
    width += ICON_FROM_SIZE[itemSize] + PADDING_FROM_SIZE[itemSize] / 2;
  }

  return width;
};

/**
 * Calculate the total estimated width of all items including gaps.
 * Mirrors the Tabs `getTabsLength` approach.
 */
const getItemsLength = (
  items: (IReqoreSegmentedControlItem | IReqoreSegmentedControlItem[])[],
  itemSize: TSizes = 'normal',
  selectedValue?: string,
  overflowLabel: string = 'More'
): number =>
  items.reduce((len, item) => {
    if (Array.isArray(item)) {
      // "More" group — estimate the More button width
      const isSelectedHidden = item.some((i) => i.value === selectedValue);
      const moreLabel = isSelectedHidden
        ? item.find((i) => i.value === selectedValue)?.label ?? overflowLabel
        : overflowLabel;
      const hPad = CONTROL_HORIZONTAL_PADDING_FROM_SIZE[itemSize];
      const iconWidth = ICON_FROM_SIZE[itemSize] + PADDING_FROM_SIZE[itemSize] / 2;
      const labelWidth = calculateStringSizeInPixels(
        moreLabel.toString(),
        CONTROL_TEXT_FROM_SIZE[itemSize]
      );
      return len + hPad * 2 + iconWidth + labelWidth;
    }

    return len + estimateItemWidth(item, itemSize);
  }, 0);

/**
 * Progressively move items from the end into a "More" group array until
 * the total estimated width fits within the available space.
 * Same algorithm as Tabs `getTransformedItems`.
 */
const getTransformedItems = (
  items: (IReqoreSegmentedControlItem | IReqoreSegmentedControlItem[])[],
  availableWidth: number,
  itemSize: TSizes = 'normal',
  selectedValue?: string,
  overflowLabel: string = 'More'
): (IReqoreSegmentedControlItem | IReqoreSegmentedControlItem[])[] => {
  if (!availableWidth) {
    return items;
  }

  let newItems = [...items];

  while (
    getItemsLength(newItems, itemSize, selectedValue, overflowLabel) > availableWidth &&
    newItems.length > 1
  ) {
    const last = newItems[newItems.length - 1];
    if (Array.isArray(last)) {
      // Already have a More group — prepend the second-to-last item into it
      last.unshift(
        newItems[newItems.length - 2] as IReqoreSegmentedControlItem
      );
      newItems[newItems.length - 2] = undefined!;
    } else {
      // Convert last item into a More group
      newItems[newItems.length - 1] = [last] as IReqoreSegmentedControlItem[];
    }
    newItems = newItems.filter((i) => i);
  }

  return newItems.filter((i) => i);
};

const ReqoreSegmentedControl = memo(
  forwardRef<HTMLDivElement, IReqoreSegmentedControlProps>(
    (
      {
        items,
        value,
        defaultValue,
        onChange,
        size = 'normal',
        flat,
        pill,
        allowDeselect,
        activeIntent,
        disabled,
        readOnly,
        intent,
        customTheme,
        inheritCustomTheme,
        fluid,
        className,
        overflowLabel = 'More',
        _testWidth,
        ...rest
      },
      ref
    ) => {
      const animations = useReqoreProperty('animations');
      const theme = useReqoreTheme('main', customTheme, intent, undefined, inheritCustomTheme);

      const [_value, _setValue] = useState<string | undefined>(
        value ?? defaultValue ?? items[0]?.value
      );

      const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
      const wrapperRefs = useRef<Record<string, HTMLDivElement | null>>({});
      const containerRef = useRef<HTMLDivElement>(null);
      const [measureRef, { width: measuredWidth }] = useMeasure();
      const [indicatorStyle, setIndicatorStyle] = useState<{
        left: number;
        width: number;
      }>({ left: 0, width: 0 });

      // Only constrain width when fluid (container has fixed width from parent)
      // or when _testWidth is explicitly provided for testing.
      // Non-fluid containers grow to fit their content, so overflow never applies.
      const availableWidth = _testWidth || (fluid ? measuredWidth : 0);

      // Sync controlled value
      useUpdateEffect(() => {
        if (value !== undefined) {
          _setValue(value);
        }
      }, [value]);

      // Transform items using the Tabs-style width estimation approach
      const transformedItems = useMemo(
        () => getTransformedItems(items, availableWidth, size, _value, overflowLabel),
        [items, availableWidth, size, _value, overflowLabel]
      );

      // Split into visible items and hidden items (the More group)
      const visibleItems = useMemo(
        () =>
          transformedItems.filter(
            (item): item is IReqoreSegmentedControlItem => !Array.isArray(item)
          ),
        [transformedItems]
      );

      const hiddenItems = useMemo(() => {
        const moreGroup = transformedItems.find(
          (item): item is IReqoreSegmentedControlItem[] => Array.isArray(item)
        );
        return moreGroup || [];
      }, [transformedItems]);

      const hasOverflow = hiddenItems.length > 0;

      // Is the selected value hidden in the "More" dropdown?
      const isSelectedHidden = useMemo(
        () =>
          hasOverflow && _value
            ? hiddenItems.some((item) => item.value === _value)
            : false,
        [hasOverflow, _value, hiddenItems]
      );

      // Get the label for the "More" button
      const moreLabel = useMemo(() => {
        if (isSelectedHidden) {
          const hidden = hiddenItems.find((item) => item.value === _value);
          return hidden?.label ?? overflowLabel;
        }
        return overflowLabel;
      }, [isSelectedHidden, hiddenItems, _value, overflowLabel]);

      // Calculate indicator position
      useLayoutEffect(() => {
        if (!_value || isSelectedHidden) {
          return;
        }

        const selectedWrapper = wrapperRefs.current[_value];
        const container = containerRef.current;

        if (selectedWrapper && container) {
          const containerRect = container.getBoundingClientRect();
          const itemRect = selectedWrapper.getBoundingClientRect();
          setIndicatorStyle({
            left: itemRect.left - containerRect.left,
            width: itemRect.width,
          });
        }
      }, [_value, items, isSelectedHidden, visibleItems, measuredWidth]);

      const handleSelect = useCallback(
        (itemValue: string) => {
          if (disabled || readOnly) {
            return;
          }

          if (allowDeselect && itemValue === _value) {
            _setValue(undefined);
            onChange?.(undefined);
            return;
          }

          _setValue(itemValue);
          onChange?.(itemValue);
        },
        [_value, onChange, allowDeselect, disabled, readOnly]
      );

      const enabledItems = useMemo(
        () => items.filter((item) => !item.disabled),
        [items]
      );

      const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
          if (disabled || readOnly || enabledItems.length === 0) {
            return;
          }

          const currentIndex = enabledItems.findIndex(
            (i) => i.value === _value
          );
          let nextIndex: number | undefined;

          switch (e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
              nextIndex = (currentIndex + 1) % enabledItems.length;
              break;
            case 'ArrowLeft':
            case 'ArrowUp':
              nextIndex =
                (currentIndex - 1 + enabledItems.length) % enabledItems.length;
              break;
            case 'Home':
              nextIndex = 0;
              break;
            case 'End':
              nextIndex = enabledItems.length - 1;
              break;
            default:
              return;
          }

          e.preventDefault();
          const nextItem = enabledItems[nextIndex];
          handleSelect(nextItem.value);
          itemRefs.current[nextItem.value]?.focus();
        },
        [enabledItems, _value, handleSelect, disabled, readOnly]
      );

      const selectedVisibleIndex = useMemo(
        () => visibleItems.findIndex((item) => item.value === _value),
        [visibleItems, _value]
      );

      if (!items || items.length === 0) {
        return null;
      }

      return (
        <StyledSegmentedControl
          {...rest}
          ref={(node) => {
            (containerRef as React.MutableRefObject<HTMLDivElement | null>).current =
              node;
            measureRef(node as Element);
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              (ref as React.MutableRefObject<HTMLDivElement | null>).current =
                node;
            }
          }}
          theme={theme}
          size={size}
          flat={flat}
          pill={pill}
          fluid={fluid}
          disabled={disabled}
          role='radiogroup'
          onKeyDown={handleKeyDown}
          className={`${className || ''} reqore-segmented-control`}
        >
          {_value && selectedVisibleIndex >= 0 && !isSelectedHidden && (
            <StyledSegmentedControlIndicator
              theme={theme}
              size={size}
              pill={pill}
              animate={animations.buttons !== false}
              style={{
                transform: `translateX(${indicatorStyle.left - CONTAINER_PADDING}px)`,
                width: `${indicatorStyle.width}px`,
              }}
            />
          )}
          {visibleItems.map((item, index) => {
            const isSelected = item.value === _value;
            const isBeforeSelected = index === selectedVisibleIndex - 1;
            const isLastVisible =
              index === visibleItems.length - 1 && !hasOverflow;
            const itemDisabled = disabled || item.disabled;
            const selectedItemIntent = item.activeIntent || activeIntent;

            return (
              <StyledItemWrapper
                key={item.value}
                ref={(el: HTMLDivElement | null) => {
                  wrapperRefs.current[item.value] = el;
                }}
                isSelected={isSelected}
                isBeforeSelected={isBeforeSelected}
                isLast={isLastVisible}
                theme={theme}
                fluid={fluid}
              >
                <ReqoreButton
                  ref={(el) => {
                    itemRefs.current[item.value] = el;
                  }}
                  flat
                  transparent
                  icon={item.icon}
                  rightIcon={item.rightIcon}
                  badge={item.badge}
                  tooltip={item.tooltip}
                  disabled={itemDisabled}
                  effect={item.effect}
                  size={size}
                  fluid={fluid}
                  intent={
                    isSelected && selectedItemIntent
                      ? selectedItemIntent
                      : undefined
                  }
                  customTheme={
                    isSelected && !selectedItemIntent
                      ? {
                          main: getReadableColorFrom(theme.main),
                        }
                      : customTheme
                  }
                  onClick={() => handleSelect(item.value)}
                  role='radio'
                  aria-checked={isSelected}
                  tabIndex={
                    isSelected
                      ? 0
                      : selectedVisibleIndex < 0 && index === 0
                      ? 0
                      : -1
                  }
                  className='reqore-segmented-control-item'
                  pill={pill}
                >
                  {item.label}
                </ReqoreButton>
              </StyledItemWrapper>
            );
          })}
          {hasOverflow && (
            <StyledItemWrapper
              key='__more__'
              isSelected={false}
              isBeforeSelected={false}
              isLast
              theme={theme}
              fluid={fluid}
            >
              <ReqorePopover
                component={ReqoreButton}
                componentProps={{
                  icon: 'ArrowDownSLine' as IReqoreIconName,
                  flat: true,
                  transparent: true,
                  size,
                  pill,
                  fluid,
                  active: isSelectedHidden,
                  intent: isSelectedHidden ? activeIntent : undefined,
                  customTheme: isSelectedHidden
                    ? { main: getReadableColorFrom(theme.main) }
                    : customTheme,
                  className:
                    'reqore-segmented-control-item reqore-segmented-control-more',
                  label: moreLabel,
                }}
                closeOnOutsideClick
                isReqoreComponent
                noWrapper
                handler='hoverStay'
                content={
                  <ReqoreMenu customTheme={customTheme}>
                    {hiddenItems.map((overflowItem) => (
                      <ReqoreMenuItem
                        key={overflowItem.value}
                        icon={overflowItem.icon}
                        rightIcon={overflowItem.rightIcon}
                        disabled={overflowItem.disabled}
                        selected={overflowItem.value === _value}
                        intent={
                          overflowItem.value === _value
                            ? overflowItem.activeIntent || activeIntent
                            : undefined
                        }
                        onClick={(_event, _itemId, closePopover) => {
                          handleSelect(overflowItem.value);
                          closePopover?.();
                        }}
                      >
                        {overflowItem.label}
                      </ReqoreMenuItem>
                    ))}
                  </ReqoreMenu>
                }
              />
            </StyledItemWrapper>
          )}
        </StyledSegmentedControl>
      );
    }
  )
);

export default ReqoreSegmentedControl;
