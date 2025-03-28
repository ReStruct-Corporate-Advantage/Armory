import {BetweenHighlightRule} from './between-highlight-rule.model';
import {TestUtils} from '@utils/test.utils';
import {HighlightRuleTestUtils} from '@models/highlight-rules/highlight-rule.test-utils';
import {HighlightComparisonType, HighlightSettings} from '@blk/explore-ui-column-option';
import {ColumnConfig, ResponseData} from '@blk/explore-ui-core';

describe('BetweenHighlightRule', () => {

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

    it('should apply BETWEEN highlight rule - number, leaf only', () => {
        columnConfig = HighlightRuleTestUtils.getMktValPercent_ColumnConfig();
        dataColumnIndex = HighlightRuleTestUtils.getMktValPercent_DataIndex();

        highlightSetting = new HighlightSettings();
        highlightSetting.backGroundColors = ['rgb(242, 180, 205)', 'rgb(211, 211, 211)'];
        highlightSetting.foreGroundColors = ['rgb(242, 25, 205)'];
        highlightSetting.comparisonRawValues = [0.20, 0.50];
        highlightSetting.comparisonType = HighlightComparisonType.BETWEEN;
        highlightSetting.comparisonValues = [];
        highlightSetting.isEnabled = true;

        const highlightRule = new BetweenHighlightRule(highlightSetting, columnConfig, dataColumnIndex, []);
        highlightRule.applyRuleToData(responseDataMock, true);

        expect(responseDataMock.children[0].children[0].fgColorData).toEqual([undefined, undefined, 'rgb(242, 25, 205)']);
        expect(responseDataMock.children[0].children[0].bgColorData).toEqual([undefined, undefined, 'rgb(242, 180, 205)']);
        expect(responseDataMock.children[0].children[1].bgColorData).toEqual([undefined, undefined, undefined]);
        expect(responseDataMock.children[0].bgColorData).toBeUndefined();

        expect(responseDataMock.children[1].children[0].fgColorData).toEqual([undefined, undefined, 'rgb(242, 25, 205)']);
        expect(responseDataMock.children[1].children[0].bgColorData).toEqual([undefined, undefined, 'rgb(242, 180, 205)']);
        expect(responseDataMock.children[1].children[1].bgColorData).toEqual([undefined, undefined, 'rgb(242, 180, 205)']);
        expect(responseDataMock.children[1].children[2].bgColorData).toEqual([undefined, undefined, undefined]);
        expect(responseDataMock.children[1].bgColorData).toBeUndefined();

        expect(responseDataMock.bgColorData).toBeUndefined();
    });

    it('should apply BETWEEN highlight rule - number, not leaf only', () => {
        columnConfig = HighlightRuleTestUtils.getMktValPercent_ColumnConfig();
        dataColumnIndex = HighlightRuleTestUtils.getMktValPercent_DataIndex();

        highlightSetting = new HighlightSettings();
        highlightSetting.backGroundColors = ['rgb(242, 180, 205)', 'rgb(211, 211, 211)'];
        highlightSetting.foreGroundColors = ['rgb(242, 25, 205)'];
        highlightSetting.comparisonRawValues = [0.20, 0.50];
        highlightSetting.comparisonType = HighlightComparisonType.BETWEEN;
        highlightSetting.comparisonValues = [];
        highlightSetting.isEnabled = true;

        const highlightRule = new BetweenHighlightRule(highlightSetting, columnConfig, dataColumnIndex, []);
        highlightRule.applyRuleToData(responseDataMock, false);

        expect(responseDataMock.children[0].children[0].fgColorData).toEqual([undefined, undefined, 'rgb(242, 25, 205)']);
        expect(responseDataMock.children[0].children[0].bgColorData).toEqual([undefined, undefined, 'rgb(242, 180, 205)']);
        expect(responseDataMock.children[0].children[1].bgColorData).toEqual([undefined, undefined, undefined]);
        expect(responseDataMock.children[0].bgColorData).toEqual([undefined, undefined, 'rgb(242, 180, 205)']);

        expect(responseDataMock.children[1].children[0].fgColorData).toEqual([undefined, undefined, 'rgb(242, 25, 205)']);
        expect(responseDataMock.children[1].children[0].bgColorData).toEqual([undefined, undefined, 'rgb(242, 180, 205)']);
        expect(responseDataMock.children[1].children[1].bgColorData).toEqual([undefined, undefined, 'rgb(242, 180, 205)']);
        expect(responseDataMock.children[1].children[2].bgColorData).toEqual([undefined, undefined, undefined]);
        expect(responseDataMock.children[1].bgColorData).toEqual([undefined, undefined, undefined]);

        expect(responseDataMock.bgColorData).toEqual([undefined, undefined, undefined]);
    });

    it('should apply BETWEEN highlight rule - date', () => {
        columnConfig = HighlightRuleTestUtils.getPriceDate_ColumnConfig();
        dataColumnIndex = HighlightRuleTestUtils.getPriceDate_DataIndex();

        highlightSetting = new HighlightSettings();
        highlightSetting.backGroundColors = ['rgb(242, 180, 205)', 'rgb(211, 211, 211)'];
        highlightSetting.foreGroundColors = ['rgb(242, 25, 205)'];
        highlightSetting.comparisonRawValues = ['01-FEB-2020', '02-MAR-2020'];
        highlightSetting.comparisonType = HighlightComparisonType.BETWEEN;
        highlightSetting.comparisonValues = [];
        highlightSetting.isEnabled = true;

        const highlightRule = new BetweenHighlightRule(highlightSetting, columnConfig, dataColumnIndex, []);
        highlightRule.applyRuleToData(responseDataMock, true);

        expect(responseDataMock.children[0].children[0].fgColorData).toEqual([undefined, undefined, undefined, undefined]);
        expect(responseDataMock.children[0].children[0].bgColorData).toEqual([undefined, undefined, undefined, undefined]);
        expect(responseDataMock.children[0].children[1].bgColorData).toEqual([undefined, undefined, undefined, undefined]);
        expect(responseDataMock.children[0].bgColorData).toBeUndefined();

        expect(responseDataMock.children[1].children[0].fgColorData).toEqual([undefined, undefined, undefined,'rgb(242, 25, 205)']);
        expect(responseDataMock.children[1].children[0].bgColorData).toEqual([undefined, undefined, undefined, 'rgb(242, 180, 205)']);
        expect(responseDataMock.children[1].children[1].bgColorData).toEqual([undefined, undefined, undefined, undefined]);
        expect(responseDataMock.children[1].children[2].bgColorData).toEqual([undefined, undefined, undefined, 'rgb(242, 180, 205)']);
        expect(responseDataMock.children[1].bgColorData).toBeUndefined();

        expect(responseDataMock.bgColorData).toBeUndefined();
    });
});
