import {Component, Input} from '@angular/core';
import {FactorColumnSetSettingsComponent} from './factor-column-set-settings.component';
import {FactorModelColumnDefinition} from '@blk/explore-ui-core';
import {ScenarioConstants} from '../../../constants/scenario.constant';

@Component({
    selector: 'explore-extended-factor-widget-column-set-settings',
    templateUrl: './factor-column-set-settings.component.html',
    styleUrls: ['./factor-column-set-settings.component.scss']
})
export class FactorDataWidgetColumnSetSettingsComponent extends FactorColumnSetSettingsComponent {

    @Input()
    showFactorViewLevelPerms: boolean;

    protected updateFactorsData(factorDefs: FactorModelColumnDefinition[]): void {
        // If Factor level time series mode is selected, then update the factors data to show the permissions
        if (!this.showFactorViewLevelPerms) {
            return;
        }
        factorDefs.forEach(factorDef => {
            if (!factorDef.viewLevels) {
                factorDef.title = ScenarioConstants.NO_PERMISSION_TITLE + factorDef.title;
            }
        });
    }
}
