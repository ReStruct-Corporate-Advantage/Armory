import {StdDeviationHighlightRule} from './std-deviation-highlight-rule.model';
import {TestUtils} from '@utils/test.utils';
import {HighlightRuleTestUtils} from '@models/highlight-rules/highlight-rule.test-utils';
import {ColumnConfig, ResponseData} from '@blk/explore-ui-core';
import {HighlightComparisonType, HighlightSettings} from '@blk/explore-ui-column-option';

describe('StdDeviationHighlightRule', () => {

    let highlightSetting: HighlightSettings;
    let columnConfig: ColumnConfig;
    let dataColumnIndex: number;

    let responseDataMock: ResponseData;

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        responseDataMock = HighlightRuleTestUtils.getMockResponseData();

        columnConfig = HighlightRuleTestUtils.getMktValPercent_ColumnConfig();
        dataColumnIndex = HighlightRuleTestUtils.getMktValPercent_DataIndex();
    });

    it('should apply STD_DEV_IN rule - leaf only', () => {
        highlightSetting = new HighlightSettings();
        highlightSetting.backGroundColors = ['rgb(242, 180, 205)', 'rgb(211, 211, 211)'];
        highlightSetting.foreGroundColors = ['rgb(242, 25, 205)'];
        // mean: 0.2, std dev: 0.089442719099992
        // (mean - std_dev) < value < (mean + std_dev)
        highlightSetting.comparisonRawValues = [1];
        highlightSetting.comparisonType = HighlightComparisonType.STD_DEV_IN;
        highlightSetting.comparisonValues = [];
        highlightSetting.isEnabled = true;

        const highlightRule = new StdDeviationHighlightRule(
            highlightSetting,
            columnConfig,
            dataColumnIndex,
            HighlightRuleTestUtils.getMktValPercent_LeafValues()
        );
        highlightRule.applyRuleToData(responseDataMock, true);

        expect(responseDataMock.children[0].children[0].bgColorData).toEqual([undefined, undefined, 'rgb(242, 180, 205)']);
        expect(responseDataMock.children[0].children[1].bgColorData).toEqual([undefined, undefined, 'rgb(242, 180, 205)']);
        expect(responseDataMock.children[0].bgColorData).toBeUndefined();

        expect(responseDataMock.children[1].children[0].bgColorData).toEqual([undefined, undefined, undefined]);
        expect(responseDataMock.children[1].children[1].bgColorData).toEqual([undefined, undefined, 'rgb(242, 180, 205)']);
        expect(responseDataMock.children[1].children[2].bgColorData).toEqual([undefined, undefined, undefined]);
        expect(responseDataMock.children[1].bgColorData).toBeUndefined();

        expect(responseDataMock.bgColorData).toBeUndefined();
    });

    it('should apply STD_DEV_OUT rule - leaf only', () => {
        columnConfig = HighlightRuleTestUtils.getMktValPercent_ColumnConfig();
        dataColumnIndex = HighlightRuleTestUtils.getMktValPercent_DataIndex();

        highlightSetting = new HighlightSettings();
        highlightSetting.backGroundColors = ['rgb(242, 180, 205)', 'rgb(211, 211, 211)'];
        highlightSetting.foreGroundColors = ['rgb(242, 25, 205)'];
        // mean: 0.2, std dev: 0.089442719099992
        // (mean - std_dev) < value < (mean + std_dev)
        highlightSetting.comparisonRawValues = [1];
        highlightSetting.comparisonType = HighlightComparisonType.STD_DEV_OUT;
        highlightSetting.comparisonValues = [];
        highlightSetting.isEnabled = true;

        const highlightRule = new StdDeviationHighlightRule(
            highlightSetting,
            columnConfig,
            dataColumnIndex,
            HighlightRuleTestUtils.getMktValPercent_LeafValues()
        );
        highlightRule.applyRuleToData(responseDataMock, true);

        expect(responseDataMock.children[0].children[0].bgColorData).toEqual([undefined, undefined, undefined]);
        expect(responseDataMock.children[0].children[1].bgColorData).toEqual([undefined, undefined, undefined]);
        expect(responseDataMock.children[0].bgColorData).toBeUndefined();

        expect(responseDataMock.children[1].children[0].bgColorData).toEqual([undefined, undefined, 'rgb(242, 180, 205)']);
        expect(responseDataMock.children[1].children[1].bgColorData).toEqual([undefined, undefined, undefined]);
        expect(responseDataMock.children[1].children[2].bgColorData).toEqual([undefined, undefined, 'rgb(242, 180, 205)']);
        expect(responseDataMock.children[1].bgColorData).toBeUndefined();

        expect(responseDataMock.bgColorData).toBeUndefined();
    });

    it('should apply STD_DEV_OUT rule - not leaf only', () => {
        highlightSetting = new HighlightSettings();
        highlightSetting.backGroundColors = ['rgb(242, 180, 205)', 'rgb(211, 211, 211)'];
        highlightSetting.foreGroundColors = ['rgb(242, 25, 205)'];
        // mean: 0.2, std dev: 0.089442719099992
        // (mean - std_dev) < value < (mean + std_dev)
        highlightSetting.comparisonRawValues = [1];
        highlightSetting.comparisonType = HighlightComparisonType.STD_DEV_OUT;
        highlightSetting.comparisonValues = [];
        highlightSetting.isEnabled = true;

        const highlightRule = new StdDeviationHighlightRule(
            highlightSetting,
            columnConfig,
            dataColumnIndex,
            HighlightRuleTestUtils.getMktValPercent_LeafValues()
        );
        highlightRule.applyRuleToData(responseDataMock, false);

        expect(responseDataMock.children[0].children[0].bgColorData).toEqual([undefined, undefined, undefined]);
        expect(responseDataMock.children[0].children[1].bgColorData).toEqual([undefined, undefined, undefined]);
        expect(responseDataMock.children[0].bgColorData).toEqual([undefined, undefined, 'rgb(242, 180, 205)']);

        expect(responseDataMock.children[1].children[0].bgColorData).toEqual([undefined, undefined, 'rgb(242, 180, 205)']);
        expect(responseDataMock.children[1].children[1].bgColorData).toEqual([undefined, undefined, undefined]);
        expect(responseDataMock.children[1].children[2].bgColorData).toEqual([undefined, undefined, 'rgb(242, 180, 205)']);
        expect(responseDataMock.children[1].bgColorData).toEqual([undefined, undefined, 'rgb(242, 180, 205)']);

        expect(responseDataMock.bgColorData).toEqual([undefined, undefined, 'rgb(242, 180, 205)']);
    });

    it('should apply STD_DEV_OUT rule - not leaf only, 2 std dev', () => {
        highlightSetting = new HighlightSettings();
        highlightSetting.backGroundColors = ['rgb(242, 180, 205)', 'rgb(211, 211, 211)'];
        highlightSetting.foreGroundColors = ['rgb(242, 25, 205)'];
        // mean: 0.2, std dev: 0.089442719099992
        // (mean - 2*std_dev) < value < (mean + 2*std_dev)
        highlightSetting.comparisonRawValues = [2];
        highlightSetting.comparisonType = HighlightComparisonType.STD_DEV_OUT;
        highlightSetting.comparisonValues = [];
        highlightSetting.isEnabled = true;

        const highlightRule = new StdDeviationHighlightRule(
            highlightSetting,
            columnConfig,
            dataColumnIndex,
            HighlightRuleTestUtils.getMktValPercent_LeafValues()
        );
        highlightRule.applyRuleToData(responseDataMock, false);

        expect(responseDataMock.children[0].children[0].bgColorData).toEqual([undefined, undefined, undefined]);
        expect(responseDataMock.children[0].children[1].bgColorData).toEqual([undefined, undefined, undefined]);
        expect(responseDataMock.children[0].bgColorData).toEqual([undefined, undefined, 'rgb(242, 180, 205)']);

        expect(responseDataMock.children[1].children[0].bgColorData).toEqual([undefined, undefined, undefined]);
        expect(responseDataMock.children[1].children[1].bgColorData).toEqual([undefined, undefined, undefined]);
        expect(responseDataMock.children[1].children[2].bgColorData).toEqual([undefined, undefined, undefined]);
        expect(responseDataMock.children[1].bgColorData).toEqual([undefined, undefined, 'rgb(242, 180, 205)']);

        expect(responseDataMock.bgColorData).toEqual([undefined, undefined, 'rgb(242, 180, 205)']);
    });
});
