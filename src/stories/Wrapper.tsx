import { ReqoreLayoutContent } from '..';
import ReqoreContent from '../components/Content';
import ReqoreUIProvider, { IReqoreUIProviderProps } from '../containers/UIProvider';

export const StoryWrapper = ({ children, ...args }: IReqoreUIProviderProps) => {
  return (
    <ReqoreUIProvider {...args}>
      <ReqoreLayoutContent>
        <ReqoreContent style={{ padding: '20px' }}>{children}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
};
