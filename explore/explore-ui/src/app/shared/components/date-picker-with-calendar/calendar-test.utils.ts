import {Calendar} from '@blk/explore-ui-core';

export class CalendarTestUtils {
    static getMockCalendars(): Calendar[] {
        return [
            new Calendar({
                calendarCode: 'GreenPkg',
                calendarName: 'United States',
                holidays: [
                    {month: 1, year: 2010, day: 2},
                    {month: 1, year: 2013, day: 2},
                    {month: 1, year: 2014, day: 2},
                    {month: 1, year: 2015, day: 2},
                    {month: 1, year: 2016, day: 2},
                    {month: 1, year: 2017, day: 2},
                    {month: 1, year: 2018, day: 2},
                    {month: 1, year: 2019, day: 2},
                    {month: 1, year: 2020, day: 2},
                ],
            }),
            new Calendar({
                calendarCode: 'GB',
                calendarName: 'England',
                holidays: [
                    {month: 1, year: 2010, day: 3},
                    {month: 1, year: 2013, day: 3},
                    {month: 1, year: 2014, day: 3},
                    {month: 1, year: 2015, day: 3},
                    {month: 1, year: 2016, day: 3},
                    {month: 1, year: 2017, day: 3},
                    {month: 1, year: 2018, day: 3},
                    {month: 1, year: 2019, day: 3},
                    {month: 1, year: 2020, day: 3},
                ],
            }),
            new Calendar({
                calendarCode: 'EMPTY',
                calendarName: 'No Holidays',
                holidays: [],
            }),
            new Calendar({
                calendarCode: 'GP_HK_STD',
                calendarName: 'HK_STD',
                holidays: [
                    {month: 1, year: 2010, day: 1},
                    {month: 1, year: 2013, day: 1},
                    {month: 1, year: 2014, day: 1},
                    {month: 1, year: 2015, day: 1},
                    {month: 1, year: 2016, day: 1},
                    {month: 1, year: 2017, day: 2},
                    {month: 1, year: 2018, day: 1},
                    {month: 1, year: 2019, day: 1},
                    {month: 1, year: 2020, day: 1},
                ],
            })
        ];
    }
}
