import {Setting} from '../../core/models/setting.model';
import {DateAttribute} from './date-attribute.model';

export class Calendar extends Setting {

    calendarCode: string;
    calendarName: string;
    holidays: DateAttribute[];

    constructor(data?: any) {
        super(data);
    }

    /**
     * Assigning of data into a model received from backend
     */
    static createCalendarMapping(data): Calendar[] {
        const calendar: Calendar[] = [];
        for (const cal of data.calendars) {
            calendar.push(new Calendar(cal));
        }
        return calendar;
    }

    /**
     * doDeserialize
     */
    doDeserialize(data: any): void {
        this.calendarCode = data.calendarCode;
        this.calendarName = data.calendarName;
        this.holidays = data.holidays;
    }
}
