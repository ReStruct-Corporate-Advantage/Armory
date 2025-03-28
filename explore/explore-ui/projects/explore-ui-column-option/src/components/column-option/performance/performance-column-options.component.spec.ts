import {
    AdditionalPerformanceSettings,
    ColumnConfig,
    ColumnDefinition,
    CoreColumnUtils, CoreCommonConstants,
    CoreTestUtils,
    CoreWidgetConfigStore, DateService,
    HTTP_SERVICE_TOKEN,
    PERFORMANCE_TIME_PERIOD_SETTINGS_SERVICE_TOKEN,
    PerformanceConstants,
    PerformanceSettings,
    PerformanceTimePeriod,
    WidgetConfigType
} from '@blk/explore-ui-core';
import {BehaviorSubject, of} from 'rxjs';
import {ColumnOptionTestBed} from '../../../test-utils/column-option-test-bed.testutil';
import {PerformanceColumnOptionsComponent} from './performance-column-options.component';
import {ColumnOptionConstants} from '../../../constants';

describe('PerformanceColumnOptionsComponent', () => {
    let testBed: ColumnOptionTestBed<PerformanceColumnOptionsComponent, PerformanceSettings>;
    const mockedOption = {
        columnOptionKey: 'performanceSettings',
        columnOptionTitle: 'Performance Settings',
        columnOptionConfigType: 'performanceSettings',
        columnOptionAttributes: [
            {dataType: 'STRING', defaultValue: null, key: 'TIME-PERIOD', title: 'Time Period', values: []},
            {dataType: 'BOOLEAN', key: 'AS-REPORTED', title: 'As Reported'},
            {
                dataType: 'STRING',
                defaultValue: null,
                key: 'customPivotPoint',
                title: 'Custom Pivot Point',
                values: [{value: 'THREE_MONTH', label: '3 Months'}]
            },
            {dataType: 'BOOLEAN', key: PerformanceConstants.IS_NET_RETURN, title: 'Return Type'}
        ]
    };

    const observableMock = {
        subscribe: jest.fn(),
        pipe: jest.fn()
    };

    const performanceTimePeriodSettingsServiceMock = {
        getAvailableTypes: jest.fn(),
        getAvailableIntervals: jest.fn(),
        setDatesFromTimePeriod$: jest.fn(() => observableMock),
        populateTimePeriodFromValue$: jest.fn(() => of(new PerformanceTimePeriod('Week to date', 2, 'WTD', undefined, undefined))),
        getCalCode: jest.fn(),
        modifyTimePeriod$: jest.fn(() => of(new PerformanceTimePeriod('Week to date', 2, 'WTD', undefined, undefined))),
        getIntervalsByType: jest.fn()
    };

    beforeAll(() => {
        CoreTestUtils.initDefinitions();
    });

    beforeEach(() => {
        CoreWidgetConfigStore.currentWidgetConfigType$ = new BehaviorSubject<string>(WidgetConfigType.RETURNS);

        const performanceSettings = new PerformanceSettings();
        performanceSettings.timePeriod = new PerformanceTimePeriod('Week to date', 2, 'WTD', undefined, undefined);
        performanceSettings.parentPerformanceSettings = new PerformanceSettings();
        const col: ColumnDefinition = CoreColumnUtils.getColumnDefByTag('total_ret');
        const column = ColumnConfig.createColumnFromColumnDefinition(col);
        // Create the testbed for testing the testBed.component.
        testBed = new ColumnOptionTestBed<PerformanceColumnOptionsComponent, PerformanceSettings>(PerformanceColumnOptionsComponent, performanceSettings, mockedOption, [], undefined, undefined, column,
            [
                        {provide: PERFORMANCE_TIME_PERIOD_SETTINGS_SERVICE_TOKEN, useValue: performanceTimePeriodSettingsServiceMock},
                        {provide: HTTP_SERVICE_TOKEN, useValue: {} },
                        {provide: DateService, useValue: { getMaxDateByCalendarCode$: () => of(new Date(2023, 10, 31))}}
                     ]
        );
        testBed.component.widgetType = WidgetConfigType.RISK_EXPOSURE;
    });

    it('should create', () => {
        expect(testBed.component).toBeTruthy();
        expect(testBed.component.optionValue.sourceName).toBe(CoreCommonConstants.SETTINGS_HIERARCHY_TYPE.COLUMN);
        expect(testBed.component.timePeriod.sourceName).toBe(CoreCommonConstants.SETTINGS_HIERARCHY_TYPE.COLUMN);
    });

    describe('updateColumnTitle Test', () => {
        it('should updateColumnTitle - additional settings not present at column level', () => {
            expect(CoreTestUtils.validate([testBed.component.column.columnTitle], ['Total Return (2 WTD)'])).toBe(true);

            // Custom Time Period
            testBed.component.optionValue.timePeriod.shortName = 'CUSTOM';
            testBed.component.updateColumnTitle();
            expect(CoreTestUtils.validate([testBed.component.column.columnTitle], ['Total Return (CUSTOM)'])).toBe(true);

            testBed.component.optionValue.timePeriod.shortName = 'WTD';

            testBed.component.optionValue.parentPerformanceSettings.additionalSettings = new AdditionalPerformanceSettings();

            // As Reported set to true
            testBed.component.optionValue.parentPerformanceSettings.additionalSettings.asReported = true;
            testBed.component.updateColumnTitle();
            expect(CoreTestUtils.validate([testBed.component.column.columnTitle], ['Total Return (2 WTD)'])).toBe(true);

            // Custom Pivot Point
            testBed.component.optionValue.parentPerformanceSettings.additionalSettings.customPivotPoint = 'THREE_MONTH';
            testBed.component.updateColumnTitle();
            expect(CoreTestUtils.validate([testBed.component.column.columnTitle], ['Total Return (2 WTD)'])).toBe(true);

            // As Reported set to false
            testBed.component.optionValue.parentPerformanceSettings.additionalSettings.asReported = false;
            testBed.component.updateColumnTitle();
            expect(CoreTestUtils.validate([testBed.component.column.columnTitle], ['Total Return (2 WTD)'])).toBe(true);
        });

        it('should updateColumnTitle', () => {
            testBed.component.ngOnInit();
            expect(CoreTestUtils.validate([testBed.component.column.columnTitle], ['Total Return (2 WTD)'])).toBe(true);

            testBed.component.optionValue.additionalSettings = new AdditionalPerformanceSettings();

            // As Reported set to true
            testBed.component.optionValue.additionalSettings.asReported = true;
            testBed.component.updateColumnTitle();
            expect(CoreTestUtils.validate([testBed.component.column.columnTitle], ['Total Return (2 WTD:As Reported)'])).toBe(true);

            // Custom Pivot Point
            testBed.component.optionValue.additionalSettings.customPivotPoint = 'THREE_MONTH';
            testBed.component.updateColumnTitle();
            expect(CoreTestUtils.validate([testBed.component.column.columnTitle], ['Total Return (3 Month,2 WTD:As Reported)'])).toBe(true);

            // As Reported set to false
            testBed.component.optionValue.additionalSettings.asReported = false;
            testBed.component.updateColumnTitle();
            expect(CoreTestUtils.validate([testBed.component.column.columnTitle], ['Total Return (3 Month,2 WTD)'])).toBe(true);

            // As Reported set to false
            testBed.component.widgetType = WidgetConfigType.RETURNS;
            testBed.component.updateColumnTitle();
            expect(CoreTestUtils.validate([testBed.component.column.columnTitle], ['Total Return (3 Month)'])).toBe(true);

            // No custom pivot point
            testBed.component.optionValue.additionalSettings.customPivotPoint = null;
            testBed.component.updateColumnTitle();
            expect(CoreTestUtils.validate([testBed.component.column.columnTitle], ['Total Return'])).toBe(true);
        });
    });

    /**
     * Test case for callback function of checkbox
     */
    it('True case for As Reported Checkbox', () => {
        testBed.component.optionValue.additionalSettings = undefined;
        const event: any = {};
        event.detail = {value: {checked: true}};
        testBed.component.setAsReportedAttribute(event);
        expect(testBed.component.optionValue.additionalSettings.asReported).toBe(true);

        event.detail.value.checked = false;
        testBed.component.setAsReportedAttribute(event);
        expect(testBed.component.optionValue.additionalSettings.asReported).toBe(false);
    });

    /**
     * Test case for callback function custom pivot point select box
     */
    it('True case for custom pivot point select box', () => {
        testBed.component.optionValue.additionalSettings = undefined;
        const event: any = {};
        event.detail = {value: {value: 'TWO_YEAR'}};
        testBed.component.setCustomPivot(event);
        expect(testBed.component.optionValue.additionalSettings.customPivotPoint).toBe('TWO_YEAR');

        event.detail.value = undefined;
        testBed.component.setCustomPivot(event);
        expect(testBed.component.optionValue.additionalSettings.customPivotPoint).toBe(null);

        event.detail = {value: {value: null}};
        testBed.component.setCustomPivot(event);
        expect(testBed.component.optionValue.additionalSettings.customPivotPoint).toBe(null);
    });

    describe('Initialize custom pivot point', () => {
        it('RNE widget', () => {
            CoreWidgetConfigStore.currentWidgetConfigType$ = new BehaviorSubject<string>(WidgetConfigType.RISK_EXPOSURE);

            testBed.component.optionValue.additionalSettings = undefined;
            testBed.component.optionValue.parentPerformanceSettings.additionalSettings = new AdditionalPerformanceSettings();
            testBed.component.availableCustomPivotPoints[0].values = [];
            testBed.component.initializeCustomPivotPoints();
            // Ten Year custom pivot point is available and is selected
            const tenYearCustomPivotPoint = testBed.component.availableCustomPivotPoints[0].values.find(option => option.value === ColumnOptionConstants.TEN_YEAR);
            expect(tenYearCustomPivotPoint).toBeDefined();
            expect(tenYearCustomPivotPoint.value).toBe(ColumnOptionConstants.TEN_YEAR);
            expect(tenYearCustomPivotPoint.isSelected).toBeTruthy();
            // Only TEN_YEAR custom pivot point is selected
            const selectedCustomPivotPoints = testBed.component.availableCustomPivotPoints[0].values.filter(option => option.isSelected);
            expect(selectedCustomPivotPoints.length).toBe(1);
            expect(selectedCustomPivotPoints[0].value).toBe(ColumnOptionConstants.TEN_YEAR);
        });
        it('Return Widget', () => {
            CoreWidgetConfigStore.currentWidgetConfigType$ = new BehaviorSubject<string>(WidgetConfigType.RETURNS);

            testBed.component.optionValue.additionalSettings = undefined;
            testBed.component.optionValue.parentPerformanceSettings.additionalSettings = new AdditionalPerformanceSettings();
            testBed.component.availableCustomPivotPoints[0].values = [];
            testBed.component.initializeCustomPivotPoints();
            expect(testBed.component.availableCustomPivotPoints[0].values[0].displayValue).toBe('Widget default');
            expect(testBed.component.availableCustomPivotPoints[0].values[0].isSelected).toBe(true);

            testBed.component.availableCustomPivotPoints[0].values = [];

            testBed.component.optionValue.additionalSettings = new AdditionalPerformanceSettings();
            testBed.component.optionValue.additionalSettings.customPivotPoint = 'THREE_MONTH';
            testBed.component.initializeCustomPivotPoints();
            expect(testBed.component.availableCustomPivotPoints[0].values[0].displayValue).toBe('Widget default');
            expect(testBed.component.availableCustomPivotPoints[0].values[0].isSelected).toBe(false);
            expect(testBed.component.availableCustomPivotPoints[0].values[1].isSelected).toBe(true);
        });
    });

    it('initializes the isNetReturn flag', () => {
        const additionalPerformanceSettings = new AdditionalPerformanceSettings();
        testBed.component.optionValue.additionalSettings = additionalPerformanceSettings;
        testBed.component.optionValue.parentPerformanceSettings.additionalSettings = additionalPerformanceSettings;

        // default to gross
        testBed.component.initializeReturnType();
        expect(testBed.component.returnTypeDisplayOptions.length).toEqual(2);
        expect(testBed.component.returnTypeDisplayOptions[0].checked).toEqual(true);
        expect(testBed.component.returnTypeDisplayOptions[1].checked).toEqual(false);

        additionalPerformanceSettings.isNetReturn = false;
        testBed.component.initializeReturnType();
        expect(testBed.component.returnTypeDisplayOptions.length).toEqual(2);
        expect(testBed.component.returnTypeDisplayOptions[0].checked).toEqual(true);
        expect(testBed.component.returnTypeDisplayOptions[1].checked).toEqual(false);

        // initialize when saved as Net Return
        testBed.component.optionValue.additionalSettings.isNetReturn = true;
        testBed.component.initializeReturnType();
        expect(testBed.component.returnTypeDisplayOptions.length).toEqual(2);
        expect(testBed.component.returnTypeDisplayOptions[0].checked).toEqual(false);
        expect(testBed.component.returnTypeDisplayOptions[1].checked).toEqual(true);
    });

    it('updates the isNetReturn flag', () => {
        const additionalPerformanceSettings = new AdditionalPerformanceSettings();
        testBed.component.optionValue.additionalSettings = additionalPerformanceSettings;
        testBed.component.optionValue.parentPerformanceSettings.additionalSettings = additionalPerformanceSettings;

        testBed.component.initializeReturnType();
        expect(testBed.component.optionValue.additionalSettings.isNetReturn).toBeUndefined();
        expect(testBed.component.returnTypeDisplayOptions.length).toEqual(2);
        expect(testBed.component.returnTypeDisplayOptions[0].checked).toEqual(true);
        expect(testBed.component.returnTypeDisplayOptions[1].checked).toEqual(false);

        // update handled by DS component
        testBed.component.returnTypeDisplayOptions[0].checked = false;
        testBed.component.returnTypeDisplayOptions[1].checked = true;

        testBed.component.updateNetReturn();
        expect(testBed.component.optionValue.additionalSettings.isNetReturn).toEqual(true);
    });
});
