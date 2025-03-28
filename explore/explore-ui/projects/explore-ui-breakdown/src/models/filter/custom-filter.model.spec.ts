import {CustomFilter} from './custom-filter.model';
import {ConfigTypeFactory} from '@blk/explore-ui-core';
import {CustomSector} from '../sector/custom-sector/custom-sector.model';
import {GroupRule} from '../sector/group-rule.model';
import {ColumnSectorRule} from '../sector/column-sector/column-sector-rule.model';

describe('Custom Filter model test case', () => {
    let filter: CustomFilter;

    beforeAll(() => {
        ConfigTypeFactory.registerConfigType(CustomFilter.CONFIG_TYPE, CustomFilter);
        filter = new CustomFilter({'title': 'abc'});
    });

    it('Serialize/Deserialize test', () => {
        // Convert the object to string and then back to json again.
        const serializedData: string = JSON.stringify(filter.serialize());
        const deserializedData: any = JSON.parse(serializedData);
        const newFilter: CustomFilter = ConfigTypeFactory.createConfig(deserializedData, CustomFilter.CONFIG_TYPE, true);

        expect(filter.equals(newFilter)).toBeTruthy();
        expect(newFilter.title).toBe('abc');
    });

    describe('isFilterEmpty test case', () => {
        beforeEach(() => {
            filter = new CustomFilter();
            filter.customSector = new CustomSector();
        });

        it('When custom Sector is not defined then filter is empty', () => {
            expect(filter.isFilterEmpty()).toBeTruthy();
        });

        it('If rule is not an instance of ColumnSectorRule then return false', () => {
            filter.customSector.rule = new GroupRule();
            expect(filter.isFilterEmpty()).toBeFalsy();
        });

        it('When filter is populated then return false', () => {
            filter.customSector.rule = new ColumnSectorRule();
            (filter.customSector.rule as ColumnSectorRule).columnTag = 'Dummy Tag';
            expect(filter.isFilterEmpty()).toBeFalsy();
        });

        it('Add request params does nothing', () => {
            const data = {};
            filter.addRequestParams(data);
            expect(data).toStrictEqual({});
        });
    });
});
