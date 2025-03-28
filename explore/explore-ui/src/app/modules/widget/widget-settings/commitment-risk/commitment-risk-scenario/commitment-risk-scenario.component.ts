import {Component} from '@angular/core';
import {BaseWidgetSettingComponent} from '@blk/explore-ui-column-option';
import {CommitmentRiskScenario} from '@models/widget/inputs/commitment-risk/commitment-risk-scenario.model';
import {
    CommonUtils,
    CoreDefinitionStore,
    ExploreSelectOption,
    ExploreSelectOptionGroup,
    TokenConstants
} from '@blk/explore-ui-core';
import {DefinitionsStore} from '@stores/definitions.store';
import {
    AuxButtonTypeEnum,
    AuxSelectOption,
    AuxSelectSelectionChangedDetailInterface
} from '@blk/aladdin-angular-components';

@Component({
    selector: 'app-commitment-risk-scenario',
    templateUrl: './commitment-risk-scenario.component.html',
    styleUrls: ['./commitment-risk-scenario.component.scss']
})
export class CommitmentRiskScenarioComponent extends BaseWidgetSettingComponent<CommitmentRiskScenario> {
    static readonly COMMITMENT_RISK_SCENARIO_LEARN_MORE_URL = '/acs/literature/aladdin-publication/acrm-multiperiod-scenarios.pdf';

    readonly AuxButtonTypeEnum = AuxButtonTypeEnum;
    public readonly SCENARIO_LABEL: string = 'Select a scenario';
    public readonly SCENARIO_HELPER_TEXT: string = 'Learn more';

    scenarioSelectOptions: ExploreSelectOptionGroup[] = [];

    initializeComponent(): void {
        const noneOption = new ExploreSelectOption('None', undefined, !this.widgetInput.scenario);
        const groupingOptions = DefinitionsStore.commitmentRiskStressScenarios
        .map(({text, value}) => new ExploreSelectOption(text, value, value === this.widgetInput.scenario))
        .sort((a, b) => a.displayValue.localeCompare(b.displayValue));

        this.scenarioSelectOptions = [
            new ExploreSelectOptionGroup([noneOption]),
            new ExploreSelectOptionGroup(groupingOptions)
        ];
    }

    /**
     * Updates groupBy when selection is changed
     */
    updateScenario(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.widgetInput.scenario = (event.detail.value as AuxSelectOption).value;
    }

    /**
     * Opens link to documentation about scenarios
     */
    openScenariosDocumentationLink(): void {
        // use path if set in token, otherwise default
        const path = CoreDefinitionStore.tokens[TokenConstants.EXPLORE_ACRM_SCENARIO_DOC_URL] || CommitmentRiskScenarioComponent.COMMITMENT_RISK_SCENARIO_LEARN_MORE_URL;
        // example: https://spc.blackrock.com/acs/literature/aladdin-publication/acrm-multiperiod-scenarios.pdf
        const url = CommonUtils.getURLOrigin() + path;
        window.open(url, '_blank');
    }
}
