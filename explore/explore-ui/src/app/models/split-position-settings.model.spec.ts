import {SplitPositionSettings} from './split-position-settings.model';

describe('Split Position Settings test case', () => {

    it('Deserialize test case', () => {
        // Creating object of type SplitPositionSetting
        const splitSetting = getSplitSettings();
        const splitSettingCtrl = new SplitPositionSettings(splitSetting);
        expect(splitSettingCtrl.selectedPositionTypes.length).toBe(2);
        expect(splitSettingCtrl.selectedPositionTypes[1]).toBe('Dummy Split Position 2');

        // Object not type of SplitPositionSetting
        const splitPositionSetting: any = {};
        splitPositionSetting.selectedPositionTypes = new Array<string>();
        splitPositionSetting.selectedPositionTypes.push('Dummy Split Position 1');
        splitPositionSetting.selectedPositionTypes.push('Dummy Split Position 2');
        const splitSettingCtrl1 = new SplitPositionSettings(splitPositionSetting);
        expect(splitSettingCtrl1.selectedPositionTypes.length).toBe(2);
        expect(splitSettingCtrl1.selectedPositionTypes[1]).toBe('Dummy Split Position 2');
    });

    it('Serialize test case', () => {
        const splitSetting = getSplitSettings();
        expect(splitSetting.serialize()).toBe('Dummy Split Position 1,Dummy Split Position 2');
    });

    it('AddRequest Param test case', () => {
        const requestParams: any = {};
        const splitSetting = getSplitSettings();
        splitSetting.addRequestParams(requestParams);
        expect(requestParams.splitPositionTypes).toBe('Dummy Split Position 1,Dummy Split Position 2');
    });

    /**
     *  Create SplitSettings for testing.
     */
    function getSplitSettings(): SplitPositionSettings {
        const splitSettings: SplitPositionSettings = new SplitPositionSettings();
        splitSettings.selectedPositionTypes = new Array<string>();
        splitSettings.selectedPositionTypes.push('Dummy Split Position 1');
        splitSettings.selectedPositionTypes.push('Dummy Split Position 2');
        return splitSettings;
    }
});
