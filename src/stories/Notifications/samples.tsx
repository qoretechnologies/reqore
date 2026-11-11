import { noop } from 'lodash';
import { CSSProperties, ReactNode } from 'react';
import { IReqoreNotificationProps } from '../../components/Notifications/notification';
import { TReqoreHexColor } from '../../components/Effect';
import { getDrawnColor } from '../../helpers/colors';
import { ReqoreP, ReqoreSurfaceProvider } from '../../index';

/** Realistic notifications, one per intent, with a one-line form for `compact`. */
export type TSample = Partial<IReqoreNotificationProps> & { key: string; short?: string };

export const SAMPLES: TSample[] = [
  {
    key: 'info',
    intent: 'info',
    title: 'Release ready',
    content: 'v3.2.0 was built and is waiting for approval.',
    short: 'v3.2.0 is waiting for approval',
    actions: [{ label: 'Review' }],
  },
  {
    key: 'success',
    intent: 'success',
    title: 'Deployed',
    content: 'order-sync went live on production twelve seconds ago.',
    short: 'order-sync is live',
    actions: [{ label: 'Open' }, { label: 'Dismiss' }],
  },
  {
    key: 'warning',
    intent: 'warning',
    title: 'Quota at 90%',
    content: 'Qog executions pause at the limit. Raise it, or trim the schedule.',
    short: 'Quota at 90%',
    actions: [{ label: 'Raise limit', icon: 'ArrowUpLine' }],
  },
  {
    key: 'danger',
    intent: 'danger',
    title: 'Connection lost',
    content: 'erp-oracle has been unreachable for four minutes. Retrying every 30 s.',
    short: 'erp-oracle is unreachable',
    actions: [{ label: 'Retry now', icon: 'RefreshLine' }, { label: 'Show log' }],
  },
  {
    key: 'pending',
    intent: 'pending',
    title: 'Importing schema',
    content: 'Reading 214 nodes from the OPC-UA server…',
    short: 'Importing 214 nodes…',
  },
  {
    key: 'muted',
    intent: 'muted',
    title: 'Snoozed',
    content: 'Alerts from staging are muted until 09:00.',
    short: 'Staging alerts muted until 09:00',
    actions: [{ label: 'Unmute' }],
  },
  {
    key: 'plain',
    content: 'Copied to clipboard.',
    short: 'Copied to clipboard',
    actions: [{ label: 'Undo' }],
  },
];

export const DANGER = SAMPLES[3];

/** The props a sample renders with, in the long or the one-line form. */
export const sampleProps = (sample: TSample, compact?: boolean): Partial<IReqoreNotificationProps> => {
  const { key, short, ...props } = sample;

  // A pill carries no actions (it answers to a click on itself and its close).
  return compact
    ? { ...props, compact: true, title: undefined, content: short ?? props.content, actions: undefined }
    : props;
};

/** Every sample gets a close and a silent finish, so a story never dismisses itself. */
export const STATIC: Partial<IReqoreNotificationProps> = { onClose: noop, onFinish: noop };

export const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div style={{ display: 'flex', flexFlow: 'column', gap: 8, minWidth: 0 }}>
    {/* in the text color, not faded: on the busy backdrop a faded label did not read everywhere it is drawn */}
    <ReqoreP size='tiny' effect={{ uppercase: true, spaced: 1 }}>
      {label}
    </ReqoreP>
    {children}
  </div>
);

export const Grid = ({
  columns,
  children,
  style,
}: {
  columns: number | string;
  children: ReactNode;
  style?: CSSProperties;
}) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns:
        typeof columns === 'number' ? `repeat(${columns}, max-content)` : columns,
      gap: '20px 28px',
      padding: 12,
      alignItems: 'start',
      overflowX: 'auto',
      ...style,
    }}
  >
    {children}
  </div>
);

/** The backdrop's gradient: its colors, painted and read alike. */
const BACKDROP_COLORS: TReqoreHexColor[] = ['#1d3557', '#7b2d7a', '#0f6b4f'];

/** Its stripes: a white wash over the gradient, painted and read alike. */
const BACKDROP_STRIPE = 'rgba(255,255,255,0.08)';

/* Every color the backdrop shows: its gradient's, and each under a stripe. The notifications on it are told
   (`ReqoreSurfaceProvider`), so their text and icons read on all of it, as an app does for a background of its own. */
const BACKDROP_SURFACES: TReqoreHexColor[] = [
  ...BACKDROP_COLORS,
  ...BACKDROP_COLORS.map((color) => getDrawnColor(BACKDROP_STRIPE, color)),
];

/**
 * Something busy behind the glass, so the frost and the translucency can be
 * judged — a plain canvas hides both.
 */
export const Backdrop = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      padding: 24,
      borderRadius: 12,
      // the stripes over the gradient, drawn as the surfaces above read them: a plain wash, no blend mode
      background:
        `repeating-linear-gradient(45deg, transparent 0 18px, ${BACKDROP_STRIPE} 18px 22px), ` +
        `linear-gradient(135deg, ${BACKDROP_COLORS[0]} 0%, ${BACKDROP_COLORS[1]} 45%, ${BACKDROP_COLORS[2]} 100%)`,
    }}
  >
    <ReqoreSurfaceProvider color={BACKDROP_SURFACES}>{children}</ReqoreSurfaceProvider>
  </div>
);
