import { forwardRef, memo } from 'react';
import styled, { css } from 'styled-components';
import { IReqoreTabsListItem } from '.';
import { TABS_PADDING_TO_PX, TSizes } from '../../constants/sizes';
import { IReqoreCustomTheme, IReqoreTheme } from '../../constants/theme';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { useReqoreTheme } from '../../hooks/useTheme';
import { IWithReqoreFlat } from '../../types/global';
import ReqoreButton, { StyledButton } from '../Button';
import ReqoreControlGroup from '../ControlGroup';

export interface IReqoreTabListItemProps extends IReqoreTabsListItem, IWithReqoreFlat {
  active?: boolean;
  vertical?: boolean;
  onCloseClick?: any;
  customTheme?: IReqoreCustomTheme;
  size?: TSizes;
  wrapTabNames?: boolean;
  fill?: boolean;
  className?: string;
}

export interface IReqoreTabListItemStyle extends IReqoreTabListItemProps {
  theme: IReqoreTheme;
  closable?: boolean;
  activeColor: string;
}

export const StyledTabListItem = styled.div<IReqoreTabListItemStyle>`
  ${({ disabled, vertical, size, fill }: IReqoreTabListItemStyle) => {
    return css`
      display: flex;
      flex-shrink: 0;
      overflow: hidden;
      position: relative;
      align-items: center;
      width: ${vertical ? `100%` : undefined};
      padding: ${`${TABS_PADDING_TO_PX[size!]}px`};
      padding-bottom: ${!vertical && 0};
      padding-right: ${vertical && 0};

      ${vertical
        ? css`
            ${StyledButton}:last-child {
              border-right: 0;
            }
            ${StyledButton}:last-child {
              border-top-right-radius: 0 !important;
              border-bottom-right-radius: 0 !important;
            }
          `
        : css`
            ${StyledButton} {
              border-bottom: 0;
            }
            ${StyledButton}:first-child {
              border-bottom-left-radius: 0 !important;
            }
            ${StyledButton}:last-child {
              border-bottom-right-radius: 0 !important;
            }
          `}

      ${fill &&
      css`
        flex: 1;
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

const ReqoreTabsListItem = memo(
  forwardRef<HTMLDivElement, IReqoreTabListItemProps>(
    (
      {
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
        fill,
        intent,
        size = 'normal',
        closeIcon,
        customTheme,
        className,
        flat = true,
        wrapTabNames,
        id,
        ...rest
      }: IReqoreTabListItemProps,
      ref
    ) => {
      const { targetRef } = useCombinedRefs(ref);
      const theme = useReqoreTheme('main', customTheme);

      return (
        <StyledTabListItem
          ref={targetRef}
          {...props}
          className={className}
          intent={intent}
          as={as}
          size={size}
          active={active}
          disabled={disabled}
          vertical={vertical}
          theme={theme}
          fill={fill}
        >
          {label || icon ? (
            <ReqoreControlGroup stack size={size} fluid={fill || vertical}>
              <ReqoreButton
                flat={intent ? false : flat}
                fluid={fill || vertical}
                icon={icon}
                minimal
                wrap={wrapTabNames}
                intent={active ? activeIntent || intent : intent}
                active={active}
                disabled={disabled}
                onClick={onClick}
                tooltip={tooltip}
                customTheme={theme}
                className={`reqore-tabs-list-item ${active ? 'reqore-tabs-list-item-active' : ''}`}
                {...rest}
              >
                {label}
              </ReqoreButton>
              {onCloseClick && !disabled ? (
                <ReqoreButton
                  fixed
                  flat={intent ? false : flat}
                  icon={closeIcon || 'CloseLine'}
                  intent={active ? activeIntent || intent : intent}
                  minimal
                  active={active}
                  className='reqore-tabs-list-item-close'
                  customTheme={theme}
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
    }
  )
);

export default ReqoreTabsListItem;
