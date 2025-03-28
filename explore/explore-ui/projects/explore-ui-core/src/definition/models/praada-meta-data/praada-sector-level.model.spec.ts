import {PraadaSectorLevel} from './praada-sector-level.model';

describe('Praada Sector Level test case file', () => {
    it('Deserialize test case', () => {
        const data: any = {
            value: 'IMMEDIATE_PARENT_LEVEL',
            displayName: 'Immediate Parent'
        };

        const praadaSectorLevelCtrl = new PraadaSectorLevel(data);
        expect(praadaSectorLevelCtrl.value).toBe('IMMEDIATE_PARENT_LEVEL');
        expect(praadaSectorLevelCtrl.label).toBe('Immediate Parent');
    });
});
