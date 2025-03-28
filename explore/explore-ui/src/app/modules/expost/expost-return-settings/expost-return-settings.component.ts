import {Component, Input, OnInit} from '@angular/core';
import {
    AuxRadioGroupChangedDetailInterface,
    AuxRadioInterface,
    AuxSelectOption,
    AuxSelectSelectionChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {ExploreSelectOption, ExploreSelectOptionGroup, ExpostSettingsStore, TimePeriod} from '@blk/explore-ui-core';
import {find} from 'lodash';
import {ExpostReturnSettings} from '../../../models/expostSettings/expost-return-settings.model';

@Component({
    selector: 'app-expost-return-settings',
    templateUrl: './expost-return-settings.component.html',
    styleUrls: ['./expost-return-settings.component.scss']
})
/**
 * Component for expost return settings
 */
export class ExpostReturnSettingsComponent implements OnInit {

    static readonly RETURN_TYPES = {
        NET_RETURNS: 'Net returns',
        GROSS_RETURNS: 'Gross returns',
        GROSS_AND_NET_RETURNS: 'Gross and Net returns'
    };

    @Input() expostReturnSettings: ExpostReturnSettings;

    /**
     * List of supported statistc periods for expost returns
     */
    supportedExpostReturnStatisticPeriods: Array<TimePeriod> = [];
    displayDataForReturnStatisticPeriod: ExploreSelectOptionGroup[];
    displayDataForNetReturns: AuxRadioInterface[];

    /**
     * Init hook
     */
    ngOnInit() {
        if (!this.expostReturnSettings) {
            return;
        }
        this.initialize();
    }

    /**
     * Initialize supportedExpostReturnStatisticPeriods and displayDataForReturnStatisticPeriod
     */
    initialize() {
        this.supportedExpostReturnStatisticPeriods = ExpostSettingsStore.getSupportedReturnStatisticPeriods();
        this.displayDataForReturnStatisticPeriod = [new ExploreSelectOptionGroup(
            this.supportedExpostReturnStatisticPeriods.map(statisticPeriod => new ExploreSelectOption(statisticPeriod.timePeriodName, statisticPeriod.timePeriodName))
        )];
        const defaultStatisticPeriod = this.displayDataForReturnStatisticPeriod[0].values.filter(statisticPeriod => statisticPeriod.value === this.expostReturnSettings.expostSettings.statisticPeriods[0].timePeriodName);
        if (defaultStatisticPeriod.length > 0) {
            defaultStatisticPeriod[0].isSelected = true;
        } else {
            this.displayDataForReturnStatisticPeriod[0].values[0].isSelected = true;
        }

        this.displayDataForNetReturns = [
            {label: ExpostReturnSettingsComponent.RETURN_TYPES.GROSS_RETURNS, checked: !(this.expostReturnSettings.expostSettings.isNetReturns || this.expostReturnSettings.expostSettings.isGrossAndNetReturns), disabled: false},
            {label: ExpostReturnSettingsComponent.RETURN_TYPES.NET_RETURNS, checked: this.expostReturnSettings.expostSettings.isNetReturns, disabled: false},
            {label: ExpostReturnSettingsComponent.RETURN_TYPES.GROSS_AND_NET_RETURNS, checked: this.expostReturnSettings.expostSettings.isGrossAndNetReturns, disabled: false}
        ];
    }

    /**
     * Method invoked when statistic period is changed by the user
     */
    changeStatisticPeriod(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        this.expostReturnSettings.expostSettings.statisticPeriods = [];
        this.expostReturnSettings.expostSettings.statisticPeriods.push(find(this.supportedExpostReturnStatisticPeriods, {timePeriodName: (event.detail.value as AuxSelectOption).value as string}));
    }

    /**
     * Show bench change handler
     */
    updateShowBench(value: boolean) {
        this.expostReturnSettings.showBench = value;
    }

    /**
     * Show active change handlerapp
     */
    updateShowActive(value: boolean) {
        this.expostReturnSettings.showActive = value;
    }

    /**
     * Update the state of Net Returns and Gross Returns checkbox
     */
    updateNetReturns(event: CustomEvent<AuxRadioGroupChangedDetailInterface>) {
        this.expostReturnSettings.expostSettings.isNetReturns = this.expostReturnSettings.expostSettings.isGrossAndNetReturns = false;
        switch (event.detail.value.label) {
            case ExpostReturnSettingsComponent.RETURN_TYPES.GROSS_AND_NET_RETURNS:
                this.expostReturnSettings.expostSettings.isGrossAndNetReturns = true;
                break;
            case ExpostReturnSettingsComponent.RETURN_TYPES.NET_RETURNS:
                this.expostReturnSettings.expostSettings.isNetReturns = true;
                break;
        }
    }
}
