import { forwardRef, memo } from 'react';
import styled, { css } from 'styled-components';
import { IReqoreTabsListItem } from '.';
import { TABS_PADDING_TO_PX, TSizes } from '../../constants/sizes';
import { IReqoreCustomTheme, IReqoreTheme } from '../../constants/theme';
import { changeLightness } from '../../helpers/colors';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
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
  fill?: boolean;
  className?: string;
}

export interface IReqoreTabListItemStyle extends IReqoreTabListItemProps {
  theme: IReqoreTheme;
  closable?: boolean;
  activeColor: string;
}

export const StyledTabListItem = styled.div<IReqoreTabListItemStyle>`
  ${({ active, disabled, vertical, activeColor, size, fill }: IReqoreTabListItemStyle) => {
    return css`
      display: flex;
      flex-shrink: 0;
      overflow: hidden;
      position: relative;
      align-items: center;
      width: ${vertical ? `100%` : undefined};
      padding: ${vertical ? `${TABS_PADDING_TO_PX[size!]}px` : `${TABS_PADDING_TO_PX[size!]}px`};
      ${active &&
      css`
        &:after {
          width: ${vertical ? '5px' : '1px'};
          height: ${vertical ? '1px' : '5px'};
          left: ${vertical ? '0' : '50%'};
          top: ${vertical ? '50%' : undefined};
          bottom: ${vertical ? undefined : '0'};
          content: '';
          position: absolute;
          background-color: ${activeColor};
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
  forwardRef(
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
      }: IReqoreTabListItemProps,
      ref
    ) => {
      const { targetRef } = useCombinedRefs(ref);
      const theme = useReqoreTheme('main', customTheme);
      const _intent = activeIntent || intent;
      const activeColor = _intent ? theme.intents[_intent] : changeLightness(theme.main, 0.05);

      return (
        <StyledTabListItem
          ref={targetRef}
          {...props}
          className={className}
          intent={intent}
          activeIntent={activeIntent}
          activeColor={activeColor}
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
                flat={!active && !intent}
                fluid={fill || vertical}
                icon={icon}
                minimal
                intent={active ? activeIntent || intent : intent}
                active={active}
                disabled={disabled}
                onClick={onClick}
                tooltip={tooltip}
                customTheme={customTheme}
                className={`reqore-tabs-list-item ${active ? 'reqore-tabs-list-item-active' : ''}`}
              >
                {label}
              </ReqoreButton>
              {onCloseClick && !disabled ? (
                <ReqoreButton
                  fixed
                  flat={!active && !intent}
                  icon={closeIcon || 'CloseLine'}
                  intent={active ? activeIntent || intent : intent}
                  minimal
                  active={active}
                  className='reqore-tabs-list-item-close'
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
    }
  )
);

export default ReqoreTabsListItem;
