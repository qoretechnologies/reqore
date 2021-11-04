import { size } from 'lodash';
import { forwardRef, ReactElement, useCallback, useMemo, useState } from 'react';
import { useUpdateEffect } from 'react-use';
import styled, { css } from 'styled-components';
import { RADIUS_FROM_SIZE } from '../../constants/sizes';
import { IReqoreIntent, IReqoreTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { changeLightness, getReadableColor } from '../../helpers/colors';
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
  actions?: IReqoreDropdownItemProps[];
}

export interface IReqorePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: any;
  icon?: IReqoreIconName;
  label?: string | ReactElement<any>;
  collapsible?: boolean;
  isCollapsed?: boolean;
  onClose?: () => void;
  rounded?: boolean;
  actions?: IReqorePanelAction[];
  customTheme?: IReqoreTheme;
  intent?: IReqoreIntent;
  flat?: boolean;
  unMountContentOnCollapse?: boolean;
  onCollapseChange?: (isCollapsed?: boolean) => void;
  fill?: boolean;
  padded?: boolean;
}

export interface IStyledPanel extends IReqorePanelProps {
  theme: IReqoreTheme;
}

export const StyledPanel = styled.div<IStyledPanel>`
  background-color: ${({ theme }: IStyledPanel) => theme.main};
  border-radius: ${({ rounded }) => (rounded ? RADIUS_FROM_SIZE.normal : 0)}px;
  border: ${({ theme, flat }) =>
    flat ? undefined : `1px solid ${changeLightness(theme.main, 0.2)}`};
  color: ${({ theme }) => getReadableColor(theme, undefined, undefined, true)};
  overflow: hidden;
  display: flex;
  flex-flow: column;

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
  background-color: ${({ theme }: IStyledPanel) => changeLightness(theme.main, 0.07)};
  justify-content: space-between;
  height: 40px;
  align-items: center;
  padding: 0 5px 0 15px;
  border-bottom: ${({ theme, isCollapsed, flat }) =>
    !isCollapsed && !flat ? `1px solid ${changeLightness(theme.main, 0.2)}` : null};
  transition: background-color 0.1s linear;
  overflow: hidden;
  flex: 0 0 auto;

  ${({ collapsible }) =>
    collapsible &&
    css`
      cursor: pointer;
      &:hover {
        background-color: ${({ theme }: IStyledPanel) => changeLightness(theme.main, 0.1)};
      }
    `}
`;
export const StyledPanelContent = styled.div<IStyledPanel>`
  display: ${({ isCollapsed }) => (isCollapsed ? 'none' : undefined)};
  min-height: ${({ isCollapsed }) => (isCollapsed ? undefined : '40px')};
  padding: ${({ padded }) => (!padded ? undefined : '10px')};
  flex: 1;
  overflow: hidden;
`;
export const StyledPanelTitleHeader = styled.div``;

export const ReqorePanel = forwardRef(
  (
    {
      children,
      label,
      collapsible,
      onClose,
      rounded,
      actions = [],
      isCollapsed,
      customTheme,
      icon,
      intent,
      className,
      flat,
      unMountContentOnCollapse = true,
      onCollapseChange,
      padded,
      ...rest
    }: IReqorePanelProps,
    ref
  ) => {
    const [_isCollapsed, setIsCollapsed] = useState(isCollapsed || false);
    const theme = useReqoreTheme('main', customTheme, intent);

    useUpdateEffect(() => {
      setIsCollapsed(isCollapsed);
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

    return (
      <ReqoreThemeProvider theme={theme}>
        <StyledPanel
          {...rest}
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
            >
              <StyledPanelTitleHeader>
                {icon && <ReqoreIcon icon={icon} margin='right' />}
                {label}
              </StyledPanelTitleHeader>
              <ReqoreControlGroup minimal>
                {actions.map(({ label, actions, ...rest }) =>
                  size(actions) ? (
                    <ReqoreDropdown
                      {...rest}
                      label={label}
                      componentProps={{
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
                      onClick={
                        rest.onClick
                          ? (e: React.MouseEvent<HTMLButtonElement>) => {
                              e.stopPropagation();
                              rest.onClick();
                            }
                          : undefined
                      }
                    >
                      {label}
                    </ReqoreButton>
                  )
                )}
                {collapsible && (
                  <ReqoreButton
                    icon={_isCollapsed ? 'ArrowDownSLine' : 'ArrowUpSLine'}
                    onClick={handleCollapseClick}
                    tooltip={_isCollapsed ? 'Expand' : 'Collapse'}
                  />
                )}
                {onClose && (
                  <ReqoreButton
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
              padded={padded}
            >
              {children}
            </StyledPanelContent>
          ) : null}
        </StyledPanel>
      </ReqoreThemeProvider>
    );
  }
);
