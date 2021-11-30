import timeago from 'epoch-timeago';
import { useState } from 'react';
import { useInterval } from 'react-use';
import { getTimeAgoIntervalDelay } from '../../helpers/time';

export const TimeAgo = ({ time }: { time: number }) => {
  const [_lastUpdate, _setLastUpdate] = useState<number>(Date.now());

  useInterval(() => {
    _setLastUpdate(Date.now());
  }, getTimeAgoIntervalDelay(time));

  return timeago(time);
};
