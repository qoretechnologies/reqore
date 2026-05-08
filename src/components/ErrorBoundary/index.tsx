import { omit } from 'lodash';
import { Component, ErrorInfo, memo } from 'react';
import { ReqorePanel, ReqoreTree, useReqoreProperty } from '../..';
import { IReqorePanelProps } from '../Panel';

export interface IReqoreErrorBoundaryProps extends Omit<IReqorePanelProps, 'onError'> {
  fallback?: React.ReactNode;
  children: React.ReactNode;
  doNotCatch?: boolean;
  errorMessage?: string;
  onError?: (error: Error, info: ErrorInfo) => void;
}

export interface IReqoreErrorBoundaryState {
  error: Error;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<IReqoreErrorBoundaryProps, IReqoreErrorBoundaryState> {
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
    const { doNotCatch, fallback, errorMessage, children, ...rest } = this.props;

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
          responsiveTitle={false}
          customTheme={{ main: 'danger' }}
          iconProps={{ size: '20px' }}
          {...omit(rest, ['onError'])}
          errorBoundaryOptions={{ doNotCatch: true }}
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
          {errorMessage}
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

export const ReqoreErrorBoundary = memo((props: IReqoreErrorBoundaryProps) => {
  const errorBoundaryOptions = useReqoreProperty('errorBoundaryOptions');

  if (errorBoundaryOptions?.doNotCatch || props.doNotCatch) {
    return <>{props.children || null}</>;
  }

  return <ErrorBoundary {...errorBoundaryOptions} {...props} />;
});
