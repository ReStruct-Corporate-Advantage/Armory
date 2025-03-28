import {Component, Inject} from '@angular/core';
import {ScenarioColumnOption, ScenarioColumnOptionComponent} from '@blk/explore-ui-column-option';
import { NamedScenario } from '@blk/explore-ui-core';
import { isEmpty } from 'lodash';
import {SCENARIO_CREATION_ENABLED_TOKEN} from '../../../tokens';


@Component({
    selector: 'explore-extended-stress-scenario-column-option',
    templateUrl: './stress-scenario-column-option.component.html',
    styleUrls: ['./stress-scenario-column-option.component.scss']
})
export class StressScenarioColumnOptionComponent extends ScenarioColumnOptionComponent {
    public static OPTION_KEY = ScenarioColumnOption.ALT_CONFIG_TYPE;

    /**
     * Hides the action column and create edit scenario functionalities for Implied and Specified scenarios
     * Allows only for selection
     */
    isScenarioCreationDisabled = false;

    disableCreateScenarioButton = false;

    constructor(@Inject(SCENARIO_CREATION_ENABLED_TOKEN) private isScenarioCreationWorkflowEnabled: boolean) {
        super();
    }

    protected initializeComponent(): void {
        super.initializeComponent();
        this.setDisableScenarioCreation();
        this.handleOtherScenarios();
        this.handleSingleSelectScenario();
    }

    /**
     * If single select is enabled, keep only one element in named scenarios
     * @private
     */
    private handleSingleSelectScenario(): void {
        if (this.isRestrictedModeEnabled && this.optionValue.nameScenarios.length > 1) {
            this.optionValue.nameScenarios = [ this.optionValue.nameScenarios[0] ];
        }
    }

    /**
     * This method moves all the other scenarios to nameScenarios list since we are now handling nameScenarios and otherScenarios in a same way for Scenario selection
     * @private
     */
    private handleOtherScenarios(): void {
        if (isEmpty(this.optionValue?.otherScenarios)) {
            return;
        }
        this.optionValue.otherScenarios.forEach(otherScenario => {
            const nameScenario = new NamedScenario();
            nameScenario.code = otherScenario.code;
            nameScenario.description = otherScenario.description;
            nameScenario.name = otherScenario.name;
            this.optionValue.nameScenarios.push(nameScenario);
        });
        this.optionValue.otherScenarios = [];
    }

    /**
     * Set isScenarioCreationDisabled to true when scenario creation workflow is disabled or when this component is opened from optimization settings objectives
     * @private
     */
    private setDisableScenarioCreation(): void {
        this.isScenarioCreationDisabled = !this.isScenarioCreationWorkflowEnabled;
        if (!isEmpty(this.option.columnOptionAttributes) && this.option.columnOptionAttributes[0]['optimizationFlow']) {
            this.isScenarioCreationDisabled = true;
            this.disableCreateScenarioButton = true;
        }
    }

}
