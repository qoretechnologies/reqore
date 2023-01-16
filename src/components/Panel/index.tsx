import { size } from 'lodash';
import { darken, rgba } from 'polished';
import { ReactElement, forwardRef, useCallback, useMemo, useState } from 'react';
import { useUpdateEffect } from 'react-use';
import styled, { css } from 'styled-components';
import {
  GAP_FROM_SIZE,
  ICON_FROM_HEADER_SIZE,
  PADDING_FROM_SIZE,
  RADIUS_FROM_SIZE,
  TEXT_FROM_SIZE,
  TSizes,
} from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import {
  changeDarkness,
  changeLightness,
  getMainBackgroundColor,
  getReadableColor,
} from '../../helpers/colors';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { useReqoreTheme } from '../../hooks/useTheme';
import { useTooltip } from '../../hooks/useTooltip';
import { ACTIVE_ICON_SCALE, INACTIVE_ICON_SCALE } from '../../styles';
import {
  IReqoreIntent,
  IWithReqoreCustomTheme,
  IWithReqoreFlat,
  IWithReqoreFluid,
  IWithReqoreSize,
  IWithReqoreTooltip,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import ReqoreButton, { ButtonBadge, IReqoreButtonProps, TReqoreBadge } from '../Button';
import { StyledCollectionItemContent } from '../Collection/item';
import ReqoreControlGroup from '../ControlGroup';
import ReqoreDropdown from '../Dropdown';
import { IReqoreDropdownItem } from '../Dropdown/list';
import { IReqoreEffect, StyledEffect, TReqoreEffectColor } from '../Effect';
import { ReqoreHeading } from '../Header';
import ReqoreIcon, { StyledIconWrapper } from '../Icon';
import { ReqoreHorizontalSpacer, ReqoreSpacer } from '../Spacer';

export interface IReqorePanelAction extends IReqoreButtonProps, IWithReqoreTooltip, IReqoreIntent {
  label?: string | number;
  onClick?: () => void;
  actions?: Omit<IReqoreDropdownItem[], 'value'>;
  // Custom react element
  as?: React.ElementType;
  props?: { [key: string | number]: any } | undefined;
  // Hide the action if the condition is false
  show?: boolean;
  // Hide the action if the group is too small
  responsive?: boolean;
}

export interface IReqorePanelBottomAction extends IReqorePanelAction {
  position?: 'left' | 'right';
}

export interface IReqorePanelContent {}

export interface IReqorePanelProps
  extends IWithReqoreSize,
    IWithReqoreCustomTheme,
    IWithReqoreFlat,
    IReqoreIntent,
    IWithReqoreTooltip,
    IWithReqoreFluid,
    React.HTMLAttributes<HTMLDivElement> {
  as?: any;
  children?: any;
  icon?: IReqoreIconName;
  label?: string | ReactElement<any>;
  badge?: TReqoreBadge | TReqoreBadge[];
  collapsible?: boolean;
  isCollapsed?: boolean;
  onClose?: () => void;
  rounded?: boolean;
  actions?: (IReqorePanelAction | IReqorePanelAction[])[];
  bottomActions?: IReqorePanelBottomAction[];
  unMountContentOnCollapse?: boolean;
  onCollapseChange?: (isCollapsed?: boolean) => void;
  fill?: boolean;
  padded?: boolean;
  contentStyle?: React.CSSProperties;
  opacity?: number;
  blur?: number;
  minimal?: boolean;
  headerSize?: 1 | 2 | 3 | 4 | 5 | 6;
  contentSize?: TSizes;
  contentEffect?: IReqoreEffect;
  headerEffect?: IReqoreEffect;
  transparent?: boolean;
  iconColor?: TReqoreEffectColor;
}

export interface IStyledPanel extends IReqorePanelProps {
  theme: IReqoreTheme;
  noHorizontalPadding?: boolean;
}

export const StyledPanel = styled(StyledEffect)<IStyledPanel>`
  background-color: ${({ theme, opacity = 1 }: IStyledPanel) =>
    rgba(changeDarkness(getMainBackgroundColor(theme), 0.03), opacity)};
  border-radius: ${({ rounded }) => (rounded ? RADIUS_FROM_SIZE.normal : 0)}px;
  border: ${({ theme, flat, intent }) =>
    flat && !intent
      ? undefined
      : `1px solid ${changeLightness(
          intent ? theme.intents[intent] : getMainBackgroundColor(theme),
          0.2
        )}`};
  color: ${({ theme }) => getReadableColor(theme, undefined, undefined, true)};
  overflow: hidden;
  display: flex;
  flex-flow: column;
  position: relative;
  backdrop-filter: ${({ blur, opacity }) => (blur && opacity < 1 ? `blur(${blur}px)` : undefined)};
  transition: 0.2s ease-in-out;
  width: ${({ fluid }) => (fluid ? '100%' : undefined)};
  max-width: 100%;
  flex: ${({ fluid }) => (fluid ? '1 auto' : '0 0 auto')};

  ${({ interactive, theme, opacity = 1, flat, intent }) =>
    interactive
      ? css`
          cursor: pointer;

          &:hover {
            ${StyledPanelTitle} > div > ${StyledIconWrapper} {
              transform: scale(${ACTIVE_ICON_SCALE});
            }

            background-color: ${opacity === 0 && flat
              ? undefined
              : rgba(
                  darken(0.025, rgba(changeDarkness(getMainBackgroundColor(theme), 0.03), opacity)),
                  opacity
                )};

            border-color: ${flat && !intent
              ? undefined
              : `${changeLightness(
                  intent ? theme.intents[intent] : getMainBackgroundColor(theme),
                  0.25
                )}`};

            ${opacity !== 0 &&
            css`
              ${StyledCollectionItemContent}:after {
                background: linear-gradient(
                  to top,
                  ${rgba(
                      darken(
                        0.025,
                        rgba(changeDarkness(getMainBackgroundColor(theme), 0.03), opacity)
                      ),
                      opacity
                    )}
                    0%,
                  transparent 100%
                );
              }
            `}
          }
        `
      : undefined}

  ${({ fill, isCollapsed }) =>
    !isCollapsed && fill
      ? css`
          height: 100%;
          flex: 1;
        `
      : undefined}
`;

export const StyledPanelTitle = styled.div<IStyledPanel>`
  display: flex;
  background-color: ${({ theme, opacity = 1 }: IStyledPanel) =>
    rgba(changeLightness(getMainBackgroundColor(theme), 0.03), opacity)};
  justify-content: space-between;
  height: 40px;
  align-items: center;
  padding: ${({ noHorizontalPadding, contentSize }: IStyledPanel) =>
    `0 ${noHorizontalPadding ? 0 : '5px'} 0 ${
      noHorizontalPadding ? 0 : `${TEXT_FROM_SIZE[contentSize]}px`
    }`};
  border-bottom: ${({ theme, isCollapsed, flat, opacity = 1 }) =>
    !isCollapsed && !flat
      ? `1px solid ${rgba(changeLightness(getMainBackgroundColor(theme), 0.2), opacity)}`
      : null};
  transition: background-color 0.2s ease-out;
  overflow: hidden;
  flex: 0 0 auto;

  > div > ${StyledIconWrapper} {
    transform: scale(${INACTIVE_ICON_SCALE});
  }

  ${({ collapsible }) =>
    collapsible &&
    css`
      cursor: pointer;
      &:hover {
        > div > ${StyledIconWrapper} {
          transform: scale(${ACTIVE_ICON_SCALE});
        }

        background-color: ${({ theme, opacity = 1 }: IStyledPanel) =>
          rgba(changeLightness(getMainBackgroundColor(theme), 0.05), opacity)};
      }
    `}
`;

export const StyledPanelBottomActions = styled(StyledPanelTitle)`
  padding: ${({ noHorizontalPadding }: IStyledPanel) => `0 ${noHorizontalPadding ? 0 : '5px'}`};
  border-bottom: 0;
  border-top: ${({ theme, flat, opacity = 1 }) =>
    !flat
      ? `1px solid ${rgba(changeLightness(getMainBackgroundColor(theme), 0.2), opacity)}`
      : null};
`;

export const StyledPanelContent = styled.div<IStyledPanel>`
  display: ${({ isCollapsed }) => (isCollapsed ? 'none !important' : undefined)};
  padding: ${({ padded, contentSize, noHorizontalPadding }) =>
    !padded
      ? undefined
      : noHorizontalPadding
      ? `${TEXT_FROM_SIZE[contentSize]}px 0`
      : `${TEXT_FROM_SIZE[contentSize]}px`};
  // The padding is not needed when the panel is minimal and has title, since
  // the title already has padding and is transparent
  padding-top: ${({ minimal, hasLabel, padded, contentSize }) =>
    minimal && hasLabel && padded ? `${TEXT_FROM_SIZE[contentSize] / 2}px` : undefined};
  padding-bottom: ${({ minimal, padded, contentSize }) =>
    minimal && padded ? `${TEXT_FROM_SIZE[contentSize]}px` : undefined};
  flex: 1;
  overflow: auto;
  font-size: ${({ contentSize }) => TEXT_FROM_SIZE[contentSize]}px;
`;

export const StyledPanelTitleHeader = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding-right: 5px;
  flex: 1 1 auto;
  width: 100%;
  overflow: hidden;
  min-width: 100px;
`;

export const ReqorePanel = forwardRef<HTMLDivElement, IReqorePanelProps>(
  (
    {
      children,
      label,
      collapsible,
      onClose,
      rounded = true,
      actions = [],
      bottomActions = [],
      isCollapsed,
      customTheme,
      icon,
      intent,
      className,
      flat,
      unMountContentOnCollapse = true,
      onCollapseChange,
      padded = true,
      contentStyle,
      contentEffect,
      headerEffect = {},
      headerSize = 4,
      contentSize = 'normal',
      minimal,
      tooltip,
      badge,
      iconColor,
      fluid,
      ...rest
    }: IReqorePanelProps,
    ref
  ) => {
    const [_isCollapsed, setIsCollapsed] = useState(isCollapsed || false);
    const theme = useReqoreTheme(
      'main',
      customTheme ||
        (contentEffect?.gradient && minimal
          ? { main: Object.values(contentEffect.gradient.colors)[0] as TReqoreEffectColor }
          : undefined)
    );
    const { targetRef } = useCombinedRefs(ref);

    useTooltip(targetRef.current, tooltip);

    useUpdateEffect(() => {
      setIsCollapsed(!!isCollapsed);
    }, [isCollapsed]);

    // Return true if the card has a title bar, otherwise return false.
    const hasTitleBar: boolean = useMemo(
      () => !!label || collapsible || !!onClose || !!size(actions) || !!badge,
      [label, collapsible, onClose, actions, badge]
    );

    // If collapsible is true, toggle the isCollapsed state
    // If the isCollapsed state is true, the component is expanded
    // If the isCollapsed state is false, the component is collapsed
    const handleCollapseClick = useCallback(() => {
      // If collapsible is true, toggle the isCollapsed state
      if (collapsible) {
        setIsCollapsed(!_isCollapsed);
        onCollapseChange?.(!_isCollapsed);
      }
    }, [collapsible, _isCollapsed, onCollapseChange]);

    const leftBottomActions: IReqorePanelBottomAction[] = useMemo(
      () => bottomActions.filter(({ position }) => position === 'left' || !position),
      [bottomActions]
    );

    const rightBottomActions: IReqorePanelBottomAction[] = useMemo(
      () => bottomActions.filter(({ position }) => position === 'right'),
      [bottomActions]
    );

    // Calculates whether or not the bottom actions should be displayed.
    const hasBottomActions: boolean = useMemo(
      () => !!(size(leftBottomActions) || size(rightBottomActions)),
      [leftBottomActions, rightBottomActions]
    );

    const renderResponsiveActions = useCallback(
      (actionOrActions: IReqorePanelAction | IReqorePanelAction[], index: number) => {
        return renderActions(actionOrActions, index, true);
      },
      [actions]
    );

    const hasNonResponsiveActions = useCallback(
      (data: (IReqorePanelAction[] | IReqorePanelAction)[]) =>
        data.some((action) => !Array.isArray(action) && action.responsive === false),
      [actions, bottomActions]
    );

    const hasResponsiveActions = useCallback(
      (data: (IReqorePanelAction[] | IReqorePanelAction)[]) =>
        data.some((action) => Array.isArray(action) || action.responsive !== false),
      [actions, bottomActions]
    );

    const renderNonResponsiveActions = useCallback(
      (actionOrActions: IReqorePanelAction | IReqorePanelAction[], index: number) => {
        return renderActions(actionOrActions, index, false);
      },
      [actions]
    );

    const renderActions = useCallback(
      (
        actionOrActions: IReqorePanelAction | IReqorePanelAction[],
        index: number,
        includeResponsive
      ) => {
        const action: IReqorePanelAction = Array.isArray(actionOrActions)
          ? {
              show: true,
              responsive: true,
              as: ReqoreControlGroup,
              props: {
                stack: true,
                fluid: true,
                children: actionOrActions.map(renderActions),
              },
            }
          : actionOrActions;

        if (
          action.show === false ||
          (includeResponsive && action.responsive === false) ||
          (!includeResponsive && (action.responsive === true || !('responsive' in action)))
        ) {
          return null;
        }

        const {
          id,
          actions,
          label,
          intent,
          className,
          as: CustomElement,
          props = {},
          ...rest
        }: IReqorePanelAction = action;

        if (size(actions)) {
          return (
            <ReqoreDropdown<IReqoreButtonProps>
              {...rest}
              key={index}
              fixed
              label={label}
              items={actions}
              intent={intent}
              className={className}
              customTheme={rest.customTheme || theme}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.stopPropagation()}
              id={id}
            />
          );
        }

        if (CustomElement) {
          return (
            <CustomElement
              fixed
              {...props}
              key={index}
              customTheme={props.customTheme || theme}
              onClick={(e: React.MouseEvent<any>) => {
                e.stopPropagation();
                props?.onClick?.(e);
              }}
            />
          );
        }

        return (
          <ReqoreButton
            {...rest}
            id={id}
            fixed
            key={index}
            className={className}
            customTheme={rest.customTheme || theme}
            intent={intent}
            onClick={
              rest.onClick
                ? (e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    rest.onClick?.();
                  }
                : undefined
            }
          >
            {label}
          </ReqoreButton>
        );
      },
      [actions, theme]
    );

    const interactive: boolean = !!(
      rest.onClick ||
      rest.onMouseOver ||
      rest.onMouseEnter ||
      rest.onDoubleClick ||
      rest.onContextMenu
    );

    const transformedContentEffect: IReqoreEffect = useMemo(() => {
      const newContentEffect: IReqoreEffect = { ...contentEffect };

      if (newContentEffect?.gradient) {
        newContentEffect.gradient.borderColor = intent
          ? theme.intents[intent]
          : newContentEffect.gradient.borderColor;
      }

      newContentEffect.interactive = interactive;

      return newContentEffect;
    }, [intent, theme, contentEffect, interactive]);

    const opacity = rest.transparent ? 0 : rest.opacity;
    const noHorizontalPadding = opacity === 0 && flat && !intent;

    return (
      <StyledPanel
        {...rest}
        as={rest.as || 'div'}
        ref={targetRef}
        isCollapsed={_isCollapsed}
        rounded={rounded}
        flat={flat}
        intent={intent}
        className={`${className || ''} reqore-panel`}
        interactive={interactive}
        theme={theme}
        effect={transformedContentEffect}
        opacity={opacity}
        fluid={fluid}
      >
        {hasTitleBar && (
          <StyledPanelTitle
            flat={flat}
            isCollapsed={_isCollapsed}
            collapsible={collapsible}
            className='reqore-panel-title'
            onClick={handleCollapseClick}
            theme={theme}
            contentSize={contentSize}
            opacity={opacity ?? (minimal ? 0 : 1)}
            noHorizontalPadding={noHorizontalPadding}
          >
            <StyledPanelTitleHeader>
              {icon && (
                <ReqoreIcon
                  size={`${ICON_FROM_HEADER_SIZE[headerSize]}px`}
                  icon={icon}
                  margin='right'
                  color={iconColor}
                />
              )}
              {typeof label === 'string' ? (
                <ReqoreHeading
                  size={headerSize}
                  customTheme={theme}
                  effect={{
                    noWrap: true,
                    ...headerEffect,
                  }}
                >
                  {label}
                </ReqoreHeading>
              ) : (
                label
              )}
              {badge || badge === 0 ? (
                <>
                  <ButtonBadge
                    color={changeLightness(theme.main, 0.18)}
                    size='big'
                    content={badge}
                  />
                  <ReqoreSpacer width={PADDING_FROM_SIZE.normal} />
                </>
              ) : null}
            </StyledPanelTitleHeader>
            {hasResponsiveActions(actions) && (
              <ReqoreControlGroup responsive fluid horizontalAlign='flex-end' customTheme={theme}>
                {actions.map(renderResponsiveActions)}
              </ReqoreControlGroup>
            )}
            {collapsible || onClose || hasNonResponsiveActions(actions) ? (
              <>
                <ReqoreHorizontalSpacer width={GAP_FROM_SIZE.normal} />
                <ReqoreControlGroup fixed horizontalAlign='flex-end'>
                  {actions.map(renderNonResponsiveActions)}
                  {collapsible && (
                    <ReqoreButton
                      customTheme={theme}
                      icon={_isCollapsed ? 'ArrowDownSLine' : 'ArrowUpSLine'}
                      onClick={handleCollapseClick}
                      tooltip={_isCollapsed ? 'Expand' : 'Collapse'}
                      fixed
                    />
                  )}
                  {onClose && (
                    <ReqoreButton
                      fixed
                      customTheme={theme}
                      icon='CloseLine'
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        onClose?.();
                      }}
                    />
                  )}
                </ReqoreControlGroup>
              </>
            ) : null}
          </StyledPanelTitle>
        )}
        {!_isCollapsed || (_isCollapsed && !unMountContentOnCollapse) ? (
          <StyledPanelContent
            as={'div'}
            className='reqore-panel-content'
            hasLabel={!!label}
            isCollapsed={_isCollapsed}
            style={contentStyle}
            padded={padded}
            minimal={minimal}
            contentSize={contentSize}
            noHorizontalPadding={noHorizontalPadding}
          >
            {children}
          </StyledPanelContent>
        ) : null}
        {hasBottomActions && !_isCollapsed ? (
          <StyledPanelBottomActions
            flat={flat}
            className='reqore-panel-bottom-actions'
            theme={theme}
            opacity={opacity ?? (minimal ? 0 : 1)}
            noHorizontalPadding={noHorizontalPadding}
          >
            {hasNonResponsiveActions(leftBottomActions) ? (
              <>
                <ReqoreControlGroup>
                  {leftBottomActions.map(renderNonResponsiveActions)}
                </ReqoreControlGroup>
                <ReqoreHorizontalSpacer width={GAP_FROM_SIZE.normal} />
              </>
            ) : null}
            {hasResponsiveActions(leftBottomActions) && (
              <ReqoreControlGroup fluid responsive customTheme={theme}>
                {leftBottomActions.map(renderResponsiveActions)}
              </ReqoreControlGroup>
            )}
            {hasResponsiveActions(rightBottomActions) && (
              <ReqoreControlGroup fluid horizontalAlign='flex-end' responsive customTheme={theme}>
                {rightBottomActions.map(renderResponsiveActions)}
              </ReqoreControlGroup>
            )}
            {hasNonResponsiveActions(rightBottomActions) ? (
              <>
                <ReqoreHorizontalSpacer width={GAP_FROM_SIZE.normal} />
                <ReqoreControlGroup horizontalAlign='flex-end'>
                  {rightBottomActions.map(renderNonResponsiveActions)}
                </ReqoreControlGroup>
              </>
            ) : null}
          </StyledPanelBottomActions>
        ) : null}
      </StyledPanel>
    );
  }
);
