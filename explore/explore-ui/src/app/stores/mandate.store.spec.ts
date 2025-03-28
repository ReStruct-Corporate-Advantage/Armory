import {MandateStore} from './mandate.store';
import {MandateSettings} from '../models/mandate/mandate-settings.model';
import {Mandate} from '../models/mandate/mandate.model';

describe('MandateStore', () => {
    beforeAll(() => {
        MandateStore.mandateSettingsList = [
            new MandateSettings({
                'MANDATE': 'FI_MANDATE',
                'ATTRIBUTION_SETTING': 'FIXED_INCOME_DXS',
                'BREAKDOWN': 'false;1210587',
                'REPORTS': ['false;1325071', 'false;1325073', 'false;1325075'],
                'PERF_BKD': 'false;1210587'
            }),
            new MandateSettings({
                'MANDATE': 'EQ_MANDATE',
                'ATTRIBUTION_SETTING': 'EQUITY',
                'BREAKDOWN': 'false;1275180',
                'REPORTS': ['false;1325090', 'false;1325091'],
                'FAC_BKD': 'false;1435981'
            }),
            new MandateSettings({
                'MANDATE': 'BAL_MANDATE',
                'ATTRIBUTION_SETTING': 'EQUITY_TD_xFX',
                'REPORTS': ['false;1325094', 'false;1325095']
            }),
            new MandateSettings({
                'MANDATE': 'EQASXJAP',
                'ATTRIBUTION_SETTING': 'EQUITY',
                'BREAKDOWN': 'false;1275180',
                'REPORTS': ['false;1445064', 'false;1445063', 'false;1445062'],
                'FAC_BKD': 'false;1435981'
            }),
            new MandateSettings({
                'MANDATE': 'BAL-FID',
                'ATTRIBUTION_SETTING': 'EQUITY_TD_xFX',
                'REPORTS': ['false;1456150']
            })];
    });
    describe('getMandateSettings Test', () => {
        it('should get mandateSettings', () => {
            const expectedMandateSettings = new MandateSettings({
                'MANDATE': 'EQ_MANDATE',
                'ATTRIBUTION_SETTING': 'EQUITY',
                'BREAKDOWN': 'false;1275180',
                'REPORTS': ['false;1325090', 'false;1325091'],
                'FAC_BKD': 'false;1435981'
            });
            const mandate = new Mandate('EQ-PB', '', 'EQ_MANDATE');

            expect(MandateStore.getMandateSettings(mandate, 'EQ_MANDATE')).toEqual(expectedMandateSettings);
        });
    });
});
