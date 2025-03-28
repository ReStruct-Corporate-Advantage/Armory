import {ConfigTypeFactory} from '@blk/explore-ui-core';
import {SchemaSector} from './schema-sector.model';
import {BreakdownInitializer} from '../../../breakdown.initializer';
import {BreakdownConstants} from '../../../constants/breakdown.constants';
import {SectorConstants} from '../../../constants/sector.constants';

describe('ColumnSector', () => {
    beforeAll(() => {
        BreakdownInitializer.registerSectorConfigTypes();
    });

    it('should test serialize/deserialize', () => {
        const sector = createSchemaSector();

        const serializedData: string = JSON.stringify(sector.serialize());
        const deserializedData = JSON.parse(serializedData);
        const newSector: SchemaSector = ConfigTypeFactory.createConfig(deserializedData, SectorConstants.ConfigType.SCHEMA_SECTOR);

        expect(newSector.title).toBe(sector.title);
        expect(newSector.userSpecifiedSchema).toBe(sector.userSpecifiedSchema);
    });

    it('should test isValid', () => {
        const sector = createSchemaSector();
        expect(sector.isValid()).toBe(true);
    });

    it('should test getTitle', () => {
        const sector = createSchemaSector();
        expect(sector.getTitle()).toBe(BreakdownConstants.FACTOR_SPACE_USER_SPECIFIED_SCHEMA_TITLE);
    });

    it('should test getDataType', () => {
        const sector = createSchemaSector();
        expect(sector.getDataType()).toBe(SectorConstants.SECTOR_DATA_TYPE.SCHEMA);
    });

    function createSchemaSector(): SchemaSector {
        const sector: SchemaSector = new SchemaSector();
        sector.title = BreakdownConstants.FACTOR_SPACE_USER_SPECIFIED_SCHEMA_TITLE;
        sector.userSpecifiedSchema = 'TEST_USER_SPECIFIED_SCHEMA';

        return sector;
    }
});
