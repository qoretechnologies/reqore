import { omit, size } from 'lodash';
import styled from 'styled-components';
import { ReqoreButton, ReqoreColumn, ReqoreControlGroup, ReqoreDropdown } from '../..';
import { TReqoreIntent } from '../../constants/theme';
import { IReqoreIconName } from '../../types/icons';
import { ReqoreColumns } from '../Columns';
import { ReqoreH3 } from '../Header';
import ReqoreIcon from '../Icon';
import { IReqorePanelAction, ReqorePanel } from '../Panel';
import { ReqoreP } from '../Paragraph';

export interface IReqoreCommentProps {
  icon?: IReqoreIconName;
  image?: string;
  title?: string;
  children: any;
  intent?: TReqoreIntent;
  rounded?: boolean;
  flat?: boolean;
  detail?: string;
  actions?: IReqorePanelAction[];
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
  min-height: 10px;
  overflow: hidden;
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
  actions,
  ...rest
}: IReqoreCommentProps) => {
  return (
    <ReqorePanel rounded={rounded} flat={flat} intent={intent} className='reqore-comment' {...rest}>
      <StyledCommentWrapper>
        {icon || image ? (
          <StyledIconWrapper>
            {icon ? <ReqoreIcon icon={icon} size='30px' /> : <StyledCommentImage src={image} />}
          </StyledIconWrapper>
        ) : null}
        <StyledInfoWrapper>
          <ReqoreColumns minColumnWidth='100px'>
            <ReqoreColumn flexFlow='column' justifyContent='center'>
              {title && <StyledCommentTitle>{title}</StyledCommentTitle>}
              {detail && <StyledCommentDetail>{detail}</StyledCommentDetail>}
            </ReqoreColumn>
            {size(actions) ? (
              <ReqoreColumn justifyContent='flex-end'>
                <ReqoreControlGroup minimal size='small'>
                  {actions.map(({ label, actions, ...rest }, index) =>
                    size(actions) ? (
                      <ReqoreDropdown
                        {...omit(rest, ['show'])}
                        key={index}
                        label={label}
                        componentProps={{
                          minimal: true,
                          onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation();
                          },
                        }}
                        items={actions}
                      />
                    ) : (
                      <ReqoreButton
                        {...omit(rest, ['show'])}
                        key={index}
                        onClick={
                          rest.onClick
                            ? (e: React.MouseEvent<HTMLButtonElement>) => {
                                e.stopPropagation();
                                rest.onClick();
                              }
                            : undefined
                        }
                      >
                        {label}
                      </ReqoreButton>
                    )
                  )}
                </ReqoreControlGroup>
              </ReqoreColumn>
            ) : null}
          </ReqoreColumns>
          <StyledCommentText marginTop={title || detail || size(actions) ? '10px' : '0px'}>
            {children}
          </StyledCommentText>
        </StyledInfoWrapper>
      </StyledCommentWrapper>
    </ReqorePanel>
  );
};
