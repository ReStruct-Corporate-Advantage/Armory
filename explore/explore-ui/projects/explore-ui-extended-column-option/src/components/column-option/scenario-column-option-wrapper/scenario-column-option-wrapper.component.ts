import {Component, Input, OnInit} from '@angular/core';
import {ColumnConfig, ColumnOptionMetaDataInterface, RestrictedOptionInterface, TokenConstants, TokenUtils} from '@blk/explore-ui-core';
import {Subject} from 'rxjs';
import {ColumnOptionUpdate, ScenarioColumnOption} from '@blk/explore-ui-column-option';

@Component({
  selector: 'explore-extended-scenario-column-option-wrapper',
  templateUrl: './scenario-column-option-wrapper.component.html',
})
/**
 * This component is a wrapper to switch between the old and new scenario column option components
 * based on token exploreEnableNewStressScenarios.
 */
export class ScenarioColumnOptionWrapperComponent implements OnInit {
    public static OPTION_KEY = ScenarioColumnOption.ALT_CONFIG_TYPE;

    @Input() option: ColumnOptionMetaDataInterface;
    @Input() column: ColumnConfig;
    @Input() columnOptionUpdated$: Subject<ColumnOptionUpdate>;
    @Input() widgetType: string;
    @Input() restrictedColumnOptions: RestrictedOptionInterface;
    @Input() columnOptionsToAdd: ColumnOptionMetaDataInterface[];

    /**
     * Flag to enable the new Scenarios PRT migration work
     */
    isNewStressScenarioEnabled = false;

    ngOnInit() {
        this.isNewStressScenarioEnabled = TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_NEW_STRESS_SCENARIOS);
    }

}
