import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {WidgetConfigType} from '@blk/explore-ui-core';
import {ExploreClarityAiChartComponent} from './explore-clarity-ai-chart.component';
import {SimpleCube} from '@qbstr/data-cube-reactive';
import {TestUtils} from '@utils/test.utils';
import {Widget} from '@models/widget/widget.model';


describe('ExploreClarityAiChartComponent', () => {

    let component: ExploreClarityAiChartComponent;
    let fixture: ComponentFixture<ExploreClarityAiChartComponent>;
    let widgetPayload: WidgetPayload;
    let colMap: any;

    const summary = {
            name: 'Portfolio',
            totalOrganizations: 2404,
            coverageOrganizations: 1207,
            coverageWeight: 33.923973,
            scores: [
                {
                    id: 'TOTAL',
                    goal: 'TOTAL',
                    treeLevel: 'TOTAL',
                    score: 47,
                    metadata: 'NONE',
                    relevance: 94
                },
                {
                    id: 'P_01_POVERTY',
                    goal: 'P_01_POVERTY',
                    treeLevel: 'GOAL',
                    score: 38,
                    metadata: 'NONE',
                    relevance: 97
                },
                {
                    id: 'P_02_END_HUNGER',
                    goal: 'P_02_END_HUNGER',
                    treeLevel: 'GOAL',
                    score: 44,
                    metadata: 'NONE',
                    relevance: 100
                },
                {
                    id: 'P_03_HEALTH',
                    goal: 'P_03_HEALTH',
                    treeLevel: 'GOAL',
                    score: 43,
                    metadata: 'NONE',
                    relevance: 91
                },
                {
                    id: 'P_04_QUALITY_EDUCATION',
                    goal: 'P_04_QUALITY_EDUCATION',
                    treeLevel: 'GOAL',
                    score: 20,
                    metadata: 'NONE',
                    relevance: 62
                },
                {
                    id: 'P_05_GENDER_INEQUALITY',
                    goal: 'P_05_GENDER_INEQUALITY',
                    treeLevel: 'GOAL',
                    score: 51,
                    metadata: 'NONE',
                    relevance: 95
                },
                {
                    id: 'P_06_WATER_AND_SANITATION',
                    goal: 'P_06_WATER_AND_SANITATION',
                    treeLevel: 'GOAL',
                    score: 61,
                    metadata: 'NONE',
                    relevance: 90
                },
                {
                    id: 'P_07_ENERGY',
                    goal: 'P_07_ENERGY',
                    treeLevel: 'GOAL',
                    score: 41,
                    metadata: 'NONE',
                    relevance: 86
                },
                {
                    id: 'P_08_ECONOMIC_GROWTH',
                    goal: 'P_08_ECONOMIC_GROWTH',
                    treeLevel: 'GOAL',
                    score: 52,
                    metadata: 'NONE',
                    relevance: 96
                },
                {
                    id: 'P_09_INDUSTRIES',
                    goal: 'P_09_INDUSTRIES',
                    treeLevel: 'GOAL',
                    score: 54,
                    metadata: 'NONE',
                    relevance: 100
                },
                {
                    id: 'P_10_INEQUALITY',
                    goal: 'P_10_INEQUALITY',
                    treeLevel: 'GOAL',
                    score: 51,
                    metadata: 'NONE',
                    relevance: 97
                },
                {
                    id: 'P_11_CITIES',
                    goal: 'P_11_CITIES',
                    treeLevel: 'GOAL',
                    score: 53,
                    metadata: 'NONE',
                    relevance: 91
                },
                {
                    id: 'P_12_SUSTAINABLE_CONSUMPTION',
                    goal: 'P_12_SUSTAINABLE_CONSUMPTION',
                    treeLevel: 'GOAL',
                    score: 91,
                    metadata: 'NONE',
                    relevance: 96
                },
                {
                    id: 'P_13_ENVIRONMENT',
                    goal: 'P_13_ENVIRONMENT',
                    treeLevel: 'GOAL',
                    score: 61,
                    metadata: 'NONE',
                    relevance: 99
                },
                {
                    id: 'P_14_BELOW_WATER',
                    goal: 'P_14_BELOW_WATER',
                    treeLevel: 'GOAL',
                    score: 53,
                    metadata: 'NONE',
                    relevance: 61
                },
                {
                    id: 'P_15_LAND',
                    goal: 'P_15_LAND',
                    treeLevel: 'GOAL',
                    score: null,
                    metadata: 'NOT_APPLICABLE',
                    relevance: 0
                },
                {
                    id: 'P_16_INSTITUTIONS',
                    goal: 'P_16_INSTITUTIONS',
                    treeLevel: 'GOAL',
                    score: 56,
                    metadata: 'NONE',
                    relevance: 95
                }
            ]
        }
    ;
    const benchmark = {
        name: 'Benchmark',
        coverageWeight: 98.82530212402344,
        scores: [
            {
                id: 'TOTAL',
                goal: 'TOTAL',
                treeLevel: 'TOTAL',
                score: 43,
                metadata: 'NONE',
                relevance: 99,
                peersPercentile: 38
            },
            {
                id: 'P_01_POVERTY',
                goal: 'P_01_POVERTY',
                treeLevel: 'GOAL',
                score: 41,
                metadata: 'NONE',
                relevance: 100,
                peersPercentile: 59
            },
            {
                id: 'P_02_END_HUNGER',
                goal: 'P_02_END_HUNGER',
                treeLevel: 'GOAL',
                score: 67,
                metadata: 'NONE',
                relevance: 100,
                peersPercentile: 78
            },
            {
                id: 'P_03_HEALTH',
                goal: 'P_03_HEALTH',
                treeLevel: 'GOAL',
                score: 41,
                metadata: 'NONE',
                relevance: 94,
                peersPercentile: 44
            },
            {
                id: 'P_04_QUALITY_EDUCATION',
                goal: 'P_04_QUALITY_EDUCATION',
                treeLevel: 'GOAL',
                score: 21,
                metadata: 'NONE',
                relevance: 68,
                peersPercentile: 85
            },
            {
                id: 'P_05_GENDER_INEQUALITY',
                goal: 'P_05_GENDER_INEQUALITY',
                treeLevel: 'GOAL',
                score: 54,
                metadata: 'NONE',
                relevance: 99,
                peersPercentile: 85
            },
            {
                id: 'P_06_WATER_AND_SANITATION',
                goal: 'P_06_WATER_AND_SANITATION',
                treeLevel: 'GOAL',
                score: 53,
                metadata: 'NONE',
                relevance: 89,
                peersPercentile: 28
            },
            {
                id: 'P_07_ENERGY',
                goal: 'P_07_ENERGY',
                treeLevel: 'GOAL',
                score: 53,
                metadata: 'NONE',
                relevance: 94,
                peersPercentile: 90
            },
            {
                id: 'P_08_ECONOMIC_GROWTH',
                goal: 'P_08_ECONOMIC_GROWTH',
                treeLevel: 'GOAL',
                score: 37,
                metadata: 'NONE',
                relevance: 100,
                peersPercentile: 22
            },
            {
                id: 'P_09_INDUSTRIES',
                goal: 'P_09_INDUSTRIES',
                treeLevel: 'GOAL',
                score: 47,
                metadata: 'NONE',
                relevance: 100,
                peersPercentile: 43
            },
            {
                id: 'P_10_INEQUALITY',
                goal: 'P_10_INEQUALITY',
                treeLevel: 'GOAL',
                score: 55,
                metadata: 'NONE',
                relevance: 100,
                peersPercentile: 89
            },
            {
                id: 'P_11_CITIES',
                goal: 'P_11_CITIES',
                treeLevel: 'GOAL',
                score: 50,
                metadata: 'NONE',
                relevance: 91,
                peersPercentile: 59
            },
            {
                id: 'P_12_SUSTAINABLE_CONSUMPTION',
                goal: 'P_12_SUSTAINABLE_CONSUMPTION',
                treeLevel: 'GOAL',
                score: 93,
                metadata: 'NONE',
                relevance: 100,
                peersPercentile: 81
            },
            {
                id: 'P_13_ENVIRONMENT',
                goal: 'P_13_ENVIRONMENT',
                treeLevel: 'GOAL',
                score: 58,
                metadata: 'NONE',
                relevance: 100,
                peersPercentile: 47
            },
            {
                id: 'P_14_BELOW_WATER',
                goal: 'P_14_BELOW_WATER',
                treeLevel: 'GOAL',
                score: 52,
                metadata: 'NONE',
                relevance: 48,
                peersPercentile: 72
            },
            {
                id: 'P_15_LAND',
                goal: 'P_15_LAND',
                treeLevel: 'GOAL',
                score: null,
                metadata: 'NOT_APPLICABLE',
                relevance: 0,
                peersPercentile: null
            },
            {
                id: 'P_16_INSTITUTIONS',
                goal: 'P_16_INSTITUTIONS',
                treeLevel: 'GOAL',
                score: 59,
                metadata: 'NONE',
                relevance: 100,
                peersPercentile: 26
            }
        ]
    };

    const serverlessData = {
        summary,
        benchmark,
        organizations: [], // out of scope for this PoC but supported,
    };

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        const request = {
            portfolio: 'PEP',
            columns: [
                {
                    columnKey: 'CLARITY_AI_30032',
                    columnTitle: 'CLARITY_AI_30032',
                    formatter: undefined,
                    dataType: 'DOUBLE',
                    columnTag: 'CLARITY_AI_30032',
                    isHidden: false,
                    isSubtotalable: false
                }
            ]
        };

        widgetPayload = {widgetConfigType: WidgetConfigType.CLARITY};
        widgetPayload.requestConfig = request;
        widgetPayload.widgetSpecificData = serverlessData;
        widgetPayload.cube = new SimpleCube([]);
        widgetPayload.breakdownLevels = null;
        colMap = {};
        request.columns.forEach(col => colMap[col.columnKey] = col);

        TestBed.configureTestingModule({
            declarations: [ExploreClarityAiChartComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ExploreClarityAiChartComponent);
        component = fixture.componentInstance;
        component.widgetPayload = widgetPayload;
        component.widget = new Widget(WidgetConfigType.CLARITY);
        component.urlExists = jest.fn(() => Promise.resolve(true));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have an error if cannot connect to clarity', async () => {
        component.urlExists = jest.fn(() => Promise.resolve(false));
        expect(component.widgetPayload.notification !== null);
    });

    it('should not have an error if can connect to clarity', async () => {
        component.urlExists = jest.fn(() => Promise.resolve(true));
        expect(component.widgetPayload.notification === null);
    });
});


