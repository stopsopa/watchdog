
const th = msg => new Error(`howMuchTimeLeftToNextTrigger.js error ${msg}`);

module.exports = function howMuchTimeLeftToNextTrigger({
  intervalMilliseconds,
  lastTimeLoggedInEsUnixtimestampMilliseconds,
}) {

  if ( ! Number.isInteger(intervalMilliseconds) ) {

    throw th(`intervalMilliseconds is not an integer`);
  }

  if ( lastTimeLoggedInEsUnixtimestampMilliseconds !== undefined && ! Number.isInteger(lastTimeLoggedInEsUnixtimestampMilliseconds) ) {

    throw th(`lastTimeLoggedInEsUnixtimestampMilliseconds is not undefined nor an integer`);
  }

  if ( lastTimeLoggedInEsUnixtimestampMilliseconds === undefined ) {

    lastTimeLoggedInEsUnixtimestampMilliseconds = -intervalMilliseconds;
  }

  const nowUnixtimestampMilliseconds = (new Date()).getTime();

  let nextTriggerRelativeToLastEsLogAfterApplyingIntervalUnixtimestampMilliseconds = lastTimeLoggedInEsUnixtimestampMilliseconds + intervalMilliseconds;

  let nextTriggerFromNowMilliseconds = nextTriggerRelativeToLastEsLogAfterApplyingIntervalUnixtimestampMilliseconds - nowUnixtimestampMilliseconds;

  if (nextTriggerFromNowMilliseconds < 0) {

    nextTriggerFromNowMilliseconds = 0;
  }

  return {
    // nowUnixtimestampMilliseconds,
    nextTriggerRelativeToLastEsLogAfterApplyingIntervalUnixtimestampMilliseconds,
    nextTriggerFromNowMilliseconds,
  }

}