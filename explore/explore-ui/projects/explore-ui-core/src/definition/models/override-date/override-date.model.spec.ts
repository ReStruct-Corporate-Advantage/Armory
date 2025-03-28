import {OverrideDate} from './override-date.model';

describe('Override date test case file', () =>{
    it('deserialize test', () =>{
        const data: any = {
            value: 'CURRENT',
            displayName: 'Current'
        };

        let overrideDateCtrl = new OverrideDate(data);
        expect(overrideDateCtrl.value).toBe('CURRENT');
        expect(overrideDateCtrl.label).toBe('Current');
    });
});
