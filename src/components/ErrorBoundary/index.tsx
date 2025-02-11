import { Component, ErrorInfo } from 'react';
import { ReqorePanel, ReqoreTree } from '../..';
import { IReqorePanelProps } from '../Panel';

export interface IReqoreErrorBoundaryProps extends Omit<IReqorePanelProps, 'onError'> {
  fallback?: React.ReactNode;
  children: React.ReactNode;
  doNotCatch?: boolean;
  onError?: (error: Error, info: ErrorInfo) => void;
}

export interface IReqoreErrorBoundaryState {
  error: Error;
  showDetails: boolean;
}

export class ReqoreErrorBoundary extends Component<
  IReqoreErrorBoundaryProps,
  IReqoreErrorBoundaryState
> {
  constructor(props) {
    super(props);
    this.state = { error: undefined, showDetails: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  render() {
    const { doNotCatch, fallback, children, onError, ...rest } = this.props;

    if (this.state.error && !doNotCatch) {
      if (fallback) {
        // You can render any custom fallback UI
        return fallback;
      }

      return (
        <ReqorePanel
          label='Something went wrong'
          intent='danger'
          minimal
          size='small'
          icon='ErrorWarningLine'
          responsiveActions={false}
          iconProps={{ size: '20px' }}
          customTheme={{ main: 'danger' }}
          {...rest}
          actions={[
            ...(rest.actions || []),
            {
              label: 'Reset',
              icon: 'RefreshLine',
              size: 'tiny',
              compact: true,
              minimal: true,
              onClick: () => this.setState({ error: undefined }),
            },
            {
              label: 'Details',
              icon: 'InformationLine',
              size: 'tiny',
              compact: true,
              minimal: true,
              onClick: () => this.setState({ showDetails: !this.state.showDetails }),
            },
          ]}
        >
          There was an error rendering this component. You can try resetting or refreshing the page.
          {this.state.showDetails && (
            <ReqoreTree
              showControls={false}
              size='small'
              data={{
                Name: this.state.error.name,
                Message: this.state.error.message,
                Stack: this.state.error.stack,
              }}
            />
          )}
        </ReqorePanel>
      );
    }

    return children;
  }
}
