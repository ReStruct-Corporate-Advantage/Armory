import {isEmpty, isNil, isObject, isUndefined} from 'lodash';
import {
    AbstractColumnOption,
    CoreCommonConstants,
    DateValue,
    SerializeFavoriteType
} from '@blk/explore-ui-core';

/**
 * Override Column Options Model
 */
export class OverrideDateColumnOption extends AbstractColumnOption {

    public static CONFIG_TYPE = 'overrideDateColumnOption';

    overrideDateTypes: string[] = [];
    customOverrideDateLabel: string;
    multiOverrideDateTypeFrequency: string;
    numberOfObservations: number;
    startDate: DateValue;
    endDate: DateValue;
    compareToCurrentType: string;
    dateType: string;
    showAttribution = false;
    appendReportDate = false;

    /**
     * Looks at the list of option values and if it can create a column option model from it does so.
     * NOTE:  That the list of option values is modified by this function if a model can be created.
     */
    static createModelLegacy(optionValues: any): OverrideDateColumnOption {
        // If there is none of the required parameters then get out of here.
        if (isUndefined(optionValues.overrideDate)) {
            // Given options are not override date options
            return undefined;
        }

        // Create the model.
        const columnOption: OverrideDateColumnOption = new OverrideDateColumnOption();
        columnOption.overrideDateTypes = optionValues.overrideDate.overrideDateTypes;
        columnOption.customOverrideDateLabel = optionValues.overrideDate.customOverrideDateLabel;
        columnOption.multiOverrideDateTypeFrequency = optionValues.overrideDate.multiOverrideDateTypeFrequency;
        columnOption.numberOfObservations = optionValues.overrideDate.numberOfObservations;
        columnOption.startDate = isObject(optionValues.overrideDate.startDate) ? new DateValue(optionValues.overrideDate.startDate) : DateValue.newDate(optionValues.overrideDate.startDate);
        columnOption.endDate = isObject(optionValues.overrideDate.endDate) ? new DateValue(optionValues.overrideDate.endDate) : DateValue.newDate(optionValues.overrideDate.endDate);
        columnOption.compareToCurrentType = isUndefined(optionValues.compareToCurrent) ? undefined : optionValues.compareToCurrent.compareToCurrentType;
        columnOption.showAttribution = optionValues.overrideDate.showAttribution;
        columnOption.dateType = isUndefined(optionValues.dateType) ? undefined : optionValues.overrideDate.dateType;
        columnOption.appendReportDate = isUndefined(optionValues.appendReportDate) ? undefined : optionValues.overrideDate.appendReportDate;

        // Now remove the old optionValues so nothing else can process them.
        delete optionValues.overrideDate;
        delete optionValues.compareToCurrent;

        return columnOption;
    }

    /**
     * Constructor
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Gets the type of the config object.
     */
    get configType(): string {
        return OverrideDateColumnOption.CONFIG_TYPE;
    }


    /**
     * Get params that are to be send as a part of the request param
     */
    protected doAddRequestParams(requestParams: any): void {
        // Add the settings.
        requestParams.overrideDate = {
            overrideDateTypes: this.overrideDateTypes,
            customOverrideDateLabel: this.customOverrideDateLabel,
            multiOverrideDateTypeFrequency: this.multiOverrideDateTypeFrequency,
            numberOfObservations: this.numberOfObservations,
        };

        this.addDatesToRequestParams(requestParams);

        if (this.dateType) {
            requestParams.overrideDate.dateType = this.dateType;
            requestParams.overrideDate.showAttribution = this.showAttribution;
        }

        // Add the compare to current setting if it is there.
        if (!isNil(this.compareToCurrentType) && this.compareToCurrentType.length > 0) {
            requestParams.compareToCurrent = {
                compareToCurrentType: this.compareToCurrentType
            };
        }

        requestParams.appendReportDate = this.appendReportDate;
        requestParams.overrideDate.appendReportDate = this.appendReportDate;
    }
    /**
     * This function adds start date and end date to request params.
     */
    protected addDatesToRequestParams(requestParams: any): void {
        if (this.endDate) {
            if (!isEmpty(this.endDate.date) && !this.endDate.dateString) {
                requestParams.overrideDate.endDate = this.endDate.date;
            } else if (this.endDate.dateString && this.endDate.dateStringValue) {
                requestParams.overrideDate.endDate = this.endDate.dateStringValue;
            }
        }

        if (this.startDate) {
            if (!isEmpty(this.startDate.date) && !this.startDate.dateString) {
                requestParams.overrideDate.startDate = this.startDate.date;
            } else if (this.startDate.dateString && this.startDate.dateStringValue) {
                requestParams.overrideDate.startDate = this.startDate.dateStringValue;
            }
        }
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        if (!this.isValid()) {
            return undefined;
        }
        const startDateSerialized = this.startDate ? this.startDate.sanitizeAndSerialize() : DateValue.newDate(CoreCommonConstants.EMPTY_STRING).serialize();
        const endDateSerialized = this.endDate ? this.endDate.sanitizeAndSerialize() : DateValue.newDate(CoreCommonConstants.EMPTY_STRING).serialize();
        return {
            overrideDateTypes: this.overrideDateTypes,
            customOverrideDateLabel: this.customOverrideDateLabel,
            multiOverrideDateTypeFrequency: this.multiOverrideDateTypeFrequency,
            numberOfObservations: this.numberOfObservations,
            startDate: startDateSerialized,
            endDate: endDateSerialized,
            compareToCurrentType: this.compareToCurrentType,
            dateType: this.dateType,
            showAttribution: this.showAttribution,
            appendReportDate: this.appendReportDate
        };
    }

    /**
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        this.overrideDateTypes = data.overrideDateTypes;
        this.customOverrideDateLabel = data.customOverrideDateLabel;
        this.multiOverrideDateTypeFrequency = data.multiOverrideDateTypeFrequency;
        this.numberOfObservations = data.numberOfObservations;
        // Old favorites will have start date and end date as string whereas new favorites will have it of type DateValue
        this.startDate = DateValue.deserializeDateValue(data.startDate);
        this.endDate = DateValue.deserializeDateValue(data.endDate);

        this.compareToCurrentType = data.compareToCurrentType;
        this.dateType = data.dateType;
        this.showAttribution = data.showAttribution;
        this.appendReportDate = data.appendReportDate;
        // For backwards compatibility, users loading an existing date override|time series will have the 'Include report date' opted in and checked on.
        // The 'Number of Observations' field will subtract by 1. (for Month end, Quarter end, and Year end)
        if (isNil(data.appendReportDate) && this.multiOverrideDateTypeFrequency !== 'DAILY' && this.multiOverrideDateTypeFrequency !== 'WEEKLY') {
            this.appendReportDate = true;
            this.numberOfObservations--;
        }
    }

    /**
     * Returns true if the passed in otherColOption is equal to this one
     */
    equals(columnOption: AbstractColumnOption): boolean {
        if (!(columnOption instanceof OverrideDateColumnOption)) {
            return false;
        }
        if (this.overrideDateTypes.length !== columnOption.overrideDateTypes.length) {
            return false;
        }
        let overrideDateTypesEqual = true;
        this.overrideDateTypes.forEach((overrideDateType: string) => {
            if (columnOption.overrideDateTypes.indexOf(overrideDateType) === -1) {
                overrideDateTypesEqual = false;
            }
        });
        if (!overrideDateTypesEqual) {
            return false;
        }
        if (this.customOverrideDateLabel !== columnOption.customOverrideDateLabel) {
            return false;
        }
        if (this.multiOverrideDateTypeFrequency !== columnOption.multiOverrideDateTypeFrequency) {
            return false;
        }
        if (this.numberOfObservations !== columnOption.numberOfObservations) {
            return false;
        }
        if (!this.compareDatesForEquals(this.startDate, this.endDate, columnOption.startDate, columnOption.endDate)) {
            return false;
        }
        if (this.compareToCurrentType !== columnOption.compareToCurrentType) {
            return false;
        }
        if (this.dateType !== columnOption.dateType) {
            return false;
        }
        if (this.appendReportDate !== columnOption.appendReportDate) {
            return false;
        }
        return this.showAttribution === columnOption.showAttribution;
    }

    /**
     * Helper Function to compare dates for equals function
     */
    compareDatesForEquals(startDate: DateValue, endDate: DateValue, columnOptionStartDate: DateValue, columnOptionEndDate: DateValue): boolean {
        if ((isNil(startDate) && !isNil(columnOptionStartDate)) || (isNil(endDate) && !isNil(columnOptionEndDate))) {
            return false;
        }
        if (!isNil(startDate) && !startDate.equals(columnOptionStartDate)) {
            return false;
        }
        return !(!isNil(endDate) && !endDate.equals(columnOptionEndDate));

    }

    /**
     * Check if the settings are valid
     */
    isValid(): boolean {
        return !((isNil(this.overrideDateTypes) || this.overrideDateTypes.length === 0) && isEmpty(this.multiOverrideDateTypeFrequency));
    }
}

