import {Calendar} from './calendar.model';

describe('calendars file test cases', () =>{
    it('deserialize test', ()  =>{
        const data: any = {
            calendarCode: 'GreenPkg',
            calendarName: 'United States',
            holidays: [{day: 16, month: 1, year: 2006},
                {day: 20, month: 2, year: 2006}]
        };

        let calendarsCtrl = new Calendar(data);
        expect(calendarsCtrl.calendarCode).toBe('GreenPkg');
        expect(calendarsCtrl.calendarName).toBe('United States');
        expect(calendarsCtrl.holidays).toStrictEqual([{day: 16, month: 1, year: 2006}, {day: 20, month: 2, year: 2006}]);
    });

});
