import {AuxCheckboxInterface} from '@blk/aladdin-angular-components';
import {Component, Input, OnInit} from '@angular/core';
import {DefinitionsStore} from '../../../stores';
import {SplitPositionSettings} from '@models/split-position-settings.model';
import {SplitPositionType} from '@models/definitions/column-definitions/split-position-types.model';

@Component({
    selector: 'app-split-setting',
    templateUrl: './split-setting.component.html',
    styleUrls: ['./split-setting.component.scss']
})
export class SplitSettingComponent implements OnInit {
    @Input() splitSetting: SplitPositionSettings;

    allPossibleSplitPositionTypes: SplitPositionType[];
    selectedSplitSetting: string[];
    checkboxStackedData: any[];

    ngOnInit(): void {
        // Get all Possible split settings
        this.selectedSplitSetting = this.splitSetting.selectedPositionTypes;
        this.allPossibleSplitPositionTypes = DefinitionsStore.splitPositionType;
        this.getDisplayDataForCheckbox();
    }

    /**
     * Set data for display checkbox for aux-checkbox-group
     */
    getDisplayDataForCheckbox(): void {
        this.checkboxStackedData = this.allPossibleSplitPositionTypes.map(option => {
            return {label: option.description, checked: this.getCheckboxState(option.name), uid: option.name};
        });
    }

    /**
     * Return checkbox state according to element in selectedSplitSetting
     */
    getCheckboxState(name: string): boolean {
        return this.selectedSplitSetting.includes(name);
    }

    /**
     * Reset selectedSplitSetting Array wrt to what checkbox are currently selected
     */
    onCheckboxGroupChanged(event: AuxCheckboxInterface[]): void {
        this.selectedSplitSetting.length = 0;
        event.filter(setting => setting.checked).forEach(setting => this.selectedSplitSetting.push(setting.uid));
    }

    /**
     * Reset SelectedSplitSetting array to it's defaultState
     */
    resetSetting(): void {
        // For Initial config to be apply, remove all previous entry
        this.selectedSplitSetting.splice(0, this.selectedSplitSetting.length);
        // Set SelectedSplitSetting according to the default Setting
        this.allPossibleSplitPositionTypes.filter(splitPosType => splitPosType.defaultSelected)
            .forEach(splitPosType => this.splitSetting.selectedPositionTypes.push(splitPosType.name));

        // Update data that is shown in html
        this.getDisplayDataForCheckbox();
    }
}
