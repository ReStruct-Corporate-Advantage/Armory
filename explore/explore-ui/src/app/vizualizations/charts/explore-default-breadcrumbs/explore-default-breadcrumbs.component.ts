import {Component, Input} from '@angular/core';
import {Breakdown} from '@blk/explore-ui-breakdown';
import {VizualizationColumnConfig} from '@interfaces/request.interface';

/**
 * The breadcrumbs feature is a functionality offered by Highcharts, utilized within the drilldown module and for hierarchy series types.
 * Explore aims to improve this functionality by introducing a pop-over option when multiple measures are accessible.
 * This component is to emulate the seamless appearance of the breadcrumbs supported by Highcharts, with the pop-over functionality.
 */
@Component({
    selector: 'app-explore-default-breadcrumbs',
    templateUrl: './explore-default-breadcrumbs.component.html',
    styleUrls: ['./explore-default-breadcrumbs.component.scss']
})
export class ExploreDefaultBreadcrumbsComponent {
    @Input() measures: VizualizationColumnConfig[];
    @Input() breakdown: Breakdown;
}
