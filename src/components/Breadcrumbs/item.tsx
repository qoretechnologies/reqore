import { useState } from 'react';
import styled, { css } from 'styled-components';
import { IReqoreBreadcrumbItem } from '.';
import { PADDING_FROM_SIZE, TEXT_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import { changeLightness, getReadableColor, getReadableColorFrom } from '../../helpers/colors';
import usePopover from '../../hooks/usePopover';
import { useReqoreTheme } from '../../hooks/useTheme';
import ReqoreIcon from '../Icon';

export interface IReqoreBreadcrumbItemProps extends IReqoreBreadcrumbItem {
  interactive?: boolean;
  size?: TSizes;
}

export interface IReqoreBreadcrumbItemStyle extends IReqoreBreadcrumbItemProps {
  theme: IReqoreTheme;
}

const StyledBreadcrumbItem = styled.div<IReqoreBreadcrumbItemStyle>`
  ${({ theme, active, interactive, size }: IReqoreBreadcrumbItemStyle) => {
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
      padding: 0 ${PADDING_FROM_SIZE[size!]}px;
      transition: background-color 0.15s ease-out;
      font-size: ${TEXT_FROM_SIZE[size!]}px;
      font-weight: 450;
      border-bottom: 2px solid transparent;

      * {
        color: ${textColor};
      }

      ${active &&
      css`
        * {
          font-weight: 600;
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
  size = 'normal',
}: IReqoreBreadcrumbItemProps) => {
  const [ref, setRef] = useState(undefined);
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
      size={size}
    >
      {icon && (
        <ReqoreIcon
          icon={icon}
          size={`${TEXT_FROM_SIZE[size]}px`}
          margin={label ? 'right' : undefined}
        />
      )}
      {label && <Element {...props}>{label}</Element>}
    </StyledBreadcrumbItem>
  );
};

export default ReqoreBreadcrumbsItem;
