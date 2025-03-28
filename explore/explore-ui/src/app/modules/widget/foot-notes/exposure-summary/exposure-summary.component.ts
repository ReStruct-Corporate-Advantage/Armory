import {Component, Input} from '@angular/core';

/**
 * Exposure Summary Component
 */
@Component({
    selector: 'app-exposure-summary',
    templateUrl: './exposure-summary.component.html'
})
export class ExposureSummaryComponent {
    @Input() missingExposureDetails: string[];
}
