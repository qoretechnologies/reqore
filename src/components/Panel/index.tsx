import { size } from 'lodash';
import { rgba } from 'polished';
import { forwardRef, ReactElement, useCallback, useMemo, useState } from 'react';
import { useUpdateEffect } from 'react-use';
import styled, { css } from 'styled-components';
import { RADIUS_FROM_SIZE } from '../../constants/sizes';
import { IReqoreIntent, IReqoreTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import {
  changeDarkness,
  changeLightness,
  getMainBackgroundColor,
  getReadableColor,
} from '../../helpers/colors';
import { useReqoreTheme } from '../../hooks/useTheme';
import { IReqoreIconName } from '../../types/icons';
import ReqoreButton from '../Button';
import ReqoreControlGroup from '../ControlGroup';
import ReqoreDropdown from '../Dropdown';
import { IReqoreDropdownItemProps } from '../Dropdown/item';
import ReqoreIcon from '../Icon';

export interface IReqorePanelAction {
  icon?: IReqoreIconName;
  label?: string;
  onClick?: () => void;
  intent?: IReqoreIntent;
  actions?: IReqoreDropdownItemProps[];
}

export interface IReqorePanelBottomAction extends IReqorePanelAction {
  position: 'left' | 'right';
}

export interface IReqorePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: any;
  children?: any;
  icon?: IReqoreIconName;
  label?: string | ReactElement<any>;
  collapsible?: boolean;
  isCollapsed?: boolean;
  onClose?: () => void;
  rounded?: boolean;
  actions?: IReqorePanelAction[];
  bottomActions?: IReqorePanelBottomAction[];
  customTheme?: IReqoreTheme;
  intent?: IReqoreIntent;
  flat?: boolean;
  unMountContentOnCollapse?: boolean;
  onCollapseChange?: (isCollapsed?: boolean) => void;
  fill?: boolean;
  padded?: boolean;
  contentStyle?: React.CSSProperties;
  opacity?: number;
  blur?: number;
}

export interface IStyledPanel extends IReqorePanelProps {
  theme: IReqoreTheme;
}

export const StyledPanel = styled.div<IStyledPanel>`
  background-color: ${({ theme, opacity = 1 }: IStyledPanel) =>
    changeDarkness(rgba(getMainBackgroundColor(theme), opacity), 0.03)};
  border-radius: ${({ rounded }) => (rounded ? RADIUS_FROM_SIZE.normal : 0)}px;
  border: ${({ theme, flat, opacity = 1 }) =>
    flat
      ? undefined
      : `1px solid ${changeLightness(rgba(getMainBackgroundColor(theme), opacity), 0.2)}`};
  color: ${({ theme }) => getReadableColor(theme, undefined, undefined, true)};
  overflow: hidden;
  display: flex;
  flex-flow: column;
  position: relative;
  z-index: 1;
  backdrop-filter: ${({ blur, opacity }) => (blur && opacity < 1 ? `blur(${blur}px)` : undefined)};

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
    changeLightness(rgba(getMainBackgroundColor(theme), opacity), 0.07)};
  justify-content: space-between;
  height: 40px;
  align-items: center;
  padding: 0 5px 0 15px;
  border-bottom: ${({ theme, isCollapsed, flat, opacity = 1 }) =>
    !isCollapsed && !flat
      ? `1px solid ${changeLightness(rgba(getMainBackgroundColor(theme), opacity), 0.2)}`
      : null};
  transition: background-color 0.2s ease-out;
  overflow: hidden;
  flex: 0 0 auto;

  ${({ collapsible }) =>
    collapsible &&
    css`
      cursor: pointer;
      &:hover {
        background-color: ${({ theme, opacity = 1 }: IStyledPanel) =>
          changeLightness(rgba(getMainBackgroundColor(theme), opacity), 0.1)};
      }
    `}
`;

export const StyledPanelBottomActions = styled(StyledPanelTitle)`
  padding-left: 5px;
  border-bottom: 0;
  border-top: ${({ theme, isCollapsed, flat, opacity = 1 }) =>
    !flat
      ? `1px solid ${changeLightness(rgba(getMainBackgroundColor(theme), opacity), 0.2)}`
      : null};
`;

export const StyledPanelContent = styled.div<IStyledPanel>`
  display: ${({ isCollapsed }) => (isCollapsed ? 'none' : undefined)};
  min-height: ${({ isCollapsed }) => (isCollapsed ? undefined : '40px')};
  padding: ${({ padded }) => (!padded ? undefined : '10px')};
  flex: 1;
  overflow: auto;
`;

export const StyledPanelTitleLabel = styled.span`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

export const StyledPanelTitleHeader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  padding-right: 5px;

  ${StyledPanelTitleLabel} {
    font-weight: 600;
  }
`;

export const ReqorePanel = forwardRef(
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
      ...rest
    }: IReqorePanelProps,
    ref
  ) => {
    const [_isCollapsed, setIsCollapsed] = useState(isCollapsed || false);
    const theme = useReqoreTheme('main', customTheme, intent);

    useUpdateEffect(() => {
      setIsCollapsed(!!isCollapsed);
    }, [isCollapsed]);

    const hasTitleBar: boolean = useMemo(
      () => !!label || collapsible || !!onClose || !!size(actions),
      [label, collapsible, onClose, actions]
    );

    const handleCollapseClick = useCallback(() => {
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

    const hasBottomActions: boolean = useMemo(
      () => !!(size(leftBottomActions) || size(rightBottomActions)),
      [leftBottomActions, rightBottomActions]
    );

    const renderActions = ({ label, actions, intent, ...rest }: IReqorePanelAction) =>
      size(actions) ? (
        <ReqoreDropdown
          {...rest}
          label={label}
          componentProps={{
            intent,
            minimal: true,
            onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
            },
          }}
          items={actions}
        />
      ) : (
        <ReqoreButton
          {...rest}
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

    return (
      <ReqoreThemeProvider theme={theme}>
        <StyledPanel
          {...rest}
          as={rest.as || 'div'}
          ref={ref as any}
          isCollapsed={_isCollapsed}
          rounded={rounded}
          flat={flat}
          className={`${className || ''} reqore-panel`}
        >
          {hasTitleBar && (
            <StyledPanelTitle
              flat={flat}
              isCollapsed={_isCollapsed}
              collapsible={collapsible}
              className='reqore-panel-title'
              onClick={handleCollapseClick}
              theme={theme}
              opacity={rest.opacity}
            >
              <StyledPanelTitleHeader>
                {icon && <ReqoreIcon icon={icon} margin='right' />}
                {typeof label === 'string' ? (
                  <StyledPanelTitleLabel>{label}</StyledPanelTitleLabel>
                ) : (
                  label
                )}
              </StyledPanelTitleHeader>
              <ReqoreControlGroup minimal>
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
              className='reqore-panel-content'
              isCollapsed={_isCollapsed}
              style={contentStyle}
              padded={padded}
            >
              {children}
            </StyledPanelContent>
          ) : null}
          {hasBottomActions ? (
            <StyledPanelBottomActions
              flat={flat}
              className='reqore-panel-bottom-actions'
              theme={theme}
              opacity={rest.opacity}
            >
              <ReqoreControlGroup minimal>
                {leftBottomActions.map(renderActions)}
              </ReqoreControlGroup>
              <ReqoreControlGroup minimal>
                {rightBottomActions.map(renderActions)}
              </ReqoreControlGroup>
            </StyledPanelBottomActions>
          ) : null}
        </StyledPanel>
      </ReqoreThemeProvider>
    );
  }
);
