import {PraadaCustomPivotPoint} from './praada-custom-pivot-point.model';

describe('Praada Custom Pivot Point test case file ', () => {
    it('Deserialize method', () => {
        const data: any = {
            value: 'THREE_MONTH',
            displayName: 'THREE_MONTH'
        };

        const praadaCustomPivotPointCtrl = new PraadaCustomPivotPoint(data);
        expect(praadaCustomPivotPointCtrl.value).toBe('THREE_MONTH');
        expect(praadaCustomPivotPointCtrl.label).toBe('THREE_MONTH');
    });
});
