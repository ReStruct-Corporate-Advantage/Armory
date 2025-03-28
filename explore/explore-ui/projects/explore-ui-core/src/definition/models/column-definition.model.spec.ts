import {DefinitionInitializer} from '../definition.initializer';
import {ColumnDefinition} from './column-definition.model';
import {NumericColumnFormat} from './column-format/numeric-column-format.model';

/**
 * Test cases for ColumnDefinition model class
 */
describe('ColumnDefinition', () => {
    let colDef: ColumnDefinition;

    beforeAll(() => {
        DefinitionInitializer.registerDefinitionsConfigTypes();
    });

    beforeEach(() => {
        colDef = new ColumnDefinition();
    });

    /**
     * Test deserialize
     */
    it('deserialize', () => {
        const col: any = {
            'reportTypes': ['EXPOST'],
            'columnTag': 'ActRetSemid',
            'columnReports': ['prism_all'],
            'isGroupable': false,
            'columnType': 'EXPOST',
            'field': 'ActRetSemid',
            'isSubtotalable': false,
            'isNotSupportedInCustomCal': false,
            'functionFlag': 4,
            'dataType': 'DOUBLE',
            'staticColumn': false,
            'groups': ['Expost', 'Statistics'],
            'uses': 'ACTIVE',
            'title': 'Active Semi Deviation',
            'columnFormat': {
                'scalingOptions': {'Percent (%)': 0.01, 'Basis Point (bp)': 0.0001},
                'scalable': true,
                'scalingFactor': 0.0001,
                'useThousandsSeparator': true,
                'decimalPlaces': 2,
                'configType': NumericColumnFormat.CONFIG_TYPE
            },
            'CLASS_TYPE': DefinitionInitializer.COL_DEF_BEAN,
            'isMacroFactor': true,
            'isRASColumn': false
        };

        colDef.deserialize(col);
        expect(colDef.columnTag).toBe('ActRetSemid');
        expect(colDef.field).toBe('ActRetSemid');
        expect(colDef.title).toBe('Active Semi Deviation');
        expect(colDef.uses).toBe('ACTIVE');
        expect(colDef.isSubtotalable).toBe(false);
        expect(colDef.reportTypes.length).toBe(1);
        expect(colDef.reportTypes[0]).toBe('EXPOST');
        expect(colDef.columnReports.length).toBe(1);
        expect(colDef.columnReports[0]).toBe('prism_all');
        expect(colDef.dataType).toBe('DOUBLE');
        expect(colDef.columnType).toBe('EXPOST');
        expect(colDef.isNotSupportedInCustomCal).toBe(false);
        expect(colDef.groups.length).toBe(2);
        expect(colDef.groups[0]).toBe('Expost');
        expect(colDef.groups[1]).toBe('Statistics');
        expect(colDef.isGroupable).toBe(false);
        expect(colDef.isStaticColumn).toBe(false);
        expect(colDef.columnDesc).toBe(undefined);
        expect(colDef.functionFlag).toBe(4);
        expect(colDef.columnFormat instanceof NumericColumnFormat).toBeTruthy();
        const colFormat = colDef.columnFormat as NumericColumnFormat;
        expect(colFormat.isScalable).toBe(true);
        expect(colFormat.scalingFactor).toBe(0.0001);
        expect(colFormat.isUseThousandsSeparator).toBe(true);
        expect(colFormat.decimalPlaces).toBe(2);
        expect(colFormat.scalingOptions.size).toBe(2);
        expect(colFormat.scalingOptions.get('Percent (%)')).toBe(0.01);
        expect(colFormat.scalingOptions.get('Basis Point (bp)')).toBe(0.0001);
        expect(colDef.strippedName).toBe('Semi Deviation');
        delete col.columnFormat;
        colDef = new ColumnDefinition();
        colDef.deserialize(col);
        expect(colDef.columnFormat).toBe(undefined);
        expect(colDef.isMacroFactor).toBe(true);
        expect(colDef.isRASColumn).toBe(false);
    });
    it('getColumnPath', () => {
        const col = new ColumnDefinition();
        col.title = 'Total Returns';
        expect(col.getColumnPath()).toEqual('Total Returns');
        col.groups = ['Performance', 'Return'];
        expect(col.getColumnPath()).toEqual('Performance / Return / Total Returns');
    });
});
