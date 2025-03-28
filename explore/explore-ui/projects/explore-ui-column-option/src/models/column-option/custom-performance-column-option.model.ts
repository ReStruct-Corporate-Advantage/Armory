import {isObject, isUndefined} from 'lodash';
import {
    AbstractColumnOption,
    ColumnConfig,
    ColumnOptionValidatorInterface,
    ColumnTitleModifiable,
    ExploreInputValidationInfo,
    NotificationType,
    SerializeFavoriteType
} from '@blk/explore-ui-core';

/**
 * Custom Performance Column Options Model
 */
export class CustomPerformanceColumnOption extends AbstractColumnOption implements ColumnTitleModifiable, ColumnOptionValidatorInterface {

    static readonly CONFIG_TYPE = 'customPerfSettings';

    positionColumnType: string;  // this is port/bench/active type.
    performanceColumnType: string;
    underlyingColumns: ColumnConfig[];

    /**
     * Constructor
     */
    constructor(data?: any) {
        super();
        this.initialize();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Initialises the column with the default settings.
     */
    initialize(defaultSettings?: any): void {
        if (defaultSettings) {
            this.positionColumnType = defaultSettings.columnOptionAttributes[0].defaultValue.label;
            this.performanceColumnType = defaultSettings.columnOptionAttributes[1].defaultValue.label;
        }
        this.underlyingColumns = [];
    }

    /**
     * Gets the type of the config object.
     */
    get configType(): string {
        return CustomPerformanceColumnOption.CONFIG_TYPE;
    }

    /**
     * Modify the column title
     */
    public getModifiedColumnTitle(originalTitle: any): string {
        const updatedTitle: string = this.positionColumnType ? originalTitle + ' (' + this.positionColumnType + ')' : originalTitle;
        return this.performanceColumnType ? updatedTitle + ' (' + this.performanceColumnType + ')' : updatedTitle;
    }

    /**
     * Add required request param to Options values
     */
    protected doAddRequestParams(requestParams: any): void {
        requestParams['underlyingColumns'] = this.serializeColumns(false);
        // we need the positionColumnType and performanceColumnType in to create the title of the column as we are creating the title on backend.
        requestParams['positionColumnType'] = this.positionColumnType;
        requestParams['performanceColumnType'] = this.performanceColumnType;
    }

    /**
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        if (!data) {
            return;
        }
        if (data.positionColumnType) {
            this.positionColumnType = data.positionColumnType;
        }
        if (data.performanceColumnType) {
            this.performanceColumnType = data.performanceColumnType;
        }
        if (data.underlyingColumns) {
            this.underlyingColumns = data.underlyingColumns.map(col => new ColumnConfig(col));
        }
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    doSerialize(isNested?: boolean | SerializeFavoriteType): any {
        return {
            positionColumnType: this.positionColumnType,
            performanceColumnType: this.performanceColumnType,
            underlyingColumns: this.serializeColumns(isNested)
        };
    }

    /**
     * This function is used to serialize the underlyingColumns
     */
    private serializeColumns(isNested: boolean | number): any {
        return this.underlyingColumns.map((col: any) => {
            const colConfig: ColumnConfig = col instanceof ColumnConfig ? col : ColumnConfig.createColumn(col.columnTag, col.positionColumnType, col.columnKey, col.title);
            return colConfig.serialize(isNested);
        });
    }

    /**
     * Equals method implementation to compare with other column option@param otherColOption
     */
    equals(otherColOption: AbstractColumnOption): boolean {
        if (!(otherColOption instanceof CustomPerformanceColumnOption)) {
            return false;
        }

        if (this.positionColumnType !== otherColOption.positionColumnType) {
            return false;
        }

        if (this.performanceColumnType !== otherColOption.performanceColumnType) {
            return false;
        }

        if (this.underlyingColumns.length !== otherColOption.underlyingColumns.length) {
            return false;
        }

        for (let i = 0; i < this.underlyingColumns.length; i++) {
            if (!this.underlyingColumns[i].equals(otherColOption.underlyingColumns[i])) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check if the column option is valid
     */
    isValid(): boolean {
        return isUndefined(this.isValidColumnOption());
    }

    /**
     * Validate column Option inputs
     */
    isValidColumnOption(): any {
        // If underlying columns are empty then fail validation.
        if (!this.underlyingColumns || this.underlyingColumns.length === 0) {
            return new ExploreInputValidationInfo(NotificationType.ERROR, 'Underlying Columns are not defined for custom performance column.');
        }
        return undefined;
    }

}
