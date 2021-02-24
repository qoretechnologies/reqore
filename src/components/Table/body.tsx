import React, { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import { useScroll } from 'react-use';
import { FixedSizeList as List } from 'react-window';
import { IReqoreTableColumn } from '.';
import ReqoreTableRow from './row';

export interface IReqoreTableSectionBodyProps {
  hover?: boolean;
  striped?: boolean;
  bordered?: boolean;
  data?: any[];
  columns?: IReqoreTableColumn[];
  setLeftScroll: Dispatch<SetStateAction<number>>;
  height: number;
}

const ReqoreTableBody = ({
  data,
  columns,
  setLeftScroll,
  height,
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
        columns,
        data,
      }}
    >
      {ReqoreTableRow}
    </List>
  );
};

export default ReqoreTableBody;
