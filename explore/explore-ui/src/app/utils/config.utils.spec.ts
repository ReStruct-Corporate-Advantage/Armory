import {Breakdown, ColumnBreakdown, ColumnSector} from '@blk/explore-ui-breakdown';
import {ColumnConfig, ColumnDefinition, CoreColumnUtils} from '@blk/explore-ui-core';
import {ConfigUtils} from './config.utils';
import {AggregationColumnOption} from '@blk/explore-ui-column-option';

describe('ConfigUtils Test', () => {
    it('tests isColumnBreakdownPortfolioBreakdown', () => {
        const columnConfig: ColumnConfig = new ColumnConfig();
        expect(ConfigUtils.isColumnBreakdownPortfolioBreakdown(columnConfig)).toBeFalsy();
        columnConfig.optionValues.push(new AggregationColumnOption());
        expect(ConfigUtils.isColumnBreakdownPortfolioBreakdown(columnConfig)).toBeFalsy();
        const columnBreakdown: ColumnBreakdown = new ColumnBreakdown();
        columnConfig.optionValues.push(columnBreakdown);
        expect(ConfigUtils.isColumnBreakdownPortfolioBreakdown(columnConfig)).toBeFalsy();
        columnBreakdown.breakdown = new Breakdown();
        const columnSector: ColumnSector = new ColumnSector();
        columnSector.columnTag = 'portfolio_name';
        columnBreakdown.breakdown.children.push(columnSector);
        expect(ConfigUtils.isColumnBreakdownPortfolioBreakdown(columnConfig)).toBeTruthy();
    });

    it('tests isColumnBreakdownMacroFactor', () => {
        const columnConfig: ColumnConfig = new ColumnConfig();
        expect(ConfigUtils.isColumnBreakdownMacroFactor(columnConfig)).toBeFalsy();
        columnConfig.optionValues.push(new AggregationColumnOption());
        expect(ConfigUtils.isColumnBreakdownMacroFactor(columnConfig)).toBeFalsy();
        const columnBreakdown: ColumnBreakdown = new ColumnBreakdown();
        columnConfig.optionValues.push(columnBreakdown);
        expect(ConfigUtils.isColumnBreakdownMacroFactor(columnConfig)).toBeFalsy();
        columnBreakdown.breakdown = new Breakdown();
        const columnSector: ColumnSector = new ColumnSector();
        columnSector.columnTag = 'MACRO';
        columnBreakdown.breakdown.children.push(columnSector);

        const columnDefinition: ColumnDefinition = new ColumnDefinition();
        columnDefinition.isMacroFactor = true;

        const colDefSpy = jest.spyOn(CoreColumnUtils, 'getColumnDefByTagAndUse');
        colDefSpy.mockReturnValue(columnDefinition);
        expect(ConfigUtils.isColumnBreakdownMacroFactor(columnConfig)).toBeTruthy();

        columnDefinition.isMacroFactor = null;
        expect(ConfigUtils.isColumnBreakdownMacroFactor(columnConfig)).toBeFalsy();
    });
});
