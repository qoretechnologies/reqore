import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { IReqoreTabsListItem } from '.';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { changeLightness, getReadableColor } from '../../helpers/colors';
import usePopover from '../../hooks/usePopover';
import ReqoreIcon from '../Icon';

export interface IReqoreTabListItemProps extends IReqoreTabsListItem {
  active?: boolean;
  vertical?: boolean;
}

export interface IReqoreTabListItemStyle {
  theme: IReqoreTheme;
  active?: boolean;
  disabled?: boolean;
  vertical?: boolean;
}

const StyledLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const StyledTabListItem = styled.div<IReqoreTabListItemStyle>`
  ${({ theme, active, disabled, vertical }: IReqoreTabListItemStyle) => {
    const textColor = getReadableColor(theme.main, undefined, undefined, true);

    return css`
      display: flex;
      align-items: center;
      padding: ${vertical ? '10px' : 0} 15px;
      transition: background-color 0.15s linear;

      text-transform: uppercase;
      letter-spacing: 2px;
      font-size: 12px;

      &:not(:last-child) {
        border-${vertical ? 'bottom' : 'right'}: 1px solid ${changeLightness(
      theme.main,
      0.05
    )};
      }

      * {
        color: ${textColor};
      }

      ${
        active &&
        css`
          background-color: ${changeLightness(theme.main, 0.05)};
          * {
            font-weight: 700;
            color: ${getReadableColor(theme.main, undefined, undefined)};
          }
        `
      }

      ${
        !disabled
          ? css`
              cursor: pointer;
              &:hover {
                color: ${getReadableColor(theme.main, undefined, undefined)};
                background-color: ${changeLightness(theme.main, 0.025)};
              }
            `
          : css`
              cursor: not-allowed;
              > * {
                opacity: 0.5;
              }
            `
      }
    `;
  }}

  > *:first-child:not(:last-child) {
    margin-right: 5px;
  }

  a {
    text-decoration: none;

    &:hover {
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
}: IReqoreTabListItemProps) => {
  const [ref, setRef] = useState(null);

  usePopover(ref, tooltip, undefined, undefined, !!tooltip);

  return (
    <ReqoreThemeProvider>
      <StyledTabListItem
        {...props}
        as={as}
        ref={setRef}
        active={active}
        disabled={disabled}
        vertical={vertical}
        className={`${props?.className || ''} reqore-tabs-list-item ${
          active ? 'reqore-tabs-list-item__active' : ''
        }`}
        onClick={onClick}
      >
        {icon && <ReqoreIcon icon={icon} size='13px' />}
        {label && <StyledLabel>{label}</StyledLabel>}
      </StyledTabListItem>
    </ReqoreThemeProvider>
  );
};

export default ReqoreTabsListItem;
