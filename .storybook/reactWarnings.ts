// Copyright 2026 Qore Technologies, s.r.o.
import { watchReactWarnings } from '../src/stories/utils/reactWarningGate';

/**
 * The console's React warnings, watched from before any of reqore's modules load: `vitest.setup.ts` imports this
 * module first, so a warning a module gives as it loads (a library calling a deprecated React API at import) is kept
 * too, and fails the story file's first story (`src/stories/utils/reactWarningGate.ts`).
 */
export const reactWarnings = watchReactWarnings();
