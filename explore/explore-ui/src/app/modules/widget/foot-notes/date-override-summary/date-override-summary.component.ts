import {Component, Input} from '@angular/core';

/**
 * Date Override Summary Component
 */
@Component({
    selector: 'app-date-override-summary',
    templateUrl: './date-override-summary.component.html',
    styleUrls: ['../foot-notes.component.scss']
})
export class DateOverrideSummaryComponent {
    @Input() dateOverrideDetails: Array<{columnKeys: string, columnTitle: string, dates: any[]}>;
}
