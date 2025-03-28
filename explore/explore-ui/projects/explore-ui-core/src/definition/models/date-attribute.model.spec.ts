import {DateAttribute} from './date-attribute.model';

describe('Date model test cases', () =>{

    it('deserialize test', () =>{
        const data: any = {
            day: 16,
            month: 1,
            year: 2006,
        };

        let dateCtrl = new DateAttribute(data);
        expect(dateCtrl.day).toBe(16);
        expect(dateCtrl.month).toBe(1);
        expect(dateCtrl.year).toBe(2006);
    });
});
