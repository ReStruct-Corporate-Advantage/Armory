import {StringHighlightRule} from './string-highlight-rule.model';
import {TestUtils} from '@utils/test.utils';
import {HighlightRuleTestUtils} from '@models/highlight-rules/highlight-rule.test-utils';
import {ColumnConfig} from '@blk/explore-ui-core';
import {HighlightComparisonType, HighlightSettings} from '@blk/explore-ui-column-option';
import {ResponseData} from '@blk/explore-ui-core';

describe('StringHighlightRule', () => {

    let highlightSetting: HighlightSettings;
    let columnConfig: ColumnConfig;
    let dataColumnIndex: number;

    let responseDataMock: ResponseData;

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        columnConfig = HighlightRuleTestUtils.getCountryName_ColumnConfig();
        dataColumnIndex = HighlightRuleTestUtils.getCountryName_DataIndex();

        responseDataMock = HighlightRuleTestUtils.getMockResponseData();
    });

    it('should apply CONTAINS highlight rule', () => {
        highlightSetting = new HighlightSettings();
        highlightSetting.backGroundColors = ['rgb(242, 180, 205)', 'rgb(211, 211, 211)'];
        highlightSetting.foreGroundColors = ['rgb(242, 25, 205)'];
        highlightSetting.comparisonRawValues = ['Euro'];
        highlightSetting.comparisonType = HighlightComparisonType.CONTAINS;
        highlightSetting.comparisonValues = [];
        highlightSetting.isEnabled = true;

        const highlightRule = new StringHighlightRule(highlightSetting, columnConfig, dataColumnIndex, []);
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

    it('should apply DOES NOT CONTAINS highlight rule', () => {
        highlightSetting = new HighlightSettings();
        highlightSetting.backGroundColors = ['rgb(242, 180, 205)', 'rgb(211, 211, 211)'];
        highlightSetting.foreGroundColors = ['rgb(242, 25, 205)'];
        highlightSetting.comparisonRawValues = ['ance'];
        highlightSetting.comparisonType = HighlightComparisonType.DOES_NOT_CONTAIN;
        highlightSetting.comparisonValues = [];
        highlightSetting.isEnabled = true;

        const highlightRule = new StringHighlightRule(highlightSetting, columnConfig, dataColumnIndex, []);
        highlightRule.applyRuleToData(responseDataMock, false);

        expect(responseDataMock.children[0].children[0].bgColorData).toEqual([undefined, undefined, undefined, undefined, undefined]);
        expect(responseDataMock.children[0].children[1].bgColorData).toEqual([undefined, undefined, undefined, undefined, 'rgb(242, 180, 205)']);
        expect(responseDataMock.children[0].bgColorData).toBeUndefined();

        expect(responseDataMock.children[1].children[0].bgColorData).toEqual([undefined, undefined, undefined, undefined, 'rgb(242, 180, 205)']);
        expect(responseDataMock.children[1].children[1].bgColorData).toEqual([undefined, undefined, undefined, undefined, 'rgb(242, 180, 205)']);
        expect(responseDataMock.children[1].children[2].bgColorData).toEqual([undefined, undefined, undefined, undefined, 'rgb(242, 180, 205)']);
        expect(responseDataMock.children[1].bgColorData).toBeUndefined();

        expect(responseDataMock.bgColorData).toBeUndefined();
    });

    it('should apply STARTS WITH highlight rule', () => {
        highlightSetting = new HighlightSettings();
        highlightSetting.backGroundColors = ['rgb(242, 180, 205)', 'rgb(211, 211, 211)'];
        highlightSetting.comparisonRawValues = ['Fr'];
        highlightSetting.comparisonType = HighlightComparisonType.STARTS_WITH;
        highlightSetting.comparisonValues = [];
        highlightSetting.isEnabled = true;

        const highlightRule = new StringHighlightRule(highlightSetting, columnConfig, dataColumnIndex, []);
        highlightRule.applyRuleToData(responseDataMock, false);

        expect(responseDataMock.children[0].children[0].bgColorData).toEqual([undefined, undefined, undefined, undefined, 'rgb(242, 180, 205)']);
        expect(responseDataMock.children[0].children[1].bgColorData).toEqual([undefined, undefined, undefined, undefined, undefined]);
        expect(responseDataMock.children[0].bgColorData).toBeUndefined();

        expect(responseDataMock.children[1].children[0].bgColorData).toEqual([undefined, undefined, undefined, undefined, undefined]);
        expect(responseDataMock.children[1].children[1].bgColorData).toEqual([undefined, undefined, undefined, undefined, undefined]);
        expect(responseDataMock.children[1].children[2].bgColorData).toEqual([undefined, undefined, undefined, undefined, undefined]);
        expect(responseDataMock.children[1].bgColorData).toBeUndefined();

        expect(responseDataMock.bgColorData).toBeUndefined();
    });
});
