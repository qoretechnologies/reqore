import { getBadgeLength } from '../Tabs/list';
import { isUndefined, omitBy } from 'lodash';
import { lighten, mix } from 'polished';
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
import { css } from 'styled-components';
import styled from '../../helpers/styled';
import {
  CONTROL_HORIZONTAL_PADDING_FROM_SIZE,
  ICON_FROM_SIZE,
  PADDING_FROM_SIZE,
  PILL_RADIUS_MODIFIER,
  RADIUS_FROM_SIZE,
  SIZE_TO_PX,
  TSizes,
} from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import {
  changeLightness,
  getColorFromMaybeString,
  getOpaqueColor,
  getPanelBackgroundColor,
  getPanelHairlineColor,
  getReadableAccentColor,
  getReadableColorFrom,
  getSecondaryTextColor,
  getThemePanelSurface,
} from '../../helpers/colors';
import { getControlTextSize } from '../../helpers/typeScale';
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
  TReqoreDataAttributes,
  TReqoreTooltipProp,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import { IReqoreButtonProps, TReqoreBadge } from '../Button';
import ReqoreButton from '../Button';
import { IReqoreEffect, TReqoreHexColor } from '../Effect';
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
  /**
   * More props for the segment's `ReqoreButton`: `data-*` (a `data-track-click` for analytics),
   * `aria-*` (an `aria-label` for an icon-only segment), `id`, `className` (merged), `style`,
   * `leftIconProps`, … They go under the control's own, so the segments stay a radio group
   * that the control runs: the selection handler, `role`, `aria-checked`, `tabIndex`,
   * `disabled` and the selected look are the control's, and the item's own `icon`,
   * `rightIcon`, `badge`, `tooltip` and `effect` win when set. A segment folded into the
   * "More" menu passes them to its menu item.
   */
  props?: TReqoreSegmentedControlItemProps;
}

/** What a segment's `props` may hold (see `IReqoreSegmentedControlItem.props`). */
export type TReqoreSegmentedControlItemProps = Omit<
  Partial<IReqoreButtonProps>,
  'onClick' | 'role' | 'tabIndex' | 'aria-checked' | 'label' | 'children'
> &
  TReqoreDataAttributes;

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
  /**
   * The whole control is the size's height — as tall as a button or an input of the same
   * `size` beside it — and its items are that much shorter inside the frame. Off (the
   * default), each item is the size's height and the frame adds its padding and border
   * around them, so a `small` control stands 8px taller than the `small` controls in its
   * toolbar.
   */
  fitSize?: boolean;
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
  /**
   * Keep every segment at its own width and fold the ones that do not fit into "More".
   * The control takes the room its parent gives it (a toolbar slot that is
   * `flex: 1 1 0; min-width: 0`) and folds against THAT width, not its own, so what it
   * draws never feeds back into what it measures; and it folds on the segments' measured
   * widths, badges included, rather than on an estimate of their labels. `fluid`
   * stretches the segments to fill the width instead, and folds on the estimate.
   */
  foldToFit?: boolean;
  /** Override width for testing responsive behavior */
  _testWidth?: number;
}

/**
 * The colours of a control drawn on the surfaces a theme names (`theme.panel`: a calm theme).
 *
 * Derived from `theme.main`, the chosen segment's thumb is the page's own colour and its track a
 * shade lighter. A panel sits a step above the page, so on a dark calm panel the thumb was darker
 * than its track and as dark as the panel around it, the chosen words were drawn exactly as the
 * others, and the control read as nothing chosen. On named surfaces:
 *
 * - the track is the button surface (`theme.buttons.main`, else a step off the panel), edged
 *   with the panel hairline, as every control on a panel is;
 * - the thumb is a step lighter than the track, a raised segment on a dark theme and on a light
 *   one, and its edge stands 3:1 against the track (WCAG 1.4.11): the hairline pushed until it
 *   reads, or the chosen segment's intent in a colour that reads (a filter that narrows),
 *   whose words are then that intent made readable on the thumb (on a light theme they were
 *   tinted towards white, as a transparent button's words are on a dark one);
 * - the other segments' words are the secondary grey (`theme.text.secondary` where it reads,
 *   else the text colour mixed 70% into the track), so the chosen one is the bright one.
 */
export interface IReqoreSegmentedControlSurfaces {
  track: TReqoreHexColor;
  trackEdge: TReqoreHexColor;
  divider: TReqoreHexColor;
  thumb: TReqoreHexColor;
  thumbEdge: TReqoreHexColor;
  /** The chosen segment's words, when it has an intent. */
  chosenText?: TReqoreHexColor;
  otherText: TReqoreHexColor;
}

/** The thumb's step above its track. */
const THUMB_STEP = 0.1;
/** What the thumb's edge stands against the track. */
const THUMB_EDGE_CONTRAST = 3;
/** What the chosen segment's words in its intent stand against the thumb. */
const CHOSEN_TEXT_CONTRAST = 4.5;

/**
 * `IReqoreSegmentedControlSurfaces` for a control on `theme`, or `undefined` when the theme names
 * no panel surface or the control's surface is its own (a `customTheme` main or an `intent`, given
 * or inherited): such a control keeps the look derived from `main`.
 */
export const getSegmentedControlSurfaces = (
  theme: IReqoreTheme,
  chosenIntent?: TReqoreIntent
): IReqoreSegmentedControlSurfaces | undefined => {
  if (!getThemePanelSurface(theme)?.main) {
    return undefined;
  }

  const buttons = theme.buttons?.main
    ? getColorFromMaybeString(theme, theme.buttons.main)
    : undefined;
  const track = getOpaqueColor(
    buttons ?? changeLightness(getPanelBackgroundColor(theme), 0.03)
  );
  const hairline = getPanelHairlineColor(theme);
  const intentColor = chosenIntent ? theme.intents?.[chosenIntent] : undefined;
  const thumb = lighten(THUMB_STEP, track) as TReqoreHexColor;

  return {
    track,
    trackEdge: hairline,
    divider: hairline,
    thumb,
    thumbEdge: getReadableAccentColor(intentColor ?? hairline, track, THUMB_EDGE_CONTRAST),
    chosenText: intentColor
      ? getReadableAccentColor(intentColor, thumb, CHOSEN_TEXT_CONTRAST)
      : undefined,
    otherText:
      getSecondaryTextColor({ text: theme.text, main: track }) ??
      (mix(0.7, getReadableColorFrom(track), track) as TReqoreHexColor),
  };
};

interface IStyledSegmentedControlProps {
  theme: IReqoreTheme;
  size: TSizes;
  flat?: boolean;
  pill?: boolean;
  fluid?: boolean;
  foldToFit?: boolean;
  disabled?: boolean;
  surfaces?: IReqoreSegmentedControlSurfaces;
}

interface IStyledIndicatorProps {
  theme: IReqoreTheme;
  size: TSizes;
  pill?: boolean;
  animate?: boolean;
  surfaces?: IReqoreSegmentedControlSurfaces;
}

const CONTAINER_PADDING = 3;

const StyledSegmentedControl = styled.div<IStyledSegmentedControlProps>`
  display: inline-flex;
  align-items: center;
  position: relative;
  box-sizing: border-box;
  padding: ${CONTAINER_PADDING}px;
  background-color: ${({ theme, surfaces }) =>
    surfaces?.track ?? changeLightness(theme.main, 0.03)};
  border: ${({ theme, flat, surfaces }) =>
    !flat ? `1px solid ${surfaces?.trackEdge ?? changeLightness(theme.main, 0.07)}` : 'none'};
  border-radius: ${({ size, pill }) =>
    `${RADIUS_FROM_SIZE[size] * (pill ? PILL_RADIUS_MODIFIER : 1) + 1}px`};
  width: ${({ fluid }) => (fluid ? '100%' : undefined)};
  max-width: ${({ foldToFit }) => (foldToFit ? '100%' : undefined)};
  overflow: hidden;
  gap: 0;

  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.5;
      pointer-events: none;
    `}
`;

/**
 * The room a `foldToFit` control is given: as wide as its parent allows, never wider.
 *
 * One grid track of `minmax(0, max-content)` rather than a flex box, for what the slot reports
 * about itself. Its max-content width is the whole control, so a parent sized to its content
 * still draws every segment that fits. Its min-content width is 0 — the control folds, so it can
 * do without any of its width — where a flex box passed up the full row of segments. A panel's
 * narrow title bar gives the title its claim and the actions "at least what their controls
 * cannot do without", and with the full row as that floor the title was left 0px wide.
 */
const StyledFoldSlot = styled.div`
  display: grid;
  grid-template-columns: minmax(0, max-content);
  width: 100%;
  min-width: 0;
`;

const StyledSegmentedControlIndicator = styled.div<IStyledIndicatorProps>`
  position: absolute;
  top: ${CONTAINER_PADDING}px;
  bottom: ${CONTAINER_PADDING}px;
  left: 0;
  box-sizing: border-box;
  background-color: ${({ theme, surfaces }) => surfaces?.thumb ?? theme.main};
  border: ${({ surfaces }) => (surfaces ? `1px solid ${surfaces.thumbEdge}` : undefined)};
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
  surfaces?: IReqoreSegmentedControlSurfaces;
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
    background-color: ${({ theme, surfaces }) =>
      surfaces?.divider ?? changeLightness(theme.main, 0.1)};
    transition: opacity 0.15s ease-out;
    opacity: ${({ isSelected, isBeforeSelected, isLast }) =>
      isSelected || isBeforeSelected || isLast ? 0 : 1};
  }

  /* On named surfaces the segments not chosen say their words in the secondary grey (their
     icons follow, they inherit the colour), so the chosen one is the bright one. Under the
     pointer a segment takes the button's own hover colour. */
  ${({ surfaces, isSelected }) =>
    surfaces &&
    !isSelected &&
    css`
      .reqore-segmented-control-item:not(:hover) {
        color: ${surfaces.otherText};
      }
    `}

  /* ...and a chosen segment with an intent says it in a colour that reads on the thumb, under
     the pointer too. */
  ${({ surfaces, isSelected }) =>
    surfaces?.chosenText &&
    isSelected &&
    css`
      && .reqore-segmented-control-item,
      && .reqore-segmented-control-item:hover {
        color: ${surfaces.chosenText};
      }
    `}
`;

/**
 * Estimate the pixel width of a segment item based on its content.
 * Same approach as Tabs: calculates width from label text size, icons, badges, and padding.
 */
export const estimateItemWidth = (
  item: IReqoreSegmentedControlItem,
  itemSize: TSizes = 'normal',
  theme?: IReqoreTheme
): number => {
  const hPad = CONTROL_HORIZONTAL_PADDING_FROM_SIZE[itemSize];
  let width = hPad * 2;

  if (item.label) {
    width += calculateStringSizeInPixels(
      item.label.toString(),
      getControlTextSize(theme, itemSize)
    );
  }

  if (item.icon ?? item.props?.icon) {
    width += ICON_FROM_SIZE[itemSize] + PADDING_FROM_SIZE[itemSize] / 2;
  }

  if (item.rightIcon ?? item.props?.rightIcon) {
    width += ICON_FROM_SIZE[itemSize] + PADDING_FROM_SIZE[itemSize] / 2;
  }

  // The count beside a label ("Failing 3") is part of the segment: left out, a `fluid` control
  // (and the first frame before measuring) folded too late and cut its last segment in half.
  width += getBadgeLength(item.badge ?? item.props?.badge, itemSize, theme);

  return width;
};

/**
 * Calculate the total estimated width of all items including gaps.
 * Mirrors the Tabs `getTabsLength` approach.
 */
/** A segment's width as it was last drawn (`foldToFit`), by value; "More" by the label it
 *  showed (`moreKey`) — the label of the selected segment when that one is folded. */
type TMeasuredWidths = Record<string, number>;
const MORE_KEY = '__more__';
const moreKey = (label: string | number) => `${MORE_KEY}:${label}`;

const getItemsLength = (
  items: (IReqoreSegmentedControlItem | IReqoreSegmentedControlItem[])[],
  itemSize: TSizes = 'normal',
  selectedValue?: string,
  overflowLabel: string = 'More',
  theme?: IReqoreTheme,
  measured?: TMeasuredWidths
): number =>
  items.reduce((len, item) => {
    if (Array.isArray(item)) {
      // "More" group — its width as drawn with this label, else an estimate
      const isSelectedHidden = item.some((i) => i.value === selectedValue);
      const moreLabel = isSelectedHidden
        ? item.find((i) => i.value === selectedValue)?.label ?? overflowLabel
        : overflowLabel;
      if (measured?.[moreKey(moreLabel)]) {
        return len + measured[moreKey(moreLabel)];
      }
      const hPad = CONTROL_HORIZONTAL_PADDING_FROM_SIZE[itemSize];
      const iconWidth = ICON_FROM_SIZE[itemSize] + PADDING_FROM_SIZE[itemSize] / 2;
      const labelWidth = calculateStringSizeInPixels(
        moreLabel.toString(),
        getControlTextSize(theme, itemSize)
      );
      return len + hPad * 2 + iconWidth + labelWidth;
    }

    return len + (measured?.[item.value] ?? estimateItemWidth(item, itemSize, theme));
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
  overflowLabel: string = 'More',
  theme?: IReqoreTheme,
  measured?: TMeasuredWidths
): (IReqoreSegmentedControlItem | IReqoreSegmentedControlItem[])[] => {
  if (!availableWidth) {
    return items;
  }

  let newItems = [...items];

  while (
    getItemsLength(newItems, itemSize, selectedValue, overflowLabel, theme, measured) >
      availableWidth &&
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
        fitSize,
        activeIntent,
        disabled,
        readOnly,
        intent,
        customTheme,
        inheritCustomTheme,
        fluid,
        className,
        overflowLabel = 'More',
        foldToFit,
        _testWidth,
        ...rest
      },
      ref
    ) => {
      const animations = useReqoreProperty('animations');
      // Folding to fit keeps every segment at its own width, so `fluid` does not stretch them.
      const stretch = fluid && !foldToFit;
      // fitSize: the frame (its padding and its 1px border, top and bottom) comes out of
      // the items, so the control as a whole is the size's height.
      const fittedItemHeight = SIZE_TO_PX[size] - 2 * (CONTAINER_PADDING + (flat ? 0 : 1));
      const fittedItemStyle = useMemo(
        () => ({
          height: fittedItemHeight,
          minHeight: fittedItemHeight,
          maxHeight: fittedItemHeight,
        }),
        [fittedItemHeight]
      );
      const theme = useReqoreTheme('main', customTheme, intent, undefined, inheritCustomTheme);

      const [_value, _setValue] = useState<string | undefined>(
        value ?? defaultValue ?? items[0]?.value
      );

      const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
      const wrapperRefs = useRef<Record<string, HTMLDivElement | null>>({});
      const containerRef = useRef<HTMLDivElement>(null);
      const [measureRef, { width: measuredWidth }] = useMeasure();
      /* One ref for as long as the caller's ref is the same: an arrow made in the render was a new ref every time, so
         React called it with null and then the node on every render, and the measure set its state twice for
         nothing. */
      const setContainerRef = useCallback(
        (node: HTMLDivElement | null) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          measureRef(node as Element);
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }
        },
        [measureRef, ref]
      );
      const [indicatorStyle, setIndicatorStyle] = useState<{
        left: number;
        width: number;
      }>({ left: 0, width: 0 });
      // The indicator as last set, to set it only when it moves.
      const indicatorDrawn = useRef(indicatorStyle);

      // foldToFit: the room the slot is given, and each segment's width as drawn.
      const [slotRef, { width: slotWidth }] = useMeasure<HTMLDivElement>();
      const measuredWidths = useRef<TMeasuredWidths>({});
      const [measuredVersion, setMeasuredVersion] = useState(0);
      // The frame's padding and border come out of the room the segments have.
      const frameWidth = 2 * (CONTAINER_PADDING + (flat ? 0 : 1));

      // Only constrain width when fluid (container has fixed width from parent),
      // folding to fit (the slot's width) or when _testWidth is explicitly provided
      // for testing. Other containers grow to fit their content, so overflow never applies.
      const availableWidth =
        _testWidth ||
        (foldToFit ? Math.max(0, slotWidth - frameWidth) : fluid ? measuredWidth : 0);

      // Sync controlled value
      useUpdateEffect(() => {
        if (value !== undefined) {
          _setValue(value);
        }
      }, [value]);

      // Transform items using the Tabs-style width estimation approach
      const transformedItems = useMemo(
        () =>
          getTransformedItems(
            items,
            availableWidth,
            size,
            _value,
            overflowLabel,
            theme,
            foldToFit ? measuredWidths.current : undefined
          ),
        // `measuredVersion` stands for `measuredWidths`, a ref: a segment drawn at a new width.
        [items, availableWidth, size, _value, overflowLabel, theme, foldToFit, measuredVersion]
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

      // The selected segment, when it is folded into the "More" dropdown
      const hiddenSelectedItem = useMemo(
        () =>
          hasOverflow && _value
            ? hiddenItems.find((item) => item.value === _value)
            : undefined,
        [hasOverflow, _value, hiddenItems]
      );
      const isSelectedHidden = !!hiddenSelectedItem;
      const hiddenSelectedIntent = hiddenSelectedItem
        ? hiddenSelectedItem.activeIntent || activeIntent
        : undefined;
      // The chosen segment's intent, wherever it is drawn, for the thumb's edge.
      const chosenIntent = isSelectedHidden
        ? hiddenSelectedIntent
        : items.find((item) => item.value === _value)?.activeIntent || activeIntent;
      const surfaces = useMemo(
        () => getSegmentedControlSurfaces(theme, chosenIntent),
        [theme, chosenIntent]
      );

      // Get the label for the "More" button
      const moreLabel = hiddenSelectedItem?.label ?? overflowLabel;

      // Calculate indicator position. A selected segment folded into "More" is marked where it
      // is drawn — on "More", which carries its label — the same way a visible one is marked.
      useLayoutEffect(() => {
        if (!_value) {
          return;
        }

        const selectedWrapper = wrapperRefs.current[isSelectedHidden ? MORE_KEY : _value];
        const container = containerRef.current;

        if (selectedWrapper && container) {
          const containerRect = container.getBoundingClientRect();
          const itemRect = selectedWrapper.getBoundingClientRect();
          // The rects are the DRAWN boxes, so a transformed ancestor scales them. A modal
          // opens with a zoom from scale(0.5) and the control measures itself during it:
          // the highlight came out about half as wide as its item and stayed that way,
          // because a transform changes no layout size, so nothing measured again once the
          // zoom ended. Dividing by the drawn-to-layout ratio gives layout pixels at any
          // scale. `offsetWidth` is rounded to a whole pixel, so a difference under 1px is
          // that rounding, not a transform, and the rects are used as they are.
          const layoutWidth = container.offsetWidth;
          const scale =
            layoutWidth && containerRect.width && Math.abs(containerRect.width - layoutWidth) >= 1
              ? containerRect.width / layoutWidth
              : 1;
          const next = {
            // From the container's PADDING edge, which is where an absolutely positioned
            // child's `left: 0` sits: the border-box rect plus the border (`clientLeft`,
            // 0 when `flat`). Measured from the border edge and corrected by the padding
            // instead, the highlight landed `padding - border` px left of its item — 2px
            // with a border, 3px without — on every control since the component shipped.
            left: (itemRect.left - containerRect.left) / scale - container.clientLeft,
            width: itemRect.width / scale,
          };
          // Only when it moved: a page hands its items as a new list each render, and a new
          // object every time was an update for nothing. Compared before asking:
          // an update that hands back the same state is still an update React has to schedule.
          if (
            indicatorDrawn.current.left !== next.left ||
            indicatorDrawn.current.width !== next.width
          ) {
            indicatorDrawn.current = next;
            setIndicatorStyle(next);
          }
        }
      }, [_value, items, isSelectedHidden, visibleItems, measuredWidth, moreLabel]);

      // foldToFit: remember each drawn segment's width (and "More"'s), and fold again when
      // one changed — a count that loaded, a label in another language. Segments keep
      // their own width in this mode, so what is drawn is what they need.
      useLayoutEffect(() => {
        if (!foldToFit) return;
        let changed = false;
        const record = (key: string, el: HTMLElement | null | undefined) => {
          if (!el) return;
          const width = el.getBoundingClientRect().width;
          if (width && Math.abs((measuredWidths.current[key] ?? 0) - width) > 0.5) {
            measuredWidths.current[key] = width;
            changed = true;
          }
        };
        visibleItems.forEach((item) => record(item.value, wrapperRefs.current[item.value]));
        if (hasOverflow) record(moreKey(moreLabel), wrapperRefs.current[MORE_KEY]);
        if (changed) setMeasuredVersion((version) => version + 1);
      });

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

      // The "More" button and its list, kept from one render to the next: the popover is a memo
      // component, and a new object each render would draw it again for nothing.
      const moreButtonProps = useMemo(
        () => ({
          icon: 'ArrowDownSLine' as IReqoreIconName,
          flat: true,
          transparent: true,
          size,
          pill,
          fluid: stretch,
          // Exactly what a visible selected segment gets: it is the same state. An
          // `active` (filled) "More" drew one selection two ways.
          intent: hiddenSelectedIntent,
          // ...and its count: a folded "Drafts 1" still says how many
          badge: hiddenSelectedItem?.badge,
          customTheme:
            isSelectedHidden && !hiddenSelectedIntent
              ? { main: getReadableColorFrom(theme.main) }
              : customTheme,
          className: 'reqore-segmented-control-item reqore-segmented-control-more',
          label: moreLabel,
          style: fitSize ? fittedItemStyle : undefined,
        }),
        [
          size,
          pill,
          stretch,
          hiddenSelectedIntent,
          hiddenSelectedItem?.badge,
          isSelectedHidden,
          theme.main,
          customTheme,
          moreLabel,
          fitSize,
          fittedItemStyle,
        ]
      );

      // One handler for every folded segment: the menu item hands back its `itemId`, the segment's value.
      const handleOverflowItemClick = useCallback(
        (_event: unknown, itemId?: string, closePopover?: () => void) => {
          if (itemId !== undefined) handleSelect(itemId);
          closePopover?.();
        },
        [handleSelect]
      );

      const moreMenu = useMemo(
        () => (
          <ReqoreMenu customTheme={customTheme}>
            {hiddenItems.map((overflowItem) => (
              <ReqoreMenuItem
                {...overflowItem.props}
                key={overflowItem.value}
                {...omitBy(
                  {
                    icon: overflowItem.icon,
                    rightIcon: overflowItem.rightIcon,
                    // a folded "Healthy 3" keeps its count
                    badge: overflowItem.badge,
                  },
                  isUndefined
                )}
                disabled={overflowItem.disabled}
                selected={overflowItem.value === _value}
                intent={
                  overflowItem.value === _value
                    ? overflowItem.activeIntent || activeIntent
                    : undefined
                }
                itemId={overflowItem.value}
                onClick={handleOverflowItemClick}
              >
                {overflowItem.label}
              </ReqoreMenuItem>
            ))}
          </ReqoreMenu>
        ),
        [customTheme, hiddenItems, _value, activeIntent, handleOverflowItemClick]
      );

      if (!items || items.length === 0) {
        return null;
      }

      const control = (
        <StyledSegmentedControl
          {...rest}
          ref={setContainerRef}
          theme={theme}
          surfaces={surfaces}
          size={size}
          flat={flat}
          pill={pill}
          fluid={stretch}
          foldToFit={foldToFit}
          disabled={disabled}
          role='radiogroup'
          onKeyDown={handleKeyDown}
          className={`${className || ''} reqore-segmented-control`}
        >
          {_value && (selectedVisibleIndex >= 0 || isSelectedHidden) && (
            <StyledSegmentedControlIndicator
              className='reqore-segmented-control-indicator'
              theme={theme}
              surfaces={surfaces}
              size={size}
              pill={pill}
              animate={animations.buttons !== false}
              style={{
                transform: `translateX(${indicatorStyle.left}px)`,
                width: `${indicatorStyle.width}px`,
              }}
            />
          )}
          {visibleItems.map((item, index) => {
            const isSelected = item.value === _value;
            const isBeforeSelected =
              index === (isSelectedHidden ? visibleItems.length : selectedVisibleIndex) - 1;
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
                surfaces={surfaces}
                fluid={stretch}
              >
                <ReqoreButton
                  {...item.props}
                  ref={(el) => {
                    itemRefs.current[item.value] = el;
                  }}
                  flat
                  transparent
                  // The item's own fields win over its props, but only where they are set.
                  {...omitBy(
                    {
                      icon: item.icon,
                      rightIcon: item.rightIcon,
                      badge: item.badge,
                      tooltip: item.tooltip,
                      effect: item.effect,
                    },
                    isUndefined
                  )}
                  disabled={itemDisabled}
                  size={size}
                  fluid={stretch}
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
                  className={`${item.props?.className || ''} reqore-segmented-control-item`}
                  pill={pill}
                  style={fitSize ? { ...item.props?.style, ...fittedItemStyle } : item.props?.style}
                >
                  {item.label}
                </ReqoreButton>
              </StyledItemWrapper>
            );
          })}
          {hasOverflow && (
            <StyledItemWrapper
              key={MORE_KEY}
              ref={(el: HTMLDivElement | null) => {
                wrapperRefs.current[MORE_KEY] = el;
              }}
              isSelected={isSelectedHidden}
              isBeforeSelected={false}
              isLast
              theme={theme}
              surfaces={surfaces}
              fluid={stretch}
            >
              <ReqorePopover
                component={ReqoreButton}
                componentProps={moreButtonProps}
                closeOnOutsideClick
                isReqoreComponent
                noWrapper
                handler='hoverStay'
                // the hidden segments' only way in: a tap opens it too
                opensOnTap
                content={moreMenu}
              />
            </StyledItemWrapper>
          )}
        </StyledSegmentedControl>
      );

      return foldToFit ? (
        <StyledFoldSlot ref={slotRef} className='reqore-segmented-control-slot'>
          {control}
        </StyledFoldSlot>
      ) : (
        control
      );
    }
  )
);

export default ReqoreSegmentedControl;
