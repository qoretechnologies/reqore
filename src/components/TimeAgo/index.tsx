import timeago from 'epoch-timeago';
import { useState } from 'react';
import { useInterval } from 'react-use';
import { getTimeAgoIntervalDelay } from '../../helpers/time';

export const TimeAgo = ({ time }: { time: number | string }) => {
  const [_lastUpdate, _setLastUpdate] = useState<number>(Date.now());
  const _time = typeof time === 'number' ? time : Date.parse(time);

  useInterval(() => {
    _setLastUpdate(Date.now());
  }, getTimeAgoIntervalDelay(_time));

  return timeago(_time);
};
