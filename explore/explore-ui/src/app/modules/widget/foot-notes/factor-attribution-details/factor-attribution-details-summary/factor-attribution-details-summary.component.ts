import {Component, Input} from '@angular/core';

/**
 * Factor Attribution Details Summary Component
 */
@Component({
    selector: 'app-factor-attribution-details-summary',
    templateUrl: './factor-attribution-details-summary.component.html',
    styleUrls: ['../../foot-notes.component.scss']
})
export class FactorAttributionDetailsSummaryComponent {
    @Input() summaryValueList: string[];

    readonly summaryLabelList = ['Portfolio', 'Benchmark', 'Assets', 'Active Return', 'Portfolio Return', 'Benchmark Return', 'Horizon', 'Economy Date', 'Weighting Scheme', 'Model published on'];
}
