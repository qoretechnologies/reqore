import { rgba } from 'polished';
import { forwardRef, memo, useCallback, useState } from 'react';
import styled, { css } from 'styled-components';
import {
  GAP_FROM_SIZE,
  ICON_FROM_SIZE,
  PADDING_FROM_SIZE,
  RADIUS_FROM_SIZE,
  TEXT_FROM_SIZE,
  TSizes,
} from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import { changeLightness, getReadableColor } from '../../helpers/colors';
import { getOneLessSize } from '../../helpers/utils';
import { useReqoreProperty } from '../../hooks/useReqoreContext';
import { useReqoreTheme } from '../../hooks/useTheme';
import {
  IReqoreComponent,
  IReqoreDisabled,
  IReqoreIntent,
  IWithReqoreCustomTheme,
  IWithReqoreFluid,
  IWithReqoreSize,
  TReqoreTooltipProp,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import { TReqoreBadge } from '../Button';
import ReqoreControlGroup from '../ControlGroup';
import { IReqoreEffect, TReqoreEffectColor } from '../Effect';
import ReqoreIcon, { IReqoreIconProps } from '../Icon';
import { ReqoreP } from '../Paragraph';
import { ReqoreSpan } from '../Span';
import ReqoreTag, { IReqoreTagProps } from '../Tag';
import ReqoreTagGroup from '../Tag/group';
import { TimeAgo } from '../TimeAgo';
import { ReqoreTooltipComponent } from '../TooltipComponent';

export interface IReqoreTimelineItem extends IReqoreDisabled, IReqoreIntent {
  /** Title of the timeline item */
  title?: string;
  /** Content/description of the timeline item */
  content?: React.ReactNode;
  /** Timestamp or date to display */
  timestamp?: string | number;
  /** Display timestamp as relative time (e.g., "2 hours ago") */
  relativeTime?: boolean;
  /** Icon to display in the timeline marker */
  icon?: IReqoreIconName;
  /** Custom color for the icon */
  iconColor?: TReqoreEffectColor;
  /** Additional props passed to the ReqoreIcon component */
  iconProps?: Partial<IReqoreIconProps>;
  /** Click handler for interactive items */
  onClick?: () => void;
  /** Tooltip for the timeline item */
  tooltip?: TReqoreTooltipProp;
  /** Badge(s) to display next to the title */
  badge?: TReqoreBadge | TReqoreBadge[];
  /** Whether the item is collapsible */
  collapsible?: boolean;
  /** Whether the item is initially collapsed (only if collapsible) */
  isCollapsed?: boolean;
  /** Effect for the title */
  titleEffect?: IReqoreEffect;
  /** Effect for the content */
  contentEffect?: IReqoreEffect;
}

/**
 * A folded run of timeline items, rendered as a single compact "N hidden"
 * marker that expands the hidden items inline on click (GitHub-diff style).
 * Purely visual — the caller decides which consecutive items to fold and
 * passes them here. Only honored in vertical mode.
 */
export interface IReqoreTimelineCollapsedRange {
  /** The items hidden inside this run. */
  collapsedItems: IReqoreTimelineItem[];
  /** Text next to the dots; defaults to `${n} hidden`. */
  label?: string;
  /** Marker icon for the folded run; defaults to a vertical 3-dots. */
  icon?: IReqoreIconName;
  iconColor?: TReqoreEffectColor;
  /** Start expanded. Defaults to `false` (folded). */
  defaultExpanded?: boolean;
}

/** A timeline entry: either a normal item or a folded run of items. */
export type TReqoreTimelineEntry = IReqoreTimelineItem | IReqoreTimelineCollapsedRange;

/** Narrows a timeline entry to a folded run. */
export function isReqoreTimelineCollapsedRange(
  entry: TReqoreTimelineEntry
): entry is IReqoreTimelineCollapsedRange {
  return 'collapsedItems' in entry && Array.isArray(entry.collapsedItems);
}

export interface IReqoreTimelineProps
  extends Omit<React.HTMLAttributes<HTMLOListElement>, 'children'>,
    IReqoreComponent,
    IWithReqoreCustomTheme,
    IReqoreIntent,
    IWithReqoreFluid,
    IWithReqoreSize {
  /**
   * Array of timeline entries to display. An entry is either a normal
   * `IReqoreTimelineItem` or an `IReqoreTimelineCollapsedRange` — a folded run
   * of items shown as a single "N hidden" marker that expands on click.
   */
  items: TReqoreTimelineEntry[];
  /**
   * Layout direction. `'vertical'` stacks items top-to-bottom (default).
   * `'horizontal'` lays them out left-to-right with the connector line between markers.
   * Horizontal timelines do not render the `content` body or collapse controls — only
   * marker, title, timestamp and badges are shown.
   */
  direction?: 'vertical' | 'horizontal';
  /**
   * When `true` (default), `direction='horizontal'` automatically falls back to vertical on
   * mobile viewports — horizontal step indicators get cramped on narrow screens. Set to
   * `false` to force the requested direction regardless of viewport.
   */
  responsive?: boolean;
  /**
   * Controlled collapsed state — map of item index to collapsed boolean.
   * When provided, the component becomes controlled for those indices.
   * Items not in the map fall back to their own `isCollapsed` prop.
   * Only honored in vertical mode.
   */
  collapsedState?: Record<number, boolean>;
  /** Callback fired when any item's collapsed state changes (click, keyboard, etc.) */
  onCollapseChange?: (index: number, isCollapsed: boolean) => void;
  /**
   * Callback fired when a folded run (`IReqoreTimelineCollapsedRange`) is
   * expanded or re-folded. `index` is the entry's index in `items`.
   */
  onRangeToggle?: (index: number, isExpanded: boolean) => void;
}

export interface IReqoreTimelineStyle {
  theme: IReqoreTheme;
  size: TSizes;
  fluid?: boolean;
  direction?: 'vertical' | 'horizontal';
}

export interface IReqoreTimelineItemStyle extends IReqoreTimelineStyle {
  isClickable?: boolean;
  isLast?: boolean;
  disabled?: boolean;
  hasIntent?: boolean;
  isCollapsed?: boolean;
  /** Render the connector line dotted (used around a collapsed run). */
  dashed?: boolean;
}

// Size of the timeline marker (icon container) - made smaller
const MARKER_SIZE_FROM_SIZE: Record<TSizes, number> = {
  micro: 14,
  tiny: 18,
  small: 22,
  normal: 26,
  big: 32,
  huge: 40,
  massive: 50,
};

// Line width for the connector
const LINE_WIDTH_FROM_SIZE: Record<TSizes, number> = {
  micro: 1,
  tiny: 1,
  small: 2,
  normal: 2,
  big: 2,
  huge: 3,
  massive: 3,
};

const StyledTimeline = styled.ol<IReqoreTimelineStyle>`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: ${({ direction }) => (direction === 'horizontal' ? 'row' : 'column')};
  width: ${({ fluid, direction }) =>
    direction === 'horizontal' ? '100%' : fluid ? '100%' : 'auto'};
  ${({ direction }) =>
    direction === 'horizontal' &&
    css`
      align-items: flex-start;
    `}
`;

const StyledTimelineItem = styled.li<IReqoreTimelineItemStyle>`
  display: flex;
  position: relative;

  ${({ direction, theme, size, isLast }) =>
    direction === 'horizontal' &&
    css`
      flex-direction: column;
      align-items: center;
      flex: 1 1 0;
      min-width: 0;
      text-align: center;

      /* Connector line to the next item. Each item is the same flex width, so the line
         starts at the right edge of this item's marker and ends at the left edge of the
         next item's marker — distance = item_width - marker_size. */
      &::after {
        content: '';
        position: absolute;
        top: ${MARKER_SIZE_FROM_SIZE[size] / 2 - LINE_WIDTH_FROM_SIZE[size] / 2}px;
        left: calc(50% + ${MARKER_SIZE_FROM_SIZE[size] / 2}px);
        width: calc(100% - ${MARKER_SIZE_FROM_SIZE[size]}px);
        height: ${LINE_WIDTH_FROM_SIZE[size]}px;
        background-color: ${rgba(changeLightness(theme.main, 0.1), 0.4)};
        ${isLast &&
        css`
          display: none;
        `}
      }
    `}

  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.5;
      pointer-events: none;
    `}

  ${({ isClickable, theme }) =>
    isClickable &&
    css`
      cursor: pointer;

      &:hover .reqore-timeline-marker {
        background-color: ${rgba(changeLightness(theme.main, 0.1), 0.3)};
        transform: scale(1.1);
      }

      &:focus-visible {
        outline: 2px solid ${changeLightness(theme.main, 0.2)};
        outline-offset: 2px;
        border-radius: ${RADIUS_FROM_SIZE.normal}px;
      }
    `}
`;

const StyledTimelineMarkerWrapper = styled.div<IReqoreTimelineItemStyle>`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: ${({ size }) => MARKER_SIZE_FROM_SIZE[size]}px;
  margin-right: ${({ direction, size }) =>
    direction === 'horizontal' ? 0 : `${PADDING_FROM_SIZE[size]}px`};
  position: relative;
`;

const StyledTimelineMarker = styled.div<IReqoreTimelineItemStyle>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ size }) => MARKER_SIZE_FROM_SIZE[size]}px;
  height: ${({ size }) => MARKER_SIZE_FROM_SIZE[size]}px;
  border-radius: 50%;
  background-color: ${({ theme, hasIntent }) =>
    hasIntent ? rgba(theme.main, 0.2) : rgba(changeLightness(theme.main, 0.1), 0.2)};
  border: ${({ size }) => LINE_WIDTH_FROM_SIZE[size]}px solid
    ${({ theme, hasIntent }) =>
      hasIntent ? theme.main : rgba(changeLightness(theme.main, 0.2), 0.6)};
  transition: all 0.2s ease-in-out;
  flex-shrink: 0;
  z-index: 1;
`;

const StyledTimelineDot = styled.div<IReqoreTimelineItemStyle>`
  width: ${({ size }) => Math.max(4, ICON_FROM_SIZE[size] / 4)}px;
  height: ${({ size }) => Math.max(4, ICON_FROM_SIZE[size] / 4)}px;
  border-radius: 50%;
  background-color: ${({ theme, hasIntent }) =>
    hasIntent ? theme.main : changeLightness(theme.main, 0.2)};
`;

// Line now positioned to connect markers (icon to icon) — vertical mode only.
// Horizontal mode draws its connector via a pseudo-element on StyledTimelineItem.
const StyledTimelineLine = styled.div<IReqoreTimelineItemStyle>`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: ${({ size }) => MARKER_SIZE_FROM_SIZE[size]}px;
  bottom: 0;
  width: ${({ size }) => LINE_WIDTH_FROM_SIZE[size]}px;

  ${({ dashed, theme }) =>
    dashed
      ? css`
          /* Dotted connector — signals the folded/skipped run boundary. */
          background-image: linear-gradient(
            to bottom,
            ${rgba(changeLightness(theme.main, 0.2), 0.6)} 0 3px,
            transparent 3px 7px
          );
          background-size: 100% 7px;
          background-repeat: repeat-y;
        `
      : css`
          background-color: ${rgba(changeLightness(theme.main, 0.1), 0.4)};
        `}

  ${({ isLast }) =>
    isLast &&
    css`
      display: none;
    `}
`;

const StyledTimelineContent = styled.div<IReqoreTimelineItemStyle>`
  flex: 1;
  min-width: 0;
  ${({ direction, size }) =>
    direction === 'horizontal'
      ? css`
          padding-top: ${GAP_FROM_SIZE[size]}px;
          padding-bottom: 0;
          width: 100%;
          text-align: center;
        `
      : css`
          padding-top: ${Math.max(0, (MARKER_SIZE_FROM_SIZE[size] - TEXT_FROM_SIZE[size]) / 2 - 2)}px;
          padding-bottom: ${PADDING_FROM_SIZE[size] * 2}px;
        `}
`;

const StyledTimelineDetails = styled.div<IReqoreTimelineItemStyle>`
  display: grid;
  transition: grid-template-rows 0.2s ease-in-out, opacity 0.2s ease-in-out,
    margin-top 0.2s ease-in-out;

  ${({ isCollapsed }) =>
    isCollapsed &&
    css`
      grid-template-rows: 0fr;
      opacity: 0;
      margin-top: 0;
    `}

  ${({ isCollapsed, size }) =>
    !isCollapsed &&
    css`
      grid-template-rows: 1fr;
      opacity: 1;
      margin-top: ${GAP_FROM_SIZE[size]}px;
    `}

  > * {
    overflow: hidden;
    min-height: 0;
  }
`;

interface IBadgeProps extends IWithReqoreSize {
  content?: TReqoreBadge | TReqoreBadge[];
}

const TimelineBadge = memo(({ size, content }: IBadgeProps) => {
  const renderTag = useCallback(
    (badge: TReqoreBadge, key: number) => (
      <ReqoreTag
        key={key}
        size={getOneLessSize(size)}
        asBadge
        className='reqore-timeline-badge'
        labelAlign='center'
        minimal
        {...(typeof badge === 'string' || typeof badge === 'number'
          ? { label: badge }
          : (badge as IReqoreTagProps))}
      />
    ),
    [size]
  );

  if (!content && content !== 0) {
    return null;
  }

  if (Array.isArray(content)) {
    return (
      <ReqoreTagGroup className='reqore-timeline-badges'>
        {content.map((badge, index) => renderTag(badge, index))}
      </ReqoreTagGroup>
    );
  }

  return renderTag(content, 0);
});

interface ITimelineItemRendererProps {
  item: IReqoreTimelineItem;
  isLast: boolean;
  size: TSizes;
  customTheme?: IReqoreTimelineProps['customTheme'];
  intent?: IReqoreTimelineProps['intent'];
  baseTheme: IReqoreTheme;
  isCollapsed: boolean;
  direction: 'vertical' | 'horizontal';
  /** Draw this item's downward connector dotted (next to a collapsed run). */
  lineDashed?: boolean;
  onToggle: (event: React.MouseEvent) => void;
  onItemClick: (item: IReqoreTimelineItem) => void;
  onKeyDown: (event: React.KeyboardEvent, item: IReqoreTimelineItem) => void;
}

const TimelineItemRenderer = memo(
  ({
    item,
    isLast,
    size,
    customTheme,
    intent,
    baseTheme,
    isCollapsed,
    direction,
    lineDashed,
    onToggle,
    onItemClick,
    onKeyDown,
  }: ITimelineItemRendererProps) => {
    const itemTheme = useReqoreTheme('main', customTheme, item.intent || intent);
    const isClickable = !!item.onClick && !item.disabled;
    const hasIntent = !!(item.intent || intent);
    const isHorizontal = direction === 'horizontal';
    // Horizontal mode is intentionally minimal: no expanding/collapsing and no content body.
    const showCollapsible = !isHorizontal && item.collapsible;
    const showContent = !isHorizontal && item.content;

    const itemContent = (
      <StyledTimelineItem
        theme={itemTheme}
        size={size}
        direction={direction}
        isClickable={isClickable}
        isLast={isLast}
        disabled={item.disabled}
        onClick={() => onItemClick(item)}
        onKeyDown={(e) => onKeyDown(e, item)}
        tabIndex={isClickable ? 0 : undefined}
        role='listitem'
        className='reqore-timeline-item'
      >
        <StyledTimelineMarkerWrapper theme={itemTheme} size={size} direction={direction}>
          <StyledTimelineMarker
            theme={itemTheme}
            size={size}
            hasIntent={hasIntent}
            className='reqore-timeline-marker'
          >
            {item.icon ? (
              <ReqoreIcon
                icon={item.icon}
                size={getOneLessSize(getOneLessSize(size))}
                color={item.iconColor || (hasIntent ? itemTheme.main : undefined)}
                {...item.iconProps}
              />
            ) : (
              <StyledTimelineDot theme={itemTheme} size={size} hasIntent={hasIntent} />
            )}
          </StyledTimelineMarker>
          {!isHorizontal && (
            <StyledTimelineLine
              theme={baseTheme}
              size={size}
              isLast={isLast}
              dashed={lineDashed}
            />
          )}
        </StyledTimelineMarkerWrapper>
        <StyledTimelineContent theme={baseTheme} size={size} direction={direction}>
          {item.title && (
            <ReqoreControlGroup
              verticalAlign='flex-start'
              horizontalAlign={isHorizontal ? 'center' : undefined}
              vertical={isHorizontal}
              gapSize={size}
              onClick={showCollapsible ? (e) => onToggle(e) : undefined}
              style={showCollapsible ? { cursor: 'pointer' } : undefined}
            >
              {showCollapsible && (
                <ReqoreIcon
                  icon='ArrowDownSLine'
                  size={getOneLessSize(size)}
                  color={getReadableColor(baseTheme, undefined, undefined)}
                  rotation={isCollapsed ? -90 : 0}
                  className='reqore-timeline-collapse'
                  style={{ flexShrink: 0 }}
                />
              )}
              <ReqoreSpan
                size={size}
                effect={item.titleEffect}
                className='reqore-timeline-title'
                style={{ fontWeight: 500 }}
              >
                {item.title}
              </ReqoreSpan>
              {(item.badge || item.badge === 0) && (
                <TimelineBadge content={item.badge} size={size} />
              )}
            </ReqoreControlGroup>
          )}
          {item.timestamp && (
            <ReqoreSpan
              size={getOneLessSize(getOneLessSize(size))}
              className='reqore-timeline-timestamp'
              style={{
                color: rgba(getReadableColor(baseTheme, undefined, undefined), 0.5),
                display: 'block',
                marginTop: `${GAP_FROM_SIZE[size]}px`,
                textAlign: isHorizontal ? 'center' : undefined,
              }}
            >
              {item.relativeTime ? <TimeAgo time={item.timestamp} /> : item.timestamp}
            </ReqoreSpan>
          )}
          {showContent && (
            <StyledTimelineDetails theme={baseTheme} size={size} isCollapsed={isCollapsed}>
              <div>
                {typeof item.content === 'string' || typeof item.content === 'number' ? (
                  <ReqoreP
                    size={getOneLessSize(size)}
                    effect={item.contentEffect}
                    className='reqore-timeline-content'
                    style={{
                      color: rgba(getReadableColor(baseTheme, undefined, undefined), 0.7),
                      lineHeight: 1.5,
                    }}
                  >
                    {item.content}
                  </ReqoreP>
                ) : (
                  <div className='reqore-timeline-content'>{item.content}</div>
                )}
              </div>
            </StyledTimelineDetails>
          )}
        </StyledTimelineContent>
      </StyledTimelineItem>
    );

    if (item.tooltip) {
      return (
        <ReqoreTooltipComponent tooltip={item.tooltip} Component='div'>
          {itemContent}
        </ReqoreTooltipComponent>
      );
    }

    return itemContent;
  }
);

interface ICollapsedRunRendererProps {
  range: IReqoreTimelineCollapsedRange;
  isLast: boolean;
  size: TSizes;
  baseTheme: IReqoreTheme;
  expanded: boolean;
  onToggle: () => void;
}

/**
 * The folded "N hidden" marker for a collapsed run — one muted, clickable
 * timeline node that stands in for the hidden items (or, when expanded, a
 * "Hide" control that re-folds them). Vertical mode only.
 */
const CollapsedRunRenderer = memo(
  ({ range, isLast, size, baseTheme, expanded, onToggle }: ICollapsedRunRendererProps) => {
    const n = range.collapsedItems.length;
    // Hex for the icon (ReqoreIcon `color` wants a TReqoreEffectColor); rgba for
    // the label's plain CSS colour. Both muted to read as "skipped".
    const mutedIconColor = changeLightness(baseTheme.main, 0.2);
    const mutedTextColor = rgba(getReadableColor(baseTheme, undefined, undefined), 0.55);
    const label = expanded ? 'Hide' : (range.label ?? `${n} hidden`);
    return (
      <StyledTimelineItem
        theme={baseTheme}
        size={size}
        direction='vertical'
        isClickable
        isLast={isLast}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
        tabIndex={0}
        role='listitem'
        className='reqore-timeline-item reqore-timeline-collapsed-run'
      >
        <StyledTimelineMarkerWrapper theme={baseTheme} size={size} direction='vertical'>
          <StyledTimelineMarker
            theme={baseTheme}
            size={size}
            hasIntent={false}
            className='reqore-timeline-marker'
          >
            <ReqoreIcon
              icon={range.icon ?? (expanded ? 'ArrowUpSLine' : 'More2Line')}
              size={getOneLessSize(getOneLessSize(size))}
              color={range.iconColor ?? mutedIconColor}
            />
          </StyledTimelineMarker>
          {!isLast && (
            <StyledTimelineLine
              theme={baseTheme}
              size={size}
              isLast={isLast}
              dashed={!expanded}
            />
          )}
        </StyledTimelineMarkerWrapper>
        <StyledTimelineContent theme={baseTheme} size={size} direction='vertical'>
          <ReqoreControlGroup
            verticalAlign='center'
            gapSize={size}
            style={{ cursor: 'pointer' }}
          >
            <ReqoreSpan
              size={size}
              className='reqore-timeline-collapsed-run-label'
              style={{ fontWeight: 500, color: mutedTextColor }}
            >
              {label}
            </ReqoreSpan>
          </ReqoreControlGroup>
        </StyledTimelineContent>
      </StyledTimelineItem>
    );
  }
);

const ReqoreTimeline = memo(
  forwardRef<HTMLOListElement, IReqoreTimelineProps>(
    (
      {
        items,
        size = 'normal',
        customTheme,
        inheritCustomTheme,
        intent,
        fluid = false,
        className,
        direction: directionProp = 'vertical',
        responsive = true,
        collapsedState,
        onCollapseChange,
        onRangeToggle,
        ...rest
      },
      ref
    ) => {
      const theme = useReqoreTheme('main', customTheme, intent, undefined, inheritCustomTheme);
      const baseTheme = useReqoreTheme('main', customTheme, undefined, undefined, inheritCustomTheme);
      const isMobile = useReqoreProperty('isMobile');
      // Horizontal step rows get cramped on narrow viewports. Auto-fall back to vertical on
      // mobile unless the caller explicitly opts out via `responsive={false}`.
      const direction =
        responsive && isMobile && directionProp === 'horizontal' ? 'vertical' : directionProp;

      // Internal collapse state for TOP-LEVEL items (uncontrolled mode). Folded
      // runs are skipped here — they carry their own expand state below.
      const [internalCollapsedStates, setInternalCollapsedStates] = useState<
        Record<number, boolean>
      >(() =>
        items.reduce((acc, entry, index) => {
          if (!isReqoreTimelineCollapsedRange(entry) && entry.collapsible) {
            acc[index] = entry.isCollapsed ?? false;
          }
          return acc;
        }, {} as Record<number, boolean>)
      );

      // Expand state per folded run (uncontrolled), seeded from `defaultExpanded`.
      const [expandedRanges, setExpandedRanges] = useState<Record<number, boolean>>(() =>
        items.reduce((acc, entry, index) => {
          if (isReqoreTimelineCollapsedRange(entry)) {
            acc[index] = entry.defaultExpanded ?? false;
          }
          return acc;
        }, {} as Record<number, boolean>)
      );

      // Collapse state for items rendered INSIDE an expanded run, keyed by
      // `${rangeIndex}-${nestedIndex}` (always uncontrolled).
      const [nestedCollapsedStates, setNestedCollapsedStates] = useState<
        Record<string, boolean>
      >({});

      const isControlled = collapsedState !== undefined;

      const handleItemClick = useCallback((item: IReqoreTimelineItem) => {
        if (item.onClick && !item.disabled) {
          item.onClick();
        }
      }, []);

      const handleKeyDown = useCallback((event: React.KeyboardEvent, item: IReqoreTimelineItem) => {
        if ((event.key === 'Enter' || event.key === ' ') && item.onClick && !item.disabled) {
          event.preventDefault();
          item.onClick();
        }
      }, []);

      const toggleCollapse = useCallback(
        (index: number, event: React.MouseEvent) => {
          event.stopPropagation();
          if (isControlled) {
            const entry = items[index];
            const fallback =
              entry && !isReqoreTimelineCollapsedRange(entry) ? entry.isCollapsed ?? false : false;
            const currentCollapsed = collapsedState![index] ?? fallback;
            onCollapseChange?.(index, !currentCollapsed);
          } else {
            setInternalCollapsedStates((prev) => {
              const next = !prev[index];
              onCollapseChange?.(index, next);
              return { ...prev, [index]: next };
            });
          }
        },
        [isControlled, collapsedState, items, onCollapseChange]
      );

      const getIsCollapsed = useCallback(
        (item: IReqoreTimelineItem, index: number): boolean => {
          if (!item.collapsible) return false;
          if (isControlled) {
            return collapsedState![index] ?? item.isCollapsed ?? false;
          }
          return internalCollapsedStates[index] ?? item.isCollapsed ?? false;
        },
        [isControlled, collapsedState, internalCollapsedStates]
      );

      const getIsRangeExpanded = useCallback(
        (range: IReqoreTimelineCollapsedRange, index: number): boolean =>
          expandedRanges[index] ?? range.defaultExpanded ?? false,
        [expandedRanges]
      );

      const toggleRange = useCallback(
        (index: number, range: IReqoreTimelineCollapsedRange) => {
          const next = !getIsRangeExpanded(range, index);
          setExpandedRanges((prev) => ({ ...prev, [index]: next }));
          onRangeToggle?.(index, next);
        },
        [getIsRangeExpanded, onRangeToggle]
      );

      const getNestedCollapsed = useCallback(
        (item: IReqoreTimelineItem, key: string): boolean => {
          if (!item.collapsible) return false;
          return nestedCollapsedStates[key] ?? item.isCollapsed ?? false;
        },
        [nestedCollapsedStates]
      );

      const toggleNested = useCallback(
        (key: string, item: IReqoreTimelineItem, event: React.MouseEvent) => {
          event.stopPropagation();
          setNestedCollapsedStates((prev) => ({
            ...prev,
            [key]: !(prev[key] ?? item.isCollapsed ?? false),
          }));
        },
        []
      );

      // Flatten entries into the render sequence: normal items, plus a fold
      // marker per collapsed run (followed by its items when expanded). `isLast`
      // (the connector line) is computed over THIS flattened order so it never
      // breaks across an expanded run.
      type TRenderRow =
        | {
            kind: 'item';
            item: IReqoreTimelineItem;
            isCollapsed: boolean;
            onToggle: (event: React.MouseEvent) => void;
            key: string;
          }
        | {
            kind: 'run';
            range: IReqoreTimelineCollapsedRange;
            expanded: boolean;
            onToggle: () => void;
            key: string;
          };

      const rows: TRenderRow[] = [];
      items.forEach((entry, entryIndex) => {
        if (!isReqoreTimelineCollapsedRange(entry)) {
          rows.push({
            kind: 'item',
            item: entry,
            isCollapsed: getIsCollapsed(entry, entryIndex),
            onToggle: (event) => toggleCollapse(entryIndex, event),
            key: `i${entryIndex}`,
          });
          return;
        }
        // A folded run. Horizontal mode has no fold affordance — inline the items.
        const expanded = direction === 'horizontal' || getIsRangeExpanded(entry, entryIndex);
        if (direction === 'vertical') {
          rows.push({
            kind: 'run',
            range: entry,
            expanded,
            onToggle: () => toggleRange(entryIndex, entry),
            key: `r${entryIndex}`,
          });
        }
        if (expanded) {
          entry.collapsedItems.forEach((nested, nestedIndex) => {
            const nestedKey = `${entryIndex}-${nestedIndex}`;
            rows.push({
              kind: 'item',
              item: nested,
              isCollapsed: getNestedCollapsed(nested, nestedKey),
              onToggle: (event) => toggleNested(nestedKey, nested, event),
              key: `n${nestedKey}`,
            });
          });
        }
      });

      return (
        <StyledTimeline
          {...rest}
          ref={ref}
          theme={theme}
          size={size}
          fluid={fluid}
          direction={direction}
          className={`${className || ''} reqore-timeline reqore-timeline-${direction}`}
          role='list'
        >
          {rows.map((row, rowIndex) => {
            const isLast = rowIndex === rows.length - 1;
            if (row.kind === 'run') {
              return (
                <CollapsedRunRenderer
                  key={row.key}
                  range={row.range}
                  isLast={isLast}
                  size={size}
                  baseTheme={baseTheme}
                  expanded={row.expanded}
                  onToggle={row.onToggle}
                />
              );
            }
            // A normal item's downward connector goes dotted when the next
            // entry is a *folded* run — the dotted boundary reads as "hidden".
            // An expanded run reveals its items, so that line stays solid.
            const nextRow = rows[rowIndex + 1];
            const lineDashed =
              nextRow !== undefined && nextRow.kind === 'run' && !nextRow.expanded;
            return (
              <TimelineItemRenderer
                key={row.key}
                item={row.item}
                isLast={isLast}
                size={size}
                customTheme={customTheme}
                intent={intent}
                baseTheme={baseTheme}
                direction={direction}
                isCollapsed={row.isCollapsed}
                lineDashed={lineDashed}
                onToggle={row.onToggle}
                onItemClick={handleItemClick}
                onKeyDown={handleKeyDown}
              />
            );
          })}
        </StyledTimeline>
      );
    }
  )
);

export default ReqoreTimeline;
