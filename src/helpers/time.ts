export const getTimeAgoIntervalDelay = (time: number): number => {
  // If the time is larger than one day
  if (Date.now() - time > 60000 * 60 * 24) {
    // update once a day
    return 60000 * 60 * 24;
  }
  // If the time is larger than one hour
  if (Date.now() - time > 60000 * 60) {
    // update once an hour
    return 60000 * 60;
  }

  // Otherwise update every 5 seconds
  return 5000;
};
