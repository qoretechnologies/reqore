import React, { useState } from "react";
import styled, { css } from "styled-components";
import { IReqoreBreadcrumbItem } from ".";
import { IReqoreTheme } from "../../constants/theme";
import ReqoreThemeProvider from "../../containers/ThemeProvider";
import {
  changeDarkness,
  changeLightness,
  getReadableColor,
} from "../../helpers/colors";
import usePopover from "../../hooks/usePopover";
import ReqoreIcon from "../Icon";

export interface IReqoreBreadcrumbItemProps extends IReqoreBreadcrumbItem {
  interactive?: boolean;
}

export interface IReqoreBreadcrumbItemStyle {
  theme: IReqoreTheme;
  active?: boolean;
  interactive?: boolean;
}

const StyledBreadcrumbItem = styled.div<IReqoreBreadcrumbItemStyle>`
  ${({ theme, active, interactive }: IReqoreBreadcrumbItemStyle) => {
    const textColor =
      theme.breadcrumbs?.item?.color ||
      theme.breadcrumbs?.main ||
      getReadableColor(theme, undefined, undefined, true);

    return css`
      display: flex;
      height: 100%;
      justify-content: space-evenly;
      align-items: center;
      padding: 0 5px;
      transition: background-color 0.15s linear;

      text-transform: uppercase;
      letter-spacing: 2px;
      font-size: 12px;
      font-weight: 450;

      * {
        color: ${textColor};
      }

      ${active &&
      css`
        * {
          font-weight: 700;
          color: ${theme.breadcrumbs?.item?.activeColor ||
          changeDarkness(theme.breadcrumbs?.main, 0.05) ||
          getReadableColor(theme, undefined, undefined)};
        }
      `}

      ${interactive &&
      css`
        cursor: pointer;
        &:hover {
          color: ${theme.breadcrumbs?.item?.hoverColor ||
          changeDarkness(theme.breadcrumbs?.main, 0.05) ||
          getReadableColor(theme, undefined, undefined)};
          background-color: ${changeLightness(theme.main, 0.1)};
        }
      `}

    a:hover {
        color: ${theme.breadcrumbs?.item?.hoverColor ||
        changeDarkness(theme.breadcrumbs?.main, 0.05) ||
        getReadableColor(theme, undefined, undefined)};
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

const ReqoreBreadcrumbsItem = ({
  tooltip,
  label,
  props,
  icon,
  active,
  as,
  interactive,
}: IReqoreBreadcrumbItemProps) => {
  const [ref, setRef] = useState(null);
  const Element: any = as || "span";

  usePopover(ref, tooltip, undefined, undefined, !!tooltip);

  return (
    <ReqoreThemeProvider>
      <StyledBreadcrumbItem
        ref={setRef}
        active={active}
        interactive={interactive || !!props?.onClick}
        className="reqore-breadcrumbs-item"
      >
        {icon && (
          <ReqoreIcon
            icon={icon}
            size="13px"
            margin={label ? "right" : undefined}
          />
        )}
        {label && <Element {...props}>{label}</Element>}
      </StyledBreadcrumbItem>
    </ReqoreThemeProvider>
  );
};

export default ReqoreBreadcrumbsItem;
