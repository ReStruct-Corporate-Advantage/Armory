/**
 * Hide Unassigned Filter component
 */
import {Component} from '@angular/core';
import {BaseWidgetSettingComponent} from '@blk/explore-ui-column-option';
import {HideUnassignedFilterInput} from '@models/widget/inputs/hide-unassigned-filter-input.model';
import {AuxCheckboxChangedDetailInterface} from '@blk/aladdin-angular-components';

@Component({
    selector: 'app-hide-unassigned-filter-settings',
    templateUrl: './hide-unassigned-filter-settings.component.html',
    styleUrls: ['./hide-unassigned-filter-settings.component.scss']
})
export class HideUnassignedFilterSettingsComponent extends BaseWidgetSettingComponent<HideUnassignedFilterInput> {

    initializeComponent(): void {
        // Intentionally empty
    }

    /**
     * function to toggle the value of hide unassigned sectors
     * @param event - event from the web component
     */
    onCheckboxChanged(event: CustomEvent<AuxCheckboxChangedDetailInterface>) {
        this.widgetInput.hideUnassignedFilter = event.detail.value.checked;
    }
}
