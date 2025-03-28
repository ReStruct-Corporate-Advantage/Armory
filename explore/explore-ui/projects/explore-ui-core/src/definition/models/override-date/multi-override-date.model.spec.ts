import {MultiOverrideDate} from './multi-override-date.model';

describe('MultiOverride Data test case file', () =>{
    it('Deserialize method test', () => {
        const data: any = {
            value: 'DAILY',
            displayName: 'Daily'
        };

        const multiOverrideDataCtrl = new MultiOverrideDate(data);
        expect(multiOverrideDataCtrl.value).toBe('DAILY');
        expect(multiOverrideDataCtrl.label).toBe('Daily');
    });
});
