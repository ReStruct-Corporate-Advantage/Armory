import {isObject, isUndefined} from 'lodash';
import {ColumnSector} from './column-sector.model';
import {SectorConstants} from '../../../constants/sector.constants';
import {SerializeFavoriteType} from '@blk/explore-ui-core';

export class DateColumnSector extends ColumnSector {
    groupByYear: boolean;

    /**
     * Constructor.
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Gets the config type for numeric column sector options
     */
    get configType(): string {
        return SectorConstants.ConfigType.DATE_COLUMN_SECTOR;
    }

    /**
     * Get the sectorRuleType
     */
    get sectorRuleType(): string {
        return 'Date';
    }

    /**
     * Serialize the config to json.
     * isNested an optional parameter to indicate that the favorite is a nested one.
     */
    serialize(isNested?: boolean | SerializeFavoriteType): any {
        // Get the super implementation of the settings.
        const data: any = super.serialize(isNested);

        // Add this implementations parameters.
        data.toBeGroupedByYear = this.groupByYear;

        return data;
    }

    /**
     * Deserialize the json data into this object.
     */
    deserialize(data: any): void {
        super.deserialize(data);
        this.groupByYear = data.toBeGroupedByYear ? data.toBeGroupedByYear : false;
    }

    /**
     * Checks if this sector definition is valid.
     */
    isValid(): boolean {
        // Make sure the super is valid first.
        if (!super.isValid()) {
            return false;
        }

        // This is valid as long as the variable is set to true or false.
        return !isUndefined(this.groupByYear);
    }

    /**
     * @inheritDoc
     */
    getDataType(): string {
        return SectorConstants.SECTOR_DATA_TYPE.DATE;
    }
}
