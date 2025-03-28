import {Component, Input, OnInit} from '@angular/core';
import {AuxRadioInterface} from '@blk/aladdin-angular-components';
import {PerformanceConstants} from '../../performance.constants';
import {FactorAttributionSettings} from '../../models/factor-attribution-settings/factor-attribution-settings.model';

@Component({
  selector: 'explore-core-advanced-attribution-settings',
  templateUrl: './advanced-attribution-settings.component.html',
  styleUrls: ['./advanced-attribution-settings.component.scss']
})
export class AdvancedAttributionSettingsComponent implements OnInit {

    @Input() factorAttributionSettings: FactorAttributionSettings;

    displayFactorAttributionTypes: AuxRadioInterface[];

    ngOnInit(): void {
        this.initializeDisplayAssetTypes();
    }

    /**
     * Initialize display values for factorAttribution Types
     */
    initializeDisplayAssetTypes(): void {
        this.displayFactorAttributionTypes = [];
        for (const item of PerformanceConstants.AVAILABLE_ASSET_TYPES) {
            this.displayFactorAttributionTypes.push({
                label: item.label,
                eventData: item.value,
                checked: item.value === this.factorAttributionSettings.factorAttributionType
            });
        }
        this.displayFactorAttributionTypes = this.displayFactorAttributionTypes.map(type => type);
    }


    /**
     * When factorAttributionType is changed
     */
    onFactorAttributionTypeChanged(factorAttributionType: string) {
        this.factorAttributionSettings.factorAttributionType = factorAttributionType;
    }

}
