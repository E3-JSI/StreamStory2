import MomentUtils from '@date-io/moment';
import { Moment, MomentInput } from 'moment';

class MomentUtcUtils extends MomentUtils {
    format(value: MomentInput, formatString: string): string {
        return this.moment.utc(value).format(formatString);
    }

    parse(value: MomentInput, format: string): Moment {
        // if (value === '') {
        //     return null;
        // }

        return this.moment.utc(value, format, true);
    }

    date(value?: MomentInput): Moment {
        // if (value === null) {
        //     return null;
        // }

        const moment = this.moment.utc(value);

        if (this.locale) {
            moment.locale(this.locale);
        }

        return moment;
    }
}

export default MomentUtcUtils;
