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
  /**
   * Label for the "Reset" action rendered on the built-in fallback panel.
   * Defaults to English `'Reset'` — override this to translate the button copy.
   */
  resetActionLabel?: string;
  /**
   * Label for the "Details" toggle action rendered on the built-in fallback panel.
   * Defaults to English `'Details'` — override this to translate the button copy.
   */
  detailsActionLabel?: string;
  /**
   * Label used as the "Name" row header inside the details tree.
   * Defaults to English `'Name'` — override this to translate the tree row label.
   */
  errorNameLabel?: string;
  /**
   * Label used as the "Message" row header inside the details tree.
   * Defaults to English `'Message'` — override this to translate the tree row label.
   */
  errorDetailsMessageLabel?: string;
  /**
   * Label used as the "Stack" row header inside the details tree.
   * Defaults to English `'Stack'` — override this to translate the tree row label.
   */
  errorStackLabel?: string;
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
    // React only auto-logs caught errors in development builds; in a
    // production build a caught error otherwise produces no console output at
    // all (only the visual fallback renders), which makes swallowed
    // exceptions impossible to debug. Always log so the error stays visible.
    // eslint-disable-next-line no-console
    console.error('ReqoreErrorBoundary caught an error:', error, info?.componentStack);

    this.props.onError?.(error, info);
  }

  render() {
    const {
      doNotCatch,
      fallback,
      errorMessage,
      children,
      resetActionLabel = 'Reset',
      detailsActionLabel = 'Details',
      errorNameLabel = 'Name',
      errorDetailsMessageLabel = 'Message',
      errorStackLabel = 'Stack',
      ...rest
    } = this.props;

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
              label: resetActionLabel,
              icon: 'RefreshLine',
              size: 'tiny',
              compact: true,
              minimal: true,
              onClick: () => this.setState({ error: undefined }),
            },
            {
              label: detailsActionLabel,
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
                [errorNameLabel]: this.state.error.name,
                [errorDetailsMessageLabel]: this.state.error.message,
                [errorStackLabel]: this.state.error.stack,
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
