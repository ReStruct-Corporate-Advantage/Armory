import {isEmpty} from 'lodash';
import {ExpostSettingsComponent} from './expost-settings.component';
import {ExploreSelectOption} from '../../../ui/models/explore-select-option.model';
import {ExploreSelectOptionGroup} from '../../../ui/models/explore-select-option-group.model';
import {ExpostSettings} from '../../models/expost-settings.model';
import {TimePeriod} from '../../../date/models/time-period/time-period.model';
import {ExpostSettingsStore} from '../../expost-settings.store';

describe('ExpostSettingsComponent', () => {
    let ctrl: ExpostSettingsComponent;
    const samplingPeriod = new TimePeriod('1 Month', 1, 'Months');
    const statisticPeriod = new TimePeriod('1 Year', 1, 'Days');

    beforeEach(() => {
        ctrl = new ExpostSettingsComponent();

        ctrl.expostSettings = new ExpostSettings();
        ctrl.expostSettings.samplingPeriod = samplingPeriod;
        ctrl.expostSettings.statisticPeriods = [statisticPeriod];
        ExpostSettingsStore.supportedSamplingPeriods = getSamplingPeriods();
        ExpostSettingsStore.supportedStatisticPeriods = getStatisticPeriods();
        ctrl.initialize();
    });

    it('Test control initialises', () => {
        expect(ctrl).not.toBeUndefined();
        expect(ctrl).not.toBeNull();

        const expostSettings = new ExpostSettings();
        expostSettings.samplingPeriod = samplingPeriod;
        expostSettings.statisticPeriods = [statisticPeriod];
        expect(ctrl.expostSettings.equals(expostSettings));
        expect(JSON.stringify(ctrl.supportedStatisticPeriods)).toEqual(JSON.stringify(getStatisticPeriods()));
        expect(JSON.stringify(ctrl.supportedSamplingPeriods)).toEqual(JSON.stringify(getSamplingPeriods()));

        expect(ctrl.displayDataForSamplingPeriod[0].values.length).toBe(3);
        expect(ctrl.displayDataForStatisticPeriod[0].values.length).toBe(13);

        // validate when samplingPeriod or statisticsPeriod is undefined
        ctrl.expostSettings = new ExpostSettings();
        ctrl.initialize();
        expect(ctrl.displayDataForSamplingPeriod[0].values.length).toBe(3);
        expect(ctrl.displayDataForStatisticPeriod[0].values.length).toBe(13);
    });

    it('Test control initialises - with widget defaults', () => {
        // When not a column option the widget default should not be set.
        ctrl.expostSettings = new ExpostSettings();
        ctrl.includeWidgetDefault = false;
        ctrl.initialize();
        expect(containsWidgetDefault(ctrl.displayDataForSamplingPeriod)).toBeFalsy();
        expect(containsWidgetDefault(ctrl.displayDataForStatisticPeriod)).toBeFalsy();

        // When a column option the widget default should not be set.
        ctrl.expostSettings = new ExpostSettings();
        ctrl.includeWidgetDefault = true;
        ctrl.initialize();
        expect(containsWidgetDefault(ctrl.displayDataForSamplingPeriod)).toBeTruthy();
        expect(containsWidgetDefault(ctrl.displayDataForStatisticPeriod)).toBeTruthy();
    });

    /**
     * Utility function to check if the widget default is in the list.
     */
    function containsWidgetDefault(options: ExploreSelectOptionGroup[]): boolean {
        const matchedItems = options[0].values.filter((item: ExploreSelectOption) => item.value === ExpostSettingsComponent.WIDGET_DEFAULT);
        return !isEmpty(matchedItems);
    }

    it('Test changeSamplingPeriod', () => {
        ctrl.changeSamplingPeriod('1 Week');
        expect(ctrl.expostSettings.samplingPeriod.equals(new TimePeriod('1 Week', 1, 'Weeks'))).toBeTruthy();
    });

    it('Test chooseStatisticPeriods', () => {
        // validate when single period is chosen
        let event = {detail: {value: {value: '1 Week'}}} as CustomEvent;
        ctrl.chooseStatisticPeriods(event);
        expect(ctrl.expostSettings.statisticPeriods.length).toBe(1);
        expect(ctrl.expostSettings.statisticPeriods[0].equals(new TimePeriod('1 Week', 1, 'Weeks')));

        // validate when multiple periods are chosen
        event = {detail: {value: [{value: '1 Day'}, {value: '1 Week'}]}} as CustomEvent;
        ctrl.chooseStatisticPeriods(event);
        expect(ctrl.expostSettings.statisticPeriods.length).toBe(2);
        expect(ctrl.expostSettings.statisticPeriods[1].equals(new TimePeriod('1 Day', 1, 'Days')));
        expect(ctrl.expostSettings.statisticPeriods[1].equals(new TimePeriod('1 Week', 1, 'Weeks')));
    });

    it('Use Log Returns True/False Case', () => {
        ctrl.updateLogReturns(true);
        expect(ctrl.expostSettings.isLogNormal).toBe(true);

        ctrl.updateLogReturns(false);
        expect(ctrl.expostSettings.isLogNormal).toBe(false);
    });

    it(' test updateNetReturns', () => {
        ctrl.expostSettings.isNetReturns = false;
        ctrl.displayDataForNetReturns = [
            {label: 'Gross returns', checked: false, disabled: false},
            {label: 'Net returns', checked: true, disabled: false}
        ];
        ctrl.updateNetReturns();
        expect(ctrl.expostSettings.isNetReturns).toBe(true);
        ctrl.displayDataForNetReturns = [
            {label: 'Gross returns', checked: true, disabled: false},
            {label: 'Net returns', checked: false, disabled: false}
        ];
        ctrl.updateNetReturns();
        expect(ctrl.expostSettings.isNetReturns).toBe(false);
    });

    it('test updateCategoryBreakdown', () => {
        ctrl.updateCategoryBreakdown(true);
        expect(ctrl.expostSettings.categoryBreakdown).toBe(true);

        ctrl.updateCategoryBreakdown(false);
        expect(ctrl.expostSettings.categoryBreakdown).toBe(false);
    });

    /**
     * * Expected statistic periods
     */
    function getStatisticPeriods(): Array<TimePeriod> {
        const expectedStatisticPeriods = [];
        expectedStatisticPeriods.push(new TimePeriod('1 Day', 1, 'Days'));
        expectedStatisticPeriods.push(new TimePeriod('1 Week', 1, 'Weeks'));
        expectedStatisticPeriods.push(new TimePeriod('1 Month', 1, 'Months'));
        expectedStatisticPeriods.push(new TimePeriod('1 Quarter', 1, 'Quarters'));
        expectedStatisticPeriods.push(new TimePeriod('1 Year', 1, 'Years'));
        expectedStatisticPeriods.push(new TimePeriod('2 Years', 2, 'Years'));
        expectedStatisticPeriods.push(new TimePeriod('3 Years', 3, 'Years'));
        expectedStatisticPeriods.push(new TimePeriod('4 Years', 4, 'Years'));
        expectedStatisticPeriods.push(new TimePeriod('5 Years', 5, 'Years'));
        expectedStatisticPeriods.push(new TimePeriod('7 Years', 7, 'Years'));
        expectedStatisticPeriods.push(new TimePeriod('10 Years', 10, 'Years'));
        expectedStatisticPeriods.push(new TimePeriod('20 Years', 20, 'Years'));
        expectedStatisticPeriods.push(new TimePeriod('Inception to Date', 1, 'ITD'));

        return expectedStatisticPeriods;
    }

    /**
     * * Expected sampling periods
     */
    function getSamplingPeriods(): Array<TimePeriod> {
        const expectedSamplingPeriods = [];
        expectedSamplingPeriods.push(new TimePeriod('1 Day', 1, 'Days'));
        expectedSamplingPeriods.push(new TimePeriod('1 Week', 1, 'Weeks'));
        expectedSamplingPeriods.push(new TimePeriod('1 Month', 1, 'Months'));
        return expectedSamplingPeriods;
    }
});
