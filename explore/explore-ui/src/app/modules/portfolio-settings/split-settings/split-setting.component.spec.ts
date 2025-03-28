import {SplitSettingComponent} from './split-setting.component';
import {SplitPositionSettings} from '../../../models/split-position-settings.model';

describe('Split Setting component test cases', () => {
    const selectedPositionTypes: Array<string> = ['XC', 'XF', 'XH'];
    const allSplitSetting: Array<any> = [
        {name: 'XC', description: 'FX CSWAP', defaultSelected: true},
        {name: 'XF', description: 'FX FWRD', defaultSelected: true},
        {name: 'XH', description: 'FX HEDGE', defaultSelected: true},
        {name: 'XS', description: 'FX SPOT', defaultSelected: true},
        {name: 'SW', description: 'SWAP CSWAP', defaultSelected: true},
        {name: 'O', description: 'OPTION CUROTIC', defaultSelected: false}
    ];

    let splitSettingComponent: SplitSettingComponent;
    beforeEach(() => {
        splitSettingComponent = new SplitSettingComponent();
        splitSettingComponent.splitSetting = new SplitPositionSettings();
        splitSettingComponent.splitSetting.selectedPositionTypes = selectedPositionTypes;
        splitSettingComponent.allPossibleSplitPositionTypes = allSplitSetting;
        splitSettingComponent.selectedSplitSetting = splitSettingComponent.splitSetting.selectedPositionTypes;
    });

    it('test getCheckboxState method', () => {
        expect(splitSettingComponent.getCheckboxState('XF')).toBeTruthy();
        expect(splitSettingComponent.getCheckboxState('O')).toBeFalsy();
    });

    it('resetSetting method test case', () => {
        // selectedSplitPositionArray will contain all element of allPossibleSplitPositionTypes which have defaultSelect as true
        splitSettingComponent.resetSetting();
        expect(splitSettingComponent.selectedSplitSetting.length).toBe(5);
    });

    it('onCheckboxGroupChanged method test case', () => {
        const allSelectSplitSetting: Array<any> = [
            {label: 'FX CSWAP', checked: true, name: 'XC'},
            {label: 'FX FWRD', checked: true, name: 'XF'},
            {label: 'FX HEDGE', checked: true, name: 'XH'},
            {label: 'FX SPOT', checked: true, name: 'XS'},
            {label: 'SWAP CSWAP', checked: true, name: 'SW'},
            {label: 'OPTION CUROTC', checked: true, name: 'O'}
        ];

        // When select all is checked
        splitSettingComponent.onCheckboxGroupChanged(allSelectSplitSetting);
        expect(splitSettingComponent.selectedSplitSetting.length).toBe(allSelectSplitSetting.length);
        expect(splitSettingComponent.selectedSplitSetting.length).toBe(6);

        const recentSplitSetting: Array<any> = [
            {label: 'FX CSWAP', checked: true, name: 'XC'},
            {label: 'FX FWRD', checked: true, name: 'XF'},
            {label: 'FX HEDGE', checked: false, name: 'XH'},
            {label: 'FX SPOT', checked: true, name: 'XS'},
            {label: 'SWAP CSWAP', checked: true, name: 'SW'},
            {label: 'OPTION CUROTC', checked: false, name: 'O'}
        ];

        // feeding recent SplitSetting list
        splitSettingComponent.onCheckboxGroupChanged(recentSplitSetting);
        expect(splitSettingComponent.selectedSplitSetting.length).toBe(4);

        // When select all is unchecked
        splitSettingComponent.onCheckboxGroupChanged(new Array<any>());
        expect(splitSettingComponent.selectedSplitSetting.length).toBe(0);
    });
});
