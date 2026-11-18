import { useReqoreSurface } from '../../src/context/SurfaceContext';

/**
 * Every color a component reads as what it is drawn on (`useReqoreSurface`), joined with commas, in a span the test
 * finds by `id`: `none` where no component around it has said.
 */
export const SurfaceProbe = ({ id = 'surfaces' }: { id?: string }) => {
  const surface = useReqoreSurface();

  return (
    <span data-testid={id}>
      {surface === undefined ? 'none' : ([] as string[]).concat(surface).join(',')}
    </span>
  );
};
