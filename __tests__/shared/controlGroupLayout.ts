/**
 * jsdom lays nothing out, so a responsive control group's layout is modelled for it: each child declares its width
 * (`data-test-width`), a child that declares none is the overflow button (`menuWidth`), and the container grants
 * `available`. The group reads these widths as the box model would give them: its content box is as wide as its
 * content wants, up to what the container granted, and the container is as wide as it was granted.
 */
export interface IModelledGroupLayout {
  /** The room the container grants, read each time it is asked. */
  available: () => number;
  /** The overflow button's width, read each time it is asked. */
  menuWidth: () => number;
  /** Called on each measurement of the group's content, for a test that counts them. */
  onMeasure?: () => void;
}

/** What the group's content wants: the sum of what is rendered in it now. */
export const contentWidthOf = (group: HTMLElement, menuWidth: number): number =>
  Array.from(group.children).reduce(
    (total, child) => total + Number((child as HTMLElement).dataset.testWidth ?? menuWidth),
    0
  );

/** Teaches jsdom the widths the group reads (see above). */
export const modelGroupLayout = (
  group: HTMLElement,
  { available, menuWidth, onMeasure }: IModelledGroupLayout
) => {
  Object.defineProperty(group, 'scrollWidth', {
    configurable: true,
    get: () => {
      onMeasure?.();
      return contentWidthOf(group, menuWidth());
    },
  });
  Object.defineProperty(group, 'clientWidth', {
    configurable: true,
    get: () => Math.min(contentWidthOf(group, menuWidth()), available()),
  });
  Object.defineProperty(group.parentElement!, 'clientWidth', {
    configurable: true,
    get: () => available(),
  });
};
