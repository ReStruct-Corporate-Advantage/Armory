import {ConfigInitializer} from '../../../initializers/config.initializer';
import {GpBreakdownColumnDefinition} from './gp-breakdown-column-definition.model';
import {ColumnConstants} from '@blk/explore-ui-core';

/**
 * Test cases for GpBreakdownColumnDefinition model class
 */
describe('GpBreakdownColumnDefinition', () => {

    beforeAll(() => {
        ConfigInitializer.registerDefinitionsConfigTypes();
    });

    /**
     * Test deserialize
     */
    it('deserialize', () => {
        const col: any = {'levelColumns': ['grsector`NJC_ISSUER_BRIT`1'], 'reportTypes': ['SINGLE'], 'columnTag': 'grsector`NJC_ISSUER_BRIT',
            'columnReports': ['prism_dataagg', 'prism_praada_sectors'], 'isGroupable': true, 'columnType': 'GR_SECTOR', 'field': 'grsector`NJC_ISSUER_BRIT',
            'isSubtotalable': false, 'isNotSupportedInCustomCal': false, 'functionFlag': 0, 'dataType': 'STRING', 'staticColumn': false, 'groups': ['Security'],
            'uses': 'ALL', 'title': ' (NJC_ISSUER_BRIT)', 'CLASS_TYPE': ColumnConstants.GP_BREAKDOWN_COL_DEF_BEAN};

        const colDef = new GpBreakdownColumnDefinition();
        colDef.deserialize(col);
        expect(colDef.columnTag).toBe('grsector`NJC_ISSUER_BRIT');
        expect(colDef.field).toBe('grsector`NJC_ISSUER_BRIT');
        expect(colDef.title).toBe(' (NJC_ISSUER_BRIT)');
        expect(colDef.uses).toBe('ALL');
        expect(colDef.isSubtotalable).toBe(false);
        expect(colDef.reportTypes.length).toBe(1);
        expect(colDef.reportTypes[0]).toBe('SINGLE');
        expect(colDef.columnReports.length).toBe(2);
        expect(colDef.columnReports[0]).toBe('prism_dataagg');
        expect(colDef.columnReports[1]).toBe('prism_praada_sectors');
        expect(colDef.dataType).toBe('STRING');
        expect(colDef.columnType).toBe('GR_SECTOR');
        expect(colDef.isNotSupportedInCustomCal).toBe(false);
        expect(colDef.groups.length).toBe(1);
        expect(colDef.groups[0]).toBe('Security');
        expect(colDef.isGroupable).toBe(true);
        expect(colDef.isStaticColumn).toBe(false);
        expect(colDef.columnDesc).toBe(undefined);
        expect(colDef.functionFlag).toBe(0);
        expect(colDef.columnFormat).toBeUndefined();
        expect(colDef.levelColumns.length).toBe(1);
        expect(colDef.levelColumns[0]).toBe('grsector`NJC_ISSUER_BRIT`1');
    });
});
