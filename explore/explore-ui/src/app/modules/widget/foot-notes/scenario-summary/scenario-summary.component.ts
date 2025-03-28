import {Component, Input} from '@angular/core';

/**
 * Scenario Summary Component
 */
@Component({
    selector: 'app-scenario-summary',
    templateUrl: './scenario-summary.component.html',
    styleUrls: ['../foot-notes.component.scss']
})
export class ScenarioSummaryComponent {
    @Input() scenarioDetails: Array<{code: string, title: string, details: string[], properties: Array<{label: string, value: string}>}>;
}
