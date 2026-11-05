/**
 * What a stacked, wrapped `ReqoreControlGroup` adds to the cap of a child sized by its content. Such a group has 1px of
 * padding on its left and top, and each child a -1px margin there, so that borders collapse. The group is as wide as
 * the child's margin box plus that padding, which is the child's own width, but its content box, which a percentage is
 * measured against, is 1px less.
 *
 * The group sets this on a child with the margin that does not fill its row. A flat child has no margin. A child that
 * fills its row keeps `100%`: every row of a stack ends where `width: 100%` puts a group among them, 1px inside the
 * group, and a button that reached past that line drew its border out of line with the rows around it. A filling child
 * alone in a group sized by its content therefore stays 1px short, as it always was.
 */
export const CONTROL_GROUP_COLLAPSE_VARIABLE = '--reqore-control-group-collapse';

/**
 * The cap of a control that is never wider than what holds it, plus what its group sets above. At a plain `100%` a
 * stacked group as wide as what it holds was always 1px too narrow for a button alone in it, whose label was then cut by
 * that 1px ("Clo…" for "Clone").
 */
export const CONTROL_GROUP_CHILD_MAX_WIDTH = `calc(100% + var(${CONTROL_GROUP_COLLAPSE_VARIABLE},0px))`;
