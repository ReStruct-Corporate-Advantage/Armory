import {PgsChartInputs} from '@models/pgs-chart-inputs.model';

describe('PGS chart inputs model test case', () => {

    it('Deserialize test case', () => {
        // Creating object of type PgsChartInputs
        const pgsChartInputs = getPgsChartInputs();
        const pgsChartInputsCtrl = new PgsChartInputs(pgsChartInputs);
        expect(pgsChartInputsCtrl.actionKey).toBe('test action key');
        expect(pgsChartInputsCtrl.level).toBe(2);
    });

    it('Serialize test case', () => {
        const pgsChartInputs = getPgsChartInputs();
        expect(pgsChartInputs.serialize()).toEqual({
            "actionKey": "test action key",
            "level": 2
        });
    });

    /**
     *  Create SplitSettings for testing.
     */
    function getPgsChartInputs(): PgsChartInputs {
        const pgsChartInputs: PgsChartInputs = new PgsChartInputs();
        pgsChartInputs.savedCustomVizConfig = {queryKeys: ['test Key']};
        pgsChartInputs.actionKey = 'test action key';
        pgsChartInputs.level = 2;
        return pgsChartInputs;
    }
});
