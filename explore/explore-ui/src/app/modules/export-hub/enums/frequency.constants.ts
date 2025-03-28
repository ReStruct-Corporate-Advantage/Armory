import {
    EndPeriod,
    EndPeriodMap,
    Frequency,
    FrequencyMap,
    Month,
    MonthMap,
    WeekDay,
    WeekDayMap,
    WeekDayOccurrence,
    WeekDayOccurrenceMap
} from '@blk/aladdin-graph-everything/analytics/portfolio_analytics/export_hub/v1/export_hub_job_pb';


export const FREQUENCY_LABEL_MAP = new Map<FrequencyMap[keyof FrequencyMap], string>([
    [Frequency.FREQUENCY_ONCE, 'Once'],
    [Frequency.FREQUENCY_DAILY, 'Daily'],
    [Frequency.FREQUENCY_WEEKLY, 'Weekly'],
    [Frequency.FREQUENCY_MONTHLY, 'Monthly'],
    [Frequency.FREQUENCY_YEARLY, 'Yearly']
]);

export const END_LABEL_MAP = new Map<EndPeriodMap[keyof EndPeriodMap] , string>([
    [EndPeriod.END_PERIOD_ON_THIS_DAY, 'On this day'],
    [EndPeriod.END_PERIOD_AFTER_N_OCCURRENCES, 'After'],
    [EndPeriod.END_PERIOD_NEVER, 'No end date']
]);

export const MONTH_LABEL_MAP = new Map<MonthMap[keyof MonthMap], string>([
    [Month.MONTH_JANUARY, 'January'],
    [Month.MONTH_FEBRUARY, 'February'],
    [Month.MONTH_MARCH, 'March'],
    [Month.MONTH_APRIL, 'April'],
    [Month.MONTH_MAY, 'May'],
    [Month.MONTH_JUNE, 'June'],
    [Month.MONTH_JULY, 'July'],
    [Month.MONTH_AUGUST, 'August'],
    [Month.MONTH_SEPTEMBER, 'September'],
    [Month.MONTH_OCTOBER, 'October'],
    [Month.MONTH_NOVEMBER, 'November'],
    [Month.MONTH_DECEMBER, 'December']
]);

export enum FREQUENCY_LABELS {
    ONCE = 'Once',
    DAILY = 'Daily',
    WEEKLY = 'Weekly',
    MONTHLY = 'Monthly',
    YEARLY = 'Yearly'
}

export enum  OnTheDayOptions {
    FIRST = 'First',
    SECOND = 'Second',
    THIRD = 'Third',
    FOURTH = 'Fourth',
    LAST = 'Last'
}

export const WEEK_DAY_OCCURRENCE_LABEL_MAP = new Map<WeekDayOccurrenceMap[keyof WeekDayOccurrenceMap], string>([
    [WeekDayOccurrence.WEEK_DAY_OCCURRENCE_FIRST, 'First'],
    [WeekDayOccurrence.WEEK_DAY_OCCURRENCE_SECOND, 'Second'],
    [WeekDayOccurrence.WEEK_DAY_OCCURRENCE_THIRD, 'Third'],
    [WeekDayOccurrence.WEEK_DAY_OCCURRENCE_FOURTH, 'Fourth'],
    [WeekDayOccurrence.WEEK_DAY_OCCURRENCE_LAST, 'Last']
]);

export const WEEK_DAY_LABEL_MAP = new Map<WeekDayMap[keyof WeekDayMap], string>([
    [WeekDay.WEEK_DAY_MONDAY, 'Monday'],
    [WeekDay.WEEK_DAY_TUESDAY, 'Tuesday'],
    [WeekDay.WEEK_DAY_WEDNESDAY, 'Wednesday'],
    [WeekDay.WEEK_DAY_THURSDAY, 'Thursday'],
    [WeekDay.WEEK_DAY_FRIDAY, 'Friday'],
    [WeekDay.WEEK_DAY_SATURDAY, 'Saturday'],
    [WeekDay.WEEK_DAY_SUNDAY, 'Sunday']
]);

export const LABEL_WEEKDAY_MAP = new Map<string, WeekDayMap[keyof WeekDayMap]>([
    ['Monday', WeekDay.WEEK_DAY_MONDAY],
    ['Tuesday', WeekDay.WEEK_DAY_TUESDAY],
    ['Wednesday', WeekDay.WEEK_DAY_WEDNESDAY],
    ['Thursday', WeekDay.WEEK_DAY_THURSDAY],
    ['Friday', WeekDay.WEEK_DAY_FRIDAY],
    ['Saturday', WeekDay.WEEK_DAY_SATURDAY],
    ['Sunday', WeekDay.WEEK_DAY_SUNDAY]
]);

