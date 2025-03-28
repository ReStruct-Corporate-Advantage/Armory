import {ComponentFixture, TestBed} from '@angular/core/testing';
import {WidgetConfigType} from '@blk/explore-ui-core';
import {TestUtils} from '@utils/test.utils';
import {Widget} from '@models/widget/widget.model';

import {WidgetPayload} from '@models/widget/widget-payload.model';
import {ReactiveCube} from '@qbstr/data-cube-reactive';
import Highcharts from 'highcharts';
import * as hcCore from '@qbstr/highcharts-core';
import {ExploreCommitmentRiskChartLegacyComponent} from './explore-commitment-risk-chart-legacy.component';


describe('ExploreCommitmentRiskChartLegacyComponent', () => {
    let component: ExploreCommitmentRiskChartLegacyComponent;
    let fixture: ComponentFixture<ExploreCommitmentRiskChartLegacyComponent>;
    let widgetPayload: WidgetPayload;

    const setupHighchartsSpy = jest.spyOn(hcCore, 'setupHighcharts');
    const generateOptionsSpy = jest.spyOn(hcCore, 'generateOptions');


    beforeAll((done) => {
        TestUtils.initialize(done);
        const request = {
            portfolio: 'PEP',
            columns: [
                {
                    columnKey: 'cusip_0',
                    columnTitle: 'cusip_0',
                    formatter: undefined,
                    dataType: 'STRING',
                    columnTag: 'cusip_0',
                    isSubtotalable: false,
                    isHidden: false
                },
                {
                    columnKey: 'pct_mv_1',
                    columnTitle: 'pct_mv_1',
                    formatter: {format: () => ''},
                    dataType: 'DOUBLE',
                    columnTag: 'pct_mv_1',
                    isSubtotalable: true,
                    isHidden: false
                },
                {
                    columnKey: 'security_description_1',
                    columnTitle: 'security_description_1',
                    formatter: {format: () => ''},
                    dataType: 'STRING',
                    columnTag: 'security_description_1',
                    isSubtotalable: false,
                    isHidden: false
                },
            ]
        };
        widgetPayload = {widgetConfigType: WidgetConfigType.COMMITMENT_RISK_CHART};
        widgetPayload.requestConfig = request;
        widgetPayload.cube =   new ReactiveCube<any>([]);
        widgetPayload.breakdownLevels = ['_ROOT_', 'level-1', 'level-2'];
        widgetPayload.widgetSpecificData = { 'seriesTitles' : ['0.25'], 'timeInterval': 2 };
    });

    beforeEach(() => {

        fixture = TestBed.createComponent(ExploreCommitmentRiskChartLegacyComponent);
        component = fixture.componentInstance;
        component.widget = new Widget(WidgetConfigType.COMMITMENT_RISK_CHART);
        component.columnToDisplay = {label: 'NAV', uid: 'cusip_0'};
        setupHighchartsSpy.mockImplementation(() => component.hc);
        generateOptionsSpy.mockImplementation(() => Highcharts.getOptions());
        component['setInternalState'](widgetPayload);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('test dataLabelFormatter' , () => {
        const testData = 300000000;
        const expectedResult = '300.00M';
        const result = component.dataLabelFormatter(testData);
        expect(result).toBe(expectedResult);

    });

    it('test toolTipFormatter' , () => {
        const data = {
            points: [
                {
                    series: {
                        index: 0
                    },
                    point: {
                        stackY: 37368.48046875,
                        index: 23
                    }
                }
            ],
            x: '30-JUN-2028',
            y: 37368.48046875
        };
        const result = component.tooltipFormatter(data);
        const expectedResult =
            `<table>
                    <tr><th style="font-weight: bold">Quarter 23</th></tr>
                    <tr><td style="font-weight: bold">25th percentile: </td><td>37.37K</td></tr>
                </table>`;
        expect(result).toBe(expectedResult);
    });

});
