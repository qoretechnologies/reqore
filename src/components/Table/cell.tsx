import { lighten, rgba } from 'polished';
import { forwardRef, memo } from 'react';
import styled, { css } from 'styled-components';
import { IReqoreTableColumn } from '.';
import { TEXT_FROM_SIZE } from '../../constants/sizes';
import { changeLightness, getReadableColorFrom } from '../../helpers/colors';
import { alignToFlexAlign } from '../../helpers/utils';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { useTooltip } from '../../hooks/useTooltip';
import { IWithReqoreTooltip } from '../../types/global';
import { TReqoreColor } from '../Effect';
import { IReqoreTableCellStyle } from './row';

export interface IReqoreCustomTableBodyCellProps extends IReqoreTableBodyCellProps {}
export interface IReqoreCustomTableBodyCell extends React.FC<IReqoreCustomTableBodyCellProps> {}
export interface IReqoreTableBodyCellProps
  extends Partial<IReqoreTableColumn>,
    React.HTMLAttributes<HTMLDivElement>,
    IWithReqoreTooltip {
  children?: React.ReactNode;
  padded?: IReqoreTableColumn['cell']['padded'];
}

export const StyledTableCell = styled.div<IReqoreTableCellStyle>`
  ${({ width, minWidth, maxWidth, grow }) =>
    css`
      width: ${width}px;
      min-width: ${minWidth}px;
      max-width: ${maxWidth}px;

      flex-grow: ${grow || (width ? undefined : 1)};
    `}

  ${({
    theme,
    align,
    interactive,
    interactiveCell,
    intent,
    size,
    flat,
    striped,
    even,
    selected,
    selectedIntent,
    disabled,
    hovered,
    padded,
  }: IReqoreTableCellStyle) => {
    const getBackgroundColor = (): TReqoreColor => {
      let color = theme.main;
      let opacity = 0;
      // Is there any intent
      if (intent || (selected && selectedIntent)) {
        color = theme.intents[intent || selectedIntent];
        opacity += 0.02;
      }
      // Is the table striped and this row odd
      if (striped && !even) {
        opacity += 0.05;
      }
      // Is this row selected
      if (selected) {
        opacity += 0.02;
      }
      // Is this row hovered
      if (hovered) {
        opacity += 0.08;
      }

      // Set the color as transparent if opacity is 0
      if (opacity === 0) {
        return 'transparent';
      }

      return changeLightness(color, opacity);
    };

    const backgroundColor = getBackgroundColor();

    return css`
      display: flex;
      align-items: center;
      justify-content: ${align ? alignToFlexAlign(align) : 'flex-start'};
      flex-shrink: 0;
      border-bottom: ${!flat ? '1px solid ' : undefined};

      height: 100%;
      padding: ${!padded || padded === 'both' || padded === 'vertical' ? 0 : undefined}
        ${!padded || padded === 'both' || padded === 'horizontal' ? '10px' : undefined};
      font-size: ${TEXT_FROM_SIZE[size]}px;
      background-color: ${backgroundColor === 'transparent'
        ? 'transparent'
        : rgba(getBackgroundColor(), 0.8)};
      color: ${getReadableColorFrom(
        backgroundColor === 'transparent' ? theme.main : backgroundColor,
        !hovered
      )};
      border-color: ${changeLightness(
        backgroundColor === 'transparent' ? theme.main : backgroundColor,
        0.1
      )};
      transition: background-color 0.2s ease-out;
      opacity: ${disabled ? 0.2 : 1};
      pointer-events: ${disabled ? 'none' : undefined};
      cursor: ${interactive || interactiveCell ? 'pointer' : 'default'};

      ${interactiveCell &&
      css`
        &:hover {
          background-color: ${lighten(0.2, getBackgroundColor())};
        }
      `}

      p.reqore-table-text {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        margin: 0;
        padding: 0;
      }
    `;
  }}
`;

export const ReqoreTableBodyCell = memo(
  forwardRef<HTMLButtonElement, IReqoreTableBodyCellProps>(
    (props: IReqoreTableBodyCellProps, ref) => {
      const { targetRef } = useCombinedRefs(ref);

      useTooltip(targetRef.current, props.tooltip);

      return <StyledTableCell {...props} ref={targetRef} />;
    }
  )
);
