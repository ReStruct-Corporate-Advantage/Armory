import {ExploreHighchartsBreadcrumbsUtils} from './explore-highcharts-breadcrumbs.utils';

export class ExploreHighchartsSetup {

    static initializeHighchartsExtensions() {
        ExploreHighchartsBreadcrumbsUtils.handleHighchartsDefaultBreadcrumbs();
    }
}
