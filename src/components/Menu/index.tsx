import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { RADIUS_FROM_SIZE } from '../../constants/sizes';
import { IReqoreCustomTheme, IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { changeDarkness, getMainBackgroundColor } from '../../helpers/colors';
import { useCloneThroughFragments } from '../../hooks/useCloneThroughFragments';
import { useReqoreTheme } from '../../hooks/useTheme';
import { IReqoreComponent, IWithReqoreMinimal, IWithReqoreTransparent } from '../../types/global';
import ReqoreControlGroup, { IReqoreControlGroupProps } from '../ControlGroup';

export interface IReqoreMenuProps
  extends IReqoreComponent,
    IWithReqoreMinimal,
    IWithReqoreTransparent,
    React.HTMLAttributes<HTMLDivElement> {
  children: any;
  position?: 'left' | 'right';
  width?: string;
  maxHeight?: string;
  customTheme?: IReqoreCustomTheme;
  intent?: TReqoreIntent;
  wrapText?: boolean;
  flat?: boolean;
  rounded?: boolean;
  padded?: boolean;
  itemGap?: IReqoreControlGroupProps['gapSize'];
}

export interface IReqoreMenuStyle extends IReqoreMenuProps {
  theme: IReqoreTheme;
}

const StyledReqoreMenu = styled.div<IReqoreMenuStyle>`
  width: ${({ width }) => width || undefined};
  min-width: ${({ width }) => (width ? undefined : '160px')};
  padding: ${({ padded = true }) => (padded ? '5px' : undefined)};
  max-height: ${({ maxHeight }) => maxHeight || undefined};
  overflow-y: auto;
  overflow-x: hidden;

  background-color: ${({ theme, transparent }) =>
    transparent ? 'transparent' : changeDarkness(getMainBackgroundColor(theme), 0.03)};
  border-radius: ${({ rounded }) => (rounded ? `${RADIUS_FROM_SIZE['normal']}px` : `0`)};

  ${({ theme, position, padded }) =>
    position &&
    css`
    border-${position === 'left' ? 'right' : 'left'}: 1px solid ${changeDarkness(theme.main, 0.04)};
    padding-${position === 'left' ? 'right' : 'left'}: ${padded ? '10px' : undefined};
  `}
`;

const ReqoreMenu = forwardRef<HTMLDivElement, IReqoreMenuProps>(
  (
    {
      children,
      position,
      _insidePopover,
      _popoverId,
      customTheme,
      intent,
      wrapText,
      flat = true,
      minimal,
      itemGap,
      ...rest
    }: IReqoreMenuProps,
    ref
  ) => {
    const theme = useReqoreTheme('main', customTheme, intent);
    const { clone } = useCloneThroughFragments((props) => ({
      _insidePopover: props?._insidePopover ?? _insidePopover,
      _popoverId: props?._popoverId ?? _popoverId,
      customTheme: props?.customTheme || theme,
      wrap: 'wrap' in (props || {}) ? props.wrap : wrapText,
      flat: 'flat' in (props || {}) ? props.flat : flat,
      minimal: 'minimal' in (props || {}) ? props.minimal : minimal,
    }));

    return (
      <ReqoreThemeProvider theme={theme}>
        <StyledReqoreMenu
          {...rest}
          position={position}
          ref={ref}
          theme={theme}
          className={`${rest.className || ''} reqore-menu`}
        >
          <ReqoreControlGroup vertical gapSize={itemGap} fluid>
            {clone(children)}
          </ReqoreControlGroup>
        </StyledReqoreMenu>
      </ReqoreThemeProvider>
    );
  }
);

export default ReqoreMenu;
