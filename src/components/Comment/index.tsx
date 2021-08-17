import { IReqoreIntent } from '../../constants/theme';
import { IReqoreIconName } from '../../types/icons';

export interface IReqoreCommentProps {
  icon?: IReqoreIconName | string;
  title?: string;
  children: any;
  minimal?: boolean;
  intent?: IReqoreIntent;
  rounded?: boolean;
}

export const ReqoreComment = () => {};
