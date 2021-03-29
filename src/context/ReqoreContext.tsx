import { createContext } from 'react';
import { IReqoreConfirmationModal } from '../containers/Reqore';

export interface IReqoreContext {
  confirmAction?: (data: IReqoreConfirmationModal) => void;
}

export default createContext<IReqoreContext>({});
