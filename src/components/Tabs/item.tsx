import React, { useState } from "react";
import styled, { css } from "styled-components";
import { IReqoreTabsListItem } from ".";
import { IReqoreTheme } from "../../constants/theme";
import ReqoreThemeProvider from "../../containers/ThemeProvider";
import { changeLightness, getReadableColor } from "../../helpers/colors";
import usePopover from "../../hooks/usePopover";
import ReqoreIcon from "../Icon";

export interface IReqoreTabListItemProps extends IReqoreTabsListItem {
  active?: boolean;
  vertical?: boolean;
  onCloseClick?: any;
}

export interface IReqoreTabListItemStyle {
  theme: IReqoreTheme;
  active?: boolean;
  disabled?: boolean;
  vertical?: boolean;
  closable?: boolean;
}

const StyledLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const StyledTabListItem = styled.div<IReqoreTabListItemStyle>`
  ${({
    theme,
    active,
    disabled,
    vertical,
    closable,
  }: IReqoreTabListItemStyle) => {
    const textColor = getReadableColor(theme, undefined, undefined, true);

    return css`
      display: flex;
      position: relative;
      align-items: center;
      padding: ${vertical ? "10px" : 0} 15px;
      padding-right: ${closable ? "43px" : undefined};
      transition: background-color 0.15s linear;

      text-transform: uppercase;
      letter-spacing: 2px;
      font-size: 12px;

      &:not(:last-child) {
        border-${vertical ? "bottom" : "right"}: 1px solid ${changeLightness(
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
            color: ${getReadableColor(theme, undefined, undefined)};
          }
        `
      }

      ${
        !disabled
          ? !active &&
            css`
              cursor: pointer;
              &:hover {
                color: ${getReadableColor(theme, undefined, undefined)};
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

  a {
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const StyledCloseButton = styled.div`
  ${({ theme }) => css`
    position: absolute;
    right: 0px;
    height: 100%;
    width: 33px;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 0;
    z-index: 1;
    transition: background-color 0.1s linear;
    cursor: pointer;
    &:hover {
      background-color: ${changeLightness(theme.main, 0.09)};
    }
  `}
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
  onCloseClick,
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
        className={`${props?.className || ""} reqore-tabs-list-item ${
          active ? "reqore-tabs-list-item__active" : ""
        }`}
        onClick={onClick}
        closable={!!onCloseClick && !disabled}
      >
        {icon && (
          <ReqoreIcon
            icon={icon}
            size="13px"
            margin={label ? "right" : undefined}
          />
        )}
        {label && <StyledLabel>{label}</StyledLabel>}
        {onCloseClick && !disabled ? (
          <StyledCloseButton
            className="reqore-tabs-list-item-close"
            onClick={(event) => {
              event.stopPropagation();

              onCloseClick && onCloseClick();
            }}
          >
            <ReqoreIcon icon="CloseLine" size="13px" />
          </StyledCloseButton>
        ) : null}
      </StyledTabListItem>
    </ReqoreThemeProvider>
  );
};

export default ReqoreTabsListItem;
