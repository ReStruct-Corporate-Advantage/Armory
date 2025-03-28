import {Component} from '@angular/core';
import {BaseWidgetSettingComponent} from '@blk/explore-ui-column-option';
import {AuxCheckboxChangedDetailInterface} from '@blk/aladdin-angular-components';
import {SuppressRootNodeSetting} from '@models/widget/inputs/suppress-root-node-setting.model';

/**
 * A component that represents the suppressRootNode setting.
 */
@Component({
    selector: 'app-suppress-root-node-settings',
    templateUrl: './suppress-root-node-settings.component.html'
})
export class SuppressRootNodeSettingsComponent extends BaseWidgetSettingComponent<SuppressRootNodeSetting> {

    suppressRootNodeAggregation: boolean;

    initializeComponent(): void {
        this.suppressRootNodeAggregation = this.widgetInput.suppressRootNodeAggregation;
    }

    onRootNodeAggregationChanged(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        this.widgetInput.suppressRootNodeAggregation = event.detail.value.checked;
        this.suppressRootNodeAggregation = this.widgetInput.suppressRootNodeAggregation;
    }
}
