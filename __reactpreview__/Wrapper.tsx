import {
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreUIProvider,
} from '../src/index';
import './styles.css';

export const Wrapper = ({ children }) => (
  <ReqoreUIProvider>
    <ReqoreLayoutContent>
      <ReqoreContent style={{ width: '100%', height: '100%', padding: '20px' }}>
        {children}
      </ReqoreContent>
    </ReqoreLayoutContent>
  </ReqoreUIProvider>
);
