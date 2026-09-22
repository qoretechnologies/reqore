import {
  TReqoreEffectColor,
  TReqoreEffectColorManipulationAlpha,
  TReqoreEffectColorManipulationMultiplier,
} from '../src/components/Effect';

/*
 * The size of the colour type is a tax on every consumer.
 *
 * `TReqoreEffectColor` used to ENUMERATE its modifier segments: 2
 * manipulations × 30 multipliers × 11 alphas × every intent and the hex
 * pattern — about ten thousand members. TypeScript 7 refuses to build an
 * expression whose type is that wide (`TS2590: Expression produces a union
 * type that is too complex to represent`), and it does so at the CONSUMER:
 * merely putting a typed value of it in a conditional, or spreading it into an
 * effect object, was enough. The Qorus IDE carried `as any` casts for exactly
 * that, in code that had the right type already.
 *
 * The modifier segments are `${number}` now: the same spellings are accepted,
 * the union is a handful of patterns rather than ten thousand members, and the
 * intended RANGES stay published as
 * `TReqoreEffectColorManipulationMultiplier` / `...Alpha` for anyone who wants
 * to pin them.
 *
 * HOW THIS FILE IS ENFORCED: by the COMPILER, not by the runner.
 * `expectTypeOf` erases to nothing at runtime, so every `it` below passes
 * vacuously under `yarn test` — and fails `yarn build:test`
 * (`tsc --noEmit`, which has `__tests__` in its `include`) the moment an
 * assertion stops holding. That is the gate CI runs, through `yarn precheck`.
 * Do not "fix" a failure here by editing the assertion to match; the assertion
 * IS the requirement. And do not add a runtime `expect` to make the test look
 * busy: an `expect` over literals asserts that JavaScript still works.
 */

describe('the effect colour type', () => {
  it('accepts every spelling it always did', () => {
    expectTypeOf<'#0b0b0b'>().toMatchTypeOf<TReqoreEffectColor>();
    expectTypeOf<'info'>().toMatchTypeOf<TReqoreEffectColor>();
    expectTypeOf<'main'>().toMatchTypeOf<TReqoreEffectColor>();
    expectTypeOf<'transparent'>().toMatchTypeOf<TReqoreEffectColor>();
    expectTypeOf<'info:lighten'>().toMatchTypeOf<TReqoreEffectColor>();
    expectTypeOf<'#6f1977:lighten:5'>().toMatchTypeOf<TReqoreEffectColor>();
    expectTypeOf<'main:darken:3:0.5'>().toMatchTypeOf<TReqoreEffectColor>();
    expectTypeOf<'success:lighten:10:1'>().toMatchTypeOf<TReqoreEffectColor>();
  });

  it('still refuses what is not a colour', () => {
    // Not an intent, a hex, or a modifier spelling.
    expectTypeOf<'chartreuse'>().not.toMatchTypeOf<TReqoreEffectColor>();
    // The manipulation names are `lighten` and `darken`.
    expectTypeOf<'info:brighten:5'>().not.toMatchTypeOf<TReqoreEffectColor>();
    // A hex has to start with `#`.
    expectTypeOf<'0b0b0b'>().not.toMatchTypeOf<TReqoreEffectColor>();
  });

  it('keeps the documented ranges available', () => {
    expectTypeOf<30>().toMatchTypeOf<TReqoreEffectColorManipulationMultiplier>();
    expectTypeOf<0.5>().toMatchTypeOf<TReqoreEffectColorManipulationAlpha>();
    // The ranges are what they say they are: 31 is past the multiplier's end.
    expectTypeOf<31>().not.toMatchTypeOf<TReqoreEffectColorManipulationMultiplier>();
    expectTypeOf<1.5>().not.toMatchTypeOf<TReqoreEffectColorManipulationAlpha>();
  });

  it('is small enough to use in an expression', () => {
    // What TS2590 refused at the consumer: a conditional over two values of
    // the type, and the type of an object built from them. This one has to be
    // written as real code — the failure it guards against is the COMPILER
    // giving up on the expression, which only an expression can provoke.
    const accent: TReqoreEffectColor = '#6f1977';
    const dimmed: TReqoreEffectColor = '#6d6d6d';
    const hidden = true;

    const chosen: TReqoreEffectColor = hidden ? dimmed : accent;
    const gradient: { borderColor: TReqoreEffectColor; glow: { color: TReqoreEffectColor } } = {
      borderColor: `${accent}:lighten:5`,
      glow: { color: `${accent}:darken:2:0.4` },
    };

    // The assertions here ARE runtime ones, and deliberately: what is under
    // test is that the two declarations above compile at all, and something
    // has to read the values or `noUnusedLocals` deletes the experiment.
    expect(chosen).toBe('#6d6d6d');
    expect(gradient.borderColor).toBe('#6f1977:lighten:5');
    expect(gradient.glow.color).toBe('#6f1977:darken:2:0.4');
  });
});
