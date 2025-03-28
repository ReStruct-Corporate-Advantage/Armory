import { Component } from '@angular/core';
import { AuxRadioInterface } from '@blk/aladdin-angular-components';
import {
    CompareToCurrentDateSettings,
    CoreCommonConstants,
    CoreWidgetConfigStore,
    DateValue,
    MultiOverrideDateSettings,
    OverrideDateConstants,
    OverrideDateSettings,
    PortfolioRiskColumnCategoryDefinition,
    TimeSeriesFrequency,
    TokenConstants,
    TokenUtils,
    WidgetConfigType
} from '@blk/explore-ui-core';
import { map } from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { OverrideDateColumnOption } from '../../../models/column-option/override-date-column-option.model';
import { UiColumnOptionService } from '../../../services/ui-column-option.service';
import { LibColumnUtils } from '../../../utils';
import { BaseColumnOptionComponent } from '../base-column-option.component';

@Component({
    selector: 'explore-override-date-column-option',
    templateUrl: './override-date-column-options.component.html',
    styleUrls: ['./override-date-column-options.component.scss']
})
export class OverrideDateColumnOptionsComponent<T extends OverrideDateColumnOption> extends BaseColumnOptionComponent<OverrideDateColumnOption> {
    private static readonly VARY_DATES_OPTION = 'varyDates';
    private static readonly DECOMPOSITION_ONLY_OPTION = 'decompositionOnly';
    static OPTION_KEY = OverrideDateColumnOption.CONFIG_TYPE;
    /**
     * Flag indicating if user has option to override only economy/exposure date
     */
    canHaveVaryingDates = false;

    /**
     * Flag indicating the column properties (including whether or not column depends on economy and exposure dates)
     */
    riskColumnFlags: string[];

    overrideDateOptions: AuxRadioInterface[];

    /**
     * overrideDateSelectionSubject (to enable/disable radio button of Calculate relative to Current based on overrideDate selection )
     */
    overrideDateSelectionSubject$ = new BehaviorSubject<boolean>(false);

    /**
     * Override date settings
     */
    overrideDateSettings: OverrideDateSettings;

    /**
     * Multi Override date settings
     */
    multiOverrideDateSettings: MultiOverrideDateSettings;

    /**
     * Compare to current date settings
     */
    compareToCurrentDateSettings: CompareToCurrentDateSettings;

    /**
     * Flag indicating mode of override dates selected
     */
    multiMode = OverrideDateConstants.OVERRIDE_DATE_NONE;

    canHaveMultipleOverrideDates: boolean;

    showExposureLabelInRnE: boolean;

    isDecompositionDisableAttributePresent: boolean;

    /**
     * Flag indicating if column is Risk column
     */
    isRiskColumn = false;

    constructor(private uiColumnOptionService: UiColumnOptionService) {
        super();
    }

    /**
     * Init the component.
     */
    protected initializeComponent(): void {
        super.initializeComponent();
        // Get the column definitions to try to find matchingRiskCategories
        const columnDef = LibColumnUtils.getColumnDefinition(this.column);
        this.riskColumnFlags = [];
        if(columnDef instanceof PortfolioRiskColumnCategoryDefinition) {
            this.isRiskColumn = true;
            this.riskColumnFlags = columnDef.matchingRiskCategories;
        }

        const varyOption = this.option.columnOptionAttributes[2]?.key;
        if (TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_CLIMATE_DECOMP_ENABLED) && varyOption === OverrideDateColumnOptionsComponent.DECOMPOSITION_ONLY_OPTION) {
            // If the 'decompositionOnly' column attribute is present, set optionValue.dateType to 'BOTH'.
            this.optionValue.dateType = OverrideDateConstants.VARY_BOTH;
        } else if (varyOption === OverrideDateColumnOptionsComponent.VARY_DATES_OPTION) {
            // If the 'varyDates' column attribute is present, set canHaveVaryingDates to true for non PGS.
            this.canHaveVaryingDates = this.widgetType !== WidgetConfigType.PGS;
        }

        // Initialize override date settings
        this.initializeOverrideDateSettings();
        this.initializeCompareToCurrentDateSettings();
        this.setMultiMode();

        // Initialize the radio button groups
        this.initializeOverrideDateOptions();
        this.canHaveMultipleOverrideDates = this.setCanHaveMultipleOverrideDates();

        this.isDecompositionDisableAttributePresent = this.option.columnOptionAttributes.findIndex(colOptionAttribute => colOptionAttribute.key === 'disableDecomposition') !== -1;
    }

    /**
     * Get the type of option value this component should create.
     */
    protected getOptionValueConfigType(): string {
        return OverrideDateColumnOption.CONFIG_TYPE;
    }

    /**
     * Set override date settings from column option values
     */
    initializeOverrideDateSettings(): void {
        this.overrideDateSettings = new OverrideDateSettings(this.optionValue.overrideDateTypes, this.optionValue.customOverrideDateLabel);
        this.multiOverrideDateSettings = new MultiOverrideDateSettings(this.optionValue.multiOverrideDateTypeFrequency, this.optionValue.numberOfObservations, this.optionValue.startDate, this.optionValue.endDate, this.optionValue.appendReportDate);
    }

    /**
     * Initialize the compare to current date settings
     */
    initializeCompareToCurrentDateSettings(): void {
        if (this.option.columnOptionAttributes[1]) {
            this.compareToCurrentDateSettings = new CompareToCurrentDateSettings(this.optionValue.compareToCurrentType);
        }
    }

    /**
     * Method invoked when user changes between date vary options
     */
    updateCompareToCurrent(): void {
        let compareToCurrentValue: string;
        if (this.optionValue.compareToCurrentType === OverrideDateConstants.COMPARE_TO_CURRENT_ATTRIBUTION) {
            compareToCurrentValue = OverrideDateConstants.COMPARE_TO_CURRENT;
        } else if (this.optionValue.compareToCurrentType === OverrideDateConstants.PERCENTAGE_COMPARE_TO_CURRENT_ATTRIBUTION) {
            compareToCurrentValue = OverrideDateConstants.PERCENTAGE_COMPARE_TO_CURRENT;
        } else {
            compareToCurrentValue = this.optionValue.compareToCurrentType;
        }

        // TODO: Enable it in phase 3.
        // For the time being until phase 3, we are not enabling compare to current for non FBA "vary analytic option"
        if (this.riskColumnFlags.length === 0 && this.optionValue.dateType === OverrideDateConstants.DATE_VARY_TYPES.ANALYTIC[0] && this.optionValue.compareToCurrentType) {
            compareToCurrentValue = null;
            delete this.optionValue.compareToCurrentType;
        }
        this.compareToCurrentDateSettings = new CompareToCurrentDateSettings(compareToCurrentValue);
        this.onCompareToCurrentChange(compareToCurrentValue);
    }

    initializeOverrideDateOptions(): void {
        this.overrideDateOptions = map(OverrideDateConstants.OVERRIDE_DATE_OPTIONS, (overrideDateOption: any, key: string) => {
            return {
                label: overrideDateOption,
                eventData: key,
                checked: this.multiMode === key
            };
        });
    }

    onOverrideDateOptionChanged(option: AuxRadioInterface): void {
        this.multiMode = option.eventData;
        this.onMultiModeToggle(option);
    }

    /**
     * Method invoked when user toggles between specific dates and multiple dates
     */
    onMultiModeToggle(option: AuxRadioInterface): void {
        // Reset all override date settings on toggle
        this.overrideDateSettings.overrideDateTypes.splice(0, this.overrideDateSettings.overrideDateTypes.length);
        this.overrideDateSettings.customOverrideDate = '';
        this.onCustomDateChange('');
        if (option.label === OverrideDateConstants.OVERRIDE_DATE_OPTIONS.MULTI) {
            this.multiOverrideDateSettings = new MultiOverrideDateSettings(TimeSeriesFrequency.DAILY, 10, DateValue.newDate(CoreCommonConstants.EMPTY_STRING), DateValue.newDate(CoreCommonConstants.EMPTY_STRING));
        } else {
            this.multiOverrideDateSettings = new MultiOverrideDateSettings(CoreCommonConstants.EMPTY_STRING, 0, DateValue.newDate(CoreCommonConstants.EMPTY_STRING), DateValue.newDate(CoreCommonConstants.EMPTY_STRING));
        }
        this.onMultiOverrideDateSettingsChange();

        if (this.compareToCurrentDateSettings) {
            this.onCompareToCurrentChange(this.compareToCurrentDateSettings.compareToCurrentValue);
        }
    }

    /**
     * Callback method to update custom single override date when it is changed in the child override date component
     */
    onCustomDateChange(dateStringValue: string): void {
        this.optionValue.customOverrideDateLabel = dateStringValue;
    }

    /**
     * Callback method to update compare to current when it is changed in the child compare to current component
     */
    onCompareToCurrentChange(compareToCurrentValue: string): void {
        if (this.optionValue.compareToCurrentType === compareToCurrentValue) {
            return;
        }

        this.optionValue.compareToCurrentType = compareToCurrentValue;
        this.optionValue.showAttribution = compareToCurrentValue === OverrideDateConstants.COMPARE_TO_CURRENT_ATTRIBUTION || compareToCurrentValue === OverrideDateConstants.PERCENTAGE_COMPARE_TO_CURRENT_ATTRIBUTION;
        if (this.optionValue.compareToCurrentType) {
            this.uiColumnOptionService.setCompareToCurrentOption(this.optionValue.compareToCurrentType);
        }
    }

    /**
     * Callback method to called when multi override date settings are changed
     */
    onMultiOverrideDateSettingsChange(): void {
        this.optionValue.multiOverrideDateTypeFrequency = this.multiOverrideDateSettings.multiOverrideDateTypeFrequency;
        this.optionValue.numberOfObservations = this.multiOverrideDateSettings.numberOfObservations;
        this.optionValue.startDate = this.multiOverrideDateSettings.startDate;
        this.optionValue.endDate = this.multiOverrideDateSettings.endDate;
        this.optionValue.appendReportDate = this.multiOverrideDateSettings.appendReportDate;
    }

    /**
     * Returns true or false depending on current mode that is selected to show specific date option.
     */
    showOverrideDate(): boolean {
        // In case we cannot show multiple override dates we have to show override date by default.
        return (!this.canHaveMultipleOverrideDates && this.multiMode === OverrideDateConstants.OVERRIDE_DATE_NONE) || this.multiMode === OverrideDateConstants.OVERRIDE_DATE_SPECIFIC;
    }

    /**
     * Returns true or false depending on current mode that is selected to show multi date option.
     */
    showMultiOverrideDate(): boolean {
        return this.canHaveMultipleOverrideDates && this.multiMode === OverrideDateConstants.OVERRIDE_DATE_MULTI;
    }

    /**
     * Returns true or false indicating whether or not to show compare to current option.
     */
    showCompareToCurrent(): boolean {
        // If the column is a custom calculation column, then the only time we'll see this override date column option
        // is when we are adding measures in the custom calculation measure modal.
        // For those columns that we are adding to custom calc, we do not want to show compare to current -> this.option.columnOptionAttributes[1].isRestricted will be true in this case.
        // Also, if compare to current data settings are not defined, then do not show compare to current.
        if (this.option.columnOptionAttributes?.[1]?.isRestricted || !this.compareToCurrentDateSettings) {
            return false;
        }

        return this.showOverrideDate() || this.showMultiOverrideDate();
    }

    /**
     * Returns true if a widget is configured to support multiple override dates on columns
     */
    setCanHaveMultipleOverrideDates(): boolean {
        // If the column is a custom calculation column, then the only time we'll see this override date column option
        // is when we are adding measures in the custom calculation measure modal.
        // For now, for those columns that we are adding to custom calc, we do not allow multiple override dates -> this.option.columnOptionAttributes[0].isRestricted will be true in this case.
        if ((this.option.columnOptionAttributes[0] && this.option.columnOptionAttributes[0].isRestricted)) {
            return false;
        }

        return CoreWidgetConfigStore.getChartConfigForType(CoreWidgetConfigStore.getCurrentWidgetConfigType()).canHaveMultipleOverrideDates;
    }

    /**
     * Sets the multiMode flag for the radio group
     */
    setMultiMode(): void {
        if (this.overrideDateSettings.overrideDateTypes.length > 0) {
            this.multiMode = OverrideDateConstants.OVERRIDE_DATE_SPECIFIC;
        } else if (this.multiOverrideDateSettings.multiOverrideDateTypeFrequency) {
            this.multiMode = OverrideDateConstants.OVERRIDE_DATE_MULTI;
        } else {
            // no option selected
            this.multiMode = OverrideDateConstants.OVERRIDE_DATE_NONE;
        }
    }

    /**
     * Return true if date vary option is disabled, but we have other riskCategories in the array
     */
    isDateVaryDisabledForRiskColumn() {
        return this.isRiskColumn && this.riskColumnFlags && (this.riskColumnFlags.length == 0 || (this.riskColumnFlags.length > 0 && this.riskColumnFlags.indexOf(OverrideDateConstants.RISK_CATEGORIES.DEPENDS_ON_EXPOSURE) < 0 && this.riskColumnFlags.indexOf(OverrideDateConstants.RISK_CATEGORIES.DEPENDS_ON_ECONOMY) < 0));
    }
}
