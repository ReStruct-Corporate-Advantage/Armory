import {Component} from '@angular/core';
import {CoreWidgetConfigStore, ExpostSettings, ExpostSettingsStore, WidgetConfigUtils} from '@blk/explore-ui-core';
import {isEmpty, isUndefined} from 'lodash';
import {ExpostColumnOption} from '../../../models/column-option/expost-column-option.model';
import {BaseColumnTitleModifiableColumnOptionComponent} from '../base-column-title-modifiable-column-option.component';

/**
 * Component for ex-post column options.
 */
@Component({
    selector: 'explore-core-expost-column-options',
    templateUrl: './expost-column-options.component.html'
})
export class ExpostColumnOptionsComponent extends BaseColumnTitleModifiableColumnOptionComponent<ExpostColumnOption> {
    static readonly OPTION_KEY = ExpostColumnOption.CONFIG_TYPE;
    static readonly LOG_RETURNS_KEY = 'LOG-RETURNS';
    static readonly GENERIC_EXPOST_SETTINGS_ATTRIBUTE = 'GENERIC-EXPOST-SETTINGS';

    includeWidgetDefault = false;
    showLogReturns = false;
    genericExpostSettingsAttribute: any;
    expostColumnModel: ExpostColumnOption;

    /**
     * Initialize this component so it is ready for use..
     */
    protected initializeComponent(): void {
        super.initializeComponent();

        // Check if there is a log return optiosn, and if so then enable this in the ex-post settings.
        const logReturnAttribute = this.option.columnOptionAttributes.filter((optionAttribute) => optionAttribute.key === ExpostColumnOptionsComponent.LOG_RETURNS_KEY)[0];
        this.showLogReturns = !isEmpty(logReturnAttribute);
        // Checks if widget default option is needed in selectbox or not
        this.includeWidgetDefault = WidgetConfigUtils.isExpostWidget(CoreWidgetConfigStore.getCurrentWidgetConfigType());
        this.genericExpostSettingsAttribute = this.option.columnOptionAttributes.filter((optionAttribute) => optionAttribute.key === ExpostColumnOptionsComponent.GENERIC_EXPOST_SETTINGS_ATTRIBUTE)[0];
        this.expostColumnModel = new ExpostColumnOption();
        this.expostColumnModel.expostSettings = this.optionValue.expostSettings;

        // Update timePeriodName of sampling and statisticPeriod
        if (this.expostColumnModel.expostSettings.samplingPeriod) {
            this.expostColumnModel.expostSettings.samplingPeriod.timePeriodName = ExpostSettingsStore.supportedSamplingPeriods.filter((timePeriod) => timePeriod.shortName === this.expostColumnModel.expostSettings.samplingPeriod.shortName && timePeriod.numberOfPeriods === this.expostColumnModel.expostSettings.samplingPeriod.numberOfPeriods)[0].timePeriodName;
        }
        if (!isEmpty(this.expostColumnModel.expostSettings.statisticPeriods.length)) {
            this.expostColumnModel.expostSettings.statisticPeriods[0].timePeriodName = ExpostSettingsStore.supportedStatisticPeriods.filter((timePeriod) => timePeriod.shortName === this.expostColumnModel.expostSettings.statisticPeriods[0].shortName && timePeriod.numberOfPeriods === this.expostColumnModel.expostSettings.statisticPeriods[0].numberOfPeriods)[0].timePeriodName;
        }

        // Update column title
        this.updateColumnTitle();
    }

    public onExpostSettingsChange(): void {
        this.updateColumnTitle();
    }

    /**
     * Get the type of option value this component should create.
     */
    protected getOptionValueConfigType(): string {
        return ExpostColumnOption.CONFIG_TYPE;
    }

}
