import {Component} from '@angular/core';
import {
    AuxCheckboxChangedDetailInterface,
    AuxRadioInterface,
    AuxSelectOption,
    AuxSelectSelectionChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {
    AdditionalPerformanceSettings,
    ColumnOptionAttribute,
    CoreDefinitionStore,
    CoreWidgetConfigStore,
    ExploreSelectOption,
    ExploreSelectOptionGroup,
    PerformanceConstants,
    PerformanceSettings,
    PerformanceTimePeriod,
    TimePeriodConstants,
    TokenConstants,
    TokenUtils,
    WidgetConfigType,
    CoreCommonConstants
} from '@blk/explore-ui-core';
import {find, isNil} from 'lodash';
import {BaseColumnTitleModifiableColumnOptionComponent} from '../base-column-title-modifiable-column-option.component';
import {ColumnOptionConstants} from '../../../constants';

@Component({
    selector: 'explore-performance-column-options',
    templateUrl: './performance-column-options.component.html',
    styleUrls: ['./performance-column-options.component.scss']
})
export class PerformanceColumnOptionsComponent extends BaseColumnTitleModifiableColumnOptionComponent<PerformanceSettings> {
    static readonly OPTION_KEY = 'performanceSettings';
    timePeriodAttribute: ColumnOptionAttribute;
    asReportedAttribute: ColumnOptionAttribute;
    customPivotPointAttribute: ColumnOptionAttribute;
    attributionSettingsAttribute: ColumnOptionAttribute;
    excessSettingsAttribute: ColumnOptionAttribute;
    originalTitle: string;
    availableCustomPivotPoints: ExploreSelectOptionGroup[] = [new ExploreSelectOptionGroup()];
    timePeriod: PerformanceTimePeriod;
    netReturnsAttribute: ColumnOptionAttribute;

    // flag for enabling net returns based on ExplorePRAADAGrossNetReturns token
    isNetGrossReturnsEnabled = false;
    returnTypeDisplayOptions: AuxRadioInterface[];

    /**
     * Gets the config type that this object is configuring.
     */
    getOptionValueConfigType(): string {
        return PerformanceSettings.CONFIG_TYPE;
    }

    /**
     * Performs the required initialization.
     */
    protected initializeComponent(): void {
        super.initializeComponent();
        if (!this.option) {
            return;
        }

        // Set all the possible performance column option attributes
        this.setPossibleColumnOptionAttributes();

        this.initializeCustomPivotPoints();
        this.setTimePeriod();
        // Set the column title as per the column option values
        this.updateColumnTitle();

        this.initializeReturnType();
        this.optionValue.sourceName = CoreCommonConstants.SETTINGS_HIERARCHY_TYPE.COLUMN;
    }

    /**
     * Initialize Custom Pivot points
     */
    initializeCustomPivotPoints(): void {
        const isSettingsPresentAtColumnlevel = this.optionValue.additionalSettings !== this.optionValue.parentPerformanceSettings.additionalSettings;

        if (this.customPivotPointAttribute) {
            let valueSelected = false;
            // In Returns Analysis 'Widget Default is displayed in Custom Pivot Settings
            let isReturnWidget = false;
            if (CoreWidgetConfigStore.getCurrentWidgetConfigType() === WidgetConfigType.RETURNS) {
                isReturnWidget = true;
                valueSelected = !isSettingsPresentAtColumnlevel;
                this.availableCustomPivotPoints[0].values.push(new ExploreSelectOption('Widget default', null, this.isWidgetDefaultSelected(valueSelected)));
                if (!isSettingsPresentAtColumnlevel) {
                    this.optionValue.additionalSettings = new AdditionalPerformanceSettings();
                }
            }

            CoreDefinitionStore.krdBucketDetail.forEach((pivotPoint: any) => {
                this.availableCustomPivotPoints[0].values.push(new ExploreSelectOption(pivotPoint.name, pivotPoint.value, isSettingsPresentAtColumnlevel && this.optionValue.additionalSettings.customPivotPoint === pivotPoint.value && !valueSelected));
            });

            if (!isReturnWidget && !this.optionValue?.additionalSettings?.customPivotPoint) {
                // If it is not a return widget then we should make 10 year default
                const tenYearCustomPivotPoint = this.availableCustomPivotPoints[0].values.find((customPivotPointSelectOption: ExploreSelectOption) => customPivotPointSelectOption.value === ColumnOptionConstants.TEN_YEAR);
                if (tenYearCustomPivotPoint) {
                    tenYearCustomPivotPoint.isSelected = true;
                    if (!isSettingsPresentAtColumnlevel) {
                        this.optionValue.additionalSettings = new AdditionalPerformanceSettings();
                    }
                    this.optionValue.additionalSettings.customPivotPoint = null;
                    this.optionValue.additionalSettings.customPivotPoint = tenYearCustomPivotPoint.value;
                    this.updateColumnTitle();
                }
            }
        }
    }

    /**
     * Checks whether WidgetDefault option is selected
     */
    isWidgetDefaultSelected(widgetDefaultSelected: boolean): boolean {
        return (this.optionValue.additionalSettings && isNil(this.optionValue.additionalSettings.customPivotPoint)) || widgetDefaultSelected;
    }

    /**
     * Set all the possible performance column option attributes
     */
    setPossibleColumnOptionAttributes(): void {
        this.timePeriodAttribute = find(this.option.columnOptionAttributes, {key: TimePeriodConstants.TIME_PERIOD});
        this.asReportedAttribute = find(this.option.columnOptionAttributes, {key: PerformanceConstants.AS_REPORTED});
        this.customPivotPointAttribute = find(this.option.columnOptionAttributes, {key: PerformanceConstants.CUSTOM_PIVOT_POINT});
        this.excessSettingsAttribute = find(this.option.columnOptionAttributes, {key: PerformanceConstants.EXCESS_SETTINGS});
        this.attributionSettingsAttribute = find(this.option.columnOptionAttributes, {key: PerformanceConstants.ATTRIBUTION_SETTINGS});
        this.netReturnsAttribute = find(this.option.columnOptionAttributes, {key: PerformanceConstants.IS_NET_RETURN});
    }

    /**
     * update object for time period
     */
    onTimePeriodChange(timePeriod: PerformanceTimePeriod): void {
        // Only need to change the time period if it is not the instance already in the settings.
        if (this.optionValue.timePeriod !== timePeriod) {
            this.optionValue.timePeriod = timePeriod;
        }
        this.updateColumnTitle();
    }

    /**
     * Function to set the time period for the control to use.
     */
    setTimePeriod(): void {
        // In performance settings there may be a parent hooked up.  If there is and the time period is from the parent
        // make a copy of it. so we do not change the parent.
        // NOTE:  That we are comparing with === rather than .equals as we want the exact instance.
        if (this.optionValue.timePeriod === this.optionValue.parentPerformanceSettings.timePeriod) {
            this.timePeriod = this.optionValue.timePeriod.createCopy();
            this.timePeriod.sourceName = CoreCommonConstants.SETTINGS_HIERARCHY_TYPE.COLUMN;
        } else {
            this.timePeriod = this.optionValue.timePeriod;
        }
        this.timePeriod.parentTimePeriod = this.optionValue.parentPerformanceSettings.timePeriod;
    }

    /**
     * reset local time period
     */
    resetTimePeriod(): void {
        this.optionValue.timePeriod = undefined;
        this.setTimePeriod();
        this.updateColumnTitle();
    }

    /**
     * Sets the custom pivot value based on user selection.
     */
    setCustomPivot(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        const isSettingsPresentAtColumnlevel = this.optionValue.additionalSettings !== this.optionValue.parentPerformanceSettings.additionalSettings;
        if (!isSettingsPresentAtColumnlevel) {
            this.optionValue.additionalSettings = new AdditionalPerformanceSettings();
        }
        this.optionValue.additionalSettings.customPivotPoint = null;
        if (event.detail.value) {
            this.optionValue.additionalSettings.customPivotPoint = (event.detail.value as AuxSelectOption).value;
        }
        this.updateColumnTitle();
    }

    setAsReportedAttribute(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        const isSettingsPresentAtColumnlevel = this.optionValue.additionalSettings !== this.optionValue.parentPerformanceSettings.additionalSettings;
        if (!isSettingsPresentAtColumnlevel) {
            this.optionValue.additionalSettings = new AdditionalPerformanceSettings();
        }
        this.optionValue.additionalSettings.asReported = event.detail.value.checked;
        this.updateColumnTitle();
    }

    initializeReturnType(): void {
        this.isNetGrossReturnsEnabled = TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_PRAADA_NET_GROSS_RETURNS);
        this.returnTypeDisplayOptions = [
            {label: 'Gross returns', checked: !this.optionValue.additionalSettings?.isNetReturn, disabled: false},
            {label: 'Net returns', checked: !!this.optionValue.additionalSettings?.isNetReturn, disabled: false}
        ];
    }

    /**
     * Update the state of Gross/Net Return radio
     */
    updateNetReturn() {
        const isSettingsPresentAtColumnlevel = this.optionValue.additionalSettings !== this.optionValue.parentPerformanceSettings.additionalSettings;
        if (!isSettingsPresentAtColumnlevel) {
            this.optionValue.additionalSettings = new AdditionalPerformanceSettings();
        }
        this.optionValue.additionalSettings.isNetReturn = this.returnTypeDisplayOptions[1].checked;
        // call to trigger change detection
        this.updateColumnTitle();
    }
}
