import timeago from 'epoch-timeago';
import { useState } from 'react';
import { useInterval } from 'react-use';
import { getTimeAgoIntervalDelay } from '../../helpers/time';

export const TimeAgo = ({ time }: { time: number | string }) => {
  const setUpdate = useState<number>(Date.now());
  const _time = typeof time === 'number' ? time : Date.parse(time);

  useInterval(() => {
    setUpdate[1](Date.now());
  }, getTimeAgoIntervalDelay(_time));

  return timeago(_time);
};
