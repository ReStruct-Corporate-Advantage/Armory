import {FavoriteType} from '@blk/explore-ui-core';
import {MandateSettings} from './mandate-settings.model';

describe('MandateSettings', () => {
    // Mandate Setting attribute data
    const mandateData: any = {
        MANDATE: 'FI_MANDATE',
        BREAKDOWN: 'false;1210587',
        REPORTS: ['false;1325071', 'false;1325073', 'false;1325075'],
        ATTRIBUTION_SETTING: 'FIXED_INCOME_DXS',
        PERF_BKD: 'false;1210587'
    };

    /**
     * Deserialize test case
     */
    it('deserialize Test - old favorite', () => {
        const mandateSettingResponse = new MandateSettings(mandateData);
        expect(mandateSettingResponse.mandate).toBe('FI_MANDATE');
        expect(mandateSettingResponse.settings.get(FavoriteType.BREAKDOWN)).toBe('false;1210587');
        expect(mandateSettingResponse.settings.get(FavoriteType.CURATED_REPORTS).length).toBe(3);
        expect(mandateSettingResponse.settings.get(FavoriteType.ATTRIBUTION_TYPE)).toBe('FIXED_INCOME_DXS');
        expect(mandateSettingResponse.settings.get(FavoriteType.PERFORMANCE_BREAKDOWN)).toBe('false;1210587');
    });

    /**
     * Serialize test case
     */
    it('serialize/ deserialize Test - new favorite', () => {
        let mandateSettingResponse = new MandateSettings(mandateData);
        const serializedMandateData = mandateSettingResponse.serialize();
        expect(Object.keys(serializedMandateData).length).toBe(2);
        expect(serializedMandateData.MANDATE).toBe('FI_MANDATE');
        expect(serializedMandateData.settings['BREAKDOWN']).toBe('false;1210587');
        expect(serializedMandateData.settings['CURATED_REPORTS'].length).toBe(3);
        expect(serializedMandateData.settings['ATTRIBUTION_TYPE']).toBe('FIXED_INCOME_DXS');
        expect(serializedMandateData.settings['PERF_BKD']).toBe('false;1210587');

        mandateSettingResponse = new MandateSettings(serializedMandateData);
        expect(mandateSettingResponse.mandate).toBe('FI_MANDATE');
        expect(mandateSettingResponse.settings.get(FavoriteType.BREAKDOWN)).toBe('false;1210587');
        expect(mandateSettingResponse.settings.get(FavoriteType.CURATED_REPORTS).length).toBe(3);
        expect(mandateSettingResponse.settings.get(FavoriteType.ATTRIBUTION_TYPE)).toBe('FIXED_INCOME_DXS');
        expect(mandateSettingResponse.settings.get(FavoriteType.PERFORMANCE_BREAKDOWN)).toBe('false;1210587');
    });
});
