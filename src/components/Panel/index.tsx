import { size } from 'lodash';
import { forwardRef, useMemo, useState } from 'react';
import { useUpdateEffect } from 'react-use';
import styled, { css } from 'styled-components';
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
  title?: string;
  collapsible?: boolean;
  isCollapsed?: boolean;
  onClose?: () => void;
  rounded?: boolean;
  actions?: IReqorePanelAction[];
  customTheme?: IReqoreTheme;
  intent?: IReqoreIntent;
  flat?: boolean;
}

export interface IStyledPanel extends IReqorePanelProps {
  theme: IReqoreTheme;
}

export const StyledPanel = styled.div<IStyledPanel>`
  background-color: ${({ theme }: IStyledPanel) => theme.main};
  border-radius: ${({ rounded }) => (rounded ? 5 : 0)}px;
  border: ${({ theme, flat }) =>
    flat ? undefined : `1px solid ${changeLightness(theme.main, 0.2)}`};
  color: ${({ theme }) => getReadableColor(theme, undefined, undefined, true)};
  overflow: hidden;
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

  ${({ collapsible }) =>
    collapsible &&
    css`
      cursor: pointer;
      &:hover {
        background-color: ${({ theme }: IStyledPanel) => changeLightness(theme.main, 0.1)};
      }
    `}
`;
export const StyledPanelTitleActions = styled.div``;
export const StyledPanelTitleHeader = styled.div``;

export const ReqorePanel = forwardRef(
  (
    {
      children,
      title,
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
      () => !!title || collapsible || !!onClose || !!size(actions),
      [title, collapsible, onClose, actions]
    );

    return (
      <ReqoreThemeProvider theme={theme}>
        <StyledPanel
          {...rest}
          ref={ref as any}
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
              onClick={() => (collapsible ? setIsCollapsed(!_isCollapsed) : undefined)}
            >
              <StyledPanelTitleHeader>
                {icon && <ReqoreIcon icon={icon} margin='right' />}
                {title}
              </StyledPanelTitleHeader>
              <ReqoreControlGroup minimal>
                {actions.map(({ label, actions, ...rest }) =>
                  size(actions) ? (
                    <ReqoreDropdown
                      {...rest}
                      label={label}
                      componentProps={{
                        minimal: true,
                      }}
                      items={actions}
                    />
                  ) : (
                    <ReqoreButton {...rest}>{label}</ReqoreButton>
                  )
                )}
                {collapsible && (
                  <ReqoreButton
                    icon={_isCollapsed ? 'ArrowDownSLine' : 'ArrowUpSLine'}
                    onClick={() => setIsCollapsed(!_isCollapsed)}
                    tooltip={_isCollapsed ? 'Expand' : 'Collapse'}
                  />
                )}
                {onClose && <ReqoreButton icon='CloseLine' onClick={onClose} />}
              </ReqoreControlGroup>
            </StyledPanelTitle>
          )}
          {!_isCollapsed && <div className='reqore-panel-content'>{children}</div>}
        </StyledPanel>
      </ReqoreThemeProvider>
    );
  }
);
