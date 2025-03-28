import {
    ColumnOptionMetaDataInterface,
    CoreWidgetConfigStore,
    ExpostSettings,
    ExpostSettingsStore,
    TimePeriod,
    WidgetConfigType
} from '@blk/explore-ui-core';
import {BehaviorSubject} from 'rxjs';
import {ExpostColumnOption} from '../../../models/column-option/expost-column-option.model';
import {ColumnOptionTestBed} from '../../../test-utils/column-option-test-bed.testutil';
import {ExpostColumnOptionsComponent} from './expost-column-options.component';

/**
 * Test class for the ex-post column options component.
 */
describe('Ex-post column options component', () => {

    let testBed: ColumnOptionTestBed<ExpostColumnOptionsComponent, ExpostColumnOption>;

    beforeEach(() => {
        // Create the mocked column option to validate this control.
        const mockedOption: ColumnOptionMetaDataInterface = {
            columnOptionConfigType: 'expostSettings',
            columnOptionTitle: 'Expost settings',
            columnOptionKey: 'expostSettings',
            columnOptionAttributes: [{
                title: 'Generic Expost Settings',
                key: 'GENERIC-EXPOST-SETTINGS',
                dataType: 'S'
            }, {
                title: 'Use Log Returns',
                key: 'LOG-RETURNS',
                dataType: 'B'
            }]
        };

        const columnOption = new ExpostColumnOption();
        columnOption.initialize(undefined);

        CoreWidgetConfigStore.currentWidgetConfigType$ = new BehaviorSubject<string>(WidgetConfigType.PGS);
        const expostSettings = new ExpostSettings();
        expostSettings.samplingPeriod = new TimePeriod('1 Month', 1, 'Months');
        expostSettings.statisticPeriods = [new TimePeriod('1 Day', 1, 'Days')];
        columnOption.expostSettings = expostSettings;

        const expostSamplingPeriods = [
            {displayName: '1 Month', numberOfPeriods: 1, timePeriodShortName: 'Months'},
            {displayName: '1 Week', numberOfPeriods: 1, timePeriodShortName: 'Weeks'},
        ];
        const expostStatisticPeriods = [
            {displayName: '1 Day', numberOfPeriods: 1, timePeriodShortName: 'Days'},
            {displayName: '2 Years', numberOfPeriods: 2, timePeriodShortName: 'Years'},
            {displayName: '3 Years', numberOfPeriods: 3, timePeriodShortName: 'Years'},
        ];

        ExpostSettingsStore.setSupportedSettings(expostSamplingPeriods, expostStatisticPeriods);
        // Create the testbed for testing the component.
        testBed = new ColumnOptionTestBed<ExpostColumnOptionsComponent, ExpostColumnOption>(ExpostColumnOptionsComponent, columnOption, mockedOption);
    });

    it('check if component is initialized correctly', () => {
        expect(testBed.component.showLogReturns).toBeTruthy();
        expect(testBed.component.genericExpostSettingsAttribute).not.toBeUndefined();
        expect(testBed.component.includeWidgetDefault).toBeFalsy();
        expect(testBed.component.expostColumnModel.expostSettings.samplingPeriod).not.toBeUndefined();
        expect(testBed.component.expostColumnModel.expostSettings.statisticPeriods).not.toBeUndefined();
        expect(testBed.component.expostColumnModel.expostSettings.samplingPeriod.timePeriodName).not.toBeUndefined();
        expect(testBed.component.expostColumnModel.expostSettings.statisticPeriods[0].timePeriodName).not.toBeUndefined();
    });
});
