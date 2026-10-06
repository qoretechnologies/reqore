import { mix } from 'polished';
import { memo, ReactNode, useMemo } from 'react';
import styled, { css } from 'styled-components';
import {
  LINE_SIZE_TO_NUMBER,
  PADDING_FROM_SIZE,
  TEXT_FROM_SIZE,
  TSizes,
} from '../../constants/sizes';
import { changeLightness, getReadableColor } from '../../helpers/colors';
import { useReqoreTheme } from '../../hooks/useTheme';
import { IReqoreIntent, IWithReqoreCustomTheme, IWithReqoreEffect } from '../../types/global';
import { IReqoreEffect, StyledEffect, TReqoreHexColor } from '../Effect';
import { ReqoreSpan } from '../Span';

export const StyledSpacer = styled.div`
  display: ${({ horizontal }) => (horizontal ? 'inline-flex' : 'flex')};
  vertical-align: middle;
  align-items: ${({ align }) => {
    if (align === 'start') return 'flex-start';
    if (align === 'center') return 'center';
    if (align === 'end') return 'flex-end';
    return 'center';
  }};

  ${({ horizontal, vertical }) => {
    if (horizontal) {
      return css`
        flex-flow: row;
      `;
    }

    if (vertical) {
      return css`
        flex-flow: column;
      `;
    }
  }}

  flex-shrink: 0;
`;

export const StyledSpace = styled.div`
  display: inline-block;
  flex: 0 0 auto;

  ${({ horizontal, vertical, width, height, lineSize }) => {
    if (horizontal) {
      return css`
        width: ${width / 2 - lineSize / 2}px;
        height: ${height ? height : `${TEXT_FROM_SIZE.normal}px`};
      `;
    }

    if (vertical) {
      return css`
        width: ${width ? width : '100%'};
        height: ${height / 2 - lineSize / 2}px;
      `;
    }
  }}
`;

export const StyledLine = styled(StyledEffect)`
  flex-shrink: 0;
  background-color: ${({ theme, lineSize }) =>
    lineSize === 'none' ? 'transparent' : changeLightness(theme.main, 0.2)};

  ${({ horizontal, vertical, width, height, lineSize }) => {
    if (horizontal) {
      return css`
        width: ${lineSize}px;
        height: ${height ? height : `${TEXT_FROM_SIZE.normal}px`};
      `;
    }

    if (vertical) {
      return css`
        width: ${width ? width : '100%'};
        height: ${lineSize}px;
      `;
    }
  }}
`;

/**
 * The gap between the line and a label, from the label's `size`: twice the size's padding
 * (12px at `small`). The short line `labelAlign` start / end leaves before or after the
 * label is twice the gap.
 */
const getLabelGap = (size: TSizes): number => PADDING_FROM_SIZE[size] * 2;

/**
 * The run of a labelled spacer: the two line segments with the label between them, laid
 * along the line. `$lineVertical` is the line's own orientation, which is the opposite of
 * the spacer's name — a `ReqoreVerticalSpacer` (vertical space) draws a horizontal line.
 */
export const StyledSpacerLabelledLine = styled.div<{
  $lineVertical: boolean;
  $gap: number;
  $lineSize: number;
  $width?: number | string;
  $height?: number | string;
}>`
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  gap: ${({ $gap }) => $gap}px;
  min-width: 0;

  ${({ $lineVertical, $width, $height, $lineSize }) =>
    $lineVertical
      ? css`
          flex-direction: column;
          height: ${$height ? $height : `${TEXT_FROM_SIZE.normal}px`};
        `
      : css`
          flex-direction: row;
          // The run is exactly as tall as the line, so the spacer keeps the height it
          // always had; the label is centred on the line and may overflow it.
          width: ${$width ? $width : '100%'};
          max-width: 100%;
          height: ${$lineSize}px;
        `}
`;

/** One segment of a labelled line. `$short` is the fixed run `labelAlign` start / end leaves. */
export const StyledSpacerLineSegment = styled(StyledEffect)<{
  $lineVertical: boolean;
  $lineSize: number;
  $short: boolean;
  $shortLength: number;
}>`
  display: block;
  background-color: ${({ theme, $lineSize }) =>
    $lineSize === 0 ? 'transparent' : changeLightness(theme.main, 0.2)};

  ${({ $lineVertical, $lineSize, $short, $shortLength }) =>
    $lineVertical
      ? css`
          width: ${$lineSize}px;
          flex: ${$short ? `0 0 ${$shortLength}px` : '1 1 0%'};
          min-height: ${$shortLength}px;
        `
      : css`
          height: ${$lineSize}px;
          flex: ${$short ? `0 0 ${$shortLength}px` : '1 1 0%'};
          min-width: ${$shortLength}px;
        `}
`;

export interface IReqoreSpacerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    IWithReqoreEffect,
    IWithReqoreCustomTheme,
    IReqoreIntent {
  width?: number | string;
  height?: number | string;
  lineSize?: TSizes | 'none';
  align?: 'start' | 'center' | 'end';
  /**
   * Text in the middle of the line — the "──── OR ────" divider. The line runs up to the
   * label, leaves a gap around it and continues on the other side. Without a label the
   * spacer renders exactly as it always has.
   *
   * The label is small, uppercase, slightly spaced and muted (the theme's readable colour
   * mixed 60% into the surface, so it reads on light and dark themes); `labelEffect`
   * changes any of that. It stays on one line and ellipsizes when the line is too short.
   *
   * A string (or number) label makes the spacer a `role="separator"` named by the label,
   * with the visible text hidden from assistive technology so it is announced once. Any
   * other node keeps its text readable and gets no role, unless you pass `aria-label`.
   */
  label?: ReactNode;
  /**
   * Where the label sits along the line. `start` and `end` leave a short line (twice the
   * gap) before or after it. Default `center`.
   */
  labelAlign?: 'start' | 'center' | 'end';
  /**
   * Text effect for the label, spread over the defaults (`uppercase`, `spaced: 1`,
   * `weight: 'thick'`, `noWrap`, the muted `color`). The line keeps the spacer's `effect`.
   */
  labelEffect?: IReqoreEffect;
  /** Props for the label's `ReqoreSpan` (`className`, `style`, `data-*`, …). */
  labelProps?: React.HTMLAttributes<HTMLSpanElement>;
  /**
   * The size of the label: its text and the gap between it and the line. Default `small`.
   * Has no effect without a `label`.
   */
  size?: TSizes;
}

export const ReqoreSpacer = memo(
  ({
    customTheme,
    inheritCustomTheme,
    intent,
    lineSize = 'none',
    align,
    label,
    labelAlign = 'center',
    labelEffect,
    labelProps,
    size = 'small',
    ...rest
  }: IReqoreSpacerProps & { horizontal?: boolean; vertical?: boolean }) => {
    const theme = useReqoreTheme('main', customTheme, intent, undefined, inheritCustomTheme);
    // The label reads against the surface, not against the intent the line is drawn in.
    const surfaceTheme = useReqoreTheme(
      'main',
      customTheme,
      undefined,
      undefined,
      inheritCustomTheme
    );
    let { horizontal, vertical } = rest;

    // The user is using old version of the component
    // We will assume that the user wants a spacer based on the width or height
    if (!horizontal && !vertical) {
      if (rest.width) {
        horizontal = true;
      }

      if (rest.height) {
        vertical = true;
      }
    }

    const _lineSize = useMemo(
      () => (lineSize === 'none' ? 0 : LINE_SIZE_TO_NUMBER[lineSize]),
      [lineSize]
    );

    const hasLabel = label !== undefined && label !== null && label !== false && label !== '';

    const labelColor = useMemo(
      () =>
        mix(
          0.6,
          getReadableColor(surfaceTheme, undefined, undefined, true),
          surfaceTheme.main
        ) as TReqoreHexColor,
      [surfaceTheme]
    );

    const _labelEffect = useMemo<IReqoreEffect>(
      () => ({
        uppercase: true,
        spaced: 1,
        weight: 'thick',
        noWrap: true,
        color: labelColor,
        ...labelEffect,
      }),
      [labelColor, labelEffect]
    );

    if (hasLabel) {
      const lineVertical = !!horizontal;
      const gap = getLabelGap(size);
      const ariaLabel =
        rest['aria-label'] ??
        (typeof label === 'string' || typeof label === 'number' ? String(label) : undefined);
      const segment = (short: boolean) => (
        <StyledSpacerLineSegment
          className='reqore-spacer-line'
          effect={rest.effect}
          theme={theme}
          $lineVertical={lineVertical}
          $lineSize={_lineSize}
          $short={short}
          $shortLength={gap * 2}
        />
      );

      return (
        <StyledSpacer
          as='div'
          {...rest}
          role={ariaLabel ? 'separator' : rest.role}
          aria-label={ariaLabel}
          aria-orientation={ariaLabel ? (lineVertical ? 'vertical' : 'horizontal') : undefined}
          horizontal={horizontal}
          vertical={vertical}
          align={align}
          className='reqore-spacer reqore-spacer-labelled'
        >
          <StyledSpace
            width={rest.width}
            height={rest.height}
            horizontal={horizontal}
            vertical={vertical}
            lineSize={_lineSize}
          />
          <StyledSpacerLabelledLine
            className='reqore-spacer-labelled-line'
            $lineVertical={lineVertical}
            $gap={gap}
            $lineSize={_lineSize}
            $width={rest.width}
            $height={rest.height}
          >
            {segment(labelAlign === 'start')}
            <ReqoreSpan
              size={size}
              customTheme={customTheme}
              inheritCustomTheme={inheritCustomTheme}
              aria-hidden={ariaLabel ? true : undefined}
              {...labelProps}
              className={`reqore-spacer-label ${labelProps?.className || ''}`.trim()}
              effect={_labelEffect}
              style={{
                display: 'block',
                // Shrinks (and ellipsizes) along a horizontal line; along a vertical one
                // the label keeps its width and widens the run instead.
                flex: lineVertical ? '0 0 auto' : '0 1 auto',
                minWidth: 0,
                lineHeight: 1.2,
                ...labelProps?.style,
              }}
            >
              {label}
            </ReqoreSpan>
            {segment(labelAlign === 'end')}
          </StyledSpacerLabelledLine>
          <StyledSpace
            width={rest.width}
            height={rest.height}
            horizontal={horizontal}
            vertical={vertical}
            lineSize={_lineSize}
          />
        </StyledSpacer>
      );
    }

    return (
      <StyledSpacer
        as='div'
        {...rest}
        horizontal={horizontal}
        vertical={vertical}
        align={align}
        className='reqore-spacer'
      >
        <StyledSpace {...rest} horizontal={horizontal} vertical={vertical} lineSize={_lineSize} />
        <StyledLine
          {...rest}
          horizontal={horizontal}
          vertical={vertical}
          theme={theme}
          lineSize={_lineSize}
        />
        <StyledSpace {...rest} horizontal={horizontal} vertical={vertical} lineSize={_lineSize} />
      </StyledSpacer>
    );
  }
);

export const ReqoreHorizontalSpacer = memo(
  ({
    width = 1,
    lineSize = 'none',
    ...rest
  }: Omit<IReqoreSpacerProps, 'height'> & { height?: string }) => {
    return <ReqoreSpacer width={width} lineSize={lineSize} horizontal {...rest} />;
  }
);

export const ReqoreVerticalSpacer = memo(
  ({
    height = 1,
    lineSize = 'none',
    ...rest
  }: Omit<IReqoreSpacerProps, 'width'> & { width?: string }) => {
    return <ReqoreSpacer height={height} lineSize={lineSize} vertical {...rest} />;
  }
);
