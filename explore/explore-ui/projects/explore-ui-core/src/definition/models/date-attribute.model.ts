import {Setting} from '../../core/models/setting.model';

export class DateAttribute extends Setting {

    /**
     * Any date will contain day, month and year
     */
    day: number;
    month: number;
    year: number;

    constructor(data?: any) {
        super(data);
    }

    /**
     * doDeserialize
     */
    doDeserialize(data: any): void {
        this.day = data.day;
        this.month = data.month;
        this.year = data.year;
    }
}
