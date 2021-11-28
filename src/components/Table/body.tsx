import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import { useScroll } from 'react-use';
import { FixedSizeList as List } from 'react-window';
import { TABLE_SIZE_TO_PX } from '../../constants/sizes';
import ReqoreTableRow, { IReqoreTableRowOptions } from './row';

export interface IReqoreTableSectionBodyProps extends IReqoreTableRowOptions {
  setLeftScroll: Dispatch<SetStateAction<number>>;
  rowHeight?: number;
  height: number;
}

const ReqoreTableBody = ({
  data,
  setLeftScroll,
  height,
  rowHeight,
  size = 'normal',
  ...rest
}: IReqoreTableSectionBodyProps) => {
  const ref = useRef(null);
  const { x }: { x: number } = useScroll(ref);

  useEffect(() => {
    setLeftScroll(x);
  }, [x]);

  return (
    <List
      outerRef={ref}
      itemCount={data.length}
      height={height}
      className='reqore-table-body'
      itemSize={rest.flat ? TABLE_SIZE_TO_PX[size] : TABLE_SIZE_TO_PX[size] + 1}
      itemData={{
        data,
        size,
        ...rest,
      }}
    >
      {ReqoreTableRow}
    </List>
  );
};

export default ReqoreTableBody;
