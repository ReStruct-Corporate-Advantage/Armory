import {Component, Input} from '@angular/core';

@Component({
    selector: 'app-column-settings-override-summary',
    templateUrl: './column-settings-override-summary.component.html',
    styleUrls: ['../foot-notes.component.scss']
})
export class ColumnSettingsOverrideSummaryComponent {
    @Input() columnSettingsOverrideDetails: Array<{columnKey: string, columnTitle: string, properties: any[]}>;
}
