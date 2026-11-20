// Copyright 2026 Qore Technologies, s.r.o.
import { render } from '@testing-library/react';
import {
  ReqoreButton,
  ReqoreContent,
  ReqoreInput,
  ReqoreLayoutContent,
  ReqoreTag,
  ReqoreUIProvider,
} from '../src';

/**
 * An icon's scale (0.85 at rest, 0.93 under the pointer, on focus or active) changes at once; its
 * color, opacity and rotation still ease. Animating the transform promoted the icon to a compositor
 * layer that the browser dropped some time after, so a screenshot drew the icon's box a shade apart
 * from run to run (in visual tests, focused-control stories alternated between two images).
 */
test('no icon animates its transform', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreButton icon='PlayLine'>Run</ReqoreButton>
          <ReqoreTag icon='TimeLine' label='Waiting' />
          <ReqoreInput icon='SearchLine' value='' onChange={() => undefined} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const icons = Array.from(document.querySelectorAll<HTMLElement>('.reqore-icon'));

  expect(icons.length).toBeGreaterThanOrEqual(3);
  icons.forEach((icon) => {
    const properties = getComputedStyle(icon)
      .transitionProperty.split(',')
      .map((property) => property.trim());

    expect(properties).not.toContain('transform');
    expect(properties).not.toContain('all');
  });
});
