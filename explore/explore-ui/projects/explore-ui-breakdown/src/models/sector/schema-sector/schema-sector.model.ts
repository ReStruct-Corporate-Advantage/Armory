import {AbstractConfig} from '@blk/explore-ui-core';
import {isNil, isObject} from 'lodash';
import {Sector} from '../../../interfaces/sector.interface';
import {SectorConstants} from '../../../constants/sector.constants';

export class SchemaSector extends AbstractConfig implements Sector {
    title: string;
    userSpecifiedSchema: string;

    children: Sector[];
    parent: Sector;

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
     * Get the sectorRuleType
     */
    get sectorRuleType(): string {
        return SectorConstants.SECTOR_DATA_TYPE.SCHEMA;
    }

    /**
     * Serialize
     */
    serialize(_isNested?: boolean | number): any {
        return {
            title: this.title,
            userSpecifiedSchema: this.userSpecifiedSchema,
            breakdownRuleType: this.sectorRuleType
        };
    }

    /**
     * Deserialize
     */
    deserialize(data: any): void {
        if (data.title) {
            this.title = data.title;
        }
        if (data.userSpecifiedSchema) {
            this.userSpecifiedSchema = data.userSpecifiedSchema;
        }
    }

    /**
     * Add child
     */
    addChild(child: Sector): void {
        // Empty
    }

    /**
     * Checks if this sector definition is valid.
     */
    isValid(): boolean {
        return !isNil(this.title);
    }

    /**
     * returns the title of sector
     */
    getTitle(): string {
        return this.title;
    }

    /**
     * Get data type
     */
    getDataType(): string {
        return SectorConstants.SECTOR_DATA_TYPE.SCHEMA;
    }
}
