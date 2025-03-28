import {CompareToCurrent} from './compare-to-current.model';

describe('CompareToCurrent test case file', () => {
    it('Deserialize test case', () => {
        const data: any = {
            value: 'COMPARE_TO_CURRENT',
            displayName: 'Compare to Current'
        };

        let compareToCurrentCtrl = new CompareToCurrent(data);
        expect(compareToCurrentCtrl.value).toBe('COMPARE_TO_CURRENT');
        expect(compareToCurrentCtrl.label).toBe('Compare to Current');
    });
});
