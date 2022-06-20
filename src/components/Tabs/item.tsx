import styled, { css } from 'styled-components';
import { IReqoreTabsListItem } from '.';
import { TABS_PADDING_TO_PX, TSizes } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { changeLightness } from '../../helpers/colors';
import ReqoreButton from '../Button';
import ReqoreControlGroup from '../ControlGroup';

export interface IReqoreTabListItemProps extends IReqoreTabsListItem {
  active?: boolean;
  vertical?: boolean;
  onCloseClick?: any;
  parentBackground?: string;
  flat?: boolean;
  size?: TSizes;
  wrapTabNames?: boolean;
}

export interface IReqoreTabListItemStyle extends IReqoreTabListItemProps {
  theme: IReqoreTheme;
  closable?: boolean;
}

export const StyledTabListItem = styled.div<IReqoreTabListItemStyle>`
  ${({
    theme,
    active,
    disabled,
    vertical,
    activeIntent,
    parentBackground,
    flat,
    size,
    intent,
  }: IReqoreTabListItemStyle) => {
    const currentIntent = intent || activeIntent;

    return css`
      display: flex;
      overflow: hidden;
      position: relative;
      align-items: center;
      padding: ${vertical
        ? `${TABS_PADDING_TO_PX[size!]}px`
        : `0 ${TABS_PADDING_TO_PX[size!]}px 0 ${TABS_PADDING_TO_PX[size!]}px`};

      ${active &&
      css`
        box-shadow: 0 -2px 0 2px ${currentIntent ? theme.intents[currentIntent] : changeLightness(parentBackground || theme.main, 0.2)};
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
  parentBackground,
  wrapTabNames,
  intent,
  flat,
  size = 'normal',
  closeIcon,
}: IReqoreTabListItemProps) => {
  return (
    <ReqoreThemeProvider>
      <StyledTabListItem
        {...props}
        intent={intent}
        as={as}
        size={size}
        active={active}
        disabled={disabled}
        vertical={vertical}
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
            >
              {label}
            </ReqoreButton>
            {onCloseClick && !disabled ? (
              <ReqoreButton
                flat
                icon={closeIcon || 'CloseLine'}
                intent={active ? activeIntent || intent : intent}
                minimal
                onClick={(event) => {
                  event.stopPropagation();
                  onCloseClick?.();
                }}
              />
            ) : null}
          </ReqoreControlGroup>
        ) : null}
      </StyledTabListItem>
    </ReqoreThemeProvider>
  );
};

export default ReqoreTabsListItem;
