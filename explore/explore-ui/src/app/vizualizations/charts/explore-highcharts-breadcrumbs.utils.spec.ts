import {ExploreHighchartsBreadcrumbsUtils} from './explore-highcharts-breadcrumbs.utils';
import {default as Highcharts} from 'highcharts';
import {ChartType} from '@qbstr/highcharts-api';

describe('ExploreHighchartsBreadcrumbsUtils', () => {

    describe('addDefaultBreadcrumbs Test', () => {
        beforeAll(() => {
            if (!Highcharts['Breadcrumbs']) {
                Highcharts['Breadcrumbs'] = DummyBreadcrumbs;
            }
        });

        it('should not do anything if breadcrumbs with level > 0 exists already.', () => {
            const chart: any = {};
            chart.breadcrumbs = {
                list: [],
                options: {},
                level: 2,
                updateProperties: jest.fn()
            };
            expect(chart.breadcrumbs.level).toBe(2);
        });

        it('should add default breadcrumbs - breadcrumbs with empty list (treemap and sunburst)', () => {
            const chart: any = {};
            chart.breadcrumbs = {
                list: [],
                options: {},
                updateProperties: jest.fn()
            };

            ExploreHighchartsBreadcrumbsUtils['addHighchartsDefaultBreadcrumbs'](chart, ChartType.TREEMAP);
            expect(chart.breadcrumbs.updateProperties).toHaveBeenCalled();
            expect(chart.breadcrumbs.options.position.align).toEqual('left');
            expect(chart.breadcrumbs.options.position.verticalAlign).toEqual('top');
            expect(chart.breadcrumbs.options.position.y).toBe(-36);
            expect(chart.breadcrumbs.options.showFullPath).toBeTruthy();
            expect(chart.breadcrumbs.level).toBe(1);
        });

        it('should add default breadcrumbs - without setting level to 1 for bar chart', () => {
            const chart: any = {};
            chart.options = {yAxis: [{opposite: false}]};

            expect(chart.breadcrumbs).toBeUndefined();

            ExploreHighchartsBreadcrumbsUtils['addHighchartsDefaultBreadcrumbs'](chart, ChartType.BAR);
            expect(chart.breadcrumbs).not.toBeUndefined();
            expect(chart.breadcrumbs.level).not.toBe(1);
        });

        it('should add default breadcrumbs for horizontal bar chart with secondary axis', () => {
            const chart: any = {};
            chart.options = {yAxis: [{opposite: true}]};

            expect(chart.breadcrumbs).toBeUndefined();

            ExploreHighchartsBreadcrumbsUtils['addHighchartsDefaultBreadcrumbs'](chart, ChartType.BAR);
            expect(chart.breadcrumbs).not.toBeUndefined();
            expect(chart.breadcrumbs.options.position.y).toBe(-100);
        });
    });

    it('should get breadcrumb top name', () => {
        const columnTitle = 'Notional Market Value%';
        const breakdownTitle = 'Country Name';

        expect(ExploreHighchartsBreadcrumbsUtils.getBreadcrumbTopName(columnTitle, breakdownTitle)).toEqual('Notional Market Value%&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;Country Name');
    });

    it('should check if breadcrumbs is supported given chart type ', () => {
        expect(ExploreHighchartsBreadcrumbsUtils['isHighchartsDefaultBreadcrumbsSupported'](ChartType.SUNBURST)).toBeTruthy();
        expect(ExploreHighchartsBreadcrumbsUtils['isHighchartsDefaultBreadcrumbsSupported'](ChartType.TREEMAP)).toBeTruthy();
        expect(ExploreHighchartsBreadcrumbsUtils['isHighchartsDefaultBreadcrumbsSupported'](ChartType.COLUMN)).toBeTruthy();
        expect(ExploreHighchartsBreadcrumbsUtils['isHighchartsDefaultBreadcrumbsSupported'](ChartType.BAR)).toBeTruthy();
        expect(ExploreHighchartsBreadcrumbsUtils['isHighchartsDefaultBreadcrumbsSupported'](ChartType.BUBBLE)).toBeFalsy();
        expect(ExploreHighchartsBreadcrumbsUtils['isHighchartsDefaultBreadcrumbsSupported'](ChartType.PIE)).toBeFalsy();
        expect(ExploreHighchartsBreadcrumbsUtils['isHighchartsDefaultBreadcrumbsSupported'](ChartType.SLOPE)).toBeFalsy();
    });
});

class DummyBreadcrumbs {
    constructor(chart: any, public options: any) {
        this.options = options;
    }
    updateProperties(properties: any): void {
    }
}
