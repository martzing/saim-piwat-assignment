import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const zone = 'Asia/Bangkok';
dayjs.tz.setDefault(zone);

export default dayjs;
