import {Component, Input} from '@angular/core';
import {DateRange} from '@interfaces/response.interface';

/**
 * Factor Attribution Details Missing Info Component
 */
@Component({
    selector: 'app-factor-attribution-details-missing-info',
    templateUrl: './factor-attribution-details-missing-info.component.html',
    styleUrls: ['../../foot-notes.component.scss']
})
export class FactorAttributionDetailsMissingInfoComponent {
    @Input() missingInfoMap: Map<string, DateRange[]>;

    readonly headerTitles = ['Security', 'For Dates'];
}
