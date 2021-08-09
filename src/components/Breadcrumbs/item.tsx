import { useState } from 'react';
import styled, { css } from 'styled-components';
import { IReqoreBreadcrumbItem } from '.';
import { IReqoreTheme } from '../../constants/theme';
import { changeLightness, getReadableColor, getReadableColorFrom } from '../../helpers/colors';
import usePopover from '../../hooks/usePopover';
import { useReqoreTheme } from '../../hooks/useTheme';
import ReqoreIcon from '../Icon';

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
      (theme.breadcrumbs?.main
        ? getReadableColorFrom(theme.breadcrumbs.main, true)
        : getReadableColor(theme, undefined, undefined, true));

    return css`
      display: flex;
      height: 100%;
      justify-content: space-evenly;
      align-items: center;
      padding: 0 5px;
      transition: background-color 0.15s linear;
      font-size: 13px;
      font-weight: 450;

      * {
        color: ${textColor};
      }

      ${active &&
      css`
        * {
          font-weight: 700;
          color: ${theme.breadcrumbs?.item?.activeColor ||
          (theme.breadcrumbs?.main
            ? getReadableColorFrom(theme.breadcrumbs.main, true)
            : getReadableColor(theme, undefined, undefined))};
        }
      `}

      ${interactive &&
      css`
        cursor: pointer;
        &:hover {
          color: ${theme.breadcrumbs?.item?.hoverColor ||
          (theme.breadcrumbs?.main
            ? getReadableColorFrom(theme.breadcrumbs.main)
            : getReadableColor(theme, undefined, undefined))};
          background-color: ${changeLightness(theme.breadcrumbs?.main || theme.main, 0.05)};
        }
      `}

    a:hover {
        color: ${theme.breadcrumbs?.item?.hoverColor ||
        (theme.breadcrumbs?.main
          ? getReadableColorFrom(theme.breadcrumbs?.main)
          : getReadableColor(theme, undefined, undefined))};
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
  customTheme,
}: IReqoreBreadcrumbItemProps) => {
  const [ref, setRef] = useState(null);
  const Element: any = as || 'span';
  const theme = useReqoreTheme('breadcrumbs', customTheme);

  usePopover({ targetElement: ref, content: tooltip, show: !!tooltip });

  return (
    <StyledBreadcrumbItem
      ref={setRef}
      active={active}
      interactive={interactive || !!props?.onClick}
      className='reqore-breadcrumbs-item'
      theme={theme}
    >
      {icon && <ReqoreIcon icon={icon} size='13px' margin={label ? 'right' : undefined} />}
      {label && <Element {...props}>{label}</Element>}
    </StyledBreadcrumbItem>
  );
};

export default ReqoreBreadcrumbsItem;
