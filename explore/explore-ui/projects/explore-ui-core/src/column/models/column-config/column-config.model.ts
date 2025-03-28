import {each, isEmpty, isNil, isObject, isString} from 'lodash';
import {ConfigTypeConstants, CoreCommonConstants} from '../../../core/constants';
import {CommonUtils} from '../../../core/utils';
import {ColumnDefinition} from '../../../definition/models/column-definition.model';
import {AbstractFavoriteConfig} from '../../../favorite/models/abstract-favorite-config.model';
import {NotificationType} from '../../../ui/enums';
import {ExploreInputValidationInfo} from '../../../ui/models/explore-input-validation-info.model';
import {ColumnOptionFactory} from '../../column-option.factory';
import {CoreColumnUtils} from '../../core-column.utils';
import {AbstractColumnOption} from '../abstract-column-option.model';
import {TabularColumnFilters} from '../tabular-column-filter/tabular-column-filter.model';
import {IShareDefinition} from '../../../definition/models/ishare-definition.model';
import {FavoriteDisplayEnum, SerializeFavoriteType} from '../../../favorite/enums';
import {CoreFavoriteUtils} from '../../../favorite/utils';
import {CoreFavoriteConstants} from '../../../favorite/constants';
import {ConfigState} from '../../../core/enums';
import {ColumnConstants} from '../../constants/column.constants';
import {isWidgetTitleModifiable} from '../../../widget-config/interfaces';

/**
 * Class used for saving and loading of column information.
 */
export class ColumnConfig extends AbstractFavoriteConfig {
    // Static getter - static get configType() - gives this ERROR:
    //  Metadata collected contains an error that will be reported at runtime: Only initialized variables and constants can be referenced because the value of this variable is needed by the template compiler.
    static readonly configType = 'COLUMN';

    columnTag: string;
    positionColumnType: string;
    columnKey: string;
    // This is now an array instead of a map since all the options would be AbstractColumnOptions
    optionValues: AbstractColumnOption[] = [];
    columnFilters: TabularColumnFilters;

    // These properties are part of the config but are not serialized.
    columnTitle: string;
    cusip: string;

    /**
     * Creates a column with the attributes given.
     */
    static createColumn(columnTag: string, positionColumnType?: string, columnKey?: string, title?: string, cusip?: string): ColumnConfig {
        const column = new ColumnConfig();
        column.columnTag = columnTag;
        column.positionColumnType = positionColumnType;
        column.columnKey = columnKey;
        column.columnTitle = title;
        column.cusip = cusip;

        // If Column title is null then fetch title from column definition (only if positionColumnType is provided
        // as the logic to get the title needs positionColumnType)
        if (isNil(column.columnTitle) && !isNil(positionColumnType)) {
            column.columnTitle = CoreColumnUtils.getOriginalColumnTitle(columnTag, positionColumnType);
        }
        return column;
    }

    /**
     * Creates a column from column definition
     */
    static createColumnFromColumnDefinition(input: ColumnDefinition, columnKey?: string): ColumnConfig {
        columnKey ??= ColumnConfig.generateColumnKey(input.columnTag);
        let column: ColumnConfig;
        if(input instanceof IShareDefinition) {
            column = ColumnConfig.createColumn(input.columnTag, input.uses, columnKey, input.title, input.cusip);
            return column;
        }
        column = ColumnConfig.createColumn(input.columnTag, input.uses, columnKey, input.title);

        return column;
    }


    static generateColumnKey(columnTag: string): string {
        return columnTag + '_' + CommonUtils.generateUniqueIdAsString();
    }

    /**
     * Constructor that takes a column tag.
     * NOTE:  I wanted a constructor for both just a columnTag and a serialised version of it.
     *        This logic below seems to give me what we need to achieve that.
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        } else if (isString(data)) {
            // Ensure a column tag does not have whitespaces
            this.columnTag = CoreColumnUtils.replaceWhitespaceInColumnTag(data);
        }
    }

    /**
     * Returns if there are any option values on this column.
     */
    hasOptionValues(): boolean {
        return this.optionValues && !isEmpty(this.optionValues);
    }

    /**
     * Creates the required object for the column to be requested from the server.
     * @param isExportRequest - flag if the request is export related
     */
    createRequestColumn(isExportRequest?: boolean, retainFavId?: boolean): any {
        const data: any = this.serialiseCommonAttributes();

        // Add the title to the data request.
        if (this.columnTitle) {
            data.title = this.columnTitle;
        }

        // Now add the option values to the request if there are any.
        if (this.hasOptionValues()) {
            data.optionValues = {};
            if (retainFavId && this.id) {
                data.optionValues['favorite_id'] = this.id;
            }
            each(this.optionValues, function (value: AbstractColumnOption) {
                if (retainFavId) {
                    value.addRequestParamsWithFavId(data.optionValues);
                } else {
                    // Check if Column Value is model then create request params
                    value.addRequestParams(data.optionValues);
                }
            });
        }

        if (isExportRequest && !isEmpty(this.columnFilters)) {
            data.columnFilters = this.columnFilters.serialize();
        }

        return data;
    }

    /**
     * Serialize the config.
     */
    doSerialize(isNested?: boolean | SerializeFavoriteType): any {
        const data: any = this.serialiseCommonAttributes();

        // Serialize Column Option
        // for column breakdown, if breakdown is empty then serialize will return null, hence filter
        const serializedOptionValues = this.optionValues?.map(value => value.serialize(isNested)).filter(serializedValue => !!serializedValue && !isEmpty(serializedValue));
        if (serializedOptionValues && !isEmpty(serializedOptionValues)) {
            data.optionValues = serializedOptionValues;
        }

        // Serialize the column filters
        if (this.columnFilters && !this.columnFilters.isEmpty()) {
            data.columnFilters = this.columnFilters.serialize();
        }

        // don't include columnKey when trying to detect favorite changes on a custom calc
        if (CoreFavoriteUtils.isFavoriteChangeDetection(isNested) && this.columnTag === CoreFavoriteConstants.CUSTOM_CALC_COL_TAG) {
            delete data.columnKey;
        }

        return data;
    }

    /**
     * Gets the column title that will be displayed in the widget title
     */
    getColumnTitleForWidgetTitleDetails(): string {
        let title = this.columnTitle;
        for (const optionValue of this.optionValues) {
            if (isWidgetTitleModifiable(optionValue)) {
                title += ' - ' + optionValue.getModifiedWidgetTitleDetails();
            }
        }

        return title;
    }

    /**
     * Deserialize the json data into this object.
     */
    doDeserialize(data: any): void {
        // If data is already deserialized don't deserialize again, issue in case of saved customCalc
        if (data instanceof ColumnConfig) {
            this.doCopyFrom(data);
            return;
        }

        // Ensure a column tag does not have whitespaces
        this.columnTag = CoreColumnUtils.replaceWhitespaceInColumnTag(data.columnTag);

        this.columnKey = data.columnKey ? data.columnKey : undefined;
        this.positionColumnType = data.positionColumnType ? data.positionColumnType : undefined;
        // Iterate Over Column Options to Create column options model
        if (data.optionValues && !isEmpty(data.optionValues)) {
            this.optionValues = ColumnOptionFactory.createModels(data.optionValues);
        }
        // Need to set back the title since we don't save it
        const columnDef = CoreColumnUtils.getColumnDefByTagAndUse(this.columnTag, this.positionColumnType);

        if (columnDef) {
            this.columnTitle = columnDef.title;
        }

        // columnDef will return empty title for factor model column, so set data.columnTitle
        if (data.positionColumnType === ColumnConstants.FACTOR_MODEL) {
            this.columnTitle = data.columnTitle;
        }

        // If there are column filters, then deserialize them
        if (data.columnFilters) {
            this.columnFilters = new TabularColumnFilters();
            this.columnFilters.deserialize(data.columnFilters);
        }
    }

    /**
     * Function to copy the contents of another config object into this one.
     */
    doCopyFrom(source: AbstractFavoriteConfig): void {
        if (!(source instanceof ColumnConfig)) {
            return;
        }
        this.columnTag = source.columnTag;
        this.columnTitle = source.columnTitle;
        this.columnKey = source.columnKey;
        this.positionColumnType = source.positionColumnType;
        this.optionValues = source.optionValues;
        this.columnFilters = source.columnFilters;
    }

    getConfigType(): string {
        return ColumnConfig.configType;
    }

    /**
     * Returns true if the passed in otherColConfig is equal to this one
     */
    equals(otherColConfig: ColumnConfig): boolean {
        if (this.columnTag !== otherColConfig.columnTag) {
            return false;
        }
        if (this.positionColumnType !== otherColConfig.positionColumnType) {
            return false;
        }
        if (this.columnKey !== otherColConfig.columnKey) {
            return false;
        }
        if (this.optionValues.length !== otherColConfig.optionValues.length) {
            return false;
        }
        for (let i = 0; i < this.optionValues.length; i++) {
            if (!this.optionValues[i].equals(otherColConfig.optionValues[i])) {
                return false;
            }
        }
        return true;
    }

    /**
     * Method to get to the column option given its config type
     */
    getOptionValueByConfigType(optionConfigType: string): AbstractColumnOption {
        return CoreColumnUtils.getOptionValueByConfigType(this.optionValues, optionConfigType);
    }

    /**
     * Returns the common attributes serialized.
     */
    private serialiseCommonAttributes(): any {
        const data: any = {columnTag: this.columnTag};

        if (this.columnKey) {
            data.columnKey = this.columnKey;
        }

        if (this.positionColumnType) {
            data.positionColumnType = this.positionColumnType;
        }

        return data;
    }

    /**
     * Method to check if the other config is similar to this one
     */
    isSameColumnConfigType(otherColumnConfig: ColumnConfig): boolean {
        return this.columnTag === otherColumnConfig.columnTag && this.positionColumnType === otherColumnConfig.positionColumnType;
    }

    /**
     * Returns true when given column is PRAADA column; else false
     */
    isPerformanceColumn(): boolean {
        return !isNil(this.getOptionValueByConfigType(ConfigTypeConstants.PERFORMANCE_SETTINGS));
    }

    /**
     * validation logic for option values
     */
    validateColumnOptionsToProceed(): string {
        let validationMessage = CoreCommonConstants.EMPTY_STRING;
        if (!this.hasOptionValues()) {
            return validationMessage;
        }

        for (const optionValue of this.optionValues) {
            if (!optionValue.hasColumnOptionValidator()) {
                continue;
            }

            const validationInfo: ExploreInputValidationInfo = optionValue.isValidColumnOption();
            if (validationInfo && validationInfo.notificationType === NotificationType.ERROR) {
                validationMessage = validationInfo.message;
                break;
            }
        }

        return validationMessage;
    }

    getDisplayType(parent?: any): FavoriteDisplayEnum {
        return FavoriteDisplayEnum.CUSTOM_CALC;
    }

    /**
     * Clear any flags that were set in order to detect changes to the favorite (ie column option)
     */
    resetChangeDetectionFlags(): void {
        // set all column options to EXISTING
        this.optionValues.forEach(option => option.optionState = ConfigState.EXISTING);
    }
}
