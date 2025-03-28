import {DefinitionInitializer} from '../definition.initializer';
import {NumericColumnFormat} from './column-format/numeric-column-format.model';
import {PortfolioRiskColumnCategoryDefinition} from './portfolio-risk-column-category-definition.model';

/**
 * Test cases for PortfolioRiskColumnCategoryDefinition model class
 */
describe('PortfolioRiskColumnCategoryDefinition', () => {
    beforeAll(() => {
        DefinitionInitializer.registerDefinitionsConfigTypes();
    });

    /**
     * Test deserialize
     */
    it('deserialize', () => {
        const col: any = {'matchingRiskCategories': ['BELONGS_TO_FACTOR_REPORT', 'IS_ACTIVE', 'IS_FACTOR_ATTRIBUTION', 'IS_DIRECT_DECOMP_COLUMN'],
            'isSubtotalable': true, 'isNotSupportedInCustomCal': false, 'functionFlag': 22536, 'dataType': 'DOUBLE', 'staticColumn': false, 'groups': ['Return Attribution'],
            'title': 'Active Factor PNL', 'reportTypes': ['TREND'], 'columnTag': 'act_dd_pnl', 'columnReports': ['factor_attrib_dd'], 'isGroupable': true,
            'columnType': 'RISK_FACTOR_VIEW', 'field': 'ActiveFADirectDecompPNL', 'uses': 'ACTIVE', 'columnFormat': {'scalingOptions': {'Thousands (m)': 1000, 'Millions (mm)': 1000000, 'None': 1, 'Billions (mmm)': 1000000000},
            'scalable': true, 'scalingFactor': 1, 'useThousandsSeparator': true, 'decimalPlaces': 0, 'configType': NumericColumnFormat.CONFIG_TYPE},
            'columnDesc': 'The market value weight multiplied by the effective duration.', 'CLASS_TYPE': DefinitionInitializer.PORT_RISK_COL_CAT_DEF_BEAN};

        const colDef = new PortfolioRiskColumnCategoryDefinition();
        colDef.deserialize(col);
        expect(colDef.columnTag).toBe('act_dd_pnl');
        expect(colDef.field).toBe('ActiveFADirectDecompPNL');
        expect(colDef.title).toBe('Active Factor PNL');
        expect(colDef.uses).toBe('ACTIVE');
        expect(colDef.isSubtotalable).toBe(true);
        expect(colDef.reportTypes.length).toBe(1);
        expect(colDef.reportTypes[0]).toBe('TREND');
        expect(colDef.columnReports.length).toBe(1);
        expect(colDef.columnReports[0]).toBe('factor_attrib_dd');
        expect(colDef.dataType).toBe('DOUBLE');
        expect(colDef.columnType).toBe('RISK_FACTOR_VIEW');
        expect(colDef.isNotSupportedInCustomCal).toBe(false);
        expect(colDef.groups.length).toBe(1);
        expect(colDef.groups[0]).toBe('Return Attribution');
        expect(colDef.isGroupable).toBe(true);
        expect(colDef.isStaticColumn).toBe(false);
        expect(colDef.columnDesc).toBe('The market value weight multiplied by the effective duration.');
        expect(colDef.functionFlag).toBe(22536);
        const colFormat = colDef.columnFormat as NumericColumnFormat;
        expect(colFormat.isScalable).toBe(true);
        expect(colFormat.scalingFactor).toBe(1);
        expect(colFormat.isUseThousandsSeparator).toBe(true);
        expect(colFormat.decimalPlaces).toBe(0);
        expect(colFormat.scalingOptions.size).toBe(4);
        expect(colFormat.scalingOptions.get('Thousands (m)')).toBe(1000);
        expect(colFormat.scalingOptions.get('Millions (mm)')).toBe(1000000);
        expect(colFormat.scalingOptions.get('None')).toBe(1);
        expect(colFormat.scalingOptions.get('Billions (mmm)')).toBe(1000000000);
        expect(colDef.matchingRiskCategories.length).toBe(4);
        expect(colDef.matchingRiskCategories[0]).toBe('BELONGS_TO_FACTOR_REPORT');
        expect(colDef.matchingRiskCategories[1]).toBe('IS_ACTIVE');
        expect(colDef.matchingRiskCategories[2]).toBe('IS_FACTOR_ATTRIBUTION');
        expect(colDef.matchingRiskCategories[3]).toBe('IS_DIRECT_DECOMP_COLUMN');
    });
});
