import styled from 'styled-components';
import { IReqoreIntent } from '../../constants/theme';
import { IReqoreIconName } from '../../types/icons';
import { ReqoreH3 } from '../Header';
import ReqoreIcon from '../Icon';
import { ReqorePanel } from '../Panel';
import { ReqoreP } from '../Paragraph';

export interface IReqoreCommentProps {
  icon?: IReqoreIconName;
  image?: string;
  title?: string;
  children: any;
  intent?: IReqoreIntent;
  rounded?: boolean;
  flat?: boolean;
  detail?: string;
}

export const StyledCommentWrapper = styled.div`
  display: flex;
  overflow: hidden;

  &:not(:first-child) {
    margin-top: 10px;
  }
`;

export const StyledIconWrapper = styled.div`
  flex: 0 auto;
  padding: 10px;
  display: flex;
  justify-content: center;
`;

export const StyledInfoWrapper = styled.div`
  flex: 1;
  padding: 10px;
  overflow: hidden;
`;

export const StyledCommentText = styled(ReqoreP)<{ marginTop?: string }>`
  max-height: 300px;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 0;
  margin: 0;
  margin-top: ${({ marginTop }: { marginTop?: string }) => marginTop};
`;

export const StyledCommentTitle = styled(ReqoreH3)`
  padding: 0;
  margin: 0;
`;

export const StyledCommentDetail = styled.span`
  opacity: 0.5;
  font-size: 11px;
`;

export const StyledCommentImage = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 10px;
`;

export const ReqoreComment = ({
  rounded,
  flat,
  intent,
  icon,
  children,
  image,
  title,
  detail,
  ...rest
}: IReqoreCommentProps) => {
  return (
    <ReqorePanel rounded={rounded} flat={flat} intent={intent} {...rest}>
      <StyledCommentWrapper>
        {icon || image ? (
          <StyledIconWrapper>
            {icon ? <ReqoreIcon icon={icon} size='30px' /> : <StyledCommentImage src={image} />}
          </StyledIconWrapper>
        ) : null}
        <StyledInfoWrapper>
          {title && <StyledCommentTitle>{title}</StyledCommentTitle>}
          {detail && <StyledCommentDetail>{detail}</StyledCommentDetail>}
          <StyledCommentText marginTop={title || detail ? '10px' : 0}>{children}</StyledCommentText>
        </StyledInfoWrapper>
      </StyledCommentWrapper>
    </ReqorePanel>
  );
};
