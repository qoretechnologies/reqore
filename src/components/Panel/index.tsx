import classNames from 'classnames';
import { isArray, omit, size } from 'lodash';
import { darken, rgba } from 'polished';
import { Resizable, ResizableProps } from 're-resizable';
import {
  forwardRef,
  memo,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useMeasure, useUpdateEffect } from 'react-use';
import styled, { css } from 'styled-components';
import { CONTROL_ICON_OPACITY } from '../../constants/colors';
import {
  GAP_FROM_SIZE,
  HEADER_SIZE_TO_NUMBER,
  ICON_FROM_HEADER_SIZE,
  NUMBER_TO_SIZE,
  PADDING_FROM_SIZE,
  RADIUS_FROM_SIZE,
  SIZE_TO_PX,
  TEXT_FROM_SIZE,
  TSizes,
} from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import {
  changeDarkness,
  changeLightness,
  getMainBackgroundColor,
  getReadableColor,
} from '../../helpers/colors';
import { getOneHigherSize, isActionShown } from '../../helpers/utils';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { useReqoreProperty } from '../../hooks/useReqoreContext';
import { useReqoreTheme } from '../../hooks/useTheme';
import { ACTIVE_ICON_SCALE, DisabledElement, INACTIVE_ICON_SCALE } from '../../styles';
import {
  IReqoreComponent,
  IReqoreIntent,
  IReqoreTooltip,
  IWithReqoreCustomTheme,
  IWithReqoreFlat,
  IWithReqoreFluid,
  IWithReqoreIconImage,
  IWithReqoreLoading,
  IWithReqoreSize,
  IWithReqoreTooltip,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import ReqoreBreadcrumbs, { IReqoreBreadcrumbsProps } from '../Breadcrumbs';
import ReqoreButton, { ButtonBadge, IReqoreButtonProps, TReqoreBadge } from '../Button';
import { StyledCollectionItemContent } from '../Collection/item';
import ReqoreControlGroup, { IReqoreControlGroupProps } from '../ControlGroup';
import ReqoreDropdown from '../Dropdown';
import { IReqoreDropdownItem } from '../Dropdown/list';
import { IReqoreEffect, StyledEffect, TReqoreEffectColor } from '../Effect';
import { ReqoreErrorBoundary } from '../ErrorBoundary';
import ReqoreIcon, { IReqoreIconProps, StyledIconWrapper } from '../Icon';
import { ReqoreSkeleton } from '../Skeleton';
import { ReqoreSpan } from '../Span';
import { ReqoreTooltipComponent } from '../TooltipComponent';
import { LabelEditor } from './LabelEditor';
import { ReqorePanelNonResponsiveActions } from './NonResponsiveActions';

const getPaddingSize = (padded: boolean | TSizes, size: TSizes): number =>
  typeof padded === 'string' ? PADDING_FROM_SIZE[padded] : PADDING_FROM_SIZE[size];

export interface IReqorePanelSubAction extends Omit<IReqoreDropdownItem, 'value'> {
  show?: boolean;
}
export interface IReqorePanelAction extends IReqoreButtonProps, IWithReqoreTooltip, IReqoreIntent {
  label?: string | number;
  onClick?: () => void;
  group?: IReqorePanelAction[];
  actions?: IReqorePanelSubAction[];
  multiSelect?: boolean;
  // Custom react element
  as?: React.ElementType;
  props?: { [key: string | number]: any } | undefined;
  // Hide the action if the condition is false
  show?: boolean | 'hover';
  // Hide the action if the group is too small
  responsive?: boolean;
}

export interface IReqorePanelBottomAction extends IReqorePanelAction {
  position?: 'left' | 'right';
}

export interface IReqorePanelContent {}
export type TReqorePanelActions = IReqorePanelAction[];
export type TReqorePanelBottomActions = IReqorePanelBottomAction[];

export interface IReqorePanelProps
  extends IReqoreComponent,
    IWithReqoreSize,
    IWithReqoreCustomTheme,
    IWithReqoreFlat,
    IReqoreIntent,
    IWithReqoreTooltip,
    IWithReqoreFluid,
    IWithReqoreIconImage,
    IWithReqoreLoading,
    React.HTMLAttributes<HTMLDivElement> {
  as?: any;
  children?: any;

  icon?: IReqoreIconName;
  iconProps?: IReqoreIconProps;
  label?: string | ReactElement<any>;
  badge?: TReqoreBadge | TReqoreBadge[];
  description?: string;

  collapsible?: boolean;
  isCollapsed?: boolean;
  collapseButtonProps?: IReqoreButtonProps;
  disabled?: boolean;

  onLabelEdit?: (label: string | number) => void;
  resizable?: ResizableProps;

  breadcrumbs?: IReqoreBreadcrumbsProps;

  onClose?: () => void;
  closeButtonProps?: IReqoreButtonProps;

  rounded?: boolean;
  wrapperPadding?: 'top' | 'bottom' | 'both' | 'none';

  actions?: TReqorePanelActions;
  bottomActions?: TReqorePanelBottomActions;
  showActionsWhenCollapsed?: boolean;

  unMountContentOnCollapse?: boolean;
  onCollapseChange?: (isCollapsed?: boolean) => void;
  fill?: boolean;
  padded?: boolean | TSizes;
  contentStyle?: React.CSSProperties;
  opacity?: number;
  blur?: number;
  minimal?: boolean;
  labelSize?: 1 | 2 | 3 | 4 | 5 | 6;
  contentSize?: TSizes;
  contentEffect?: IReqoreEffect;
  labelEffect?: IReqoreEffect;
  descriptionEffect?: IReqoreEffect;
  descriptionIntent?: TReqoreIntent;
  transparent?: boolean;
  iconColor?: TReqoreEffectColor;
  responsiveActions?: boolean;
  responsiveTitle?: boolean;
  getContentRef?: (ref: HTMLDivElement) => any;

  labelProps?: React.HTMLAttributes<unknown>;
  showLabelTooltip?: boolean;
  customLabelTooltip?: IReqoreTooltip;

  responsiveActionsWrapperProps?: Partial<IReqoreControlGroupProps>;
  stickyHeader?: boolean;
  stickyHeaderOffset?: number;
  floatingActions?: boolean;
}

export interface IStyledPanel extends IReqorePanelProps {
  theme: IReqoreTheme;
  noHorizontalPadding?: boolean;
  stickyHeaderOffset?: number;
}

export const StyledPanelTitleHeader = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex: 1 1 auto;
  width: 100%;
  overflow: hidden;
`;

export const StyledPanelTitleHeaderContent = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex: 0 1 auto;
  overflow: hidden;
  min-width: ${({ iconSize, hasIcon }) => {
    let width = 0;

    if (hasIcon) {
      width += iconSize;
    }

    return width;
  }}px;
`;

export const StyledPanelTitleHeaderLabelAndDescription = styled.div`
  display: flex;
  flex-flow: column;
  gap: 3px;
  min-width: 0;
  flex: 1 auto;
`;

export const StyledPanelTitleHeaderLabelAndBadge = styled.div`
  display: inline-flex;
  max-width: 100%;
`;

export type TPanelStyle = React.FC<
  Omit<IReqorePanelProps, 'onResize' | 'size'> &
    ResizableProps & {
      ref?: any;
      theme: IReqoreTheme;
      effect: IReqoreEffect;
      interactive?: boolean;
    }
>;

export const StyledPanel: TPanelStyle = styled(StyledEffect)<IStyledPanel>`
  background-color: ${({ theme, opacity = 1 }: IStyledPanel) =>
    rgba(changeDarkness(getMainBackgroundColor(theme), 0.03), opacity)};
  border-radius: ${({ rounded }) => (rounded ? RADIUS_FROM_SIZE.normal : 0)}px;
  border: ${({ theme, flat, intent }) =>
    flat && !intent
      ? undefined
      : `1px solid ${changeLightness(
          intent ? theme.intents[intent] : getMainBackgroundColor(theme),
          0.08
        )}`};
  color: ${({ theme }) => getReadableColor(theme, undefined, undefined, true)};
  overflow: ${({ stickyHeader }) => (stickyHeader ? 'visible' : 'hidden')};
  display: flex;
  flex-flow: column;
  position: relative;
  backdrop-filter: ${({ blur, opacity }) => (blur && opacity < 1 ? `blur(${blur}px)` : undefined)};
  width: ${({ fluid }) => (fluid ? '100%' : undefined)};
  max-width: 100%;
  flex: ${({ fluid }) => (fluid ? '1 auto' : '0 0 auto')};

  &:not(:hover) {
    .reqore-panel-action-hidden {
      display: none;
    }
  }

  &.reqore-panel-floating-active {
    border-top-right-radius: 0;
  }

  ${({ interactive, theme, opacity = 1, flat, intent }) =>
    interactive
      ? css`
          cursor: pointer;

          &:hover {
            ${StyledPanelTitle} ${StyledPanelTitleHeaderContent} > ${StyledIconWrapper} {
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

  ${({ disabled }) => disabled && DisabledElement}
`;

export const StyledPanelTitle = styled.div<IStyledPanel>`
  display: flex;
  flex-flow: ${({ responsive, isMobile }) => (responsive ? (isMobile ? 'column' : 'row') : 'row')};
  background-color: ${({ theme, opacity = 1 }: IStyledPanel) =>
    rgba(changeLightness(getMainBackgroundColor(theme), 0.03), opacity)};
  justify-content: space-between;

  padding: ${({ noHorizontalPadding, size, padded, transparent, flat, intent }: IStyledPanel) =>
    `${transparent && flat && !intent ? 0 : getPaddingSize(padded, size)}px ${
      noHorizontalPadding ? 0 : `${getPaddingSize(padded, size)}px`
    }`};

  align-items: center;
  border-bottom: ${({ theme, isCollapsed, flat, opacity = 1 }) =>
    !isCollapsed && !flat && opacity
      ? `1px solid ${rgba(changeLightness(getMainBackgroundColor(theme), 0.08), opacity)}`
      : null};
  transition: background-color 0.2s ease-out;
  overflow: hidden;
  flex: 0 0 auto;
  gap: ${GAP_FROM_SIZE.normal}px;

  ${StyledPanelTitleHeaderContent} > ${StyledIconWrapper} {
    transform: scale(${INACTIVE_ICON_SCALE});
  }

  ${({ collapsible }) =>
    collapsible &&
    css`
      cursor: pointer;
      &:hover {
        ${StyledPanelTitleHeaderContent} > ${StyledIconWrapper} {
          transform: scale(${ACTIVE_ICON_SCALE});
        }

        background-color: ${({ theme, opacity = 1 }: IStyledPanel) =>
          rgba(changeLightness(getMainBackgroundColor(theme), 0.05), opacity)};
      }
    `}
`;

export const StyledPanelTopBar = styled(StyledPanelTitle)`
  min-height: ${({ size, padded, wrapperPadding }) =>
    SIZE_TO_PX[size] +
    (wrapperPadding === 'both' || wrapperPadding === 'top'
      ? getPaddingSize(padded, size) * 2
      : 0)}px;
  padding-bottom: ${({ padded, size, isCollapsed }: IStyledPanel) =>
    !padded || isCollapsed ? `${getPaddingSize(padded, size)}px` : undefined};
  padding-top: ${({ minimal, size, padded, wrapperPadding }: IStyledPanel) =>
    wrapperPadding === 'bottom' || wrapperPadding === 'none'
      ? undefined
      : minimal
      ? `${getPaddingSize(padded, size)}px`
      : undefined};
  position: ${({ stickyHeader }) => (stickyHeader ? 'sticky' : 'relative')};
  top: ${({ stickyHeader, stickyHeaderOffset = 0 }) =>
    stickyHeader ? `${stickyHeaderOffset}px` : undefined};
  z-index: ${({ stickyHeader }) => (stickyHeader ? 2 : undefined)};
  background: ${({ theme, opacity = 1 }: IStyledPanel) =>
    rgba(changeLightness(getMainBackgroundColor(theme), 0.03), opacity)};
`;

export const StyledPanelBottomActions = styled(StyledPanelTitle)`
  min-height: ${({ size, padded, wrapperPadding }) =>
    SIZE_TO_PX[size] +
    (wrapperPadding === 'both' || wrapperPadding === 'bottom'
      ? getPaddingSize(padded, size) * 2
      : 0)}px;
  padding-top: ${({ padded, size }: IStyledPanel) =>
    !padded ? `${getPaddingSize(padded, size)}px` : undefined};
  padding-bottom: ${({ minimal, size, padded, wrapperPadding }: IStyledPanel) =>
    wrapperPadding === 'top' || wrapperPadding === 'none'
      ? undefined
      : minimal
      ? `${getPaddingSize(padded, size)}px`
      : undefined};
  border-bottom: 0;
  border-top: ${({ theme, flat, opacity = 1 }) =>
    !flat
      ? `1px solid ${rgba(changeLightness(getMainBackgroundColor(theme), 0.08), opacity)}`
      : null};
`;

export const StyledPanelContent = styled.div<IStyledPanel>`
  display: ${({ isCollapsed }) => (isCollapsed ? 'none !important' : undefined)};
  padding: ${({ padded, size, noHorizontalPadding, minimal }) =>
    !padded
      ? undefined
      : noHorizontalPadding
      ? `${getPaddingSize(padded, size)}px 0`
      : `${getPaddingSize(padded, size) / (minimal ? 2 : 1)}px ${getPaddingSize(padded, size)}px`};
  // The padding is not needed when the panel is minimal and has title, since
  // the title already has padding and is transparent
  padding-top: ${({ minimal, hasLabel, padded, size }) =>
    minimal && hasLabel && padded ? 0 : padded ? `${getPaddingSize(padded, size)}px` : undefined};
  padding-bottom: ${({ minimal, padded, size, hasBottomActions }) =>
    minimal && hasBottomActions && padded
      ? 0
      : padded
      ? `${getPaddingSize(padded, size)}px`
      : undefined};
  flex: 1;
  overflow: auto;
  overflow-wrap: anywhere;
  font-size: ${({ size }) => TEXT_FROM_SIZE[size]}px;
`;

export const StyledFloatingActions = styled.div<{
  theme: IReqoreTheme;
  size: TSizes;
  intent?: TReqoreIntent;
  flat?: boolean;
}>`
  position: fixed;
  z-index: 999999;
  display: flex;
  padding: ${({ size }) => PADDING_FROM_SIZE[size]}px;
  background-color: ${({ theme }) => rgba(changeDarkness(getMainBackgroundColor(theme), 0.03), 1)};
  border: ${({ theme, flat, intent }) =>
    flat && !intent
      ? undefined
      : `1px solid ${changeLightness(
          intent ? theme.intents[intent] : getMainBackgroundColor(theme),
          0.08
        )}`};
  border-bottom: none;
  border-radius: ${({ size }) => RADIUS_FROM_SIZE[size]}px ${({ size }) => RADIUS_FROM_SIZE[size]}px
    0 0;
  gap: ${({ size }) => GAP_FROM_SIZE[size]}px;
  pointer-events: auto;
`;

export const ReqorePanelSkeleton = memo(
  ({
    size,
    isCollapsed,
    children,
  }: Pick<IReqorePanelProps, 'size' | 'isCollapsed' | 'children'>) => {
    const style = useMemo(() => ({ padding: `${PADDING_FROM_SIZE[size]}px` }), [size]);

    return (
      <ReqoreControlGroup vertical fluid gapSize='big' style={style}>
        <ReqoreControlGroup spaceBetween fluid>
          <ReqoreControlGroup fixed gapSize='big'>
            <ReqoreSkeleton circle size={size} />
            <ReqoreSkeleton width='200px' size={size} />
          </ReqoreControlGroup>

          <ReqoreControlGroup fixed>
            <ReqoreSkeleton size={size} />
            <ReqoreSkeleton size={size} />
          </ReqoreControlGroup>
        </ReqoreControlGroup>
        {!isCollapsed &&
          (children ? (
            children
          ) : (
            <ReqoreControlGroup vertical>
              <ReqoreSkeleton lines={5} width='100%' size='tiny' />
            </ReqoreControlGroup>
          ))}
      </ReqoreControlGroup>
    );
  }
);

export const ReqorePanel = forwardRef<HTMLDivElement, IReqorePanelProps>(
  (
    {
      children,
      label,
      description,
      collapseButtonProps = {},
      collapsible,
      onClose,
      closeButtonProps = {},
      rounded = true,
      actions = [],
      bottomActions = [],
      isCollapsed,
      customTheme,
      icon,
      iconImage,
      intent,
      className,
      flat,
      unMountContentOnCollapse = true,
      onCollapseChange,
      padded = true,
      wrapperPadding = 'both',
      contentStyle,
      contentEffect,
      labelEffect = {},
      descriptionEffect = {},
      descriptionIntent,
      labelSize,
      contentSize,
      minimal,
      badge,
      iconColor,
      iconProps = {},
      fluid,
      responsiveActions = true,
      responsiveTitle = true,
      size: panelSize = 'normal',
      getContentRef,
      labelProps = {},
      disabled,
      breadcrumbs,
      showActionsWhenCollapsed = true,
      showLabelTooltip,
      customLabelTooltip,
      resizable,
      onLabelEdit,
      responsiveActionsWrapperProps,
      loading,
      loadingIconType,
      skeleton,
      errorBoundaryOptions,
      floatingActions,
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

    useEffect(() => {
      return () => {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      };
    }, []);

    const isMobile = useReqoreProperty('isMobile');
    const { targetRef } = useCombinedRefs(ref);
    const [measureRef, { width }] = useMeasure();
    const [_isHovered, setIsHovered] = useState(false);
    const floatingActionsRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useUpdateEffect(() => {
      setIsCollapsed(!!isCollapsed);
    }, [isCollapsed]);

    const floatingActionsList: TReqorePanelActions = useMemo(
      () => (floatingActions ? actions.filter((action) => action.show === 'hover') : []),
      [floatingActions, actions]
    );

    const nonFloatingActions: TReqorePanelActions = useMemo(
      () => (floatingActions ? actions.filter((action) => action.show !== 'hover') : actions),
      [floatingActions, actions]
    );

    const updateFloatingActionsPosition = useCallback(() => {
      if (!floatingActionsRef.current || !panelRef.current) return;

      const panelRect = panelRef.current.getBoundingClientRect();
      const floatingRect = floatingActionsRef.current.getBoundingClientRect();

      // Check if the panel's top edge is visible by testing if the element
      // at the panel's top-right corner belongs to the panel
      const topRight = document.elementFromPoint(
        panelRect.right - 1,
        panelRect.top + 1
      );
      const isPanelTopVisible =
        topRight && (panelRef.current.contains(topRight) || topRight === panelRef.current);

      if (!isPanelTopVisible) {
        floatingActionsRef.current.style.display = 'none';
        return;
      }

      floatingActionsRef.current.style.display = 'flex';
      floatingActionsRef.current.style.top = `${panelRect.top - floatingRect.height + (flat ? 0 : 1)}px`;
      floatingActionsRef.current.style.left = `${panelRect.right - floatingRect.width}px`;
    }, [flat]);

    useEffect(() => {
      if (!_isHovered || !floatingActions || !size(floatingActionsList)) return undefined;

      updateFloatingActionsPosition();

      const onScroll = () => updateFloatingActionsPosition();

      window.addEventListener('scroll', onScroll, true);
      return () => window.removeEventListener('scroll', onScroll, true);
    }, [_isHovered, floatingActions, floatingActionsList, updateFloatingActionsPosition]);

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (floatingActions) {
          if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
          hoverTimerRef.current = setTimeout(() => setIsHovered(true), 150);
        }
        rest.onMouseEnter?.(e);
      },
      [floatingActions, rest.onMouseEnter]
    );

    const cancelHover = useCallback(() => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }
      setIsHovered(false);
    }, []);

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (floatingActions) {
          const relatedTarget = e.relatedTarget;

          if (
            floatingActionsRef.current &&
            relatedTarget instanceof Node &&
            floatingActionsRef.current.contains(relatedTarget)
          ) {
            return;
          }

          cancelHover();
        }
        rest.onMouseLeave?.(e);
      },
      [floatingActions, rest.onMouseLeave, cancelHover]
    );

    const handleFloatingActionsMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        const relatedTarget = e.relatedTarget;

        if (
          panelRef.current &&
          relatedTarget instanceof Node &&
          panelRef.current.contains(relatedTarget)
        ) {
          return;
        }

        cancelHover();
      },
      [cancelHover]
    );

    const _resizable: ResizableProps = useMemo(() => {
      const disabledProps: ResizableProps = {
        enable: {
          top: false,
          right: false,
          bottom: false,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false,
        },
      };

      if (_isCollapsed || disabled) {
        return disabledProps;
      }

      return resizable || disabledProps;
    }, [resizable, _isCollapsed, disabled]);

    // Return true if the card has a title bar, otherwise return false.
    const hasTitleBar: boolean = useMemo(
      () =>
        !!label ||
        !!breadcrumbs ||
        collapsible ||
        !!onClose ||
        !!size(nonFloatingActions.filter(isActionShown)) ||
        !!(isArray(badge) ? size(badge) : badge) ||
        !!icon,
      [label, collapsible, onClose, nonFloatingActions, badge, icon]
    );

    // Return true if the card has a title bar, otherwise return false.
    const hasTitleHeader: boolean = useMemo(
      () => !!label || !!badge || !!icon || !!breadcrumbs,
      [label, icon, badge, breadcrumbs]
    );

    const isSmall = useMemo(
      () => responsiveTitle && width < 480 && process.env.NODE_ENV !== 'test',
      [width, responsiveTitle]
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
      () =>
        !!(
          size(leftBottomActions.filter(isActionShown)) ||
          size(rightBottomActions.filter(isActionShown))
        ),
      [leftBottomActions, rightBottomActions]
    );

    const renderResponsiveActions = useCallback(
      (align: 'flex-start' | 'center' | 'flex-end' = 'flex-end') =>
        (action: IReqorePanelAction, index: number) => {
          return renderActions(action, index, true, align);
        },
      [actions, showActionsWhenCollapsed, _isCollapsed]
    );

    const hasNonResponsiveActions = useCallback(
      (data: TReqorePanelActions) =>
        (!responsiveActions && size(data)) ||
        data.some((action) => action.responsive === false && action.show !== false),
      [actions, bottomActions, responsiveActions, showActionsWhenCollapsed, _isCollapsed]
    );

    const hasResponsiveActions = useCallback(
      (data: TReqorePanelActions) =>
        responsiveActions &&
        data.some((action) => action.responsive !== false && action.show !== false),
      [actions, bottomActions, responsiveActions, showActionsWhenCollapsed, _isCollapsed]
    );

    const renderNonResponsiveActions = useCallback(
      (align: 'flex-start' | 'center' | 'flex-end' = 'flex-end') =>
        (action: IReqorePanelAction, index: number) => {
          return renderActions(action, index, false, align);
        },
      [actions, bottomActions, responsiveActions, showActionsWhenCollapsed, _isCollapsed]
    );

    const renderActions = useCallback(
      (
        action: IReqorePanelAction,
        index: number,
        includeResponsive: boolean,
        align: 'flex-start' | 'center' | 'flex-end' = 'flex-end'
      ) => {
        if (
          action.show === false ||
          (showActionsWhenCollapsed === false && _isCollapsed === true) ||
          (includeResponsive && action.responsive === false) ||
          (!includeResponsive &&
            responsiveActions &&
            (action.responsive === true || !('responsive' in action)))
        ) {
          return null;
        }

        const {
          id,
          actions,
          label,
          intent,
          as: CustomElement,
          props = {},
          group,
          show,
          ...rest
        }: IReqorePanelAction = action;

        let { className }: IReqorePanelAction = action;

        // If the show prop is 'hover', add the hidden class to the action
        className = classNames(className, show === 'hover' ? 'reqore-panel-action-hidden' : '');

        if (size(group)) {
          return (
            <ReqoreControlGroup
              intent={intent}
              stack
              customTheme={rest.customTheme || theme}
              size={rest.size}
              fixed={rest.fixed}
              fluid={rest.fluid}
              key={index}
              className={className}
              horizontalAlign={align}
            >
              {group.map((action, index) => renderActions(action, index, true))}
            </ReqoreControlGroup>
          );
        }

        if (size(actions)) {
          return (
            <ReqoreDropdown<IReqoreButtonProps>
              fixed
              {...rest}
              key={index}
              label={label}
              items={actions.filter(isActionShown)}
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
              className={classNames(className, props.className)}
              key={props.key || index}
              customTheme={props.customTheme || theme}
              onClick={
                props.onClick
                  ? (e: React.MouseEvent<any>) => {
                      e.stopPropagation();
                      props?.onClick?.(e);
                    }
                  : undefined
              }
            />
          );
        }

        return (
          <ReqoreButton
            fixed
            {...rest}
            id={id}
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
      [actions, theme, showActionsWhenCollapsed, _isCollapsed]
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

      if (newContentEffect.gradient) {
        newContentEffect.gradient.borderColor = intent
          ? theme.intents[intent]
          : newContentEffect.gradient.borderColor;
      }

      newContentEffect.interactive = interactive;

      return newContentEffect;
    }, [intent, theme, contentEffect, interactive]);

    const opacity = rest.transparent ? 0 : rest.opacity;
    const noHorizontalPadding = opacity === 0 && flat && !intent;

    const showNonResponsiveGroup = useCallback((): boolean => {
      let show: boolean = false;

      // SHOULD THIS GROUP SHOW CONTROL BUTTONS?
      // This group should only show control buttons
      // if the panel is not small
      if (!isSmall && (onClose || collapsible)) {
        show = true;
      }

      // OTHERWISE, ARE THERE ANY NON RESPONSIVE ACTIONS TO BE SHOWN?
      // This either means actions where user specified responsive: false
      // or user passed responsiveActions: false
      if (hasNonResponsiveActions(nonFloatingActions)) {
        show = true;
      }

      return show;
    }, [isSmall, collapsible, nonFloatingActions, hasNonResponsiveActions]);

    const iconTooltip = useMemo(
      () => ({
        content: label,
      }),
      [label]
    );

    const handleRef = useCallback((ref) => {
      let _ref = ref;

      if (ref?.resizable) {
        _ref = ref.resizable;
      }

      targetRef.current = _ref;
    }, []);

    if (skeleton) {
      return <ReqorePanelSkeleton size={panelSize} isCollapsed={_isCollapsed} />;
    }

    return (
      <ReqoreErrorBoundary {...errorBoundaryOptions}>
        <ReqoreTooltipComponent
          {...omit(rest, ['onResize'])}
          {..._resizable}
          as={rest.as || (!!resizable && !disabled && !_isCollapsed) ? Resizable : 'div'}
          isCollapsed={_isCollapsed}
          rounded={rounded}
          flat={flat}
          intent={intent}
          className={`${className || ''} reqore-panel${
            _isHovered && size(floatingActionsList) > 0 ? ' reqore-panel-floating-active' : ''
          }`}
          interactive={interactive}
          theme={theme}
          effect={transformedContentEffect}
          opacity={opacity}
          fluid={fluid}
          disabled={disabled}
          Component={StyledPanel}
          ref={(node: any) => {
            handleRef(node);
            panelRef.current = node;
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {_isHovered &&
            size(floatingActionsList) > 0 &&
            createPortal(
              <StyledFloatingActions
                className='reqore-panel-floating-actions'
                theme={theme}
                size={panelSize}
                intent={intent}
                flat={flat}
                ref={floatingActionsRef}
                onMouseLeave={handleFloatingActionsMouseLeave}
              >
                <ReqoreControlGroup size={panelSize} gapSize={panelSize}>
                  {floatingActionsList.map((action, index) => renderActions(action, index, true))}
                </ReqoreControlGroup>
              </StyledFloatingActions>,
              document.body
            )}
          {hasTitleBar && (
            <StyledPanelTopBar
              flat={flat}
              isCollapsed={_isCollapsed}
              collapsible={collapsible}
              className='reqore-panel-title'
              onClick={handleCollapseClick}
              theme={theme}
              minimal={minimal}
              size={contentSize || panelSize}
              opacity={opacity ?? (minimal ? 0 : 1)}
              noHorizontalPadding={noHorizontalPadding}
              responsive={responsiveTitle}
              isMobile={isMobile || isSmall}
              ref={measureRef}
              padded={padded}
              wrapperPadding={wrapperPadding}
              transparent={rest.transparent || opacity === 0}
              intent={intent}
              stickyHeader={rest.stickyHeader}
              stickyHeaderOffset={rest.stickyHeaderOffset}
            >
              {hasTitleHeader && (
                <StyledPanelTitleHeader>
                  {breadcrumbs ? (
                    <ReqoreBreadcrumbs
                      {...breadcrumbs}
                      padded={false}
                      margin='none'
                      flat
                      responsive
                    />
                  ) : icon || iconImage || label || badge ? (
                    <StyledPanelTitleHeaderContent
                      size={panelSize}
                      {...labelProps}
                      hasLabel={!!label}
                      hasIcon={!!icon || !!iconImage || loading}
                      iconSize={
                        ICON_FROM_HEADER_SIZE[labelSize || HEADER_SIZE_TO_NUMBER[panelSize]]
                      }
                    >
                      {icon || iconImage ? (
                        <ReqoreIcon
                          size={`${
                            ICON_FROM_HEADER_SIZE[labelSize || HEADER_SIZE_TO_NUMBER[panelSize]]
                          }px`}
                          image={loading ? undefined : iconImage}
                          margin='right'
                          color={iconColor}
                          tooltip={iconTooltip}
                          effect={{
                            opacity: CONTROL_ICON_OPACITY,
                          }}
                          {...iconProps}
                          animation={loading ? 'spin' : iconProps?.animation}
                          icon={
                            loading ? `Loader${loadingIconType || ''}Line` : icon || iconProps?.icon
                          }
                        />
                      ) : null}
                      <StyledPanelTitleHeaderLabelAndDescription>
                        <StyledPanelTitleHeaderLabelAndBadge>
                          {typeof label === 'string' ? (
                            <LabelEditor
                              size={labelSize || panelSize}
                              customTheme={theme}
                              effect={{
                                noWrap: true,
                                ...labelEffect,
                              }}
                              style={{ display: 'inline-flex', alignItems: 'center', minWidth: 0 }}
                              label={label}
                              onSubmit={onLabelEdit}
                              tooltip={showLabelTooltip ? customLabelTooltip || label : undefined}
                            />
                          ) : (
                            label
                          )}
                          {badge || badge === 0 ? (
                            <ButtonBadge
                              size={getOneHigherSize(panelSize)}
                              content={badge}
                              wrapGroup={isSmall}
                              margin={label ? 'left' : 'none'}
                            />
                          ) : null}
                        </StyledPanelTitleHeaderLabelAndBadge>
                        {description && (
                          <ReqoreSpan
                            size={labelSize ? NUMBER_TO_SIZE[labelSize] : panelSize}
                            effect={{ opacity: 0.7, ...descriptionEffect }}
                            intent={descriptionIntent}
                          >
                            {description}
                          </ReqoreSpan>
                        )}
                      </StyledPanelTitleHeaderLabelAndDescription>
                    </StyledPanelTitleHeaderContent>
                  ) : null}
                  {breadcrumbs && (badge || badge === 0) ? (
                    <ButtonBadge
                      size={getOneHigherSize(panelSize)}
                      content={badge}
                      wrapGroup={isSmall}
                      margin={label ? 'left' : 'none'}
                    />
                  ) : null}
                  <ReqorePanelNonResponsiveActions
                    show={isSmall && (!!onClose || collapsible)}
                    isSmall={isSmall}
                    showControlButtons
                    size={panelSize}
                    hasResponsiveActions={hasResponsiveActions(nonFloatingActions)}
                    customTheme={theme}
                    isCollapsed={_isCollapsed}
                    onCollapseClick={collapsible ? handleCollapseClick : undefined}
                    onCloseClick={onClose}
                    closeButtonProps={closeButtonProps}
                    collapseButtonProps={collapseButtonProps}
                    fluid={false}
                    style={{ marginLeft: 'auto' }}
                  />
                </StyledPanelTitleHeader>
              )}
              {hasResponsiveActions(nonFloatingActions) && (
                <ReqoreControlGroup
                  responsive={responsiveActions}
                  fluid={responsiveActions || isSmall}
                  horizontalAlign='flex-end'
                  customTheme={theme}
                  size={panelSize}
                  {...responsiveActionsWrapperProps}
                >
                  {nonFloatingActions.map(renderResponsiveActions())}
                </ReqoreControlGroup>
              )}
              <ReqorePanelNonResponsiveActions
                show={showNonResponsiveGroup()}
                isSmall={isSmall}
                showControlButtons={!isSmall}
                size={panelSize}
                hasResponsiveActions={hasResponsiveActions(nonFloatingActions)}
                customTheme={theme}
                isCollapsed={_isCollapsed}
                onCollapseClick={collapsible ? handleCollapseClick : undefined}
                onCloseClick={onClose}
                closeButtonProps={closeButtonProps}
                collapseButtonProps={collapseButtonProps}
                fluid={!hasTitleHeader || isSmall}
              >
                {nonFloatingActions.map(renderNonResponsiveActions())}
              </ReqorePanelNonResponsiveActions>
            </StyledPanelTopBar>
          )}
          {!_isCollapsed || (_isCollapsed && !unMountContentOnCollapse) ? (
            <StyledPanelContent
              as={'div'}
              className='reqore-panel-content'
              hasLabel={!!hasTitleBar}
              hasBottomActions={hasBottomActions}
              isCollapsed={_isCollapsed}
              style={contentStyle}
              padded={padded}
              minimal={minimal}
              size={contentSize || panelSize}
              ref={getContentRef}
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
              padded={padded}
              intent={intent}
              minimal={minimal}
              transparent={rest.transparent || opacity === 0}
              opacity={opacity ?? (minimal ? 0 : 1)}
              size={contentSize || panelSize}
              noHorizontalPadding={noHorizontalPadding}
            >
              {hasNonResponsiveActions(leftBottomActions) ? (
                <ReqoreControlGroup size={panelSize} style={{ marginRight: 'auto' }}>
                  {leftBottomActions.map(renderNonResponsiveActions('flex-start'))}
                </ReqoreControlGroup>
              ) : null}
              {hasResponsiveActions(leftBottomActions) && (
                <ReqoreControlGroup
                  fluid={responsiveActions}
                  responsive={responsiveActions}
                  customTheme={theme}
                  size={panelSize}
                  style={{ marginRight: 'auto' }}
                >
                  {leftBottomActions.map(renderResponsiveActions('flex-start'))}
                </ReqoreControlGroup>
              )}
              {hasResponsiveActions(rightBottomActions) && (
                <ReqoreControlGroup
                  fluid={responsiveActions}
                  horizontalAlign='flex-end'
                  responsive={responsiveActions}
                  customTheme={theme}
                  style={{ marginLeft: 'auto' }}
                  size={panelSize}
                >
                  {rightBottomActions.map(renderResponsiveActions())}
                </ReqoreControlGroup>
              )}
              {hasNonResponsiveActions(rightBottomActions) ? (
                <ReqoreControlGroup
                  horizontalAlign='flex-end'
                  size={panelSize}
                  style={{ marginLeft: 'auto' }}
                >
                  {rightBottomActions.map(renderNonResponsiveActions())}
                </ReqoreControlGroup>
              ) : null}
            </StyledPanelBottomActions>
          ) : null}
        </ReqoreTooltipComponent>
      </ReqoreErrorBoundary>
    );
  }
);
