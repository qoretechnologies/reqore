import Scroll from 'react-scrollbar';

export interface IReqoreModalContent {
  children?: any;
}

export const ReqoreModalContent = ({ children }: IReqoreModalContent) => (
  <Scroll horizontal='false' className='reqore-modal-content'>
    {children}
  </Scroll>
);
