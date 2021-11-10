import { useState } from 'react';
import styled, { css } from 'styled-components';
import { IReqoreTabsListItem } from '.';
import { TABS_PADDING_TO_PX, TEXT_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { changeLightness, getReadableColor, getReadableColorFrom } from '../../helpers/colors';
import usePopover from '../../hooks/usePopover';
import { StyledActiveContent, StyledInActiveContent, StyledInvisibleContent } from '../Button';
import ReqoreIcon from '../Icon';

export interface IReqoreTabListItemProps extends IReqoreTabsListItem {
  active?: boolean;
  vertical?: boolean;
  onCloseClick?: any;
  parentBackground?: string;
  flat?: boolean;
  size?: TSizes;
}

export interface IReqoreTabListItemStyle extends IReqoreTabListItemProps {
  theme: IReqoreTheme;
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
    activeIntent,
    parentBackground,
    flat,
    size,
  }: IReqoreTabListItemStyle) => {
    const textColor = parentBackground
      ? getReadableColorFrom(parentBackground, true)
      : getReadableColor(theme, undefined, undefined, true);

    return css`
      display: flex;
      position: relative;
      align-items: center;
      padding: ${vertical ? `${TABS_PADDING_TO_PX[size]}px` : `0 ${TABS_PADDING_TO_PX[size]}px`};
      padding-right: ${closable ? '43px' : undefined};
      font-size: ${TEXT_FROM_SIZE[size]}px;
      font-weight: 450;
      opacity: 0.9;
      color: ${textColor};
      transition: all 0.2s ease-in-out;
      border-${vertical ? 'right' : 'bottom'}: 2px solid transparent;

      &:not(:last-child) {
        border-${vertical ? 'bottom' : 'right'}: ${
      flat ? 0 : `1px solid ${changeLightness(parentBackground || theme.main, 0.05)}`
    };
      }


    .reqore-icon {
      transform: scale(0.85);
    }

      ${
        active &&
        css`
          border-${vertical ? 'right' : 'bottom'}: 2px solid ${
          activeIntent
            ? theme.intents[activeIntent]
            : changeLightness(parentBackground || theme.main, 0.2)
        };
          opacity: 1;
          background-color: ${activeIntent ? `${theme.intents[activeIntent]}30` : undefined};

          > .reqore-icon {
            transform: scale(1);
          }

          * {
            font-weight: 600;
          }
        `
      }

      ${
        !disabled
          ? !active &&
            css`
              cursor: pointer;
              &:hover {
                > .reqore-icon {
                  transform: scale(1);
                }
                color: ${parentBackground
                  ? getReadableColorFrom(parentBackground)
                  : getReadableColor(theme)};
                background-color: ${activeIntent
                  ? `${theme.intents[activeIntent]}50`
                  : changeLightness(parentBackground || theme.main, 0.05)};

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

const StyledCloseButton = styled.div<Partial<IReqoreTabListItemStyle>>`
  ${({ theme, activeIntent }) => css`
    position: absolute;
    right: 0px;
    height: 100%;
    width: 33px;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 0;
    z-index: 0;
    transition: background-color 0.2s ease-out;
    cursor: pointer;

    &:hover {
      .reqore-icon {
        transform: scale(1);
      }
      color: ${getReadableColorFrom(activeIntent ? theme.intents[activeIntent] : theme.main)};
      background-color: ${changeLightness(
        activeIntent ? theme.intents[activeIntent] : theme.main,
        0.09
      )};
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
  activeIntent,
  onCloseClick,
  parentBackground,
  flat,
  size,
}: IReqoreTabListItemProps) => {
  const [ref, setRef] = useState(null);

  usePopover({ targetElement: ref, content: tooltip, show: !!tooltip });

  return (
    <ReqoreThemeProvider>
      <StyledTabListItem
        {...props}
        as={as}
        flat={flat}
        size={size}
        ref={setRef}
        active={active}
        disabled={disabled}
        vertical={vertical}
        activeIntent={activeIntent}
        parentBackground={parentBackground}
        className={`${props?.className || ''} reqore-tabs-list-item ${
          active ? 'reqore-tabs-list-item__active' : ''
        }`}
        onClick={disabled ? undefined : onClick}
        closable={!!onCloseClick && !disabled}
      >
        {icon && (
          <ReqoreIcon
            icon={icon}
            size={`${TEXT_FROM_SIZE[size]}px`}
            margin={label ? 'right' : undefined}
          />
        )}
        {label && (
          <StyledLabel>
            <StyledActiveContent>{label}</StyledActiveContent>
            <StyledInActiveContent>{label}</StyledInActiveContent>
            <StyledInvisibleContent>{label}</StyledInvisibleContent>
          </StyledLabel>
        )}
        {onCloseClick && !disabled ? (
          <StyledCloseButton
            className='reqore-tabs-list-item-close'
            onClick={(event) => {
              event.stopPropagation();

              onCloseClick && onCloseClick();
            }}
            activeIntent={activeIntent}
            active={active}
          >
            <ReqoreIcon icon='CloseLine' size={`${TEXT_FROM_SIZE[size]}px`} />
          </StyledCloseButton>
        ) : null}
      </StyledTabListItem>
    </ReqoreThemeProvider>
  );
};

export default ReqoreTabsListItem;
