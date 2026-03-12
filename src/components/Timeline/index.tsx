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
import ReqoreIcon from '../Icon';
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

export interface IReqoreTimelineProps
  extends Omit<React.HTMLAttributes<HTMLOListElement>, 'children'>,
    IReqoreComponent,
    IWithReqoreCustomTheme,
    IReqoreIntent,
    IWithReqoreFluid,
    IWithReqoreSize {
  /** Array of timeline items to display */
  items: IReqoreTimelineItem[];
}

export interface IReqoreTimelineStyle {
  theme: IReqoreTheme;
  size: TSizes;
  fluid?: boolean;
}

export interface IReqoreTimelineItemStyle extends IReqoreTimelineStyle {
  isClickable?: boolean;
  isLast?: boolean;
  disabled?: boolean;
  hasIntent?: boolean;
  isCollapsed?: boolean;
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
  flex-direction: column;
  width: ${({ fluid }) => (fluid ? '100%' : 'auto')};
`;

const StyledTimelineItem = styled.li<IReqoreTimelineItemStyle>`
  display: flex;
  position: relative;

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
  margin-right: ${({ size }) => PADDING_FROM_SIZE[size]}px;
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

// Line now positioned to connect markers (icon to icon)
const StyledTimelineLine = styled.div<IReqoreTimelineItemStyle>`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: ${({ size }) => MARKER_SIZE_FROM_SIZE[size]}px;
  bottom: 0;
  width: ${({ size }) => LINE_WIDTH_FROM_SIZE[size]}px;
  background-color: ${({ theme }) => rgba(changeLightness(theme.main, 0.1), 0.4)};

  ${({ isLast }) =>
    isLast &&
    css`
      display: none;
    `}
`;

const StyledTimelineContent = styled.div<IReqoreTimelineItemStyle>`
  flex: 1;
  min-width: 0;
  padding-top: ${({ size }) =>
    Math.max(0, (MARKER_SIZE_FROM_SIZE[size] - TEXT_FROM_SIZE[size]) / 2 - 2)}px;
  padding-bottom: ${({ size }) => PADDING_FROM_SIZE[size] * 2}px;
`;

const StyledTimelineDetails = styled.div<IReqoreTimelineItemStyle>`
  overflow: hidden;
  transition: all 0.2s ease-in-out;

  ${({ isCollapsed }) =>
    isCollapsed &&
    css`
      max-height: 0;
      opacity: 0;
      margin-top: 0;
    `}

  ${({ isCollapsed, size }) =>
    !isCollapsed &&
    css`
      max-height: 1000px;
      opacity: 1;
      margin-top: ${GAP_FROM_SIZE[size]}px;
    `}
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
  index: number;
  isLast: boolean;
  size: TSizes;
  customTheme?: IReqoreTimelineProps['customTheme'];
  intent?: IReqoreTimelineProps['intent'];
  baseTheme: IReqoreTheme;
  isCollapsed: boolean;
  onToggleCollapse: (index: number, event: React.MouseEvent) => void;
  onItemClick: (item: IReqoreTimelineItem) => void;
  onKeyDown: (event: React.KeyboardEvent, item: IReqoreTimelineItem) => void;
}

const TimelineItemRenderer = memo(
  ({
    item,
    index,
    isLast,
    size,
    customTheme,
    intent,
    baseTheme,
    isCollapsed,
    onToggleCollapse,
    onItemClick,
    onKeyDown,
  }: ITimelineItemRendererProps) => {
    const itemTheme = useReqoreTheme('main', customTheme, item.intent || intent);
    const isClickable = !!item.onClick && !item.disabled;
    const hasIntent = !!(item.intent || intent);
    const hasContent = !!(item.content || item.timestamp);

    const itemContent = (
      <StyledTimelineItem
        theme={itemTheme}
        size={size}
        isClickable={isClickable}
        isLast={isLast}
        disabled={item.disabled}
        onClick={() => onItemClick(item)}
        onKeyDown={(e) => onKeyDown(e, item)}
        tabIndex={isClickable ? 0 : undefined}
        role='listitem'
        className='reqore-timeline-item'
      >
        <StyledTimelineMarkerWrapper theme={itemTheme} size={size}>
          <StyledTimelineMarker
            theme={itemTheme}
            size={size}
            hasIntent={hasIntent}
            className='reqore-timeline-marker'
          >
            {item.icon ? (
              <ReqoreIcon
                icon={item.icon}
                size={getOneLessSize(size)}
                color={item.iconColor || (hasIntent ? itemTheme.main : undefined)}
              />
            ) : (
              <StyledTimelineDot theme={itemTheme} size={size} hasIntent={hasIntent} />
            )}
          </StyledTimelineMarker>
          <StyledTimelineLine theme={baseTheme} size={size} isLast={isLast} />
        </StyledTimelineMarkerWrapper>
        <StyledTimelineContent theme={baseTheme} size={size}>
          {item.title && (
            <ReqoreControlGroup
              verticalAlign='center'
              wrap
              gapSize={size}
              onClick={item.collapsible ? (e) => onToggleCollapse(index, e) : undefined}
              style={item.collapsible ? { cursor: 'pointer' } : undefined}
            >
              {item.collapsible && (
                <ReqoreIcon
                  icon='ArrowDownSLine'
                  size={getOneLessSize(size)}
                  color={getReadableColor(baseTheme, undefined, undefined)}
                  rotation={isCollapsed ? -90 : 0}
                  className='reqore-timeline-collapse'
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
          {hasContent && (
            <StyledTimelineDetails theme={baseTheme} size={size} isCollapsed={isCollapsed}>
              {item.content &&
                (typeof item.content === 'string' || typeof item.content === 'number' ? (
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
                ))}
              {item.timestamp && (
                <ReqoreSpan
                  size={getOneLessSize(getOneLessSize(size))}
                  className='reqore-timeline-timestamp'
                  style={{
                    color: rgba(getReadableColor(baseTheme, undefined, undefined), 0.5),
                    display: 'block',
                    marginTop: `${GAP_FROM_SIZE[size]}px`,
                  }}
                >
                  {item.relativeTime ? <TimeAgo time={item.timestamp} /> : item.timestamp}
                </ReqoreSpan>
              )}
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

const ReqoreTimeline = memo(
  forwardRef<HTMLOListElement, IReqoreTimelineProps>(
    ({ items, size = 'normal', customTheme, intent, fluid = false, className, ...rest }, ref) => {
      const theme = useReqoreTheme('main', customTheme, intent);
      const baseTheme = useReqoreTheme('main', customTheme);

      // Track collapsed state for each item
      const [collapsedStates, setCollapsedStates] = useState<Record<number, boolean>>(() =>
        items.reduce((acc, item, index) => {
          if (item.collapsible) {
            acc[index] = item.isCollapsed ?? false;
          }
          return acc;
        }, {} as Record<number, boolean>)
      );

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

      const toggleCollapse = useCallback((index: number, event: React.MouseEvent) => {
        event.stopPropagation();
        setCollapsedStates((prev) => ({
          ...prev,
          [index]: !prev[index],
        }));
      }, []);

      return (
        <StyledTimeline
          {...rest}
          ref={ref}
          theme={theme}
          size={size}
          fluid={fluid}
          className={`${className || ''} reqore-timeline`}
          role='list'
        >
          {items.map((item, index) => (
            <TimelineItemRenderer
              key={index}
              item={item}
              index={index}
              isLast={index === items.length - 1}
              size={size}
              customTheme={customTheme}
              intent={intent}
              baseTheme={baseTheme}
              isCollapsed={item.collapsible ? (collapsedStates[index] ?? item.isCollapsed ?? false) : false}
              onToggleCollapse={toggleCollapse}
              onItemClick={handleItemClick}
              onKeyDown={handleKeyDown}
            />
          ))}
        </StyledTimeline>
      );
    }
  )
);

export default ReqoreTimeline;
