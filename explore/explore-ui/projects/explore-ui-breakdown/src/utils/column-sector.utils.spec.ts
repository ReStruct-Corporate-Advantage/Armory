import {ColumnDefinition, NumericColumnFormat} from '@blk/explore-ui-core';
import {ColumnSector} from '../models/sector/column-sector/column-sector.model';
import {NumericColumnSector} from '../models/sector/column-sector/numeric-column-sector.model';
import {DateColumnSector} from '../models/sector/column-sector/date-column-sector.model';
import {TimeSpanColumnSector} from '../models/sector/column-sector/time-span-column-sector.model';
import {LinkedFavoriteSector} from '../models/sector/linked-favorite-sector.model';
import {CustomSector} from '../models/sector/custom-sector/custom-sector.model';
import {Breakdown} from '../models/breakdown/breakdown.model';
import {ColumnSectorUtils} from './column-sector.utils';

describe('ColumnSectorUtils', () => {

    it('Test createSectorFromColumnDataType', () => {
        expect(ColumnSectorUtils.createSectorFromColumnDataType('STRING')).toBeInstanceOf(ColumnSector);
        expect(ColumnSectorUtils.createSectorFromColumnDataType('INT')).toBeInstanceOf(NumericColumnSector);
        expect(ColumnSectorUtils.createSectorFromColumnDataType('DOUBLE')).toBeInstanceOf(NumericColumnSector);
        expect(ColumnSectorUtils.createSectorFromColumnDataType('DATE')).toBeInstanceOf(DateColumnSector);
        expect(ColumnSectorUtils.createSectorFromColumnDataType('TIME_SPAN')).toBeInstanceOf(TimeSpanColumnSector);
        expect(ColumnSectorUtils.createSectorFromColumnDataType('CUSTOM')).toBeInstanceOf(LinkedFavoriteSector);
        expect((ColumnSectorUtils.createSectorFromColumnDataType('CUSTOM') as LinkedFavoriteSector).sector).toBeInstanceOf(CustomSector);
        expect(ColumnSectorUtils.createSectorFromColumnDataType('BREAKDOWN')).toBeInstanceOf(LinkedFavoriteSector);
        expect((ColumnSectorUtils.createSectorFromColumnDataType('BREAKDOWN') as LinkedFavoriteSector).sector).toBeInstanceOf(Breakdown);
        expect(ColumnSectorUtils.createSectorFromColumnDataType('RANGE')).toBeInstanceOf(ColumnSector);
    });

    it('Test createColumnSectorFromColumnDefinition', () => {
        // Start with a Market Value % column definition
        let colDef: ColumnDefinition = new ColumnDefinition({title: 'Market Value %', uses: 'PORT', dataType: 'DOUBLE', columnFormat: new NumericColumnFormat({scalable: true, scalingFactor: 0.01})});
        let columnSector: ColumnSector = ColumnSectorUtils.createColumnSectorFromColumnDefinition(colDef);
        expect(columnSector.columnName).toEqual(colDef.title);
        expect(columnSector.positionColumnType).toEqual(colDef.uses);
        expect(columnSector.dataType).toEqual(colDef.dataType);
        expect(columnSector instanceof NumericColumnSector).toBeTruthy();
        expect((columnSector as NumericColumnSector).scalingFactor).toEqual((colDef.columnFormat as NumericColumnFormat).scalingFactor);

        // Use Market Value that is scalable but doesn't have a scaling factor of < 1
        colDef = new ColumnDefinition({title: 'Market Value', uses: 'PORT', dataType: 'DOUBLE', columnFormat: new NumericColumnFormat({scalable: true, scalingFactor: 1000})});
        columnSector = ColumnSectorUtils.createColumnSectorFromColumnDefinition(colDef);
        expect(columnSector instanceof NumericColumnSector).toBeTruthy();
        expect((columnSector as NumericColumnSector).scalingFactor).toBeUndefined();

        // Use Duration that is not scalable
        colDef = new ColumnDefinition({title: 'Duration', uses: 'PORT', dataType: 'DOUBLE', columnFormat: new NumericColumnFormat({scalable: false, scalingFactor: 1})});
        columnSector = ColumnSectorUtils.createColumnSectorFromColumnDefinition(colDef);
        expect(columnSector instanceof NumericColumnSector).toBeTruthy();
        expect((columnSector as NumericColumnSector).scalingFactor).toBeUndefined();

        // Try any other non-numeric column
        colDef = new ColumnDefinition({title: 'Issuer Rating', uses: 'PORT', dataType: 'STRING'});
        columnSector = ColumnSectorUtils.createColumnSectorFromColumnDefinition(colDef);
        expect(columnSector instanceof NumericColumnSector).toBeFalsy();
    });

});
