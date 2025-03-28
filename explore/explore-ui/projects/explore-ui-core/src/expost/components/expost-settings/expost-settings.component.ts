import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AuxRadioInterface, AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {find, isArray, isEmpty} from 'lodash';
import {TimePeriod} from '../../../date/models/time-period/time-period.model';
import {ExploreSelectOptionGroup} from '../../../ui/models/explore-select-option-group.model';
import {ExploreSelectOption} from '../../../ui/models/explore-select-option.model';
import {ExpostSettingsStore} from '../../expost-settings.store';
import {ExpostSettings} from '../../models/expost-settings.model';

/**
 * Expost Settings Component
 */
@Component({
    selector: 'explore-core-expost-settings',
    templateUrl: './expost-settings.component.html',
    styleUrls: ['./expost-settings.component.scss']
})
export class ExpostSettingsComponent implements OnInit {

    static readonly WIDGET_DEFAULT = 'Widget Default';

    /**
     * Flag indicating is log returns checkbox is applicable and needs to be shown ot not
     */
    @Input() showLogReturns: boolean;

    /**
     * Flag indicating if net returns radio buttons are applicable and need to be shown or not
     */
    @Input() showNetReturns: boolean;

    /**
     * Flag indicating if category breakdown option needs to be shown
     */
    @Input() showCategoryBreakdown: boolean;

    /**
     * Flag indicating if multiple statisticPeriods can be chosen
     */
    @Input() canHaveMultipleStatisticPeriods: boolean;

    /**
     * Expost settings
     */
    @Input() expostSettings: ExpostSettings;

    /**
     * This enables the "Widget Default" option in the statistic period.
     */
    @Input() includeWidgetDefault ? = false;

    @Output() expostSettingsChange = new EventEmitter<TimePeriod>();

    /**
     * Supported Sampling Periods
     */
    supportedSamplingPeriods: TimePeriod[];

    /**
     * Supported Statistics Periods
     */
    supportedStatisticPeriods: TimePeriod[];

    displayDataForSamplingPeriod: ExploreSelectOptionGroup[];
    displayDataForStatisticPeriod: ExploreSelectOptionGroup[];
    displayDataForNetReturns: AuxRadioInterface[];

    /**
     * Set display data for select box
     */
    private static setDisplayDataForSelectBox(items: TimePeriod[]): ExploreSelectOptionGroup[] {
        const selectBoxItems = [new ExploreSelectOptionGroup()];
        for (const item of items) {
            selectBoxItems[0].values.push(new ExploreSelectOption(item.timePeriodName, item.timePeriodName));
        }
        return selectBoxItems;
    }

    /**
     * Adds the widget default option to the display options.
     */
    private static addWidgetDefaultItem(displayData: ExploreSelectOption[]): void {
        displayData.push(new ExploreSelectOption(ExpostSettingsComponent.WIDGET_DEFAULT, ExpostSettingsComponent.WIDGET_DEFAULT, true));
    }

    /**
     * Initialise the control.
     */
    ngOnInit() {
        if (!this.expostSettings) {
            return;
        }
        this.initialize();
    }

    /**
     * Initialize supportedSamplingPeriods and supportedStatisticPeriods
     */
    initialize() {
        this.supportedSamplingPeriods = ExpostSettingsStore.supportedSamplingPeriods;
        this.supportedStatisticPeriods = ExpostSettingsStore.supportedStatisticPeriods;

        // Prepare display list for dropdown
        this.displayDataForSamplingPeriod = ExpostSettingsComponent.setDisplayDataForSelectBox(this.supportedSamplingPeriods);
        this.setDefaultSamplingPeriod(this.displayDataForSamplingPeriod[0].values);

        // Prepare display list for dropdown
        this.displayDataForStatisticPeriod = ExpostSettingsComponent.setDisplayDataForSelectBox(this.supportedStatisticPeriods);
        this.setDefaultStatisticPeriods(this.displayDataForStatisticPeriod[0].values);

        this.displayDataForNetReturns = [
            {label: 'Gross returns', checked: !this.expostSettings.isNetReturns, disabled: false},
            {label: 'Net returns', checked: this.expostSettings.isNetReturns, disabled: false}
        ];
    }

    /**
     * Set default sampling period
     */
    private setDefaultSamplingPeriod(displayData: ExploreSelectOption[]): void {
        if (this.expostSettings.samplingPeriod) {
            displayData.filter(data => data.value === this.expostSettings.samplingPeriod.timePeriodName)[0].isSelected = true;
        } else if (this.includeWidgetDefault) {
            // Only if this is a column option then we should also add a widget default option.
            ExpostSettingsComponent.addWidgetDefaultItem(displayData);
        }
    }

    /**
     * Set default sampling period
     */
    private setDefaultStatisticPeriods(displayData: ExploreSelectOption[]) {
        if (!isEmpty(this.expostSettings.statisticPeriods)) {
            this.expostSettings.statisticPeriods.forEach(statisticPeriod =>
                displayData.filter(data => data.value === statisticPeriod.timePeriodName)[0].isSelected = true
            );
        } else if (this.includeWidgetDefault) {
            // Only if this is a column option then we should also add a widget default option.
            ExpostSettingsComponent.addWidgetDefaultItem(displayData);
        }
    }

    /**
     * Method called when sampling period is changed
     */
    changeSamplingPeriod(samplePeriod: string) {
        this.expostSettings.samplingPeriod = find(this.supportedSamplingPeriods, {timePeriodName: samplePeriod});
        this.expostSettingsChange.emit();
    }

    /**
     * Method called when statistic period is changed
     */
    chooseStatisticPeriods(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        this.expostSettings.statisticPeriods = [];

        const items = isArray(event.detail.value) ? event.detail.value : [event.detail.value];
        items.forEach((selectedStatistic: ExploreSelectOption) => {
            this.expostSettings.statisticPeriods.push(find(this.supportedStatisticPeriods, {timePeriodName: selectedStatistic.value as string}));
        });
        this.expostSettingsChange.emit();
    }

    /**
     * Update the state of Log Returns checkbox
     */
    updateLogReturns(value: boolean) {
        this.expostSettings.isLogNormal = value;
        this.expostSettingsChange.emit();
    }

    /**
     * Update the state of Net Returns and Gross Returns checkbox
     */
    updateNetReturns() {
        this.expostSettings.isNetReturns = this.displayDataForNetReturns[1].checked;
        this.expostSettingsChange.emit();
    }

    /**
     * Update the state of Category Breakdown checkbox
     */
    updateCategoryBreakdown(value: boolean) {
        this.expostSettings.categoryBreakdown = value;
    }

}
