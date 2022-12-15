import styled from 'styled-components';

export const ReqoreSpacer = styled.div`
  visibility: hidden;
  height: ${({ height }) => height || 1}px;
  width: ${({ width }) => width || 1}px;
  flex-shrink: 0;
`;
