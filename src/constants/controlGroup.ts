/**
 * What a stacked, wrapped `ReqoreControlGroup` pulls one child over by. Such a group has 1px of padding on its left
 * and top, and each child a -1px margin there, so that borders collapse. A child's margin box is therefore 1px
 * narrower than the child, and the row a child may fill is 1px wider than the content box its `100%` is measured
 * against.
 *
 * The group sets this on the children that have the margin. A flat child has none and stays at `100%`.
 */
export const CONTROL_GROUP_COLLAPSE_VARIABLE = '--reqore-control-group-collapse';

/**
 * The cap of a control that is never wider than what holds it: the whole row it is in, including what its group pulls
 * it over. At a plain `100%` a shrink-to-fit stacked group was always 1px too narrow for a button alone in it, whose
 * label was then cut by that 1px ("Clo…" for "Clone").
 */
export const CONTROL_GROUP_CHILD_MAX_WIDTH = `calc(100% + var(${CONTROL_GROUP_COLLAPSE_VARIABLE},0px))`;
