import styled, { css, keyframes } from 'styled-components';
import { RADIUS_FROM_SIZE, SIZE_TO_PX } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import { IWithReqoreSize } from '../../types/global';

export const StyledSkeletonAnimation = keyframes`
  0% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
`;

export const StyledSkeleton = styled.div`
  ${({ $size, $width, $height, $circle, theme }: IReqoreSkeletonStyle) => css`
    background-color: ${theme.intents.muted};
    border-radius: ${$circle ? '99999' : RADIUS_FROM_SIZE[$size]}px;
    height: ${$height || `${SIZE_TO_PX[$size]}px`};
    width: ${$width || `${SIZE_TO_PX[$size]}px`};

    animation: ${StyledSkeletonAnimation} 0.75s infinite alternate;
  `}
`;

export interface IReqoreSkeletonStyle {
  $size: IWithReqoreSize['size'];
  $width?: string;
  $height?: string;
  $circle: boolean;
  theme: IReqoreTheme;
}

export interface IReqoreSkeletonProps
  extends IWithReqoreSize,
    React.HTMLAttributes<HTMLDivElement> {
  width?: string;
  height?: string;
  circle?: boolean;
  lines?: number;
}

export const ReqoreSkeleton = ({
  size = 'normal',
  width,
  height,
  circle,
  lines,
}: IReqoreSkeletonProps) => {
  if (lines) {
    return (
      <>
        {Array.from({ length: lines }).map((_, i) => (
          <StyledSkeleton key={i} $size={size} $width={width} $height={height} $circle={circle} />
        ))}
      </>
    );
  }

  return <StyledSkeleton $size={size} $width={width} $height={height} $circle={circle} />;
};
