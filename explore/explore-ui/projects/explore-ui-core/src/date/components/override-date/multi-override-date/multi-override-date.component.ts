import {
    AuxCheckboxChangedDetailInterface, AuxNotificationStyleEnum,
    AuxNumericStepperValueChangedDetailInterface,
    AuxRadioInterface,
    AuxSelectOption,
    AuxSelectSelectionChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {cloneDeep, isNil} from 'lodash';
import {CoreCommonConstants} from '../../../../core/constants';
import {ExploreSelectOptionGroup} from '../../../../ui/models/explore-select-option-group.model';
import {ExploreSelectOption} from '../../../../ui/models/explore-select-option.model';
import {OverrideDateConstants} from '../../../constants';
import {DateValue} from '../../../models/date-value/date-value.model';
import {MultiOverrideDate} from '../../../../definition/models/override-date/multi-override-date.model';
import {MultiOverrideDateSettings} from '../../../models/override-date-settings/multi-override-date-settings.model';
import {DateStore} from '../../../stores';
import {CoreDefinitionStore} from '../../../../definition/core-definition.store';
import {TokenConstants} from '../../../../definition/token/token.constants';
import {TimeSeriesFrequency, OverrideTypeOptions} from './enums';
import {CommonUtils} from '../../../../core/utils';

@Component({
    selector: 'explore-core-multi-override-date',
    templateUrl: './multi-override-date.component.html',
    styleUrls: ['./multi-override-date.component.scss']
})

/**
 * Component for the Multi Override Date
 */
export class MultiOverrideDateComponent implements OnInit {
    @Input() multiOverrideDateSettings: MultiOverrideDateSettings;
    // Override for the maximum number of periods allowed
    @Input() maxNumberOfPeriodsOverride?: number;

    @Input() showAppendReportDate?: boolean;

    @Input() calledFromFactorDataWidget = false;

    @Input() defaultMultiDateObservations: number;

    @Input() isForClimateDecompColumn?: boolean;

    // EventEmitter to emit an event when multi override date settings are changed
    @Output() multiOverrideDateSettingsChanged = new EventEmitter<void>();

    // Supported override date types
    multiOverrideDateTypes: MultiOverrideDate[];
    supportedMultiOverrideDateTypeOptions: ExploreSelectOptionGroup[];

    // Map of max number of periods supported for each frequency
    maxPeriodsMap: Map<string, number>;
    // Maximum number of periods allowed
    maxNumberOfPeriods?: number;

    selectedFrequency = OverrideDateConstants.SELECTED_FREQUENCY_LABEL;

    startDate: DateValue;
    endDate: DateValue;

    overrideTypeOptions: AuxRadioInterface[];

    selectedOverrideType: string;

    dateShortcuts = OverrideDateConstants.DATE_SHORTCUTS;

    overrideTypeOptionsEnum = OverrideTypeOptions;
    showMaxNumberOfPeriodsOverriddenNotification = false;
    public notificationToastConfig = [{
        id: CommonUtils.generateUniqueIdAsString(),
        message: OverrideDateConstants.MAX_OVERRIDES_EXCEEDED_WARNING_MESSAGE,
        toastTimeout: 5000,
        notificationStyle: AuxNotificationStyleEnum.WARNING,
    }];

    /**
     * Init hook
     */
    ngOnInit() {
        this.multiOverrideDateTypes = cloneDeep(CoreDefinitionStore.multiOverrideDateType);
        this.initializeDates();
        this.initializeMultiOverrideDateTypeOptions();
        this.initializeDefaultFrequency();
        this.initializeMaxNumberOfPeriods();
        this.initializeOverrideTypeOptions();
    }

    initializeOverrideTypeOptions(): void {
        this.selectedOverrideType = !this.calledFromFactorDataWidget && !this.multiOverrideDateSettings.numberOfObservations ? OverrideTypeOptions.BY_DATE : OverrideTypeOptions.FIXED;
        if (!this.calledFromFactorDataWidget) {
            this.overrideTypeOptions = [
                {
                    label: 'By date',
                    eventData: OverrideTypeOptions.BY_DATE,
                    checked: this.selectedOverrideType === OverrideTypeOptions.BY_DATE,
                },
                {
                    label: 'Rolling',
                    eventData: OverrideTypeOptions.FIXED,
                    checked: this.selectedOverrideType === OverrideTypeOptions.FIXED,
                }
            ];
        }
    }

    onOverrideTypeOptionChanged(option: AuxRadioInterface): void {
        this.selectedOverrideType = option.eventData;
        if (this.selectedOverrideType === OverrideTypeOptions.FIXED) {
            this.multiOverrideDateSettings.startDate = DateValue.newDate(CoreCommonConstants.EMPTY_STRING);
            this.multiOverrideDateSettings.endDate = DateValue.newDate(CoreCommonConstants.EMPTY_STRING);
            this.multiOverrideDateSettings.numberOfObservations = this.defaultMultiDateObservations || OverrideDateConstants.MIN_MULTI_DATE_OBSERVATIONS;
            this.multiOverrideDateSettingsChanged.emit();
        } else {
            this.onDateChanged();
        }
    }

    initializeDates(): void {
        const portfolioDate = DateStore.getCurrentDate();
        if (isNil(this.multiOverrideDateSettings.startDate) || 
           (!this.multiOverrideDateSettings.startDate.date && !this.multiOverrideDateSettings.startDate.dateStringValue)) {
            this.startDate = new DateValue(portfolioDate);
        } else {
            this.startDate = new DateValue(this.multiOverrideDateSettings.startDate);
        }
        if (isNil(this.multiOverrideDateSettings.endDate) || 
           (!this.multiOverrideDateSettings.endDate.date && !this.multiOverrideDateSettings.endDate.dateStringValue)) {
           this.endDate = new DateValue(portfolioDate);
        } else {
            this.endDate = new DateValue(this.multiOverrideDateSettings.endDate);
        }
    }

    /**
     * Initialize Supported override date types
     */
    private initializeMultiOverrideDateTypeOptions(): void {
        this.supportedMultiOverrideDateTypeOptions = [new ExploreSelectOptionGroup(this.multiOverrideDateTypes.map(multiOverrideDateType => new ExploreSelectOption(multiOverrideDateType.getDisplayName(), multiOverrideDateType.value)))];
    }

    /**
     * Set the default frequency if provided
     */
    private initializeDefaultFrequency(): void {
        if (!this.multiOverrideDateSettings.multiOverrideDateTypeFrequency) {
            this.multiOverrideDateSettings.multiOverrideDateTypeFrequency = TimeSeriesFrequency.DAILY;
        }
        this.supportedMultiOverrideDateTypeOptions[0].values.filter(multiOverrideDateType => multiOverrideDateType.value === this.multiOverrideDateSettings.multiOverrideDateTypeFrequency)[0].isSelected = true;
    }

    /**
     * Initialize maxPeriodsMap and maxNumberOfPeriods
     */
    private initializeMaxNumberOfPeriods(): void {
        this.maxPeriodsMap = DateStore.getMultiFrequencyMaxPeriodsMap();
        this.setMaxNumberOfPeriods();
    }

    /**
     * Frequency selection handler
     */
    onFrequencySelectionChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.multiOverrideDateSettings.multiOverrideDateTypeFrequency = (event.detail.value as AuxSelectOption).value;
        this.setMaxNumberOfPeriods();
        this.checkNumberOfObservations();
        if (this.showAppendReportDate && isNil(this.multiOverrideDateSettings.appendReportDate)) {
            this.updateAppendReportDate(false);
        }
        this.multiOverrideDateSettingsChanged.emit();
    }

    /**
     * Check if numberOfObservations are greater than max number of periods as per the frequency selected
     */
    private checkNumberOfObservations(): void {
        this.showMaxNumberOfPeriodsOverriddenNotification = false;
        if (this.multiOverrideDateSettings.numberOfObservations > this.maxNumberOfPeriods) {
            this.showMaxNumberOfPeriodsOverriddenNotification = this.calledFromFactorDataWidget;
            this.multiOverrideDateSettings.numberOfObservations = this.maxNumberOfPeriods;
        }
    }

    /**
     * Set max number of periods as per the frequency selected using the passed in input prop or maxPeriodsMap
     */
    private setMaxNumberOfPeriods(): void {
        if (this.calledFromFactorDataWidget) {
            this.maxNumberOfPeriods = this.computeMaxNumberOfPeriodOverride(this.multiOverrideDateSettings?.multiOverrideDateTypeFrequency);
        } else {
            this.maxNumberOfPeriods = CoreDefinitionStore.tokens[TokenConstants.EXPLORE_MAX_NUMBER_OF_DATA_POINTS] || this.maxNumberOfPeriodsOverride || this.maxPeriodsMap[this.multiOverrideDateSettings?.multiOverrideDateTypeFrequency] || OverrideDateConstants.MIN_MULTI_DATE_OBSERVATIONS;
        }
    }

    private computeMaxNumberOfPeriodOverride(frequency: string): number {
        let maxNumberOfPeriodsOverride ;
        if (frequency === TimeSeriesFrequency.DAILY) {
            maxNumberOfPeriodsOverride = 1000;
        } else if ( frequency === TimeSeriesFrequency.WEEKLY) {
            maxNumberOfPeriodsOverride = 1000;
        } else if (  frequency === TimeSeriesFrequency.MONTH_END) {
            maxNumberOfPeriodsOverride = 360;
        } else if (  frequency === TimeSeriesFrequency.QUARTER_END) {
            maxNumberOfPeriodsOverride = 120;
        } else if (  frequency === TimeSeriesFrequency.YEAR_END) {
            maxNumberOfPeriodsOverride = 30;
        } else {
            maxNumberOfPeriodsOverride = undefined;
        }
        return maxNumberOfPeriodsOverride;
    }

    /**
     * Number Of Observations Change handler
     */
    onNumberOfObservationsChanged(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>): void {
        this.multiOverrideDateSettings.numberOfObservations = Number(event.detail.value);
        this.checkNumberOfObservations();
        this.multiOverrideDateSettingsChanged.emit();
    }

    /**
     * Trigger when datepicker date value gets changed
     */
    onDateChanged() {
        this.multiOverrideDateSettings.numberOfObservations = null;
        // Update the start and end date of the MultiOverrideDateSettings
        this.multiOverrideDateSettings.startDate = this.startDate;
        this.multiOverrideDateSettings.endDate = this.endDate;
        this.multiOverrideDateSettingsChanged.emit();
    }

    onAppendReportDate(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        this.updateAppendReportDate(event.detail.value.checked);
    }

    updateAppendReportDate(appendReportDate: boolean) {
        this.multiOverrideDateSettings.appendReportDate = appendReportDate;
        this.multiOverrideDateSettingsChanged.emit();
    }

    showAppendReportDateCheckbox(): boolean {
        return this.showAppendReportDate && this.multiOverrideDateSettings.multiOverrideDateTypeFrequency !== TimeSeriesFrequency.DAILY && this.multiOverrideDateSettings.multiOverrideDateTypeFrequency !== TimeSeriesFrequency.WEEKLY;
    }

    onNumberOfObservationsValueChange(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>): void {
        const maxNoOfPeriods = Number(event.detail.value);
        if (this.calledFromFactorDataWidget && maxNoOfPeriods === this.maxNumberOfPeriods) {
            this.showMaxNumberOfPeriodsOverriddenNotification = true;
        }
    }

    onNotificationClosed() {
        this.showMaxNumberOfPeriodsOverriddenNotification = false;
    }
}
