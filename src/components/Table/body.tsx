import React, { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import { useScroll } from 'react-use';
import { FixedSizeList as List } from 'react-window';
import { IReqoreTableColumn } from '.';
import ReqoreTableRow from './row';

export interface IReqoreTableSectionBodyProps {
  data?: any[];
  columns?: IReqoreTableColumn[];
  setLeftScroll: Dispatch<SetStateAction<number>>;
  height: number;
  selectable?: boolean;
  selected?: string[];
  onSelectClick?: (selectId: string) => void;
}

const ReqoreTableBody = ({
  data,
  setLeftScroll,
  height,
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
      itemSize={40}
      itemData={{
        data,
        ...rest,
      }}
    >
      {ReqoreTableRow}
    </List>
  );
};

export default ReqoreTableBody;
