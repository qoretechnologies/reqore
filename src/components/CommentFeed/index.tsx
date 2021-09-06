import classNames from 'classnames';
import styled from 'styled-components';
import { StyledPanel } from '../Panel';

export interface IReqoreCommentFeedProps extends React.HTMLAttributes<HTMLDivElement> {
  gapSize?: string;
}

export const StyledCommentFeed = styled.div<{ gapSize: string }>`
  ${StyledPanel} {
    &:not(:first-child) {
      margin-top: ${({ gapSize }) => gapSize};
    }
  }
`;

export const ReqoreCommentFeed = ({
  gapSize = '10px',
  className,
  children,
  ...rest
}: IReqoreCommentFeedProps) => {
  return (
    <StyledCommentFeed
      {...rest}
      gapSize={gapSize}
      className={classNames('reqore-comment-feed', {
        className,
      })}
    >
      {children}
    </StyledCommentFeed>
  );
};
