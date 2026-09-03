/**
 * Backwards compatibility for `ReqoreMultiSelect`.
 *
 * The component itself is now `ReqoreSelect`, which holds one value by default
 * and many with `multi` — there is no second implementation, because the two
 * never differed in anything but the shape of the value.
 *
 * This module stays so that nothing consuming the old name breaks: both
 * `import { ReqoreMultiSelect } from '@qoretechnologies/reqore'` and the deep
 * `'@qoretechnologies/reqore/dist/components/MultiSelect'` import that reqraft
 * and qorus-ide use for `TReqoreMultiSelectItem` keep resolving, with the same
 * types they always had.
 */
import { IReqoreSelectMultiProps, ReqoreSelect } from '../Select';

export type {
  IReqoreSelectBaseProps as IReqoreMultiSelectBaseProps,
  IReqoreSelectCommonProps as IReqoreMultiSelectCommonProps,
  IReqoreSelectItemProps as IReqoreMultiSelectItemProps,
  TReqoreSelectItem as TReqoreMultiSelectItem,
} from '../Select';
export { ReqoreSelectBase as ReqoreMultiSelectBase, ReqoreSelectItem as ReqoreMultiSelectItem } from '../Select';

/** The multi-value half of `IReqoreSelectProps`, minus the discriminant the
    wrapper supplies — so the props are exactly what they were before. */
export type IReqoreMultiSelectProps = Omit<IReqoreSelectMultiProps, 'multi'>;

/** `ReqoreSelect` with `multi` pre-set: same name, same props, same value shape. */
export const ReqoreMultiSelect = (props: IReqoreMultiSelectProps) => (
  <ReqoreSelect {...props} multi />
);
