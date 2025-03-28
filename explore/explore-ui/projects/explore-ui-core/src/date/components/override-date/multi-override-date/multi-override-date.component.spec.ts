import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ExploreSelectOption} from '../../../../ui/models/explore-select-option.model';
import {CoreDefinitionStore} from '../../../../definition/core-definition.store';
import {TokenConstants} from '../../../../definition/token/token.constants';
import {MultiOverrideDate} from '../../../../definition/models/override-date/multi-override-date.model';
import {DateValue} from '../../../models/date-value/date-value.model';
import {MultiOverrideDateSettings} from '../../../models/override-date-settings/multi-override-date-settings.model';
import {DateStore} from '../../../stores';
import {MultiOverrideDateComponent} from './multi-override-date.component';
import {BehaviorSubject} from 'rxjs';
import {OverrideDateConstants} from '../../../constants';
import {AuxRadioInterface} from '@blk/aladdin-angular-components';
import {CoreCommonConstants} from '../../../../core/constants';

describe('MultiOverrideDateComponent', () => {
    let component: MultiOverrideDateComponent;
    let fixture: ComponentFixture<MultiOverrideDateComponent>;

    /**
     * Performs required initialisation before each test is run
     */
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [MultiOverrideDateComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        DateStore.currentMultiFrequencyMaxPeriodsMap$ = new BehaviorSubject({DAILY: 400, WEEKLY: 55, MONTH_END: 26, QUARTER_END: 8, YEAR_END: 2} as any);
        DateStore.currentDate$ = new BehaviorSubject(new DateValue({'calCode': 'GP_HK_STD', 'dateString': false, 'date': '04/20/2020'}));

        fixture = TestBed.createComponent(MultiOverrideDateComponent);
        component = fixture.componentInstance;
        component.multiOverrideDateSettings = new MultiOverrideDateSettings('DAILY', 2, DateValue.newDate(''), DateValue.newDate(''));
        CoreDefinitionStore.multiOverrideDateType = getExpectedSupportedMultiOverrideDateTypes();
    });

    describe('Test setMaxNumberOfPeriods and guardrail', () => {
        it('If token is undefined and if token is not undefined', function () {
                // if there is a guardrail and token is defined
                CoreDefinitionStore.tokens[TokenConstants.EXPLORE_MAX_NUMBER_OF_DATA_POINTS] = 15;
                component.setMaxNumberOfPeriods();
                expect(component.maxNumberOfPeriods).not.toBeUndefined;
                expect(component.maxNumberOfPeriods).toEqual(15);
            });
        });

    describe('Test Component initialization with ngOnInit method', () => {
        it('Component should initialize the properties with appropriate values', async () => {
            CoreDefinitionStore.tokens[TokenConstants.EXPLORE_MAX_NUMBER_OF_DATA_POINTS] = undefined
            component.ngOnInit();

            // Validate multiOverrideDateTypes
            expect(component.multiOverrideDateTypes).toEqual(getExpectedSupportedMultiOverrideDateTypes());

            // Validate supportedMultiOverrideDateTypeOptions
            validateSupportedMultiOverrideDateTypeOptions(component.supportedMultiOverrideDateTypeOptions[0].values);

            // Validate default frequency
            expect(component.supportedMultiOverrideDateTypeOptions[0].values.filter(multiOverrideDateType => multiOverrideDateType.value === component.multiOverrideDateSettings.multiOverrideDateTypeFrequency)[0].isSelected).toBe(true);

            // Validate maxPeriodsMap
            expect(component.maxPeriodsMap).toEqual(DateStore.getMultiFrequencyMaxPeriodsMap());


            // Validate maxNumberOfPeriods

            expect(component.maxNumberOfPeriods).toEqual(DateStore.getMultiFrequencyMaxPeriodsMap()['DAILY']);
        });

        it('should only update maxNumberOfPeriods if it is not provided as a component input prop', () => {
            CoreDefinitionStore.tokens[TokenConstants.EXPLORE_MAX_NUMBER_OF_DATA_POINTS] = undefined
            // provided via input prop
            component.maxNumberOfPeriodsOverride = 12;
            component.ngOnInit();
            expect(component.maxNumberOfPeriods).toEqual(12);

            // not provided via input prop, in map
            component.maxNumberOfPeriodsOverride = undefined;
            component.ngOnInit();
            expect(component.maxNumberOfPeriods).toEqual(DateStore.getMultiFrequencyMaxPeriodsMap()['DAILY']);

            // not provided anywhere
            component.maxNumberOfPeriodsOverride = undefined;
            DateStore.currentMultiFrequencyMaxPeriodsMap$ = new BehaviorSubject({} as any);
            component.ngOnInit();
            expect(component.maxNumberOfPeriods).toEqual(OverrideDateConstants.MIN_MULTI_DATE_OBSERVATIONS);
        });
    });

    describe('Test onFrequencySelectionChanged method', () => {
        it('onFrequencySelectionChanged should change the Frequency value properly', () => {
            CoreDefinitionStore.tokens[TokenConstants.EXPLORE_MAX_NUMBER_OF_DATA_POINTS] = undefined
            component.ngOnInit();
            expect(component.multiOverrideDateSettings.multiOverrideDateTypeFrequency).toEqual('DAILY');
            expect(component.maxNumberOfPeriods).toEqual(400);
            let event = {detail: {value: {value: 'WEEKLY'}}};
            component.onFrequencySelectionChanged(event as CustomEvent);
            expect(component.multiOverrideDateSettings.multiOverrideDateTypeFrequency).toEqual('WEEKLY');
            expect(component.maxNumberOfPeriods).toEqual(55);

            // Validate numberOfObservations are reset to maxNumberOfPeriods if greater
            component.multiOverrideDateSettings.numberOfObservations = 50;
            event = {detail: {value: {value: 'MONTH_END'}}};
            component.onFrequencySelectionChanged(event as CustomEvent);
            expect(component.multiOverrideDateSettings.multiOverrideDateTypeFrequency).toEqual('MONTH_END');
            expect(component.maxNumberOfPeriods).toEqual(26);
            expect(component.multiOverrideDateSettings.numberOfObservations).toEqual(26);

        });
        it('onFrequencySelectionChanged should change the appendReportDate change value properly', () => {
            CoreDefinitionStore.tokens[TokenConstants.EXPLORE_MAX_NUMBER_OF_DATA_POINTS] = undefined
            component.ngOnInit();
            component.showAppendReportDate = true;
            expect(component.multiOverrideDateSettings.multiOverrideDateTypeFrequency).toEqual('DAILY');
            expect(component.maxNumberOfPeriods).toEqual(400);
            component.multiOverrideDateSettings.numberOfObservations = 50;
            let event = {detail: {value: {value: 'MONTH_END'}}};
            component.onFrequencySelectionChanged(event as CustomEvent);
            expect(component.multiOverrideDateSettings.multiOverrideDateTypeFrequency).toEqual('MONTH_END');
            expect(component.maxNumberOfPeriods).toEqual(26);
            expect(component.multiOverrideDateSettings.numberOfObservations).toEqual(26);
            expect(component.multiOverrideDateSettings.appendReportDate).toBeFalsy();
            component.showAppendReportDate = false;
            component.multiOverrideDateSettings.appendReportDate = undefined;
            component.onFrequencySelectionChanged(event as CustomEvent);
            expect(component.multiOverrideDateSettings.appendReportDate).toBeUndefined();
        });
        it('onFrequencySelectionChanged should change the maxNumberOfPeriods for Factor Data Widget', () => {
            component.calledFromFactorDataWidget = true;
            component.ngOnInit();
            expect(component.multiOverrideDateSettings.multiOverrideDateTypeFrequency).toEqual('DAILY');
            expect(component.maxNumberOfPeriods).toEqual(1000);
            let event = {detail: {value: {value: 'WEEKLY'}}};
            component.onFrequencySelectionChanged(event as CustomEvent);
            expect(component.multiOverrideDateSettings.multiOverrideDateTypeFrequency).toEqual('WEEKLY');
            expect(component.maxNumberOfPeriods).toEqual(1000);
            event = {detail: {value: {value: 'MONTH_END'}}};
            component.onFrequencySelectionChanged(event as CustomEvent);
            expect(component.multiOverrideDateSettings.multiOverrideDateTypeFrequency).toEqual('MONTH_END');
            expect(component.maxNumberOfPeriods).toEqual(360);
            event = {detail: {value: {value: 'QUARTER_END'}}};
            component.onFrequencySelectionChanged(event as CustomEvent);
            expect(component.multiOverrideDateSettings.multiOverrideDateTypeFrequency).toEqual('QUARTER_END');
            expect(component.maxNumberOfPeriods).toEqual(120);
            event = {detail: {value: {value: 'YEAR_END'}}};
            component.onFrequencySelectionChanged(event as CustomEvent);
            expect(component.multiOverrideDateSettings.multiOverrideDateTypeFrequency).toEqual('YEAR_END');
            expect(component.maxNumberOfPeriods).toEqual(30);
        });
    });
    describe('Test initializeOverrideTypeOptions', () => {
        beforeEach(() => {
            component.overrideTypeOptions = undefined;
        });
        it('default to by date', () => {
            component.multiOverrideDateSettings.numberOfObservations = 0;
            component.initializeOverrideTypeOptions();
            const overrideTypeOptions = [
                {
                    label: 'By date',
                    eventData: 'BY_DATE',
                    checked: true
                },
                {
                    label: 'Rolling',
                    eventData: 'FIXED',
                    checked: false
                }
            ];
            expect(component.overrideTypeOptions).toEqual(overrideTypeOptions);
            expect(component.selectedOverrideType).toEqual('BY_DATE');
        });
        it('fixed selected', () => {
            component.multiOverrideDateSettings.numberOfObservations = 3;
            component.initializeOverrideTypeOptions();
            const overrideTypeOptions = [
                {
                    label: 'By date',
                    eventData: 'BY_DATE',
                    checked: false
                },
                {
                    label: 'Rolling',
                    eventData: 'FIXED',
                    checked: true
                }
            ];
            expect(component.overrideTypeOptions).toEqual(overrideTypeOptions);
            expect(component.selectedOverrideType).toEqual('FIXED');
        });
    });
    describe('Test onOverrideTypeOptionChanged', () => {
        it('fixed selected', () => {
            jest.spyOn(component.multiOverrideDateSettingsChanged, 'emit');
            component.onOverrideTypeOptionChanged({eventData: 'FIXED'} as AuxRadioInterface);
            expect(component.multiOverrideDateSettings.startDate).toEqual(DateValue.newDate(CoreCommonConstants.EMPTY_STRING));
            expect(component.multiOverrideDateSettings.endDate).toEqual(DateValue.newDate(CoreCommonConstants.EMPTY_STRING));
            expect(component.multiOverrideDateSettings.numberOfObservations).toEqual(OverrideDateConstants.MIN_MULTI_DATE_OBSERVATIONS);
            expect(component.multiOverrideDateSettingsChanged.emit).toHaveBeenCalled();
        });
        it('By date selected', () => {
            component.startDate = DateValue.newDate('01/01/2020');
            component.endDate = DateValue.newDate('01/02/2020');
            jest.spyOn(component.multiOverrideDateSettingsChanged, 'emit');
            component.onOverrideTypeOptionChanged({eventData: 'BY_DATE'} as AuxRadioInterface);
            expect(component.multiOverrideDateSettings.startDate).toEqual(component.startDate);
            expect(component.multiOverrideDateSettings.endDate).toEqual(component.endDate);
            expect(component.multiOverrideDateSettings.numberOfObservations).toBeNull();
            expect(component.multiOverrideDateSettingsChanged.emit).toHaveBeenCalled();
        });
    });
    describe('Test onNumberOfObservationsChanged method', () => {
        it('onNumberOfObservationsChanged should change the value properly', () => {
            expect(component.multiOverrideDateSettings.numberOfObservations).toEqual(2);
            const event = {detail: {value: 20}};
            component.onNumberOfObservationsChanged(event as CustomEvent);
            expect(component.multiOverrideDateSettings.numberOfObservations).toEqual(20);
        });
    });

    it('Test initialize default frequency with multiOverrideDateSettings frequency as undefined', () => {
        component.multiOverrideDateSettings.multiOverrideDateTypeFrequency = undefined;
        component.ngOnInit();
        expect(component.multiOverrideDateSettings.multiOverrideDateTypeFrequency).toStrictEqual('DAILY');
    });

    it('Test initialize date with multiOverrideDateSettings model dates', () => {
        component.multiOverrideDateSettings.startDate = DateValue.newDate('01/01/2020');
        component.multiOverrideDateSettings.endDate = DateValue.newDate('02/01/2020');
        component.initializeDates();
        expect(component.startDate).toStrictEqual(component.multiOverrideDateSettings.startDate);
        expect(component.endDate).toStrictEqual(component.multiOverrideDateSettings.endDate);

        component.multiOverrideDateSettings.startDate = DateValue.newDate('05/05/2020');
        component.multiOverrideDateSettings.endDate = DateValue.newDate('06/06/2020');
        component.initializeDates();
        expect(component.startDate).toStrictEqual(DateValue.newDate('05/05/2020'));
        expect(component.endDate).toStrictEqual(DateValue.newDate('06/06/2020'));
    });

    it('Test onDateChanged', () => {
        component.startDate = DateValue.newDate('04/01/2020');
        component.endDate = DateValue.newDate('05/01/2020');
        jest.spyOn(component.multiOverrideDateSettingsChanged, 'emit');

        component.onDateChanged();
        expect(component.multiOverrideDateSettings.startDate).toEqual(component.startDate);
        expect(component.multiOverrideDateSettings.endDate).toEqual(component.endDate);
        expect(component.multiOverrideDateSettingsChanged.emit).toHaveBeenCalled();
    });

    it('Test onAppendReportDate', () => {
        jest.spyOn(component.multiOverrideDateSettingsChanged, 'emit');
        component.multiOverrideDateSettings.appendReportDate = false;
        component.onAppendReportDate({detail: {value: {checked: true}}} as any)
        expect(component.multiOverrideDateSettings.appendReportDate).toBeTruthy();
        expect(component.multiOverrideDateSettingsChanged.emit).toHaveBeenCalled();
    });

    /**
     * Validates Supported Multi Override Date Type Options
     */
    function validateSupportedMultiOverrideDateTypeOptions(items: ExploreSelectOption[]) {
        const expectedOverrideDateTypes = getExpectedSupportedMultiOverrideDateTypes();
        for (let i = 0; i < items.length; i++) {
            expect(items[i].displayValue).toEqual(expectedOverrideDateTypes[i].label);
            expect(items[i].value).toEqual(expectedOverrideDateTypes[i].value);
        }
    }

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
