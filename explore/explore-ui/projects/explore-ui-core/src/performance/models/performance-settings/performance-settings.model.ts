import {cloneDeep, find, isEmpty, isNil, isObject, isUndefined} from 'lodash';
import {ColumnTitleModifiable, HasLegacyAndNewColumnOptionAttributes} from '../../../column/interfaces';
import {AbstractColumnOption} from '../../../column/models/abstract-column-option.model';
import {DerivedSettings, RequestParamsCreator} from '../../../core/interfaces';
import {DateFormatConstants, TimePeriodConstants} from '../../../date/constants';
import {DateValue} from '../../../date/models/date-value/date-value.model';
import {CalendarDateUtils} from '../../../date/utils';
import {CoreDefinitionStore} from '../../../definition/core-definition.store';
import {WidgetConfigType} from '../../../widget-config/enums';
import {WidgetInput, WidgetTitleModifiable} from '../../../widget-config/interfaces';
import {WidgetConfigUtils} from '../../../widget-config/widget-config.utils';
import {PerformanceConstants} from '../../performance.constants';
import {ReturnsUtils} from '../../utils';
import {AdditionalPerformanceSettings} from '../additional-performance-settings/additional-performance-settings';
import {AttributionSettings} from '../attribution-settings/attribution-settings.model';
import {PerformanceTimePeriod} from '../../../date/models/time-period/performance-time-period.model';
import {TimePeriodShortName} from '../../../date/models/time-period/time-period.model';

/**
 * Model class for Performance settings
 */
export class PerformanceSettings extends AbstractColumnOption
    implements WidgetInput, DerivedSettings<PerformanceSettings>, WidgetTitleModifiable, RequestParamsCreator, HasLegacyAndNewColumnOptionAttributes, ColumnTitleModifiable {
    static CONFIG_TYPE = 'performanceSettings';
    static LEGACY_WIDGET_CONFIG_TYPE = 'widgetPerformanceSettings';
    private _timePeriod: PerformanceTimePeriod;
    private _additionalSettings: AdditionalPerformanceSettings;
    private _parentPerformanceSettings: PerformanceSettings;
    _sourceName: string;
    attributionSettings: AttributionSettings = new AttributionSettings();

    /**
     * Convenience method to create an instance with the required parameters.
     */
    static createPerformanceSettings(
        parentPerformanceSettings: PerformanceSettings,
        timePeriod?: PerformanceTimePeriod,
        attributionSettings?: AttributionSettings
    ) {
        const performanceSettings = new PerformanceSettings();
        performanceSettings.timePeriod = timePeriod;
        performanceSettings.parentPerformanceSettings = parentPerformanceSettings;
        performanceSettings.attributionSettings.parentAttributionSettings = attributionSettings;
        return performanceSettings;
    }

    /**
     * Create default time period
     * returns TimePeriod
     */
    static createDefaultTimePeriod(): PerformanceTimePeriod {
        return new PerformanceTimePeriod('Month To Date', 1, TimePeriodShortName.MTD, undefined, undefined);
    }

    /**
     * Looks at the list of option values and if it can create a column option model from it does so.
     * NOTE:  That the list of option values is modified by this function if a model can be created.
     */
    static createModelLegacy(optionValues: any): PerformanceSettings {
        // Create the model.
        if (
            isUndefined(optionValues[TimePeriodConstants.TIME_PERIOD]) &&
            isUndefined(optionValues[PerformanceConstants.ATTRIBUTION_METHOD])
        ) {
            return;
        }
        const performanceSettings = new PerformanceSettings();
        if (optionValues[TimePeriodConstants.TIME_PERIOD]) {
            performanceSettings.timePeriod = new PerformanceTimePeriod();
            performanceSettings.timePeriod.createModelLegacy(optionValues);
        }
        if (optionValues[PerformanceConstants.ATTRIBUTION_METHOD]) {
            performanceSettings.attributionSettings.createModelLegacy(optionValues);
        }

        return performanceSettings;
    }

    /**
     * Constructor.
     */
    constructor(
        data?: any,
        timePeriod?: PerformanceTimePeriod,
        attributionSettings?: AttributionSettings,
        additionalSettings?: AdditionalPerformanceSettings
    ) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
        if (!isUndefined(timePeriod)) {
            this._timePeriod = timePeriod;
        }
        if (!isUndefined(attributionSettings)) {
            this.attributionSettings = attributionSettings;
        }
        if (!isUndefined(additionalSettings)) {
            this._additionalSettings = additionalSettings;
        }
    }

    get configType(): string {
        return PerformanceSettings.CONFIG_TYPE;
    }

    checkAndResetTimePeriod(isResetSettings: boolean): boolean {
        if (isResetSettings) {
            this.timePeriod = undefined;
        } else {
            return this.timePeriod !== this.parentPerformanceSettings.timePeriod;
        }
    }

    get timePeriod(): PerformanceTimePeriod {
        if (this._timePeriod) {
            return this._timePeriod;
        } else if (this.parentPerformanceSettings) {
            return this.parentPerformanceSettings.timePeriod;
        }
    }

    set timePeriod(value: PerformanceTimePeriod) {
        if (
            this.parentPerformanceSettings &&
            this.parentPerformanceSettings.timePeriod &&
            value === this.parentPerformanceSettings.timePeriod
        ) {
            this._timePeriod = undefined;
        } else {
            this._timePeriod = value;
        }
    }

    get sourceName(): string {
        return this._sourceName;
    }

    set sourceName(value: string) {
        this._sourceName = value;
        if (this._timePeriod) {
            this._timePeriod.sourceName = value;
        }
        if (this.attributionSettings) {
            this.attributionSettings.sourceName = value;
        }
    }

    get additionalSettings(): AdditionalPerformanceSettings {
        if (this._additionalSettings) {
            return this._additionalSettings;
        } else if (this.parentPerformanceSettings) {
            return this.parentPerformanceSettings.additionalSettings;
        }
    }

    set additionalSettings(value: AdditionalPerformanceSettings) {
        if (
            this.parentPerformanceSettings &&
            this.parentPerformanceSettings.additionalSettings &&
            value === this.parentPerformanceSettings.additionalSettings
        ) {
            this._additionalSettings = undefined;
        } else {
            this._additionalSettings = value;
        }
    }

    get parentPerformanceSettings(): PerformanceSettings {
        return this._parentPerformanceSettings;
    }

    set parentPerformanceSettings(value: PerformanceSettings) {
        this._parentPerformanceSettings = value;
        this.attributionSettings.parentAttributionSettings = value?.attributionSettings;
        if (this._timePeriod) {
            this._timePeriod.parentTimePeriod = value?.timePeriod;
        }
    }

    /**
     * Return false if the passed in PerformanceSettings is not equal to this
     */
    equals(otherPerformanceSettings: AbstractColumnOption | WidgetInput): boolean {
        if (!(otherPerformanceSettings instanceof PerformanceSettings)) {
            return false;
        }
        if (this.timePeriod && !this.timePeriod.equals(otherPerformanceSettings.timePeriod)) {
            return false;
        }
        if (this.additionalSettings && !this.additionalSettings.equals(otherPerformanceSettings.additionalSettings)) {
            return false;
        }
        return !(this.attributionSettings && !this.attributionSettings.equals(otherPerformanceSettings.attributionSettings));
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    /**
     * Deserialize the json data into this object.
     */
    deserialize(data: any): void {
        if (isNil(data)) {
            return;
        }
        if (data.timePeriod) {
            this.timePeriod = new PerformanceTimePeriod();
            this.timePeriod.deserialize(data.timePeriod);
        }
        if (data.attributionSettings) {
            this.attributionSettings = new AttributionSettings();
            this.attributionSettings.sourceName = this.sourceName;
            this.attributionSettings.deserialize(data.attributionSettings);
        }
        if (data.additionalSettings) {
            this.additionalSettings = new AdditionalPerformanceSettings(data.additionalSettings);
        } else {
            this.additionalSettings = new AdditionalPerformanceSettings({customPivotPoint: null});
        }
    }

    /**
     * HasLegacyAndNewColumnOptionAttributes.deserializeLegacyColumnOptionAttributes(data: any)
     */
    deserializeLegacyColumnOptionAttributes(data: any): void {
        if (data[PerformanceConstants.CUSTOM_PIVOT_POINT] || data[PerformanceConstants.AS_REPORTED]) {
            this.additionalSettings = new AdditionalPerformanceSettings(data);
        }
    }

    doSerialize(): any {
        const data: any = {};
        // _timePeriod is used as this.timePeriod will then return the timePeriod of parentPerformanceSettings and this is undesirable
        if (this._timePeriod) {
            data.timePeriod = this.timePeriod.serialize();
        }
        const serializedAttributionSettings = this.attributionSettings?.serialize();
        if (!isEmpty(serializedAttributionSettings)) {
            data.attributionSettings = serializedAttributionSettings;
        }
        if (this._additionalSettings) {
            const serializedAdditionalSettings = this.additionalSettings.serialize();
            // do not include additional settings if empty or every value is undefined
            if (!isEmpty(serializedAdditionalSettings) && !Object.values(serializedAdditionalSettings).every(val => isNil(val))) {
                data.additionalSettings = this.additionalSettings.serialize();
            }
        }
        return data;
    }

    /**
     * Overridden method from AbstractColumnOption
     */
    protected doAddRequestParams(requestParams: any, _paramName?: string): void {
        if (this.timePeriod) {
            this.timePeriod.addRequestData(requestParams);
        }
        if (this.additionalSettings) {
            this.additionalSettings.addRequestData(requestParams);
        }
        if (this.attributionSettings.cannedMethod) {
            this.attributionSettings.addRequestData(requestParams);
        }
        // In case of return widget if the default custom pivot point is not set then it will be an empty string
        if (!isUndefined(requestParams.customPivotPoint) && isEmpty(requestParams.customPivotPoint)) {
            const tenYearCustomPivotPoint = CoreDefinitionStore.krdBucketDetail.find(krdBucketItem => krdBucketItem.value === 'TEN_YEAR');
            if (tenYearCustomPivotPoint) {
                requestParams.customPivotPoint = tenYearCustomPivotPoint.value;
            }
        }
    }

    isValid(): boolean {
        return !isNil(this.timePeriod);
    }

    /**
     * Initialises the column with the default settings.
     */
    initialize(defaultSettings: any): void {
    }

    /**
     * AbstractDerivedSettingsColumnOption.getParentWidgetSettingKey()
     */
    getParentWidgetSettingKey(): string {
        return 'performanceSettings';
    }

    /**
     * AbstractDerivedSettingsColumnOption.getParentPortfolioSettingKey()
     */
    getParentPortfolioSettingKey(): string {
        return 'performanceSettings';
    }

    /**
     * AbstractDerivedSettingsColumnOption.updateDerivedSettings
     */
    updateDerivedSettings(settings: PerformanceSettings) {
        this.parentPerformanceSettings = settings;
    }

    /**
     * WidgetInput.isDataStoreInput()
     */
    isDataStoreInput(): boolean {
        return true;
    }

    /**
     * WidgetTitleModifiable.getModifiedWidgetTitleDetails(DateValue)
     * title example: 'Custom( 29-Feb-2016 - 10-Mar-2016 )'
     */
    getModifiedWidgetTitleDetails(portfolioDate: DateValue): string {
        // If the settings are not valid then just get out of here.
        if (!this.isValid()) {
            return '';
        }

        const defaultTimePeriodName =
            this.timePeriod.numberOfPeriods > 1
                ? this.timePeriod.numberOfPeriods + ' ' + this.timePeriod.shortName
                : this.timePeriod.shortName;
        let details = this.timePeriod.timePeriodName ? this.timePeriod.timePeriodName : defaultTimePeriodName;

        if (this.timePeriod.shortName === TimePeriodShortName.CUSTOM) {
            const fromDate = this.getDateToDisplayInWidgetHeader(this.timePeriod.fromDateValue);
            let toDate = this.getDateToDisplayInWidgetHeader(this.timePeriod.toDateValue);

            if (!toDate) {
            // If the to date is not set as part of the custom time period then replace with portfolio main date.
            toDate = portfolioDate.dateString
                ? portfolioDate.dateStringValue
                : CalendarDateUtils.getDateInFormat(portfolioDate.date, DateFormatConstants.DDMMMYYYY_DASH);
        }

        details = details + '( ' + fromDate + ' - ' + toDate + ' )';
    }
    return details;
    }

    /**
     * returns the correct date format to be displayed in the widget header
     */
    getDateToDisplayInWidgetHeader(date: string): string {
        return CalendarDateUtils.isRelativeDate(date) ? date : CalendarDateUtils.getDateInFormat(date, DateFormatConstants.DDMMMYYYY_DASH);
    }

    /**
     * ColumnTitleModifiable.getModifiedColumnTitle(string)
     */
    getModifiedColumnTitle(title: string, widgetType: string): string {
        if (!this.isValid()) {
            return title;
        }
        let titleToReturn = cloneDeep(title);

        const isReturnsWidget = widgetType === WidgetConfigType.RETURNS || widgetType === WidgetConfigType.RETURNS_TIME_SERIES || WidgetConfigUtils.isReturnSpritelet(widgetType);

        let isAdditionalSettingsPresentAtThisLevel = true;
        if (this.parentPerformanceSettings && this.additionalSettings === this.parentPerformanceSettings.additionalSettings) {
            isAdditionalSettingsPresentAtThisLevel = false;
        }

        // If custom pivot point is defined, then set that in the title
        if (isAdditionalSettingsPresentAtThisLevel && this.additionalSettings && !isEmpty(this.additionalSettings.customPivotPoint)) {
            // Grab the custom pivot point label from the value and add that to title
            titleToReturn = title + ' (' + find(CoreDefinitionStore.krdBucketDetail, {value: this.additionalSettings.customPivotPoint})['name'];
            // Now if other attributes are defined then add a comma otherwise add a closing bracket to end the title
            if ((!isReturnsWidget && this.additionalSettings.asReported) || !isReturnsWidget) {
                titleToReturn = titleToReturn + ',';
            } else {
                titleToReturn = titleToReturn + ')';
            }
        } else if ((!isReturnsWidget && isAdditionalSettingsPresentAtThisLevel && this.additionalSettings && this.additionalSettings.asReported) || !isReturnsWidget) {
            // If custom pivot point is not defined and other attributes are defined then add a starting bracket
            titleToReturn = title + ' (';
        }
        if (!isReturnsWidget) {
            let timePeriodShortName = this.timePeriod.shortName;
            if (timePeriodShortName !== TimePeriodShortName.CUSTOM) {
                timePeriodShortName = this.timePeriod.numberOfPeriods + ' ' + timePeriodShortName;
            }
            titleToReturn = titleToReturn + timePeriodShortName;
            // Now if as reported is not defined we are done with title update and hence add a closing bracket
            if (isReturnsWidget || !isAdditionalSettingsPresentAtThisLevel || isNil(this.additionalSettings) || !this.additionalSettings.asReported) {
                titleToReturn = titleToReturn + ')';
            }
        }

        // Update title only if as reported is set to true
        if (!isReturnsWidget && isAdditionalSettingsPresentAtThisLevel && this.additionalSettings && this.additionalSettings.asReported) {
            // If other attributes were defined we need to add a semicolon as the separator
            if (!isReturnsWidget || !isEmpty(this.additionalSettings.customPivotPoint)) {
                titleToReturn = titleToReturn + ':' + PerformanceConstants.AS_REPORTED_LABEL + ')';
            } else {
                titleToReturn = titleToReturn + PerformanceConstants.AS_REPORTED_LABEL + ')';
            }
        }
        return titleToReturn;
    }

    /**
     * This method returns the portfolio performance settings to be set in the request params for PGS Widget
     */
    addPortfolioPerformanceSettingsToPGSRequest(requestParams: any): void {
        const portfolioPerformanceSettings = this.attributionSettings ? this.attributionSettings : undefined;
        if (!portfolioPerformanceSettings) {
            return;
        }
        const performanceSettings: any = {};
        requestParams.performanceSettings = performanceSettings;
        performanceSettings.cannedAttributionMethod = portfolioPerformanceSettings.cannedMethod;
        if (performanceSettings.cannedAttributionMethod !== PerformanceConstants.CUSTOM) {
            return;
        }
        performanceSettings.attributionCalculatorMethod = portfolioPerformanceSettings.attributionCalculatorMethod;
        performanceSettings.sectorWeighting = portfolioPerformanceSettings.sectorWeighting;
        performanceSettings.sectorLevel = portfolioPerformanceSettings.sectorLevel;
        performanceSettings.accountingFactors = portfolioPerformanceSettings.factors ? ReturnsUtils.getFactorsPresentInFactorList(portfolioPerformanceSettings.factors, CoreDefinitionStore.accountingFactors.concat(CoreDefinitionStore.tradeBasedFactors)) : undefined;
        performanceSettings.attributionFactors = portfolioPerformanceSettings.factors ? ReturnsUtils.getFactorsPresentInFactorList(portfolioPerformanceSettings.factors, CoreDefinitionStore.attributionFactors) : undefined;
    }

    /**
     * getting the telemetry trackable properties
     */
    getTrackableProperties(): any {
        return this.attributionSettings.getTrackableProperties();
    }
}
