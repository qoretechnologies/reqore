import styled, { css } from 'styled-components';
import { IReqoreTabsListItem } from '.';
import { TABS_PADDING_TO_PX, TSizes } from '../../constants/sizes';
import { IReqoreCustomTheme, IReqoreTheme } from '../../constants/theme';
import { useReqoreTheme } from '../../hooks/useTheme';
import ReqoreButton from '../Button';
import ReqoreControlGroup from '../ControlGroup';

export interface IReqoreTabListItemProps extends IReqoreTabsListItem {
  active?: boolean;
  vertical?: boolean;
  onCloseClick?: any;
  customTheme?: IReqoreCustomTheme;
  size?: TSizes;
  wrapTabNames?: boolean;
}

export interface IReqoreTabListItemStyle extends IReqoreTabListItemProps {
  theme: IReqoreTheme;
  closable?: boolean;
  activeColor: string;
}

export const StyledTabListItem = styled.div<IReqoreTabListItemStyle>`
  ${({ active, disabled, vertical, activeColor, size }: IReqoreTabListItemStyle) => {
    return css`
      display: flex;
      flex-shrink: 0;
      overflow: hidden;
      position: relative;
      align-items: center;
      padding: ${vertical ? `${TABS_PADDING_TO_PX[size!]}px` : `${TABS_PADDING_TO_PX[size!]}px`};
      ${active &&
      css`
        background-color: ${activeColor}60;
      `}

      ${disabled &&
      css`
        cursor: not-allowed;
        > * {
          opacity: 0.5;
        }
      `}
    `;
  }}

  a {
    text-decoration: none;

    &:hover > * {
      text-decoration: underline;
    }
  }
`;

const ReqoreTabsListItem = ({
  tooltip,
  label,
  props,
  icon,
  active,
  as,
  disabled,
  vertical,
  onClick,
  activeIntent,
  onCloseClick,
  wrapTabNames,
  intent,
  size = 'normal',
  closeIcon,
  customTheme,
}: IReqoreTabListItemProps) => {
  const theme = useReqoreTheme('main', customTheme);
  const _intent = activeIntent || intent;
  const activeColor = _intent ? theme.intents[_intent] : theme.main;

  return (
    <StyledTabListItem
      {...props}
      intent={intent}
      activeIntent={activeIntent}
      activeColor={activeColor}
      as={as}
      size={size}
      active={active}
      disabled={disabled}
      vertical={vertical}
      theme={theme}
      className={`${props?.className || ''} reqore-tabs-list-item ${
        active ? 'reqore-tabs-list-item__active' : ''
      }`}
    >
      {label || icon ? (
        <ReqoreControlGroup stack size={size}>
          <ReqoreButton
            flat
            icon={icon}
            minimal
            intent={active ? activeIntent || intent : intent}
            active={active}
            disabled={disabled}
            onClick={onClick}
            tooltip={tooltip}
            customTheme={customTheme}
          >
            {label}
          </ReqoreButton>
          {onCloseClick && !disabled ? (
            <ReqoreButton
              flat
              icon={closeIcon || 'CloseLine'}
              intent={active ? activeIntent || intent : intent}
              minimal
              customTheme={customTheme}
              onClick={(event) => {
                event.stopPropagation();
                onCloseClick?.();
              }}
            />
          ) : null}
        </ReqoreControlGroup>
      ) : null}
    </StyledTabListItem>
  );
};

export default ReqoreTabsListItem;
