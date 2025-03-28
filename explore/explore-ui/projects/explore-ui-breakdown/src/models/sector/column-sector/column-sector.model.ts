import {isObject, isUndefined} from 'lodash';
import {Sector} from '../../../interfaces/sector.interface';
import {SectorUtils} from '../../../utils/sector.utils';
import {SectorConstants} from '../../../constants/sector.constants';
import {AbstractConfig, CoreColumnUtils, SerializeFavoriteType, ColumnDefinition} from '@blk/explore-ui-core';

export class ColumnSector extends AbstractConfig implements Sector {
    children: Sector[];
    parent: Sector;
    columnName: string;
    columnTag: string;
    positionColumnType: string;
    dataType: string;
    useNoneBuckets: boolean;

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
        return 'String';
    }

    /**
     * Gets the config type for column sectors
     */
    get configType(): string {
        return SectorConstants.ConfigType.COLUMN_SECTOR;
    }

    /**
     * Adds a child sector to this sector.
     */
    addChild(child: Sector): void {
        if (!this.children) {
            this.children = [];
        }
        this.children.push(child);
    }

    /**
     * Checks is a ColumnSector has no children
     */
    hasNoChildren(): boolean {
        return !this.children || this.children.length < 1;
    }

    /**
     * Check if columnSector is GR Sector. If yes, adds the columnTag to the breakdownColTags Set and returns true
     * Else, if returns false
     */
    isGRSectorOnly(breakdownColTags: Set<string>): boolean {
        if (!this.columnTag || !this.columnTag.startsWith('grsector')) {
            return false;
        }

        breakdownColTags.add((this.columnTag.split('`'))[1]);

        if (!this.hasNoChildren()) {
            if (this.children[0] instanceof ColumnSector) {
                return (this.children[0] as ColumnSector).isGRSectorOnly(breakdownColTags);
            } else {
                return false;
            }
        }

        return true;
    }

    /**
     * Serialize the config to json.
     */
    serialize(isNested?: boolean | SerializeFavoriteType): any {
        const data: any = {
            breakdownRuleType: this.sectorRuleType,
            groupByColumn: {
                columnName: this.columnName,
                columnTag: this.columnTag,
                dataType: this.dataType,
                positionColumnType: this.positionColumnType
            }
        };

        // Serialise the child nodes into this node.
        SectorUtils.serializeChildren(this, data, isNested);

        data.useNoneBuckets = this.useNoneBuckets;

        return data;
    }

    /**
     * Deserialize the json data into this object.
     */
    deserialize(data: any): void {
        if (data.groupByColumn) {
            // Ensure a column tag does not have whitespaces
            this.columnTag = CoreColumnUtils.replaceWhitespaceInColumnTag(data.groupByColumn.columnTag);
            this.dataType = data.groupByColumn.dataType;
            this.positionColumnType = data.groupByColumn.positionColumnType;

            let column: ColumnDefinition = CoreColumnUtils.getColumnDefByTag(this.columnTag);
            this.columnName = column ? column.title :data.groupByColumn.columnName;
        }
        this.useNoneBuckets = data.useNoneBuckets;

        // Deserialize the child sectors into this instance.
        SectorUtils.deserializeChildren(this, data);
    }

    /**
     * Checks if this sector definition is valid.
     */
    isValid(): boolean {
        // Is valid as long as there is a column tag specified.
        return !isUndefined(this.columnTag);
    }

    /**
     * @inheritDoc
     */
    getTitle(): string {
        return this.columnName;
    }

    /**
     * @inheritDoc
     */
    getDataType(): string {
        return SectorConstants.SECTOR_DATA_TYPE.STRING;
    }
}
