import { useRef } from 'react';
import styled, { css } from 'styled-components';
import { IReqoreBreadcrumbItem } from '.';
import { PADDING_FROM_SIZE, TEXT_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import { changeLightness, getReadableColor, getReadableColorFrom } from '../../helpers/colors';
import { useReqoreTheme } from '../../hooks/useTheme';
import { useTooltip } from '../../hooks/useTooltip';
import { ActiveIconScale, InactiveIconScale } from '../../styles';
import {
  StyledActiveContent,
  StyledAnimatedTextWrapper,
  StyledInActiveContent,
  StyledInvisibleContent,
} from '../Button';
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
      position: relative;
      overflow: hidden;

      * {
        color: ${textColor};
      }

      ${InactiveIconScale}

      ${active &&
      css`
        * {
          font-weight: 600;
          color: ${theme.breadcrumbs?.item?.activeColor ||
          (theme.breadcrumbs?.main
            ? getReadableColorFrom(theme.breadcrumbs.main, true)
            : getReadableColor(theme, undefined, undefined))};
        }

        ${ActiveIconScale}
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
          ${ActiveIconScale}

          ${StyledActiveContent} {
            transform: translateY(0px);
            filter: blur(0);
            opacity: 1;
          }

          ${StyledInActiveContent} {
            transform: translateY(150%);
            filter: blur(10px);
            opacity: 0;
          }
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
  const innerRef = useRef(undefined);
  const theme = useReqoreTheme('breadcrumbs', customTheme);

  useTooltip(innerRef?.current, tooltip);

  return (
    <StyledBreadcrumbItem
      ref={innerRef}
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
      {label && (
        <StyledAnimatedTextWrapper as={as || 'span'} {...props}>
          <StyledActiveContent>{label}</StyledActiveContent>
          <StyledInActiveContent>{label}</StyledInActiveContent>
          <StyledInvisibleContent>{label}</StyledInvisibleContent>
        </StyledAnimatedTextWrapper>
      )}
    </StyledBreadcrumbItem>
  );
};

export default ReqoreBreadcrumbsItem;
