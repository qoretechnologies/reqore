/**
 * How Reqore does something after a while: calls `fire` once `ms` have passed, and returns what cancels it.
 *
 * Reqore waits for a moment in a few places (a rail spells out its labels once the pointer has rested on it), and
 * by default it waits on the machine's clock (`scheduleOnTimer`). An app's tests and stories hand their own clock to
 * the provider (`options.schedule`), so what happens after a while happens when they say, not when the machine gets
 * there: a story is then drawn the same however fast the machine ran it.
 */
export type TReqoreSchedule = (ms: number, fire: () => void) => () => void;

/** Waits on the machine's clock: Reqore's schedule unless the app gives one. */
export const scheduleOnTimer: TReqoreSchedule = (ms, fire) => {
  const timer = setTimeout(fire, ms);
  return () => clearTimeout(timer);
};
