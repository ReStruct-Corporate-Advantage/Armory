import {
    CoreDefinitionStore,
    CoreWidgetConfigStore, MultiOverrideDate,
    OverrideDateConstants,
    WidgetConfigType
} from '@blk/explore-ui-core';
import {PortfolioRiskColumnCategoryDefinition, ColumnDefinition} from '@blk/explore-ui-core';
import {OverrideDateSettings, MultiOverrideDateSettings, CompareToCurrentDateSettings} from '@blk/explore-ui-core';
import {BehaviorSubject} from 'rxjs';
import {ColumnConfig} from '@blk/explore-ui-core';
import {OverrideDateColumnOption} from '../../../models/column-option/override-date-column-option.model';
import {UiColumnOptionService} from '../../../services/ui-column-option.service';
import {LibColumnUtils} from '../../../utils';
import {ColumnOptionTestBed} from '../../../test-utils/column-option-test-bed.testutil';
import {OverrideDateColumnOptionsComponent} from './override-date-column-options.component';
import {DateStore} from '@blk/explore-ui-core';


describe('OverrideDateColumnOptionsComponent', () => {
    let testBed: ColumnOptionTestBed<OverrideDateColumnOptionsComponent, OverrideDateColumnOption>;
    const getChartConfigForTypeMock = jest.fn();
    let dummyColumnDef: ColumnDefinition;
    const uiColumnOptionServiceStub = {
        setCompareToCurrentOption: jest.fn()
    };

    beforeEach(() => {
        // Create the mocked column option to validate this control.
        DateStore.currentMultiFrequencyMaxPeriodsMap$ = new BehaviorSubject({DAILY: 400, WEEKLY: 55, MONTH_END: 26, QUARTER_END: 8, YEAR_END: 2} as any);
        CoreDefinitionStore.multiOverrideDateType = getExpectedSupportedMultiOverrideDateTypes();
        const mockedOption = {
            columnOptionTitle: 'Date Override',
            columnOptionAttributes: [
                {
                    'title': 'Date',
                    'key': 'overrideDate',
                    'dataType': 'S'
                },
                {
                    'title': 'Compare To Current',
                    'key': 'compareToCurrent',
                    'dataType': 'S'
                },
                {
                    'title': 'Vary Dates',
                    'key': 'varyDates',
                    'dataType': 'S'
                }
            ],
            columnOptionConfigType: 'overrideDateColumnOption',
            columnOptionKey: 'overrideDateColumnOption'
        };

        // Create a dummy column
        const serializedColumn = {
            'columnTag': 'rfv_contrib_port',
            'columnKey': 'rfv_contrib_port_4',
            'positionColumnType': 'PORT',
            'optionValues': [
                {
                    'configType': 'numericColumnFormatColumnOption'
                },
                {
                    'economyRiskSettings': {},
                    'advancedRiskSettings': {},
                    'configType': 'riskSettings'
                },
                {
                    'aggregationType': 0,
                    'configType': 'aggregation'
                }
            ]
        };
        const dummyColumn = new ColumnConfig(serializedColumn);
        dummyColumnDef = new PortfolioRiskColumnCategoryDefinition();
        (dummyColumnDef as PortfolioRiskColumnCategoryDefinition).matchingRiskCategories = [
            'DEPENDS_ON_ECONOMY',
            'DEPENDS_ON_EXPOSURE',
            'IS_MULTICOLUMN',
            'BELONGS_TO_FACTOR_REPORT',
            'BELONGS_TO_SECTOR_REPORT',
            'BELONGS_TO_SECTOR_TO_FACTOR_REPORT',
            'BELONGS_TO_SECTOR_TO_SECURITY_REPORT',
            'BELONGS_TO_PORTFOLIO_REPORT',
            'IS_PORT',
            'SUPPORTS_BREAKDOWN',
            'IS_SUBTOTAL_ABLE'
        ];
        jest.spyOn(LibColumnUtils, 'getColumnDefinition').mockReturnValue(dummyColumnDef);
        CoreWidgetConfigStore.currentWidgetConfigType$ = new BehaviorSubject<string>(WidgetConfigType.PRA);
        jest.spyOn(CoreWidgetConfigStore, 'getChartConfigForType').mockImplementation(getChartConfigForTypeMock);
        getChartConfigForTypeMock.mockReturnValue({canHaveMultipleOverrideDates: true});

        // Create the testbed for testing the component.
        testBed = new ColumnOptionTestBed<OverrideDateColumnOptionsComponent, OverrideDateColumnOption>(
            OverrideDateColumnOptionsComponent,
            new OverrideDateColumnOption(),
            mockedOption,
            [],
            'rfv_contrib_port',
            'PORT',
            dummyColumn,
            [{provide: UiColumnOptionService, useValue: uiColumnOptionServiceStub}]
        );
    });

    it('Validate init of the component', () => {
        // const compiled = testBed.fixture.debugElement.nativeElement;
        expect(testBed.component.riskColumnFlags).toEqual((dummyColumnDef as PortfolioRiskColumnCategoryDefinition).matchingRiskCategories);
        // canHaveVaryingDates flag should be true
        expect(testBed.component.canHaveVaryingDates).toBeTruthy();

        const expectedOverrideDateSettings = new OverrideDateSettings([], undefined);
        expect(testBed.component.overrideDateSettings.equals(expectedOverrideDateSettings)).toBeTruthy();

        const expectedMultiOverrideDateSettings = new MultiOverrideDateSettings(undefined, undefined, undefined, undefined, false);
        expect(testBed.component.multiOverrideDateSettings.equals(expectedMultiOverrideDateSettings)).toBeTruthy();

        const expectedCompareToCurrentDateSettings = new CompareToCurrentDateSettings(undefined);
        expect(testBed.component.compareToCurrentDateSettings.equals(expectedCompareToCurrentDateSettings)).toBeTruthy();

        // There should be three options for None, Single, and Multi
        expect(testBed.component.overrideDateOptions.length).toEqual(3);
        // The 'multi' radio button should be checked
        expect(testBed.component.overrideDateOptions[0] && testBed.component.overrideDateOptions[0].checked).toBeTruthy();
    });



    it('Tests onOverrideDateOptionChanged', () => {
        // Starts as 'NONE'
        expect(testBed.component.multiMode).toEqual(OverrideDateConstants.OVERRIDE_DATE_NONE);

        // Select "Specific"
        testBed.component.onOverrideDateOptionChanged(testBed.component.overrideDateOptions[1]);
        expect(testBed.component.multiOverrideDateSettings.multiOverrideDateTypeFrequency).toEqual('');
        expect(testBed.component.multiOverrideDateSettings.numberOfObservations).toEqual(0);

        // Select the last option which is 'MULTI'
        testBed.component.onOverrideDateOptionChanged(testBed.component.overrideDateOptions[2]);
        expect(testBed.component.multiOverrideDateSettings.multiOverrideDateTypeFrequency).toEqual('DAILY');
        expect(testBed.component.multiOverrideDateSettings.numberOfObservations).toEqual(10);

        // Select "None"
        testBed.component.onOverrideDateOptionChanged(testBed.component.overrideDateOptions[0]);
        expect(testBed.component.multiOverrideDateSettings.multiOverrideDateTypeFrequency).toEqual('');
        expect(testBed.component.multiOverrideDateSettings.numberOfObservations).toEqual(0);
    });

    it('Tests onCustomDateChange', () => {
        testBed.component.onCustomDateChange('03/10/2017');
        expect(testBed.component.optionValue.customOverrideDateLabel).toEqual('03/10/2017');
    });

    it('Tests onCompareToCurrentChange', () => {
        testBed.component.onCompareToCurrentChange(OverrideDateConstants.PERCENTAGE_COMPARE_TO_CURRENT_ATTRIBUTION);
        expect(testBed.component.optionValue.compareToCurrentType).toEqual(OverrideDateConstants.PERCENTAGE_COMPARE_TO_CURRENT_ATTRIBUTION);
        expect(testBed.component.optionValue.showAttribution).toBeTruthy();
    });

    it('Tests showOverrideDate', () => {
        // Should be false because canHaveMultipleOverrideDates() is returning true
        expect(testBed.component.showOverrideDate()).toBeFalsy();

        testBed.component.multiMode = OverrideDateConstants.OVERRIDE_DATE_SPECIFIC;
        testBed.component.canHaveMultipleOverrideDates = testBed.component.setCanHaveMultipleOverrideDates();
        expect(testBed.component.showOverrideDate()).toBeTruthy();

        getChartConfigForTypeMock.mockReturnValue({canHaveMultipleOverrideDates: false});
        testBed.component.multiMode = OverrideDateConstants.OVERRIDE_DATE_NONE;
        testBed.component.canHaveMultipleOverrideDates = testBed.component.setCanHaveMultipleOverrideDates();
        expect(testBed.component.showOverrideDate()).toBeTruthy();
    });

    it('Tests showMultiOverrideDate', () => {
        // Should be false because canHaveMultipleOverrideDates() is returning true
        // and multiMode defaults to NONE
        expect(testBed.component.showMultiOverrideDate()).toBeFalsy();

        testBed.component.multiMode = OverrideDateConstants.OVERRIDE_DATE_MULTI;
        testBed.component.canHaveMultipleOverrideDates = testBed.component.setCanHaveMultipleOverrideDates();
        expect(testBed.component.showMultiOverrideDate()).toBeTruthy();

        getChartConfigForTypeMock.mockReturnValue({canHaveMultipleOverrideDates: false});
        testBed.component.canHaveMultipleOverrideDates = testBed.component.setCanHaveMultipleOverrideDates();
        expect(testBed.component.showMultiOverrideDate()).toBeFalsy();
    });

    it('Tests setMultiMode', () => {
        testBed.component.overrideDateSettings = new OverrideDateSettings([], undefined);
        testBed.component.multiOverrideDateSettings = new MultiOverrideDateSettings(undefined, undefined, undefined, undefined);

        // Test with no option selected
        testBed.component.setMultiMode();
        expect(testBed.component.multiMode).toEqual(OverrideDateConstants.OVERRIDE_DATE_NONE);

        // Test with multiOverrideDateTypeFrequency
        testBed.component.multiOverrideDateSettings.multiOverrideDateTypeFrequency = 'MONTH_END';
        testBed.component.setMultiMode();
        expect(testBed.component.multiMode).toEqual(OverrideDateConstants.OVERRIDE_DATE_MULTI);

        // Test with override date types
        testBed.component.overrideDateSettings.overrideDateTypes.push('PRIOR_DAY');
        testBed.component.setMultiMode();
        expect(testBed.component.multiMode).toEqual(OverrideDateConstants.OVERRIDE_DATE_SPECIFIC);
    });

    describe('CompareToCurrent Test', () => {
        it('Tests showCompareToCurrent - if it is a custom calculation column', () => {
            testBed.component.option.columnOptionAttributes[1].isRestricted = true;
            expect(testBed.component.showCompareToCurrent()).toBeFalsy();

            testBed.component.option.columnOptionAttributes[1] = null;
            expect(testBed.component.showCompareToCurrent()).toBeFalsy();
        });
    });


    it('Tests setCanHaveMultipleOverrideDates - if it is a custom calculation column', () => {
        testBed.component.option.columnOptionAttributes[0].isRestricted = true;
        expect(testBed.component.setCanHaveMultipleOverrideDates()).toBeFalsy();
    });


    it('should return true when riskColumnFlags is empty', () => {
        testBed.component.riskColumnFlags = [];
        expect(testBed.component.isDateVaryDisabledForRiskColumn()).toBe(true);
    });

    it('should return false when riskColumnFlags contains DEPENDS_ON_EXPOSURE', () => {
        testBed.component.riskColumnFlags = [OverrideDateConstants.RISK_CATEGORIES.DEPENDS_ON_EXPOSURE];
        expect(testBed.component.isDateVaryDisabledForRiskColumn()).toBe(false);
    });

    it('should return false when riskColumnFlags contains DEPENDS_ON_ECONOMY', () => {
        testBed.component.riskColumnFlags = [OverrideDateConstants.RISK_CATEGORIES.DEPENDS_ON_ECONOMY];
        expect(testBed.component.isDateVaryDisabledForRiskColumn()).toBe(false);
    });

    it('should return true when riskColumnFlags does not contain DEPENDS_ON_EXPOSURE or DEPENDS_ON_ECONOMY', () => {
        testBed.component.riskColumnFlags = ['OTHER_CATEGORY'];
        expect(testBed.component.isDateVaryDisabledForRiskColumn()).toBe(true);
    });

    /**
     * get all the supported Multi Override Date Types
     */
    function getExpectedSupportedMultiOverrideDateTypes(): MultiOverrideDate[] {
        const expectedOverrideDateTypes = [];
        expectedOverrideDateTypes.push(new MultiOverrideDate({value: 'DAILY', displayName: 'Daily'}));
        expectedOverrideDateTypes.push(new MultiOverrideDate({value: 'WEEKLY', displayName: 'Weekly'}));
        expectedOverrideDateTypes.push(new MultiOverrideDate({value: 'MONTH_END', displayName: 'Month end'}));
        expectedOverrideDateTypes.push(new MultiOverrideDate({value: 'QUARTER_END', displayName: 'Quarter end'}));
        expectedOverrideDateTypes.push(new MultiOverrideDate({value: 'YEAR_END', displayName: 'Year end'}));
        return expectedOverrideDateTypes;
    }
});
