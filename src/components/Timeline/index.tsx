import { rgba } from 'polished';
import { forwardRef, memo, useCallback } from 'react';
import styled, { css } from 'styled-components';
import {
  CONTROL_TEXT_FROM_SIZE,
  GAP_FROM_SIZE,
  ICON_FROM_SIZE,
  PADDING_FROM_SIZE,
  RADIUS_FROM_SIZE,
  TEXT_FROM_SIZE,
  TSizes,
} from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import { changeLightness, getReadableColor } from '../../helpers/colors';
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
import { TReqoreEffectColor } from '../Effect';
import ReqoreIcon from '../Icon';
import { ReqoreTooltipComponent } from '../TooltipComponent';

export interface IReqoreTimelineItem extends IReqoreDisabled, IReqoreIntent {
  /** Title of the timeline item */
  title?: string;
  /** Content/description of the timeline item */
  content?: React.ReactNode;
  /** Timestamp or date to display */
  timestamp?: string | React.ReactNode;
  /** Icon to display in the timeline marker */
  icon?: IReqoreIconName;
  /** Custom color for the icon */
  iconColor?: TReqoreEffectColor;
  /** Click handler for interactive items */
  onClick?: () => void;
  /** Tooltip for the timeline item */
  tooltip?: TReqoreTooltipProp;
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
}

// Size of the timeline marker (icon container)
const MARKER_SIZE_FROM_SIZE: Record<TSizes, number> = {
  micro: 18,
  tiny: 22,
  small: 28,
  normal: 34,
  big: 42,
  huge: 52,
  massive: 64,
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
  padding-bottom: ${({ size }) => PADDING_FROM_SIZE[size] * 2}px;

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
  width: ${({ size }) => Math.max(6, ICON_FROM_SIZE[size] / 3)}px;
  height: ${({ size }) => Math.max(6, ICON_FROM_SIZE[size] / 3)}px;
  border-radius: 50%;
  background-color: ${({ theme, hasIntent }) =>
    hasIntent ? theme.main : changeLightness(theme.main, 0.2)};
`;

const StyledTimelineLine = styled.div<IReqoreTimelineItemStyle>`
  flex: 1;
  width: ${({ size }) => LINE_WIDTH_FROM_SIZE[size]}px;
  background-color: ${({ theme }) => rgba(changeLightness(theme.main, 0.1), 0.4)};
  margin-top: ${({ size }) => GAP_FROM_SIZE[size]}px;

  ${({ isLast }) =>
    isLast &&
    css`
      visibility: hidden;
    `}
`;

const StyledTimelineContent = styled.div<IReqoreTimelineStyle>`
  flex: 1;
  min-width: 0;
  padding-top: ${({ size }) => Math.max(2, (MARKER_SIZE_FROM_SIZE[size] - TEXT_FROM_SIZE[size]) / 2 - 2)}px;
`;

const StyledTimelineTitle = styled.div<IReqoreTimelineStyle>`
  font-size: ${({ size }) => TEXT_FROM_SIZE[size]}px;
  font-weight: 500;
  color: ${({ theme }) => getReadableColor(theme, undefined, undefined)};
  line-height: 1.4;
`;

const StyledTimelineDescription = styled.div<IReqoreTimelineStyle>`
  font-size: ${({ size }) => CONTROL_TEXT_FROM_SIZE[size]}px;
  color: ${({ theme }) => rgba(getReadableColor(theme, undefined, undefined), 0.7)};
  margin-top: ${({ size }) => GAP_FROM_SIZE[size]}px;
  line-height: 1.5;
`;

const StyledTimelineTimestamp = styled.div<IReqoreTimelineStyle>`
  font-size: ${({ size }) => CONTROL_TEXT_FROM_SIZE[size] - 1}px;
  color: ${({ theme }) => rgba(getReadableColor(theme, undefined, undefined), 0.5)};
  margin-top: ${({ size }) => GAP_FROM_SIZE[size]}px;
`;

const ReqoreTimeline = memo(
  forwardRef<HTMLOListElement, IReqoreTimelineProps>(
    (
      {
        items,
        size = 'normal',
        customTheme,
        intent,
        fluid = false,
        className,
        ...rest
      },
      ref
    ) => {
      const theme = useReqoreTheme('main', customTheme, intent);
      const baseTheme = useReqoreTheme('main', customTheme);

      const handleItemClick = useCallback(
        (item: IReqoreTimelineItem) => {
          if (item.onClick && !item.disabled) {
            item.onClick();
          }
        },
        []
      );

      const handleKeyDown = useCallback(
        (event: React.KeyboardEvent, item: IReqoreTimelineItem) => {
          if ((event.key === 'Enter' || event.key === ' ') && item.onClick && !item.disabled) {
            event.preventDefault();
            item.onClick();
          }
        },
        []
      );

      return (
        <StyledTimeline
          {...rest}
          ref={ref}
          theme={theme}
          size={size}
          fluid={fluid}
          className={`${className || ''} reqore-timeline`}
          role="list"
        >
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const isClickable = !!item.onClick && !item.disabled;
            const itemTheme = useReqoreTheme('main', customTheme, item.intent || intent);
            const hasIntent = !!(item.intent || intent);

            const itemContent = (
              <StyledTimelineItem
                key={index}
                theme={itemTheme}
                size={size}
                isClickable={isClickable}
                isLast={isLast}
                disabled={item.disabled}
                onClick={() => handleItemClick(item)}
                onKeyDown={(e) => handleKeyDown(e, item)}
                tabIndex={isClickable ? 0 : undefined}
                role="listitem"
                className="reqore-timeline-item"
              >
                <StyledTimelineMarkerWrapper theme={itemTheme} size={size}>
                  <StyledTimelineMarker
                    theme={itemTheme}
                    size={size}
                    hasIntent={hasIntent}
                    className="reqore-timeline-marker"
                  >
                    {item.icon ? (
                      <ReqoreIcon
                        icon={item.icon}
                        size={size}
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
                    <StyledTimelineTitle
                      theme={baseTheme}
                      size={size}
                      className="reqore-timeline-title"
                    >
                      {item.title}
                    </StyledTimelineTitle>
                  )}
                  {item.content && (
                    <StyledTimelineDescription
                      theme={baseTheme}
                      size={size}
                      className="reqore-timeline-content"
                    >
                      {item.content}
                    </StyledTimelineDescription>
                  )}
                  {item.timestamp && (
                    <StyledTimelineTimestamp
                      theme={baseTheme}
                      size={size}
                      className="reqore-timeline-timestamp"
                    >
                      {item.timestamp}
                    </StyledTimelineTimestamp>
                  )}
                </StyledTimelineContent>
              </StyledTimelineItem>
            );

            if (item.tooltip) {
              return (
                <ReqoreTooltipComponent
                  key={index}
                  tooltip={item.tooltip}
                  Component="div"
                >
                  {itemContent}
                </ReqoreTooltipComponent>
              );
            }

            return itemContent;
          })}
        </StyledTimeline>
      );
    }
  )
);

export default ReqoreTimeline;
