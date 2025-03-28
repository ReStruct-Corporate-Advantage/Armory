import {
    AuxCheckboxChangedDetailInterface,
    AuxTextInputValueChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {Component, Input, OnInit} from '@angular/core';
import {isEmpty} from 'lodash';
import {NamedScenario} from '../../../definition/models/scenario/named-scenario.model';
import {OtherScenario} from '../../models/other-scenario.model';

/**
 * This component allows the selection of other scenarios.
 */
@Component({
    selector: 'explore-core-other-scenario',
    templateUrl: './other-scenario.component.html',
    styleUrls: ['../scenario.component.scss']
})
export class OtherScenarioComponent implements OnInit {
    /**
     * The list of scenarios that are selected.
     */
    @Input()
    scenarios: OtherScenario[];

    /**
     * The list of named scenarios the user has configured.
     * This is option and only used to set as the default when a new one is added.
     */
    @Input()
    namedScenarios: NamedScenario[];

    /**
     * Init the control.
     */
    ngOnInit(): void {
        // If there are no scenarios passed it log an exception and just get out of here.
        if (!this.scenarios) {
            console.error('Control needs to be passed the scenarios');
            return;
        }
    }

    /**
     * Event handler that is use to add a new scenario.
     */
    addScenario() {
        const newScenario = new OtherScenario();

        // When creating a new scenario we want to default the name of it to the first named scenario if there is one selected.
        if (!isEmpty(this.namedScenarios)) {
            // The code of the first scenario will be in the format of name::purpose.
            const scenarioParts = this.namedScenarios[0].code.split('::');
            newScenario.name = scenarioParts.length > 0 ? scenarioParts[0] : '';
            newScenario.purpose = scenarioParts.length > 1 ? scenarioParts[1] : '';
        }

        this.scenarios.push(newScenario);
    }

    /**
     * Event when a scenario item is enabled/disabled.
     */
    onItemEnabledChanged(scenario: OtherScenario, event: CustomEvent<AuxCheckboxChangedDetailInterface>) {
        scenario.enabled = event.detail.value.checked;
    }

    /**
     * Deletes the scenario
     */
    deleteScenario(index: number): void {
        this.scenarios.splice(index, 1);
    }

    /**
     * Event fired when the scenario name is changed.
     */
    onNameChanged(scenario: OtherScenario, event: CustomEvent<AuxTextInputValueChangedDetailInterface>) {
        scenario.name = event.detail.value;
    }

    /**
     * Event fired when the scenario purpose is changed.
     */
    onPurposeChanged(scenario: OtherScenario, event: CustomEvent<AuxTextInputValueChangedDetailInterface>) {
        scenario.purpose = event.detail.value;
    }
}
