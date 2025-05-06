import timeago from 'epoch-timeago';
import React, { useState } from 'react';
import { useInterval } from 'react-use';
import { getTimeAgoIntervalDelay } from '../../helpers/time';

export const TimeAgo = ({
  time,
  emptyMessage = null,
  invalidMessage = 'Invalid Date',
}: {
  time: number | string;
  emptyMessage?: React.ReactNode;
  invalidMessage?: React.ReactNode;
}) => {
  const setUpdate = useState<number>(Date.now());
  const _time = typeof time === 'number' ? time : Date.parse(time);

  useInterval(() => {
    setUpdate[1](Date.now());
  }, getTimeAgoIntervalDelay(_time));

  if (!time) {
    return emptyMessage;
  }

  if (isNaN(_time)) {
    return invalidMessage;
  }

  return timeago(_time);
};
