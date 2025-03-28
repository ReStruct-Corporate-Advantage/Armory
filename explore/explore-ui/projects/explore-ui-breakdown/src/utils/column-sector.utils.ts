import {Sector} from '../interfaces/sector.interface';
import {ColumnSector} from '../models/sector/column-sector/column-sector.model';
import {NumericColumnSector} from '../models/sector/column-sector/numeric-column-sector.model';
import {DateColumnSector} from '../models/sector/column-sector/date-column-sector.model';
import {TimeSpanColumnSector} from '../models/sector/column-sector/time-span-column-sector.model';
import {LinkedFavoriteSector} from '../models/sector/linked-favorite-sector.model';
import {CustomSector} from '../models/sector/custom-sector/custom-sector.model';
import {Breakdown} from '../models/breakdown/breakdown.model';
import {ColumnDefinition, NumericColumnFormat} from '@blk/explore-ui-core';

export class ColumnSectorUtils {

    /**
     * Returns the corresponding sector model based on the column data type
     */
    static createSectorFromColumnDataType(dataType: string): Sector {
        switch (dataType) {
            case 'STRING':
                return new ColumnSector();
            case 'DOUBLE':
            case 'INT':
                return new NumericColumnSector();
            case 'DATE':
                return new DateColumnSector();
            case 'TIME_SPAN':
                return new TimeSpanColumnSector();
            case 'CUSTOM':
                const linkedFavorite1: LinkedFavoriteSector = new LinkedFavoriteSector();
                linkedFavorite1.sector = new CustomSector();
                return linkedFavorite1;
            case 'BREAKDOWN':
                const linkedFavorite2: LinkedFavoriteSector = new LinkedFavoriteSector();
                linkedFavorite2.sector = new Breakdown();
                return linkedFavorite2;
            default:
                return new ColumnSector();
        }
    }

    /**
     * Creates a ColumnSector the passed in ColumnDefinition
     */
    static createColumnSectorFromColumnDefinition(colDef: ColumnDefinition): ColumnSector {
        const sectorModel: ColumnSector = ColumnSectorUtils.createSectorFromColumnDataType(colDef.dataType) as ColumnSector;
        sectorModel.columnName = colDef.title;
        sectorModel.positionColumnType = colDef.uses;
        sectorModel.dataType = colDef.dataType;
        // Add the scalingFactor to the ColumnSector so that the rule can be properly processed by the server (For percent columns)
        if (colDef.columnFormat instanceof NumericColumnFormat && colDef.columnFormat.isScalable && colDef.columnFormat.scalingFactor < 1) {
            (sectorModel as NumericColumnSector).scalingFactor = colDef.columnFormat.scalingFactor;
        }

        return sectorModel;
    }
}
