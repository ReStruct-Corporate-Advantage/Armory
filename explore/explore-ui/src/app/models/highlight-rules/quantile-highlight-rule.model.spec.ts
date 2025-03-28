import {FormatAndScaleFactory, HighlightComparisonType, HighlightRuleFactory, HighlightSettings, LibColumnUtils} from '@blk/explore-ui-column-option';
import {ColumnConfig, ResponseData} from '@blk/explore-ui-core';
import {HighlightRuleTestUtils} from '@models/highlight-rules/highlight-rule.test-utils';
import {TestUtils} from '@utils/test.utils';
import {QuantileHighlightRule} from './quantile-highlight-rule.model';

describe('QuantileHighlightRule', () => {

    let highlightSetting: HighlightSettings;
    let columnConfig: ColumnConfig;
    let dataColumnIndex: number;

    let responseDataMock: ResponseData;

    let bucketColorsHex: string[];

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        responseDataMock = HighlightRuleTestUtils.getMockResponseData();

        columnConfig = HighlightRuleTestUtils.getMktValPercent_ColumnConfig();
        dataColumnIndex = HighlightRuleTestUtils.getMktValPercent_DataIndex();

        highlightSetting = new HighlightSettings();
        highlightSetting.backGroundColors = ['rgb(255, 170, 170)', 'rgb(128, 0, 128)'];
        highlightSetting.foreGroundColors = ['rgb(255, 255, 255)', 'rgb(0, 0, 0)'];
        highlightSetting.comparisonRawValues = [3];
        highlightSetting.comparisonType = HighlightComparisonType.QUANTILE;
        highlightSetting.comparisonValues = [];
        highlightSetting.isEnabled = true;

        bucketColorsHex = ['#ffaaaa', '#c05595', '#800080'];
    });

    it('should return the correct highlight rule model', () => {
        jest.spyOn(LibColumnUtils, 'getColumnDefinition').mockReturnValueOnce({columnFormat: null});
        jest.spyOn(FormatAndScaleFactory, 'getFormatterToUse').mockReturnValueOnce(null);

        const highlightSettings = new HighlightSettings();
        highlightSettings.comparisonType = HighlightComparisonType.QUANTILE;

        const config = new ColumnConfig();

        const highlightRule = HighlightRuleFactory.createHighlightRule(highlightSettings, config, 0, []);

        expect(highlightRule instanceof QuantileHighlightRule).toBe(true);
    });

    it('should apply QUANTILE highlight rule - number, leaf only', () => {
        const highlightRule = new QuantileHighlightRule(
            highlightSetting,
            columnConfig,
            dataColumnIndex,
            HighlightRuleTestUtils.getMktValPercent_LeafValues()
        );
        highlightRule.applyRuleToData(responseDataMock, true);

        expect(responseDataMock.children[0].children[0].bgColorData).toEqual([undefined, undefined, bucketColorsHex[1]]);
        expect(responseDataMock.children[0].children[1].bgColorData).toEqual([undefined, undefined, bucketColorsHex[0]]);
        expect(responseDataMock.children[0].bgColorData).toBeUndefined();

        expect(responseDataMock.children[1].children[0].bgColorData).toEqual([undefined, undefined, bucketColorsHex[2]]);
        expect(responseDataMock.children[1].children[1].bgColorData).toEqual([undefined, undefined, bucketColorsHex[1]]);
        expect(responseDataMock.children[1].children[2].bgColorData).toEqual([undefined, undefined, bucketColorsHex[0]]);
        expect(responseDataMock.children[1].bgColorData).toBeUndefined();

        expect(responseDataMock.bgColorData).toBeUndefined();
    });

    it('should apply QUANTILE highlight rule - number, not leaf only', () => {
        const highlightRule = new QuantileHighlightRule(
            highlightSetting,
            columnConfig,
            dataColumnIndex,
            HighlightRuleTestUtils.getMktValPercent_LeafValues()
        );
        highlightRule.applyRuleToData(responseDataMock, false);

        expect(responseDataMock.children[0].children[0].bgColorData).toEqual([undefined, undefined, bucketColorsHex[1]]);
        expect(responseDataMock.children[0].children[1].bgColorData).toEqual([undefined, undefined, bucketColorsHex[0]]);
        expect(responseDataMock.children[0].bgColorData).toEqual([undefined, undefined, undefined]);

        expect(responseDataMock.children[1].children[0].bgColorData).toEqual([undefined, undefined, bucketColorsHex[2]]);
        expect(responseDataMock.children[1].children[1].bgColorData).toEqual([undefined, undefined, bucketColorsHex[1]]);
        expect(responseDataMock.children[1].children[2].bgColorData).toEqual([undefined, undefined, bucketColorsHex[0]]);
        expect(responseDataMock.children[1].bgColorData).toEqual([undefined, undefined, undefined]);

        expect(responseDataMock.bgColorData).toEqual([undefined, undefined, undefined]);
    });
});
