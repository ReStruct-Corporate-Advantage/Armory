import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ExpostSettings, TimePeriod} from '@blk/explore-ui-core';
import {find} from 'lodash';
import {ExpostReturnSettings} from '../../../models/expostSettings/expost-return-settings.model';
import {ExpostReturnSettingsComponent} from './expost-return-settings.component';

describe('ExpostReturnSettingsComponent', () => {
    let component: ExpostReturnSettingsComponent;
    let fixture: ComponentFixture<ExpostReturnSettingsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ExpostReturnSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ExpostReturnSettingsComponent);
        component = fixture.componentInstance;
        component.expostReturnSettings = new ExpostReturnSettings();
        component.expostReturnSettings.timePeriod = new TimePeriod('1 Year', 1, 'Years');
        component.expostReturnSettings.expostSettings = new ExpostSettings();
        component.expostReturnSettings.expostSettings.statisticPeriods[0] = new TimePeriod('1 Quarter', 1, 'Quarters');
    });

    describe('Test Component initialization with ngOnInit method', () => {
        it('Component should initialize with appropriate values', () => {
            component.ngOnInit();
            expect(component.supportedExpostReturnStatisticPeriods).toEqual(getExpectedExpostReturnStatisticPeriods());
            expect(component.displayDataForReturnStatisticPeriod[0].values.length).toBe(2);
            // validate for default statistic period 1 Quarter
            const selectedOption = find(component.displayDataForReturnStatisticPeriod[0].values, {value: '1 Quarter'});
            expect(selectedOption.isSelected).toBe(true);
            // validate for default statistic period 1 Month
            component.expostReturnSettings.expostSettings.statisticPeriods[0] = new TimePeriod('1 Year', 1, 'Years');
            component.ngOnInit();
            expect(component.displayDataForReturnStatisticPeriod[0].values[0].isSelected).toBe(true);
        });
    });

    describe('Test changeStatisticPeriod method', () => {
        it('should update the expostSettings.statisticPeriods with appropriate value', () => {
            component.ngOnInit();
            expect(component.expostReturnSettings.expostSettings.statisticPeriods[0].equals(new TimePeriod('1 Quarter', 1, 'Quarters')));
            const event = {detail: {value: {value: '1 Month'}}} as CustomEvent;
            component.changeStatisticPeriod(event);
            expect(component.expostReturnSettings.expostSettings.statisticPeriods.length).toBe(1);
            expect(component.expostReturnSettings.expostSettings.statisticPeriods[0].equals(new TimePeriod('1 Month', 1, 'Months')));
        });
    });

    describe('Test Show bench/active methods', () => {
        it('test updateShowBench', () => {
            component.updateShowBench(true);
            expect(component.expostReturnSettings.showBench).toBe(true);
            component.updateShowBench(false);
            expect(component.expostReturnSettings.showBench).toBe(false);
        });

        it('test updateShowActive', () => {
            component.updateShowActive(true);
            expect(component.expostReturnSettings.showActive).toBe(true);

            component.updateShowActive(false);
            expect(component.expostReturnSettings.showActive).toBe(false);
        });
    });

    it(' test updateNetReturns', () => {
        component.expostReturnSettings.expostSettings.isNetReturns = false;
        component.displayDataForNetReturns = [
            {label: 'Gross returns', checked: false, disabled: false},
            {label: 'Net returns', checked: true, disabled: false},
            {label: 'Gross and Net returns', checked: false, disabled: false}
        ];
        component.updateNetReturns({detail: {value: {label: 'Net returns'}}} as any);
        expect(component.expostReturnSettings.expostSettings.isNetReturns).toBe(true);
        expect(component.expostReturnSettings.expostSettings.isGrossAndNetReturns).toBe(false);
        component.displayDataForNetReturns = [
            {label: 'Gross returns', checked: true, disabled: false},
            {label: 'Net returns', checked: false, disabled: false},
            {label: 'Gross and Net returns', checked: false, disabled: false}
        ];
        component.updateNetReturns({detail: {value: {label: 'Gross returns'}}} as any);
        expect(component.expostReturnSettings.expostSettings.isNetReturns).toBe(false);
        expect(component.expostReturnSettings.expostSettings.isGrossAndNetReturns).toBe(false);
        component.displayDataForNetReturns = [
            {label: 'Gross returns', checked: false, disabled: false},
            {label: 'Net returns', checked: false, disabled: false},
            {label: 'Gross and Net returns', checked: true, disabled: false}
        ];
        component.updateNetReturns({detail: {value: {label: 'Gross and Net returns'}}} as any);
        expect(component.expostReturnSettings.expostSettings.isNetReturns).toBe(false);
        expect(component.expostReturnSettings.expostSettings.isGrossAndNetReturns).toBe(true);
    });

    /**
     * * Expected expost return statistic periods
     */
    function getExpectedExpostReturnStatisticPeriods(): Array<TimePeriod> {
        const supportedStatisticPeriods: Array<TimePeriod> = [];
        supportedStatisticPeriods.push(new TimePeriod('1 Month', 1, 'Months'));
        supportedStatisticPeriods.push(new TimePeriod('1 Quarter', 1, 'Quarters'));
        return supportedStatisticPeriods;
    }
});
