import {CoreColumnUtils} from '@blk/explore-ui-core';
import {NumericDataFormatter} from '../data-formatter/numeric-data-formatter.model';
import {HighlightSettings} from './highlight-settings.model';
import {HighlightComparisonType} from '../../enums';

describe('HighlightSettings', () => {
    let highlightSetting: HighlightSettings;

    it('should initialize a new highlight setting rule', () => {
        highlightSetting = new HighlightSettings();
        expect(highlightSetting.comparisonType).toBeUndefined();
        expect(highlightSetting.backGroundColors).toBeDefined();
        expect(highlightSetting.backGroundColors.length).toBe(2);
        expect(highlightSetting.foreGroundColors).toBeDefined();
        expect(highlightSetting.foreGroundColors.length).toBe(2);
        expect(highlightSetting.comparisonValues).toBeDefined();
        expect(highlightSetting.comparisonRawValues).toBeDefined();
    });

    it('should serialize and deserialize a highlight setting rule', () => {
        highlightSetting = new HighlightSettings();
        highlightSetting.isEnabled = false;
        highlightSetting.comparisonType = HighlightComparisonType.BOTTOM;
        highlightSetting.comparisonRawValues = [0.65];

        const serializedData = highlightSetting.serialize();

        const newHighlightSetting = new HighlightSettings();
        // should not be equal initially
        expect(highlightSetting.equals(newHighlightSetting)).toBe(false);

        newHighlightSetting.deserialize(serializedData);
        expect(highlightSetting.equals(newHighlightSetting)).toBe(true);
    });

    it('should set comparison flags', () => {
        highlightSetting = new HighlightSettings();
        expect(highlightSetting.isQuantileComparison()).toBeFalsy();
        expect(highlightSetting.isBetweenComparison()).toBeFalsy();

        highlightSetting.comparisonType = HighlightComparisonType.EQUALS;
        expect(highlightSetting.isQuantileComparison()).toBeFalsy();
        expect(highlightSetting.isBetweenComparison()).toBeFalsy();

        highlightSetting.comparisonType = HighlightComparisonType.QUANTILE;
        expect(highlightSetting.isQuantileComparison()).toBeTruthy();
        expect(highlightSetting.isBetweenComparison()).toBeFalsy();

        highlightSetting.comparisonType = HighlightComparisonType.BETWEEN;
        expect(highlightSetting.isQuantileComparison()).toBeFalsy();
        expect(highlightSetting.isBetweenComparison()).toBeTruthy();
    });

    it('isValid Test', () => {
        highlightSetting = new HighlightSettings();
        expect(highlightSetting.isValid()).toBeFalsy();
        highlightSetting.comparisonType = HighlightComparisonType.EQUALS;
        expect(highlightSetting.isValid()).toBeFalsy();
        highlightSetting.comparisonRawValues = [0];
        highlightSetting.backGroundColors = undefined;
        highlightSetting.foreGroundColors = undefined;
        expect(highlightSetting.isValid()).toBeFalsy();
        highlightSetting.backGroundColors = [];
        highlightSetting.foreGroundColors = [];
        expect(highlightSetting.isValid()).toBeFalsy();
        highlightSetting.backGroundColors = ['#FFFFFF'];
        expect(highlightSetting.isValid()).toBeTruthy();
        highlightSetting.foreGroundColors = ['#FFFFFF'];
        expect(highlightSetting.isValid()).toBeTruthy();
        highlightSetting.backGroundColors = [];
        expect(highlightSetting.isValid()).toBeTruthy();
        highlightSetting.comparisonType = HighlightComparisonType.BETWEEN;
        expect(highlightSetting.isValid()).toBeFalsy();
        highlightSetting.comparisonRawValues = [0, 1];
        expect(highlightSetting.isValid()).toBeTruthy();
        highlightSetting.foreGroundColors = undefined;
        highlightSetting.backGroundColors = undefined;
        highlightSetting.comparisonType = HighlightComparisonType.QUANTILE;
        expect(highlightSetting.isValid()).toBeFalsy();
        highlightSetting.foreGroundColors = ['#FFFFFF', '#FFFFFF'];
        expect(highlightSetting.isValid()).toBeTruthy();
        highlightSetting.foreGroundColors = undefined;
        highlightSetting.backGroundColors = ['#FFFFFF', '#FFFFFF'];
        expect(highlightSetting.isValid()).toBeTruthy();
        highlightSetting.foreGroundColors = ['#FFFFFF', '#FFFFFF'];
        highlightSetting.backGroundColors = undefined;
        expect(highlightSetting.isValid()).toBeTruthy();
        highlightSetting.foreGroundColors = ['#FFFFFF'];
        expect(highlightSetting.isValid()).toBeFalsy();
    });

    it('should convert comparisonValue to its raw value', () => {
        jest.spyOn(CoreColumnUtils, 'getOptionValueByConfigType').mockReturnValue(null);

        highlightSetting = new HighlightSettings();
        highlightSetting.comparisonType = HighlightComparisonType.EQUALS;
        highlightSetting.comparisonValues = [50];

        const numericDataFormatter = new NumericDataFormatter(null, []);
        jest.spyOn(numericDataFormatter, 'convertToRaw').mockImplementation(() => 3);

        highlightSetting.getRawValue(0, numericDataFormatter);

        expect(numericDataFormatter.convertToRaw).toHaveBeenCalledTimes(1);
    });

    it('should not convert values for aggregate comparison types', () => {
        jest.spyOn(CoreColumnUtils, 'getOptionValueByConfigType').mockReturnValue(null);
        const numericDataFormatter = new NumericDataFormatter(null, []);
        jest.spyOn(numericDataFormatter, 'convertToRaw');

        highlightSetting = new HighlightSettings();
        highlightSetting.comparisonType = HighlightComparisonType.TOP;
        highlightSetting.comparisonValues = [50];

        expect(numericDataFormatter.convertToRaw).not.toHaveBeenCalled();
    });

    it('should scale and format comparisonRawValues to display to user', () => {
        jest.spyOn(CoreColumnUtils, 'getOptionValueByConfigType').mockReturnValue(null);

        highlightSetting = new HighlightSettings();
        highlightSetting.comparisonType = HighlightComparisonType.EQUALS;
        highlightSetting.comparisonRawValues = [0.50];

        const numericDataFormatter = new NumericDataFormatter(null, []);
        jest.spyOn(numericDataFormatter, 'format').mockReturnValue('50');

        highlightSetting.formatRuleValues(numericDataFormatter);

        expect(numericDataFormatter.format).toHaveBeenCalledWith(highlightSetting.comparisonRawValues[0]);
        expect(highlightSetting.comparisonValues[0]).toBe('50');
    });

    it('should not scale or format any aggregate comparison types', () => {
        jest.spyOn(CoreColumnUtils, 'getOptionValueByConfigType').mockReturnValue(null);
        const numericDataFormatter = new NumericDataFormatter(null, []);
        jest.spyOn(numericDataFormatter, 'format');

        highlightSetting = new HighlightSettings();
        highlightSetting.comparisonType = HighlightComparisonType.TOP;
        highlightSetting.comparisonRawValues = [10];

        highlightSetting.formatRuleValues(numericDataFormatter);

        expect(numericDataFormatter.format).not.toHaveBeenCalled();
        expect(highlightSetting.comparisonValues[0]).toBe(10);
    });
});
