import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
// import * as timezone from 'dayjs/plugin/timezone';
// import * as utc from 'dayjs/plugin/utc';

dayjs.extend(duration);

// dayjs.extend(utc);
// dayjs.extend(timezone);
// Standardize all date handling to UTC
// This helps keep backend logic and tests consistent across environments
// dayjs.tz.setDefault('UTC');

export { dayjs };
