import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {
    ColumnConfig, ColumnConstants, ColumnDefinition, CoreTestUtils,
    WidgetConfigType,
    CoreUserMetaDataStore,
    UserMetaData
} from '@blk/explore-ui-core';
import {FactorColumnSetSettingsComponent} from './factor-column-set-settings.component';
import {
    ColumnSet,
    ColumnOptionInitializer,
    ColumnOptionService,
    CustomTitleColumnOption,
    SelectedColumnSelectorOption,
} from '@blk/explore-ui-column-option';
import {FactorDefinitionsService} from '../../../services/factor-definitions.service';
import {BehaviorSubject, of} from 'rxjs';
import {FACTOR_COLUMN_SET_SETTINGS_SERVICE_TOKEN} from '../../../tokens';
import {RiskSettings} from '@blk/explore-ui-risk';

describe('FactorColumnSetSettingsComponent', () => {
    let component: FactorColumnSetSettingsComponent;
    let fixture: ComponentFixture<FactorColumnSetSettingsComponent>;
    let columnOptionsServiceMock;

    const TEST_COLUMN_CONFIG = new ColumnConfig({
        colTag: 'pct_mv',
        title: 'PCT MV',
        uses: ColumnConstants.FACTOR_MODEL,
    });

    const TEST_SELECTED_COL_SELECTOR_OPT = new SelectedColumnSelectorOption(TEST_COLUMN_CONFIG, []);

    const factorColumnSetSettingsServiceMock = {
        getWidgetConfigInputForBreakdown: jest.fn(() => {
            return {
                'groupByColumnFilters': [
                    {
                        'type': '=',
                        'key': 'isGroupable',
                        'value': true
                    },
                    {
                        'type': '=',
                        'key': 'columnType',
                        'value': [
                            'FACTOR_ATTRIBUTES'
                        ]
                    },
                    {
                        'type': '=',
                        'key': 'columnReports',
                        'value': [
                            'prism_var_sectors',
                            'prism_var_factors',
                            'factor_attrib_dd',
                            'prism_macro_factors'
                        ]
                    },
                    {
                        'type': '!=',
                        'key': 'forTopdown',
                        'value': true
                    }
                ]};
        }),
        updateColumnWithDerivedSettings: jest.fn((column, _inputs) => {
            const widgetRiskSettings = new RiskSettings();
            widgetRiskSettings.economyRiskSettings.weightingScheme = 'WKL';
            const riskSettings: RiskSettings = column.optionValues.find(optionValue => optionValue.configType === RiskSettings.CONFIG_TYPE);
            if (riskSettings) {
                riskSettings.updateDerivedSettings(widgetRiskSettings);
            }
        })
    };

    const factorDefinitionsServiceMock = {
        fetchFactorDefinitions$: jest.fn(() => of([{
            colTag: 'pct_mv',
            title: 'PCT MV',
            uses: ColumnConstants.FACTOR_MODEL,
        }]))
    };

    /**
     * Performs required initialisation before any test is run
     */
    beforeAll(() => {
        CoreTestUtils.initDefinitions();
        ColumnOptionInitializer.registerColumnConfigTypes();
    });

    beforeEach(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        columnOptionsServiceMock = {
            fetchColumnOptions$: jest.fn(() => of([{
                colTag: 'pct_mv',
                use: ColumnConstants.FACTOR_MODEL,
                options: [],
                columnOptionType: 'ColumnOption'
            }])),
            fetchAndPopulateColumnOptions$: jest.fn(() => of([TEST_SELECTED_COL_SELECTOR_OPT])),
            setColumnOptionMap: jest.fn()
        };

        TestBed.configureTestingModule({
            declarations: [FactorColumnSetSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: ColumnOptionService, useValue: columnOptionsServiceMock},
                {provide: FactorDefinitionsService, useValue: factorDefinitionsServiceMock},
                {provide: FACTOR_COLUMN_SET_SETTINGS_SERVICE_TOKEN, useValue: factorColumnSetSettingsServiceMock},
            ]
        });

        fixture = TestBed.createComponent(FactorColumnSetSettingsComponent);
        component = fixture.componentInstance;
        component.widgetType = WidgetConfigType.FACTOR_DATA;

        component.widgetConfigInput = {
            inputConfigType: 'columns',
            inputName: 'columns',
            inputTitle: 'columns',
        };

        component.inputs = new Map();
        component.inputs.set('columns', new ColumnSet());
        component.isApplyButtonDisabled = {value: 0};
        component.restrictedColumnOptions = {
            sections: []
        };

        component.showSpinner$ = new BehaviorSubject<boolean>(false);

        fixture.detectChanges();
    });


    afterEach(() => {
        columnOptionsServiceMock.fetchColumnOptions$.mockReset();
        columnOptionsServiceMock.fetchAndPopulateColumnOptions$.mockReset();
        columnOptionsServiceMock.setColumnOptionMap.mockReset();
    });

    describe('initializeComponent Test', () => {
        it('Test ngOnInit', () => {
            CoreUserMetaDataStore.userMetaData.login = 'user01';
            expect(component.widgetInput).not.toBeUndefined();
            expect(component.selectedBreakdownTag).toBe(component['DEFAULT_FACTOR_TREE_FIELD']);
            expect(component.singleLevelBreakdown).not.toBeNull();
            expect(component.selectBreakdownOptions).not.toBeNull();
            expect(component.selectBreakdownOptions.length).toBeGreaterThan(0);
        });

        it('should trigger columnOptionUpdated$', fakeAsync(() => {
            CoreUserMetaDataStore.userMetaData.login = 'user01';
            component.selectedColumnConfig = new ColumnConfig();
            component.selectedColumnConfig.optionValues.push(new CustomTitleColumnOption({customTitle: 'customTitle'}));
            component.columnOptionUpdated$.next({column: ColumnConfig.createColumn('pct_mv'), isSaveUpdate: false});
            tick(10);
            // First titleMod was Market Value % , now it is customTitle
            expect(component.titleMod).toBe('customTitle');
        }));
    });

    describe('test updateDerivedSettingsAndColumnTitle', () => {
        it('update Risk Settings - with Portfolio Risk Settings',  () => {
            CoreUserMetaDataStore.userMetaData.login = 'user01';
            const columnConfig = ColumnConfig.createColumn('factor1', 'FACTOR_MODEL', 'factor1asd', 'Factor column');
            const riskSettings = new RiskSettings();
            columnConfig.optionValues.push(riskSettings);
            component.inputs = new Map();
            component.widgetType = WidgetConfigType.FACTOR_DATA;
            component['updateDerivedSettingsAndColumnTitle'](columnConfig);

            expect(riskSettings.economyRiskSettings.weightingScheme).toEqual('WKL');
        });
    });

    it('test OnBreakdownChanged', () => {
        const data = {
            'columnTag': 'NLAF_EDR',
            'field': 'NLAF_EDR',
            'title': 'BRS Standard Equity Factor Breakdown',
            'uses': 'ALL',
            'isSubtotalable': true,
            'reportTypes': [
                'SINGLE'
            ],
            'columnReports': [
                'prism_var_sectors'
            ],
            'dataType': 'STRING',
            'columnType': 'FACTOR_ATTRIBUTES',
            'isNotSupportedInCustomCal': false,
            'groups': [
                'Factor Attributes'
            ],
            'isGroupable': true,
            'isVisible': true,
            'isStaticColumn': true,
            'functionFlag': 0,
            'strippedName': 'BRS Standard Equity Factor Breakdown',
            'isRASColumn': false,
            'isEATBreakdownDefinition': false
        };

        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const breakdownColDef: ColumnDefinition = new ColumnDefinition(data);

        const expectedBreakdown = component['createBreakdownFromColumnDefinition'](breakdownColDef);

        component.onBreakdownChanged(breakdownColDef);

        expect(component.singleLevelBreakdown).not.toBeNull();
        expect(component.singleLevelBreakdown).toEqual(expectedBreakdown);
    });

    it('test method getCustomFactorDefinition', () => {
        const customFactorDef = component['getCustomFactorDefinition']();
        expect(customFactorDef).not.toBeNull();
        expect(customFactorDef.title).toBe('Custom Factor');
    });
});
