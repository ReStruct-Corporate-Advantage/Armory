import {EqualsHighlightRule} from './equals-highlight-rule.model';
import {TestUtils} from '@utils/test.utils';
import {HighlightRuleTestUtils} from '@models/highlight-rules/highlight-rule.test-utils';
import {ColumnConfig} from '@blk/explore-ui-core';
import {HighlightComparisonType, HighlightSettings} from '@blk/explore-ui-column-option';
import {ResponseData} from '@blk/explore-ui-core';

describe('Equals Highlight Rule Tests', () => {

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

    it('should apply EQUALS highlight rule - number, leaf only', () => {
        columnConfig = HighlightRuleTestUtils.getMktValPercent_ColumnConfig();
        dataColumnIndex = HighlightRuleTestUtils.getMktValPercent_DataIndex();

        highlightSetting = new HighlightSettings();
        highlightSetting.backGroundColors = ['rgb(242, 180, 205)', 'rgb(211, 211, 211)'];
        highlightSetting.foreGroundColors = ['rgb(242, 25, 205)'];
        highlightSetting.comparisonRawValues = [0.25];
        highlightSetting.comparisonType = HighlightComparisonType.EQUALS;
        highlightSetting.comparisonValues = [];
        highlightSetting.isEnabled = true;

        const highlightRule = new EqualsHighlightRule(highlightSetting, columnConfig, dataColumnIndex, []);
        highlightRule.applyRuleToData(responseDataMock, true);

        expect(responseDataMock.children[0].children[0].fgColorData).toEqual([undefined, undefined, 'rgb(242, 25, 205)']);
        expect(responseDataMock.children[0].children[0].bgColorData).toEqual([undefined, undefined, 'rgb(242, 180, 205)']);
        expect(responseDataMock.children[0].children[1].bgColorData).toEqual([undefined, undefined, undefined]);
        expect(responseDataMock.children[0].bgColorData).toBeUndefined();

        expect(responseDataMock.children[1].children[0].fgColorData).toEqual([undefined, undefined, undefined]);
        expect(responseDataMock.children[1].children[0].bgColorData).toEqual([undefined, undefined, undefined]);
        expect(responseDataMock.children[1].children[1].bgColorData).toEqual([undefined, undefined, 'rgb(242, 180, 205)']);
        expect(responseDataMock.children[1].children[2].bgColorData).toEqual([undefined, undefined, undefined]);
        expect(responseDataMock.children[1].bgColorData).toBeUndefined();

        expect(responseDataMock.bgColorData).toBeUndefined();
    });

    it('should apply EQUALS highlight rule - number, not leaf only', () => {
        columnConfig = HighlightRuleTestUtils.getMktValPercent_ColumnConfig();
        dataColumnIndex = HighlightRuleTestUtils.getMktValPercent_DataIndex();

        highlightSetting = new HighlightSettings();
        highlightSetting.backGroundColors = ['rgb(242, 180, 205)', 'rgb(211, 211, 211)'];
        highlightSetting.foreGroundColors = ['rgb(242, 25, 205)'];
        highlightSetting.comparisonRawValues = [0.60];
        highlightSetting.comparisonType = HighlightComparisonType.EQUALS;
        highlightSetting.comparisonValues = [];
        highlightSetting.isEnabled = true;

        const highlightRule = new EqualsHighlightRule(highlightSetting, columnConfig, dataColumnIndex, []);
        highlightRule.applyRuleToData(responseDataMock, false);

        expect(responseDataMock.children[0].children[0].bgColorData).toEqual([undefined, undefined, undefined]);
        expect(responseDataMock.children[0].children[1].bgColorData).toEqual([undefined, undefined, undefined]);
        expect(responseDataMock.children[0].bgColorData).toEqual([undefined, undefined, undefined]);

        expect(responseDataMock.children[1].children[0].bgColorData).toEqual([undefined, undefined, undefined]);
        expect(responseDataMock.children[1].children[1].bgColorData).toEqual([undefined, undefined, undefined]);
        expect(responseDataMock.children[1].children[2].bgColorData).toEqual([undefined, undefined, undefined]);
        expect(responseDataMock.children[1].bgColorData).toEqual([undefined, undefined, 'rgb(242, 180, 205)']);
        expect(responseDataMock.children[1].fgColorData).toEqual([undefined, undefined, 'rgb(242, 25, 205)']);

        expect(responseDataMock.bgColorData).toEqual([undefined, undefined, undefined]);
    });

    it('should apply EQUALS highlight rule - string', () => {
        columnConfig = HighlightRuleTestUtils.getCountryName_ColumnConfig();
        dataColumnIndex = HighlightRuleTestUtils.getCountryName_DataIndex();

        highlightSetting = new HighlightSettings();
        highlightSetting.backGroundColors = ['rgb(242, 180, 205)', 'rgb(211, 211, 211)'];
        highlightSetting.foreGroundColors = ['rgb(242, 25, 205)'];
        highlightSetting.comparisonRawValues = ['European Union'];
        highlightSetting.comparisonType = HighlightComparisonType.EQUALS;
        highlightSetting.comparisonValues = [];
        highlightSetting.isEnabled = true;

        const highlightRule = new EqualsHighlightRule(highlightSetting, columnConfig, dataColumnIndex, []);
        highlightRule.applyRuleToData(responseDataMock, false);

        expect(responseDataMock.children[0].children[0].bgColorData).toEqual([undefined, undefined, undefined, undefined, undefined]);
        expect(responseDataMock.children[0].children[1].bgColorData).toEqual([undefined, undefined, undefined, undefined, undefined]);
        expect(responseDataMock.children[0].bgColorData).toBeUndefined();

        expect(responseDataMock.children[1].children[0].bgColorData).toEqual([undefined, undefined, undefined, undefined, 'rgb(242, 180, 205)']);
        expect(responseDataMock.children[1].children[1].bgColorData).toEqual([undefined, undefined, undefined, undefined, 'rgb(242, 180, 205)']);
        expect(responseDataMock.children[1].children[2].bgColorData).toEqual([undefined, undefined, undefined, undefined, 'rgb(242, 180, 205)']);
        expect(responseDataMock.children[1].bgColorData).toBeUndefined();

        expect(responseDataMock.bgColorData).toBeUndefined();
    });

    it('should apply EQUALS highlight rule - date', () => {
        columnConfig = HighlightRuleTestUtils.getPriceDate_ColumnConfig();
        dataColumnIndex = HighlightRuleTestUtils.getPriceDate_DataIndex();

        highlightSetting = new HighlightSettings();
        highlightSetting.backGroundColors = ['rgb(242, 180, 205)', 'rgb(211, 211, 211)'];
        highlightSetting.foreGroundColors = ['rgb(242, 25, 205)'];
        highlightSetting.comparisonRawValues = ['12-MAR-2020'];
        highlightSetting.comparisonType = HighlightComparisonType.EQUALS;
        highlightSetting.comparisonValues = [];
        highlightSetting.isEnabled = true;

        const highlightRule = new EqualsHighlightRule(highlightSetting, columnConfig, dataColumnIndex, []);
        highlightRule.applyRuleToData(responseDataMock, false);

        expect(responseDataMock.children[0].children[0].bgColorData).toEqual([undefined, undefined, undefined, undefined]);
        expect(responseDataMock.children[0].children[1].bgColorData).toEqual([undefined, undefined, undefined, 'rgb(242, 180, 205)']);
        expect(responseDataMock.children[0].bgColorData).toBeUndefined();

        expect(responseDataMock.children[1].children[0].bgColorData).toEqual([undefined, undefined, undefined, undefined]);
        expect(responseDataMock.children[1].children[1].bgColorData).toEqual([undefined, undefined, undefined, undefined]);
        expect(responseDataMock.children[1].children[2].bgColorData).toEqual([undefined, undefined, undefined, undefined]);
        expect(responseDataMock.children[1].bgColorData).toBeUndefined();

        expect(responseDataMock.bgColorData).toBeUndefined();
    });

    it('should apply NOT EQUALS highlight rule - number, not leaf only', () => {
        columnConfig = HighlightRuleTestUtils.getMktValPercent_ColumnConfig();
        dataColumnIndex = HighlightRuleTestUtils.getMktValPercent_DataIndex();

        highlightSetting = new HighlightSettings();
        highlightSetting.backGroundColors = ['rgb(242, 180, 205)', 'rgb(211, 211, 211)'];
        highlightSetting.foreGroundColors = ['rgb(242, 25, 205)'];
        highlightSetting.comparisonRawValues = [0.25];
        highlightSetting.comparisonType = HighlightComparisonType.DOES_NOT_EQUAL;
        highlightSetting.comparisonValues = [];
        highlightSetting.isEnabled = true;

        const highlightRule = new EqualsHighlightRule(highlightSetting, columnConfig, dataColumnIndex, []);
        highlightRule.applyRuleToData(responseDataMock, false);

        expect(responseDataMock.children[0].children[0].bgColorData).toEqual([undefined, undefined, undefined]);
        expect(responseDataMock.children[0].children[1].bgColorData).toEqual([undefined, undefined, 'rgb(242, 180, 205)']);
        expect(responseDataMock.children[0].bgColorData).toEqual([undefined, undefined, 'rgb(242, 180, 205)']);

        expect(responseDataMock.children[1].children[0].bgColorData).toEqual([undefined, undefined, 'rgb(242, 180, 205)']);
        expect(responseDataMock.children[1].children[1].bgColorData).toEqual([undefined, undefined, undefined]);
        expect(responseDataMock.children[1].children[2].bgColorData).toEqual([undefined, undefined, 'rgb(242, 180, 205)']);
        expect(responseDataMock.children[1].bgColorData).toEqual([undefined, undefined, 'rgb(242, 180, 205)']);

        expect(responseDataMock.bgColorData).toEqual([undefined, undefined, 'rgb(242, 180, 205)']);
    });
});
