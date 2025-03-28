import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ColumnConfig, ColumnOptionFactory, CoreTestUtils, CoreWidgetConfigStore} from '@blk/explore-ui-core';
import {StyleAnalysisColumnOptionComponent} from './style-analysis-column-option.component';
import {StyleAnalysisColumnOption} from '../../../models/column-option/style-analysis-column-option.model';
import {of, Subject} from 'rxjs';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ColumnOptionService} from '../../../services/column-option.service';
import {ColumnOptionResponse, ColumnOptionUpdate} from '../../../interfaces';
import {ColumnSet} from '../../../models/column-set/column-set.model';
import {AuxRadioInterface} from '@blk/aladdin-angular-components';

describe('StyleAnalysisColumnOptionComponent', () => {
    let component: StyleAnalysisColumnOptionComponent;
    let fixture: ComponentFixture<StyleAnalysisColumnOptionComponent>;
    const columnOptionsServiceMock = {
        fetchColumnOptions$: jest.fn()
    };

    const columnOptionsSpy = jest.spyOn(columnOptionsServiceMock, 'fetchColumnOptions$');
    columnOptionsSpy.mockReturnValue(of(getResponse()));

    const colConfig1 = {
        columnTag: 'market_val',
        positionColumnType: 'PORT',
        optionValues: []
    };

    const colConfig2 = {
        columnTag: 'market_val',
        positionColumnType: 'BENCH',
        optionValues: []
    };

    const mockedOption: any = {
        columnOptionKey: 'styleAnalysis',
        columnOptionTitle: 'Measure selection',
        columnOptionConfigType: 'styleAnalysis',
        columnOptionAttributes: [{
            title: 'Type',
            values: [{
                value: false,
                label: 'isContributionColumn'
            }]
        }]
    };
    beforeAll(() => {
        CoreTestUtils.initDefinitions();
        ColumnOptionFactory.registerOptionType(StyleAnalysisColumnOption.CONFIG_TYPE, StyleAnalysisColumnOption);
    });

    beforeEach(() => {
        const dummyInputs = {
            'styleAnalysis': {
                'restrictedColumnOptions': {
                    'sections': [
                        'chartType',
                        'columnBreakdown',
                        'formatAndScaling',
                        'highlight',
                        'customColumnTitle',
                        'aggregation',
                        'customAggregation',
                        'aggregation',
                        'customCalculationNodeType'
                    ]
                },
                "measureNodeColumnOption": {
                    "columnOptionConfigType": "scopeColumnOptionType",
                    "columnOptionTitle": "Scope"
                },
                'historic_growth': {
                    'column': [
                        {
                            'columnTag': 'eq_fin_th_ws_161',
                            'positionColumnType': 'ALL',
                            'columnKey': 'eq_fin_th_ws_161_0',
                            'columnTitle': 'Dividend Growth - 1 Yr (%)',
                            'weight': 0.25,
                            'min': -100,
                            'max': 100,
                            'isNormal': true
                        },
                        {
                            'columnTag': 'eq_fin_th_ws_158',
                            'positionColumnType': 'ALL',
                            'columnKey': 'eq_fin_th_ws_161_0',
                            'columnTitle': 'EPS Growth - 1 Yr (%)',
                            'weight': 0.25,
                            'min': -100,
                            'max': 100,
                            'isNormal': true
                        },
                        {
                            'columnTag': 'eq_fin_th_ws_163',
                            'positionColumnType': 'ALL',
                            'columnKey': 'eq_fin_th_ws_161_0',
                            'columnTitle': 'Dividend Growth - 5 Yr (%)',
                            'weight': 0.25,
                            'min': -100,
                            'max': 100,
                            'isNormal': true
                        },
                        {
                            'columnTag': 'eq_fin_th_ws_160',
                            'positionColumnType': 'ALL',
                            'columnKey': 'eq_fin_th_ws_161_0',
                            'columnTitle': 'EPS Growth - 5 Yr (%)',
                            'weight': 0.25,
                            'min': -100,
                            'max': 100,
                            'isNormal': true
                        }
                    ]
                }
            }
        };

        TestBed.configureTestingModule({
            declarations: [StyleAnalysisColumnOptionComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {
                    provide: ColumnOptionService, useValue: columnOptionsServiceMock
                }
            ]
        });
        jest.spyOn(CoreWidgetConfigStore, 'getChartConfigForType').mockReturnValue(dummyInputs);
        fixture = TestBed.createComponent(StyleAnalysisColumnOptionComponent);
        component = fixture.componentInstance;
        component.restrictedColumnOptions = {
            'sections': [
                'chartType',
                'columnBreakdown',
                'formatAndScaling',
                'highlight',
                'customColumnTitle',
                'aggregation',
                'customAggregation',
                'aggregation',
                'customCalculationNodeType'
            ]
        };
        component.option = mockedOption;
        const selObject = {
            'columnTag': 'historic_growth',
            'columnKey': 'historic_growth_4',
            'positionColumnType': 'ALL',
            'optionValues': []
        };
        component.columnOptionUpdated$ = new Subject<ColumnOptionUpdate>();
        component.column = new ColumnConfig(selObject);
    });

    it('Test component initialises with serialized data', () => {
        // Create the testbed for testing the component.
        const columnOption = new StyleAnalysisColumnOption({
            measures: {
                a: colConfig1,
                b: colConfig2
            },
            showMeasures: true,
            styleMeasureMapping: {
                a: {
                    min: 0,
                    max: 10,
                    weight: 25,
                    isNormal: true
                },
                b: {
                    min: 10,
                    max: 20,
                    weight: 30,
                    isNormal: false
                }
            }
        });

        component.column.optionValues.push(columnOption);
        component.ngOnInit();
        expect(component).toBeTruthy();
        expect(Object.keys(component.optionValue.measureMapping).length).toBe(2);
        expect(Object.keys(component.optionValue.styleMeasureMapping).length).toBe(2);
        expect(component.optionValue.showMeasures).toBe(true);
    });

    it('Test component initialises', () => {
        // Create the testbed for testing the component.
        component.ngOnInit();
        expect(component).toBeTruthy();
        expect(Object.keys(component.optionValue.measureMapping).length).toBe(4);
        expect(Object.keys(component.optionValue.styleMeasureMapping).length).toBe(4);
        expect(component.restrictedColumnOptions.sections.length).toBe(9);
        expect(component.selectedStyleMeasureSummary.length).toBe(4);
        expect(component.selectedStyleMeasureSummary.length).toBe(4);
        expect(component.selectedStyleMeasureSummary[0].title).toBe('Dividend Growth - 1 Yr (%)');
        expect(component.selectedStyleMeasureSummary[0].min).toBe(-100);
        expect(component.selectedStyleMeasureSummary[0].max).toBe(100);
        expect(component.selectedStyleMeasureSummary[0].weight).toBe(0.25);
        expect(component.selectedStyleMeasureSummary[0].isNormal).toBe(true);
        expect(component.optionValue.adjustActiveExposure).toBe(true);
        expect(component.showActiveAdjustExposureCheckBox).toBe(true);
    });

    it('Test component initialises with contribution column', () => {
        // Create the testbed for testing the component.
        component.option = {
            columnOptionKey: 'styleAnalysis',
            columnOptionTitle: 'Measure selection',
            columnOptionConfigType: 'styleAnalysis',
            columnOptionAttributes: [{
                title: 'Type',
                values: [{
                    value: true,
                    label: 'isContributionColumn'
                }]
            }]
        } as any;

        component.ngOnInit();
        expect(component.optionValue.adjustActiveExposure).toBe(undefined);
        expect(component.showActiveAdjustExposureCheckBox).toBe(false);
    });

    it('Test onMin/MaxChanged', () => {
        // Create the testbed for testing the component.
        component.ngOnInit();
        expect(component).toBeTruthy();
        const alias = component.columnMeasures[0].columnKey;
        expect(component.optionValue.styleMeasureMapping[alias].min).toBe(-100);
        component.onMinChanged(alias, {detail: {srcEvent: {target: {value: '-50'}}}});
        expect(component.optionValue.styleMeasureMapping[alias].min).toBe(-50);

        expect(component.optionValue.styleMeasureMapping[alias].max).toBe(100);
        component.onMaxChanged(alias, {detail: {srcEvent: {target: {value: '200'}}}});
        expect(component.optionValue.styleMeasureMapping[alias].max).toBe(200);
    });

    it('Test onWeightValueChanged', () => {
        component.ngOnInit();
        expect(component).toBeTruthy();
        const alias = component.columnMeasures[0].columnKey;
        expect(component.optionValue.styleMeasureMapping[alias].weight).toBe(0.25);
        component.onWeightValueChanged(alias, {
            detail: {
                srcEvent: {
                    target: {
                        value: '0.50'
                    }
                }
            }
        } as CustomEvent);
        expect(component.optionValue.styleMeasureMapping[alias].weight).toBe(0.50);
    });

    it('Test onNormalInverseOptionsChanged', () => {
        component.ngOnInit();
        expect(component).toBeTruthy();
        const alias = component.columnMeasures[0].columnKey;
        expect(component.optionValue.styleMeasureMapping[alias].isNormal).toBe(true);
        component.onNormalInverseOptionsChanged(alias, {
            eventData: 'Inverse'
        } as AuxRadioInterface);
        expect(component.optionValue.styleMeasureMapping[alias].isNormal).toBe(false);
    });

    it('Test onShowMeasureChanged', () => {
        component.ngOnInit();
        expect(component).toBeTruthy();
        expect(component.isShownMeasureSelected()).toBe(true);
        component.onShowMeasureCheckboxChange(false);
        expect(component.isShownMeasureSelected()).toBe(false);
    });

    it('Test openColumnMeasuresModel', () => {
        component.ngOnInit();
        expect(component).toBeTruthy();
        expect(component.showEditColumnMeasuresModal).toBe(false);
        component.openColumnMeasuresModel();
        expect(component.showEditColumnMeasuresModal).toBe(true);
    });

    it('tests onCloseOfColumnMeasuresModal', () => {
        component.ngOnInit();
        component.onCloseOfColumnMeasuresModal(null);
        expect(component.showEditColumnMeasuresModal).toBe(false);
        const columns = [];
        const columnSet = new ColumnSet();
        columnSet.columns = columns;
        component.onCloseOfColumnMeasuresModal(columnSet);
        expect(component.columnMeasures === columns).toBeTruthy();
        expect(component.isValid()).toBeTruthy();
    });

    it('Test getNormalInverseOptions', () => {
        component.ngOnInit();
        expect(component).toBeTruthy();
        const options: AuxRadioInterface[] = component.getNormalInverseOptions(component.columnMeasures[0].columnKey);
        expect(options.length).toBe(2);
        const expected = [{
            label: 'Normal',
            eventData: 'Normal',
            checked: true
        },
            {
                label: 'Inverse',
                eventData: 'Inverse',
                checked: false
            }];
        expect(options).toEqual(expected);
    });

    it('should validate the input in text input box', () => {
        component.ngOnInit();
        expect(component.validator[0].validate('a')).toBeFalsy();
        expect(component.validator[0].validate(123)).toBeTruthy();
        expect(component.validator[0].validate('123abc')).toBeFalsy();
        expect(component.validator[0].validate('-0.6')).toBeTruthy();
        expect(component.validator[0].validate('-.6')).toBeTruthy();
        expect(component.validator[0].validate('-.68')).toBeTruthy();
        expect(component.validator[0].validate(undefined)).toBeTruthy();
    });

    /**
     * Function to get mock data returned by fetchColumnOptions$
     */
    function getResponse(): ColumnOptionResponse[] {
        return [{
            colTag: '',
            use: '',
            options: [
                null,
                null,
                {
                    columnOptionKey: '',
                    columnOptionTitle: '',
                    columnOptionConfigType: '',
                    columnOptionAttributes: [{
                        title: 'Type',
                        key: '',
                        dataType: '',
                        values: [
                            {value: 'BB_TICKER', label: 'Bloomberg'},
                            {value: 'NAME', label: 'Name'}]
                    }]
                }
            ]
        }];
    }
});
