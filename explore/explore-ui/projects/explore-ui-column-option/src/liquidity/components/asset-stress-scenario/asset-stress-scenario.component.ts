import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {LiquidityConstants} from '../../liquidity.constants';
import {AuxSelectOption, AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {CoreDefinitionStore, ExploreSelectOptionGroup, ExploreSelectOption} from '@blk/explore-ui-core';
import {head, isNil} from 'lodash';

@Component({
    selector: 'explore-asset-stress-scenario-option',
    templateUrl: './asset-stress-scenario.component.html',
    styleUrls: ['./asset-stress-scenario.component.scss']
})
export class AssetStressScenarioComponent implements OnInit {

    availablePrecannedStressScenarios: { label: string, value: string }[];
    @Input() selectedAssetStressScenario: string;
    @Input() isSectorStressSelected: boolean;
    @Output() assetStressScenarioSelected: EventEmitter<string> = new EventEmitter<string>();

    preCannedStressScenarioOptions: ExploreSelectOptionGroup[];

    ngOnInit(): void {
        this.availablePrecannedStressScenarios = [];
        this.availablePrecannedStressScenarios.push({label: LiquidityConstants.DEFAULT_ASSET_STRESS_SCENARIO, value: LiquidityConstants.DEFAULT_ASSET_STRESS_SCENARIO});
        CoreDefinitionStore.preCannedStressScenarios.forEach(scenario => {
            this.availablePrecannedStressScenarios.push({label: scenario.text, value: scenario.value});
        });
        this.preCannedStressScenarioOptions = this.initializeOptions(this.availablePrecannedStressScenarios, this.selectedAssetStressScenario);
    }

    /**
     * Initialize options in the select option group
     */
    private initializeOptions(availableOptions: { label: string, value: string }[], param: string): [ExploreSelectOptionGroup] {
        const filtered = availableOptions.find(availableOption => availableOption.value === param);
        if (!filtered) {
            param = head(availableOptions).value;
        }

        return [new ExploreSelectOptionGroup(availableOptions.map(option =>
            new ExploreSelectOption(option.label, option.value, param === option.value)
        ))];
    }

    /**
     * On liability type changed
     */
    onPrecannedStressScenarioChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        if (isNil(event)) {
            return;
        }
        this.assetStressScenarioSelected.emit((event.detail.value as AuxSelectOption).value);
    }
}
