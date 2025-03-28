import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FactorDataChartSettingsComponent} from './factor-data-chart-settings.component';
import {of, throwError} from 'rxjs';
import {ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ColumnOptionService, CustomTitleColumnOption, ColumnSet, SelectedColumnSelectorOption} from '@blk/explore-ui-column-option';
import {
    ColumnConfig,
    ColumnConstants,
    ColumnType,
    FactorModelColumnDefinition,
    HTTP_SERVICE_TOKEN,
    WidgetConfigType
} from '@blk/explore-ui-core';
import {FactorDataChartSettings} from '@models/widget/inputs/chart-settings/factor-data-chart-settings.model';
import {cloneDeep, isFunction} from 'lodash';
import {TestUtils} from '@utils/test.utils';
import {WorkspaceStore} from '@stores/workspace.store';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {RiskSettings} from '@blk/explore-ui-risk';
import {FactorDataChartSettingsStore} from './stores/factor-data-chart-settings.store';
import {FactorTimeSeriesSelectedOption} from '@enums/factor-time-series-selected-option.enum';
import {FactorDefinitionsService} from '@blk/explore-ui-extended-column-option';
import {NotificationService} from '@services/notification';

describe('FactorDataChartSettingComponent', () => {
    let component: FactorDataChartSettingsComponent;
    let fixture: ComponentFixture<FactorDataChartSettingsComponent>;

    const TEST_COLUMN_CONFIG = new ColumnConfig({
        columnTag: 'factor1',
        columnKey: 'factor1145a',
        columnTitle: 'factor 1',
        positionColumnType: ColumnConstants.FACTOR_MODEL,
    });

    const columnOptionsServiceMock = {
        fetchAndPopulateColumnOptions$: jest.fn(
            (selectedColumns, additionalColumnOptions, restrictedColumnOptions, columnCallback?) => {
                if (restrictedColumnOptions.sections.length > 0) {
                    // hide Risk Settings
                    TEST_COLUMN_CONFIG.optionValues = [ new CustomTitleColumnOption()];
                } else {
                    TEST_COLUMN_CONFIG.optionValues = [ new CustomTitleColumnOption(), new RiskSettings()];
                }

                // For the purposes of this test, invoke the callback if it is a function, so we capture coverage
                if (isFunction(columnCallback)) {
                    columnCallback(TEST_COLUMN_CONFIG);
                }
                return of([new SelectedColumnSelectorOption(TEST_COLUMN_CONFIG, [])]);
            }),
    };

    const cdRefMock = {
        markForCheck: jest.fn(),
        detectChanges: jest.fn(),
        detach: jest.fn(),
    };

    const factorDefinitionServiceMock = {
        fetchFactorDefinitionsForFactorTags$: jest.fn(),
    };

    const http2BmsServiceStub = {
        post$: jest.fn(() => of()),
    };

    const notificationServiceMock = {
        error: jest.fn(),
    };

    /**
     * Performs required initialisation before any test is run
     */
    beforeAll((done) => {
        TestUtils.initialize(done);
        WorkspaceStore.init();
        WorkspaceStore.updateCurrentWorkpad(new FlatWorkpad(), new Portfolio());
    });


    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [FactorDataChartSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: ColumnOptionService, useValue: columnOptionsServiceMock},
                {provide: FactorDefinitionsService, userValue: factorDefinitionServiceMock},
                {provide: ChangeDetectorRef, useValue: cdRefMock},
                {provide: HTTP_SERVICE_TOKEN, useValue: http2BmsServiceStub},
                {provide: NotificationService, useValue: notificationServiceMock},
            ]
        });

        fixture = TestBed.createComponent(FactorDataChartSettingsComponent);
        component = fixture.componentInstance;
        component.restrictedColumnOptions = { sections: [] };
        component.widgetType = WidgetConfigType.FACTOR_DATA;
        component.widgetConfigInput = {
            inputConfigType: FactorDataChartSettings.configType,
            inputName: FactorDataChartSettings.configType,
            inputTitle: 'Chart Settings',
        };

        component.inputs = new Map();

        const columnSet = new ColumnSet();
        columnSet.columns = [ cloneDeep(TEST_COLUMN_CONFIG) ];

        const factorDataChartSettings = new FactorDataChartSettings();
        factorDataChartSettings.isTimeSeriesMode = true;
        factorDataChartSettings.factorTimeSeriesSelectedOption = FactorTimeSeriesSelectedOption.FACTOR_LEVELS;

        component.inputs.set(ColumnType.COLUMNS, columnSet);
        component.inputs.set(FactorDataChartSettings.configType, factorDataChartSettings);
        component.isApplyButtonDisabled = { value: 0 };

        fixture.detectChanges();
        component.ngOnInit();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('test ngOnInit', () => {
        expect(component.isTimeSeriesMode).toBeTruthy();
        expect(component.factorSelectedOption).toBe(FactorTimeSeriesSelectedOption.FACTOR_LEVELS);
        expect(component.factorDataModes).not.toBeUndefined();
        expect(component.factorDataModes.length).toBe(2);
        expect(component.factorSelectOptions).not.toBeUndefined();
        expect(component.factorSelectOptions[0].values.length).toBe(6);
        expect(component.columnOptionsFetched).toBeTruthy();
    });

    it('test setTimeSeriesOptions', () => {
        // Test for timeSeries mode
        expect(component.isTimeSeriesMode).toBeTruthy();

        component.factorSelectOptions = undefined;
        component['initializeFactorSelectOptions']();

        expect(component.factorSelectOptions).not.toBeUndefined();
        expect(component.factorSelectOptions[0].values.length).toBe(6);

        // Test for Risk Matrix mode
        component.factorSelectOptions = undefined;
        component.isTimeSeriesMode = false;
        component.factorSelectedOption = FactorTimeSeriesSelectedOption.CORRELATIONS;

        component['initializeFactorSelectOptions']();

        expect(component.factorSelectOptions).not.toBeUndefined();
        expect(component.factorSelectOptions[0].values.length).toBe(2);
    });

    it('test updateHideRiskSettingsFlag', () => {
        const columns = (component.inputs.get('columns') as ColumnSet).columns;
        columns[0].optionValues = [];
        component.restrictedColumnOptions.sections = [];

        // Test hide Risk Settings column option
        component['updateHideRiskSettingsFlag']();
        expect(FactorDataChartSettingsStore.getHideFactorColumnRiskSettings$(ColumnType.COLUMNS).getValue()).toBeTruthy();
        expect(component.restrictedColumnOptions.sections).toStrictEqual(['riskSettingsColumnSettings']);
        expect(columns[0].optionValues.length).toBe(1);

        // For other options show all column options
        columns[0].optionValues = [];
        component.restrictedColumnOptions.sections = [];
        component.factorSelectedOption = FactorTimeSeriesSelectedOption.CORRELATIONS;
        component['updateHideRiskSettingsFlag']();

        expect(FactorDataChartSettingsStore.getHideFactorColumnRiskSettings$(ColumnType.COLUMNS).getValue()).toBeFalsy();
        expect(component.restrictedColumnOptions.sections.length).toBe(0);
        expect(columns[0].optionValues.length).toBe(2);
    });

    it('test onFactorDataModeChanged', () => {
        const event = {
            detail: {
                value: {
                    eventData: false
                }
            }
        } as CustomEvent;

        component.onFactorDataModeChanged(event);

        expect(component.isTimeSeriesMode).toBeFalsy();
        expect(component.widgetInput.isTimeSeriesMode).toBeFalsy();
        expect(component.factorSelectOptions).not.toBeUndefined();
        expect(component.factorSelectOptions[0].values.length).toBe(2);
        expect(component.factorSelectedOption).toBe(FactorTimeSeriesSelectedOption.CORRELATIONS);
        expect(component.widgetInput.factorTimeSeriesSelectedOption).toBe(FactorTimeSeriesSelectedOption.CORRELATIONS);
    });

    it('test onFactorOptionSelectionChanged', () => {
        const event = {
            detail: {
                value: {
                    value: FactorTimeSeriesSelectedOption.FACTOR_RETURNS
                }
            }
        } as CustomEvent;

        component.onFactorSelectedOptionChanged(event);

        expect(component.factorSelectedOption).toBe(FactorTimeSeriesSelectedOption.FACTOR_RETURNS);
        expect(component.widgetInput.factorTimeSeriesSelectedOption).toBe(FactorTimeSeriesSelectedOption.FACTOR_RETURNS);
    });

    describe('test updateColumnWithDerivedSettings', () => {
        it('update Risk Settings - with Portfolio Risk Settings',  () => {
            const columnConfig = ColumnConfig.createColumn('factor1', 'FACTOR_MODEL', 'factor1asd', 'Factor column');
            const riskSettings = new RiskSettings();
            columnConfig.optionValues.push(riskSettings);

            const portRiskSettings = new RiskSettings();
            portRiskSettings.economyRiskSettings.weightingScheme = 'FMI';
            WorkspaceStore.getCurrentPortfolio().portfolioRiskSettings = portRiskSettings;
            component.updateColumnWithDerivedSettings(columnConfig);

            expect(riskSettings.economyRiskSettings.weightingScheme).toEqual('FMI');
        });
    });

    describe('test method updateFactorPermissions', () => {
        it('should update factor permissions correctly', () => {
            const factorDefs = [
                { columnTag: 'factor1', viewLevels: false },
            ];

            const factorDefinitionServiceSpy = jest.spyOn(component['factorDefinitionsService'], 'fetchFactorDefinitionsForFactorTags$').mockReturnValue(of(factorDefs as FactorModelColumnDefinition[]));
            const cdRefSpy = jest.spyOn(component['changeDetectorRef'], 'markForCheck');

            component['updateFactorPermissions']();

            expect(factorDefinitionServiceSpy).toHaveBeenCalledTimes(1);
            expect(factorDefinitionServiceSpy).toHaveBeenLastCalledWith(['factor1']);
            expect(FactorDataChartSettingsStore.factorTagToPermissionMap.get('factor1')).toBe('N');
            expect(component.isFactorDataLoaded).toBe(true);
            expect(cdRefSpy).toHaveBeenCalledTimes(2);
        });

        it('should handle error when fetching factor definitions', () => {
            const factorDefinitionServiceSpy = jest.spyOn(component['factorDefinitionsService'], 'fetchFactorDefinitionsForFactorTags$').mockReturnValue(throwError('Error'));
            const cdRefSpy = jest.spyOn(component['changeDetectorRef'], 'markForCheck');
            const notificationServiceErrorSpy = jest.spyOn(component['notificationService'], 'error');

            component['updateFactorPermissions']();

            expect(factorDefinitionServiceSpy).toHaveBeenCalledTimes(1);
            expect(notificationServiceErrorSpy).toHaveBeenCalledTimes(1);
            expect(component.isFactorDataLoaded).toBe(true);
            expect(cdRefSpy).toHaveBeenCalledTimes(2);
        });
    });

    it('test method updateFactorTitlesOnModeChanged', () => {
        const columns = (component.inputs.get(ColumnType.COLUMNS) as ColumnSet).columns;
        columns[0].columnTitle = '(No Permissions) Factor 1';
        component.widgetInput.factorTimeSeriesSelectedOption = FactorTimeSeriesSelectedOption.VOLATILITIES;
        component['updateFactorTitlesOnModeChanged']();
        expect(columns[0].columnTitle).toBe('Factor 1');
    });
});
