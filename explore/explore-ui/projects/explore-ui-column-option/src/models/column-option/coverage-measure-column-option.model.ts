import {isNil, isObject} from 'lodash';
import {AbstractColumnOption, SerializeFavoriteType, ColumnTitleModifiable, ColumnConfig, ColumnOptionValidatorInterface, ExploreInputValidationInfo, NotificationType} from '@blk/explore-ui-core';

export class CoverageMeasureColumnOption extends AbstractColumnOption implements ColumnTitleModifiable, ColumnOptionValidatorInterface {

    static readonly INVALID_MEASURE_ERROR = 'Column measure must be selected for Coverage column.';

    static CONFIG_TYPE = 'coverageMeasure';

    column: ColumnConfig;

    /**
     * Constructor
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    getModifiedColumnTitle(title: string): string {
        if (!this.column) {
            return title;
        }
        return title + ', ' + this.column.columnTitle;
    }

    /**
     * Gets the type of the config object.
     */
    get configType(): string {
        return CoverageMeasureColumnOption.CONFIG_TYPE;
    }

    /**
     * See AbstractColumnOption.doAddRequestParams
     */
    protected doAddRequestParams(requestParams: any): void {
        requestParams.coverageMeasureColumn = this.column.createRequestColumn();
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        if (!this.isValid()) {
            return undefined;
        }
        return {
            column: this.column.serialize(_isNested)
        };
    }

    /**
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        this.column = new ColumnConfig(data.column);
    }

    /**
     * Check if the settings are valid
     */
    isValid(): boolean {
        return !!(this.column && this.column.columnTag && this.column.positionColumnType);
    }

    isValidColumnOption(): ExploreInputValidationInfo {
        if (this.isValid()) {
            return undefined;
        }
        return new ExploreInputValidationInfo(NotificationType.ERROR, CoverageMeasureColumnOption.INVALID_MEASURE_ERROR);
    }

    equals(otherColOption: AbstractColumnOption): boolean {
        if (!(otherColOption instanceof CoverageMeasureColumnOption)) {
            return false;
        }
        const otherCoverageMeasureColumnOption = otherColOption as CoverageMeasureColumnOption;
        if (isNil(this.column) !== isNil(otherCoverageMeasureColumnOption.column)) {
            return false;
        }
        return (isNil(this.column) && isNil(otherCoverageMeasureColumnOption.column)) || this.column.equals(otherCoverageMeasureColumnOption.column);
    }

}

