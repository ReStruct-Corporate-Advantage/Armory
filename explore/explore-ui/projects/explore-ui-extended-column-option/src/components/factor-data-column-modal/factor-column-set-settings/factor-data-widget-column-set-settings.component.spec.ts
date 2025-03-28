import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {
    ColumnConfig, ColumnConstants, CoreTestUtils,
    WidgetConfigType,
    CoreUserMetaDataStore,
    UserMetaData
} from '@blk/explore-ui-core';
import {
    ColumnSet,
    ColumnOptionInitializer,
    ColumnOptionService,
    SelectedColumnSelectorOption,
} from '@blk/explore-ui-column-option';
import {FactorDefinitionsService} from '../../../services/factor-definitions.service';
import {BehaviorSubject, of} from 'rxjs';
import {FACTOR_COLUMN_SET_SETTINGS_SERVICE_TOKEN} from '../../../tokens';
import {RiskSettings} from '@blk/explore-ui-risk';
import {FactorDataWidgetColumnSetSettingsComponent} from './factor-data-widget-column-set-settings.component';


describe('FactorDataWidgetColumnSetSettingsComponent', () => {
    let component: FactorDataWidgetColumnSetSettingsComponent;
    let fixture: ComponentFixture<FactorDataWidgetColumnSetSettingsComponent>;
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
            declarations: [FactorDataWidgetColumnSetSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: ColumnOptionService, useValue: columnOptionsServiceMock},
                {provide: FactorDefinitionsService, useValue: factorDefinitionsServiceMock},
                {provide: FACTOR_COLUMN_SET_SETTINGS_SERVICE_TOKEN, useValue: factorColumnSetSettingsServiceMock},
            ]
        });

        fixture = TestBed.createComponent(FactorDataWidgetColumnSetSettingsComponent);
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

    describe('initializeComponent Test', () => {
        it('Test ngOnInit', () => {
            CoreUserMetaDataStore.userMetaData.login = 'user01';
            expect(component.widgetInput).not.toBeUndefined();
            expect(component.selectedBreakdownTag).toBe(component['DEFAULT_FACTOR_TREE_FIELD']);
            expect(component.singleLevelBreakdown).not.toBeNull();
            expect(component.selectBreakdownOptions).not.toBeNull();
            expect(component.selectBreakdownOptions.length).toBeGreaterThan(0);
        });
    });


    describe('updateFactorsData', () => {
        it('should not update factor titles if showFactorViewLevelPerms is false', () => {
            component.showFactorViewLevelPerms = false;
            const factorDefs: any = [
                { title: 'Factor 1', viewLevels: ['level1'] },
                { title: 'Factor 2', viewLevels: null }
            ];

            component['updateFactorsData'](factorDefs);

            expect(factorDefs[0].title).toBe('Factor 1');
            expect(factorDefs[1].title).toBe('Factor 2');
        });

        it('should update factor titles if showFactorViewLevelPerms is true and viewLevels is null', () => {
            component.showFactorViewLevelPerms = true;
            const factorDefs: any = [
                { title: 'Factor 1', viewLevels: ['level1'] },
                { title: 'Factor 2', viewLevels: null }
            ];

            component['updateFactorsData'](factorDefs);

            expect(factorDefs[0].title).toBe('Factor 1');
            expect(factorDefs[1].title).toBe('(No Permissions) Factor 2');
        });

        it('should not update factor titles if showFactorViewLevelPerms is true and viewLevels is not null', () => {
            component.showFactorViewLevelPerms = true;
            const factorDefs: any = [
                { title: 'Factor 1', viewLevels: ['level1'] },
                { title: 'Factor 2', viewLevels: ['level2'] }
            ];

            component['updateFactorsData'](factorDefs);

            expect(factorDefs[0].title).toBe('Factor 1');
            expect(factorDefs[1].title).toBe('Factor 2');
        });
    });

});
