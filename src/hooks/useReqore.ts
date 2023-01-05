import { useContext } from 'react';
import ReqoreContext, { IReqoreContext } from '../context/ReqoreContext';

export const useReqore = (): IReqoreContext => {
  const reqore = useContext(ReqoreContext);

  if (!reqore) {
    throw new Error('Reqore context is not defined');
  }

  return reqore;
};
