import {TopBottomHighlightRule} from './top-bottom-highlight-rule.model';
import {TestUtils} from '@utils/test.utils';
import {HighlightRuleTestUtils} from '@models/highlight-rules/highlight-rule.test-utils';
import {HighlightComparisonType, HighlightSettings} from '@blk/explore-ui-column-option';
import {ResponseData, ColumnConfig} from '@blk/explore-ui-core';

describe('TopBottomHighlightRule', () => {

    let highlightSetting: HighlightSettings;
    let columnConfig: ColumnConfig;
    let dataColumnIndex: number;

    let responseDataMock: ResponseData;

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        responseDataMock = HighlightRuleTestUtils.getMockResponseData();
    });

    describe('TOP % Highlight Rule Tests', () => {
        it('should apply rule - number, leaf only', () => {
            columnConfig = HighlightRuleTestUtils.getMktValPercent_ColumnConfig();
            dataColumnIndex = HighlightRuleTestUtils.getMktValPercent_DataIndex();

            highlightSetting = new HighlightSettings();
            highlightSetting.backGroundColors = ['rgb(242, 180, 205)', 'rgb(211, 211, 211)'];
            highlightSetting.foreGroundColors = ['rgb(242, 25, 205)'];
            highlightSetting.comparisonRawValues = [10];
            highlightSetting.comparisonType = HighlightComparisonType.TOP;
            highlightSetting.comparisonValues = [];
            highlightSetting.isEnabled = true;

            const highlightRule = new TopBottomHighlightRule(
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
            expect(responseDataMock.children[1].children[2].bgColorData).toEqual([undefined, undefined, undefined]);
            expect(responseDataMock.children[1].bgColorData).toBeUndefined();

            expect(responseDataMock.bgColorData).toBeUndefined();
        });

        it('should apply rule - number, not leaf only', () => {
            columnConfig = HighlightRuleTestUtils.getMktValPercent_ColumnConfig();
            dataColumnIndex = HighlightRuleTestUtils.getMktValPercent_DataIndex();

            highlightSetting = new HighlightSettings();
            highlightSetting.backGroundColors = ['rgb(242, 180, 205)', 'rgb(211, 211, 211)'];
            highlightSetting.foreGroundColors = ['rgb(242, 25, 205)'];
            highlightSetting.comparisonRawValues = [10];
            highlightSetting.comparisonType = HighlightComparisonType.TOP;
            highlightSetting.comparisonValues = [];
            highlightSetting.isEnabled = true;

            const highlightRule = new TopBottomHighlightRule(
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
            expect(responseDataMock.children[1].children[2].bgColorData).toEqual([undefined, undefined, undefined]);
            expect(responseDataMock.children[1].bgColorData).toEqual([undefined, undefined, 'rgb(242, 180, 205)']);

            expect(responseDataMock.bgColorData).toEqual([undefined, undefined, 'rgb(242, 180, 205)']);
        });
    });

    describe('BOTTOM % Highlight Rule Tests', () => {
        it('should apply rule - number, leaf only', () => {
            columnConfig = HighlightRuleTestUtils.getMktValPercent_ColumnConfig();
            dataColumnIndex = HighlightRuleTestUtils.getMktValPercent_DataIndex();

            highlightSetting = new HighlightSettings();
            highlightSetting.backGroundColors = ['rgb(242, 180, 205)', 'rgb(211, 211, 211)'];
            highlightSetting.foreGroundColors = ['rgb(242, 25, 205)'];
            highlightSetting.comparisonRawValues = [25];
            highlightSetting.comparisonType = HighlightComparisonType.BOTTOM;
            highlightSetting.comparisonValues = [];
            highlightSetting.isEnabled = true;

            const highlightRule = new TopBottomHighlightRule(
                highlightSetting,
                columnConfig,
                dataColumnIndex,
                HighlightRuleTestUtils.getMktValPercent_LeafValues()
            );
            highlightRule.applyRuleToData(responseDataMock, true);

            expect(responseDataMock.children[0].children[0].bgColorData).toEqual([undefined, undefined, undefined]);
            expect(responseDataMock.children[0].children[1].bgColorData).toEqual([undefined, undefined, 'rgb(242, 180, 205)']);
            expect(responseDataMock.children[0].bgColorData).toBeUndefined();

            expect(responseDataMock.children[1].children[0].bgColorData).toEqual([undefined, undefined, undefined]);
            expect(responseDataMock.children[1].children[1].bgColorData).toEqual([undefined, undefined, undefined]);
            expect(responseDataMock.children[1].children[2].bgColorData).toEqual([undefined, undefined, 'rgb(242, 180, 205)']);
            expect(responseDataMock.children[1].bgColorData).toBeUndefined();

            expect(responseDataMock.bgColorData).toBeUndefined();
        });
    });
});
