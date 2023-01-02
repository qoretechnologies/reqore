import { size } from 'lodash';
import { darken, rgba } from 'polished';
import { ReactElement, forwardRef, useCallback, useMemo, useState } from 'react';
import { useUpdateEffect } from 'react-use';
import styled, { css } from 'styled-components';
import {
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
  IWithReqoreSize,
  IWithReqoreTooltip,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import ReqoreButton, { ButtonBadge, IReqoreButtonProps, TReqoreBadge } from '../Button';
import { StyledCollectionItemContent } from '../Collection/item';
import ReqoreControlGroup from '../ControlGroup';
import ReqoreDropdown from '../Dropdown';
import { IReqoreDropdownItem } from '../Dropdown/list';
import { IReqoreEffect, StyledEffect } from '../Effect';
import { ReqoreHeading } from '../Header';
import ReqoreIcon, { StyledIconWrapper } from '../Icon';
import { ReqoreSpacer } from '../Spacer';

export interface IReqorePanelAction extends IReqoreButtonProps, IWithReqoreTooltip, IReqoreIntent {
  label?: string | number;
  onClick?: () => void;
  actions?: Omit<IReqoreDropdownItem[], 'value'>;
  // Custom react element
  as?: React.ElementType;
  props?: any;
}

export interface IReqorePanelBottomAction extends IReqorePanelAction {
  position: 'left' | 'right';
}

export interface IReqorePanelContent {}

export interface IReqorePanelProps
  extends IWithReqoreSize,
    IWithReqoreCustomTheme,
    IWithReqoreFlat,
    IReqoreIntent,
    IWithReqoreTooltip,
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
}

export interface IStyledPanel extends IReqorePanelProps {
  theme: IReqoreTheme;
  noHorizontalPadding?: boolean;
}

export const StyledPanel = styled(StyledEffect)<IStyledPanel>`
  background-color: ${({ theme, opacity = 1 }: IStyledPanel) =>
    rgba(changeDarkness(getMainBackgroundColor(theme), 0.03), opacity)};
  border-radius: ${({ rounded }) => (rounded ? RADIUS_FROM_SIZE.normal : 0)}px;
  border: ${({ theme, flat, opacity = 1, intent }) =>
    flat && !intent
      ? undefined
      : `1px solid ${rgba(
          changeLightness(intent ? theme.intents[intent] : getMainBackgroundColor(theme), 0.2),
          opacity
        )}`};
  color: ${({ theme }) => getReadableColor(theme, undefined, undefined, true)};
  overflow: hidden;
  display: flex;
  flex-flow: column;
  position: relative;
  backdrop-filter: ${({ blur, opacity }) => (blur && opacity < 1 ? `blur(${blur}px)` : undefined)};
  transition: 0.2s ease-in-out;
  flex: auto;

  ${({ interactive, theme, opacity = 1, flat, intent }) =>
    interactive
      ? css`
          cursor: pointer;

          &:hover {
            ${StyledPanelTitle} > div > ${StyledIconWrapper} {
              transform: scale(${ACTIVE_ICON_SCALE});
            }

            background-color: ${rgba(
              darken(0.025, rgba(changeDarkness(getMainBackgroundColor(theme), 0.03), opacity)),
              opacity === 0 ? 0.2 : opacity
            )};

            border-color: ${flat && !intent
              ? undefined
              : `${rgba(
                  changeLightness(
                    intent ? theme.intents[intent] : getMainBackgroundColor(theme),
                    0.3
                  ),
                  opacity
                )}`};

            ${StyledCollectionItemContent}:after {
              background: linear-gradient(
                to top,
                ${rgba(
                    darken(
                      0.025,
                      rgba(changeDarkness(getMainBackgroundColor(theme), 0.03), opacity)
                    ),
                    opacity === 0 ? 0.2 : opacity
                  )}
                  0%,
                transparent 100%
              );
            }
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
  display: ${({ isCollapsed }) => (isCollapsed ? 'none' : undefined)};
  padding: ${({ padded, contentSize, noHorizontalPadding }) =>
    !padded
      ? undefined
      : noHorizontalPadding
      ? `${TEXT_FROM_SIZE[contentSize]}px 0`
      : `${TEXT_FROM_SIZE[contentSize]}px`};
  // The padding is not needed when the panel is minimal and has title, since
  // the title already has padding and is transparent
  padding-top: ${({ minimal, hasLabel, padded }) =>
    minimal && hasLabel && padded ? '0px' : undefined};
  padding-bottom: ${({ minimal, padded }) => (minimal && padded ? '10px' : undefined)};
  flex: 1;
  overflow: auto;
  font-size: ${({ contentSize }) => TEXT_FROM_SIZE[contentSize]}px;
`;

export const StyledPanelTitleHeader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  padding-right: 5px;
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
      ...rest
    }: IReqorePanelProps,
    ref
  ) => {
    const [_isCollapsed, setIsCollapsed] = useState(isCollapsed || false);
    const theme = useReqoreTheme(
      'main',
      customTheme ||
        (contentEffect?.gradient && minimal
          ? { main: Object.values(contentEffect.gradient.colors)[0] }
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
      () => bottomActions.filter(({ position }) => position === 'left'),
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

    const renderActions = useCallback(
      (actionOrActions: IReqorePanelAction | IReqorePanelAction[], index: number) => {
        if (Array.isArray(actionOrActions)) {
          return (
            <ReqoreControlGroup stack>{actionOrActions.map(renderActions)}</ReqoreControlGroup>
          );
        }

        const {
          id,
          actions,
          label,
          intent,
          className,
          as: CustomElement,
          props,
          ...rest
        }: IReqorePanelAction = actionOrActions;

        if (size(actions)) {
          return (
            <ReqoreDropdown<IReqoreButtonProps>
              {...rest}
              key={index}
              label={label}
              items={actions}
              intent={intent}
              className={className}
              customTheme={theme}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.stopPropagation()}
              id={id}
            />
          );
        }

        if (CustomElement) {
          return (
            <CustomElement
              {...props}
              key={index}
              customTheme={theme}
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
            key={index}
            className={className}
            customTheme={theme}
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
            opacity={rest.opacity ?? (minimal ? 0 : 1)}
            noHorizontalPadding={rest.opacity === 0}
          >
            <StyledPanelTitleHeader>
              {icon && (
                <ReqoreIcon
                  size={`${ICON_FROM_HEADER_SIZE[headerSize]}px`}
                  icon={icon}
                  margin='right'
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
              {badge && (
                <>
                  <ButtonBadge
                    color={changeLightness(theme.main, 0.18)}
                    size='big'
                    content={badge}
                  />
                  <ReqoreSpacer width={PADDING_FROM_SIZE.normal} />
                </>
              )}
            </StyledPanelTitleHeader>
            <ReqoreControlGroup>
              {actions.map(renderActions)}
              {collapsible && (
                <ReqoreButton
                  customTheme={theme}
                  icon={_isCollapsed ? 'ArrowDownSLine' : 'ArrowUpSLine'}
                  onClick={handleCollapseClick}
                  tooltip={_isCollapsed ? 'Expand' : 'Collapse'}
                />
              )}
              {onClose && (
                <ReqoreButton
                  customTheme={theme}
                  icon='CloseLine'
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    onClose?.();
                  }}
                />
              )}
            </ReqoreControlGroup>
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
            noHorizontalPadding={rest.opacity === 0}
          >
            {children}
          </StyledPanelContent>
        ) : null}
        {hasBottomActions && !_isCollapsed ? (
          <StyledPanelBottomActions
            flat={flat}
            className='reqore-panel-bottom-actions'
            theme={theme}
            opacity={rest.opacity ?? (minimal ? 0 : 1)}
            noHorizontalPadding={rest.opacity === 0}
          >
            <ReqoreControlGroup>{leftBottomActions.map(renderActions)}</ReqoreControlGroup>
            <ReqoreControlGroup>{rightBottomActions.map(renderActions)}</ReqoreControlGroup>
          </StyledPanelBottomActions>
        ) : null}
      </StyledPanel>
    );
  }
);
