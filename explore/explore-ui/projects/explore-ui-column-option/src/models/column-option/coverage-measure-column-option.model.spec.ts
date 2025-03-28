import {AbstractColumnOption, ColumnConfig, ColumnOptionFactory} from '@blk/explore-ui-core';
import {AggregationColumnOption} from './aggregation-column-option.model';
import {CoverageMeasureColumnOption} from './coverage-measure-column-option.model';

describe('CoverageMeasureColumnOption', () => {
    let coverageMeasureColumnOption: CoverageMeasureColumnOption;

    beforeAll(() => {
        ColumnOptionFactory.registerOptionType(CoverageMeasureColumnOption.CONFIG_TYPE, CoverageMeasureColumnOption);
    });

    beforeEach(() => {
        coverageMeasureColumnOption = new CoverageMeasureColumnOption();
        coverageMeasureColumnOption.column = ColumnConfig.createColumn('pct_mv', 'PORT', undefined, 'Market Value %');
    });

    it('test CreateRequest Params', () => {
        let optionValues: any = {};
        coverageMeasureColumnOption.addRequestParams(optionValues);
        expect(optionValues.coverageMeasureColumn.columnTag).toEqual('pct_mv');

        optionValues = {};
        coverageMeasureColumnOption.column = undefined;
        coverageMeasureColumnOption.addRequestParams(optionValues);
        expect(optionValues.coverageMeasureColumn).toBeUndefined();
    });

    it('Test serialize/deserialize', () => {
        const serialized = coverageMeasureColumnOption.serialize(false);

        const deserialized = new CoverageMeasureColumnOption(serialized);
        expect(deserialized.column.columnTag).toEqual(coverageMeasureColumnOption.column.columnTag);
        expect(deserialized.column.positionColumnType).toEqual(coverageMeasureColumnOption.column.positionColumnType);
    });

    it('Test create from factory', () => {
        const columnOption: AbstractColumnOption = ColumnOptionFactory.createNewModel(CoverageMeasureColumnOption.CONFIG_TYPE);

        expect(columnOption instanceof CoverageMeasureColumnOption).toBeTruthy();
    });

    it('Test equals', () => {
        const column2 = new CoverageMeasureColumnOption();

        column2.column = coverageMeasureColumnOption.column;
        expect(coverageMeasureColumnOption.equals(column2)).toEqual(true);

        column2.column = ColumnConfig.createColumn('pct_mv', 'BENCH', undefined, 'Market Value %');
        expect(coverageMeasureColumnOption.equals(column2)).toEqual(false);

        expect(coverageMeasureColumnOption.equals(new AggregationColumnOption())).toEqual(false);
    });

    it('Test isValid', () => {
        coverageMeasureColumnOption = new CoverageMeasureColumnOption();

        expect(coverageMeasureColumnOption.isValid()).toEqual(false);

        coverageMeasureColumnOption.column = ColumnConfig.createColumn('pct_mv', 'BENCH', undefined, 'Market Value %');
        expect(coverageMeasureColumnOption.isValid()).toEqual(true);
    });

    it('Test isValidColumnOption', () => {
        coverageMeasureColumnOption = new CoverageMeasureColumnOption();

        let validationInfo = coverageMeasureColumnOption.isValidColumnOption();
        expect(validationInfo.message).toEqual(CoverageMeasureColumnOption.INVALID_MEASURE_ERROR);

        coverageMeasureColumnOption.column = ColumnConfig.createColumn('pct_mv', 'BENCH', undefined, 'Market Value %');
        validationInfo = coverageMeasureColumnOption.isValidColumnOption();
        expect(validationInfo).toBeUndefined();
    });

    it('test getModifiedColumnTitle', () => {
        coverageMeasureColumnOption = new CoverageMeasureColumnOption();
        coverageMeasureColumnOption.column = ColumnConfig.createColumn('pct_mv', 'PORT', undefined, 'Market Value %');

        expect(coverageMeasureColumnOption.getModifiedColumnTitle('Coverage')).toEqual('Coverage, Market Value %');
    });
});
