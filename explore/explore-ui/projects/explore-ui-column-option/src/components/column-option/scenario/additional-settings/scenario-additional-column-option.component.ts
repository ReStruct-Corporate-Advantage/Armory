import {Component} from '@angular/core';
import {BaseColumnOptionComponent} from '../../base-column-option.component';
import {ScenarioAdditionalColumnOptionModel} from '../../../../models/column-option/scenario-additional-column-option.model';
import {AuxCheckboxChangedDetailInterface} from '@blk/aladdin-angular-components';
import {isNil} from 'lodash';

/**
 * This component is for the additional scenario column options.
 */
@Component({
    selector: 'explore-scenario-additional-column-option',
    templateUrl: './scenario-additional-column-option.component.html',
    styleUrls: ['./scenario-additional-column-option.component.scss']
})
export class ScenarioAdditionalColumnOptionComponent extends BaseColumnOptionComponent<ScenarioAdditionalColumnOptionModel> {
    public static OPTION_KEY = ScenarioAdditionalColumnOptionModel.CONFIG_TYPE;

    isFullRevalEnabled = false;

    /**
     * Gets the config type that this object is configuring.
     */
    getOptionValueConfigType(): string {
        return ScenarioAdditionalColumnOptionModel.CONFIG_TYPE;
    }

    /**
     * Performs the required initialization.
     */
    protected initializeComponent(): void {
        super.initializeComponent();
        if (!this.option) {
            return;
        }
        if (this.optionValue.fullReval === undefined) {
            this.optionValue.fullReval = true;
        }
        if (!isNil(this.option?.columnOptionAttributes) && this.option.columnOptionAttributes.findIndex(attr => attr.key === 'FULL-REVAL') !== -1) {
            this.isFullRevalEnabled = true;
        } else {
            // sets the default value for full reval if it is not enabled
            this.optionValue.fullReval = true;
        }
    }

    onFloorPnLChanged(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        this.optionValue.floorPnL = event.detail.value.checked;
    }

    onFullRevalChanged(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        this.optionValue.fullReval = event.detail.value.checked;

        if (!this.optionValue.fullReval) {
            this.optionValue.floorPnL = false;
        }
    }
}
