import {CoreTestUtils} from '@blk/explore-ui-core';
import {ColumnOptionInitializer} from '../column-option.initializer';
import {HighlightComparisonType} from '../enums';
import {HighlightSettings} from '../models/highlight/highlight-settings.model';
import {HighlightRuleFactory} from './highlight-rule.factory';

describe('HighlightRuleFactory Tests', () => {
    beforeAll(() => {
        ColumnOptionInitializer.initializeConfig();
        CoreTestUtils.initDefinitions();
    });

    it('should return undefined if highlight rule type does not exist', () => {
        const highlightSettings = new HighlightSettings();
        highlightSettings.comparisonType = 1000;
        expect(HighlightRuleFactory.createHighlightRule(highlightSettings, null, 0, [])).toBeUndefined();
    });

    it('should get the proper display name for the highlight rule', () => {
        expect(HighlightRuleFactory.getDisplayName(HighlightComparisonType.GT_THAN_EQUAL)).toBe('Greater than or equal');
        expect(HighlightRuleFactory.getDisplayName(HighlightComparisonType.EQUALS)).not.toBeNull();
        expect(HighlightRuleFactory.getDisplayName(HighlightComparisonType.DOES_NOT_EQUAL)).not.toBeNull();
        expect(HighlightRuleFactory.getDisplayName(HighlightComparisonType.GREATER_THAN)).not.toBeNull();
        expect(HighlightRuleFactory.getDisplayName(HighlightComparisonType.LESS_THAN)).not.toBeNull();
        expect(HighlightRuleFactory.getDisplayName(HighlightComparisonType.LESS_THAN_EQUAL)).not.toBeNull();
        expect(HighlightRuleFactory.getDisplayName(HighlightComparisonType.GREATER_THAN)).not.toBeNull();
        expect(HighlightRuleFactory.getDisplayName(HighlightComparisonType.STARTS_WITH)).not.toBeNull();
        expect(HighlightRuleFactory.getDisplayName(HighlightComparisonType.CONTAINS)).not.toBeNull();
        expect(HighlightRuleFactory.getDisplayName(HighlightComparisonType.DOES_NOT_CONTAIN)).not.toBeNull();
        expect(HighlightRuleFactory.getDisplayName(HighlightComparisonType.TOP)).not.toBeNull();
        expect(HighlightRuleFactory.getDisplayName(HighlightComparisonType.BOTTOM)).not.toBeNull();
        expect(HighlightRuleFactory.getDisplayName(HighlightComparisonType.BETWEEN)).not.toBeNull();
        expect(HighlightRuleFactory.getDisplayName(HighlightComparisonType.STD_DEV_IN)).not.toBeNull();
        expect(HighlightRuleFactory.getDisplayName(HighlightComparisonType.STD_DEV_OUT)).not.toBeNull();
        expect(HighlightRuleFactory.getDisplayName(HighlightComparisonType.QUANTILE)).not.toBeNull();
        expect(HighlightRuleFactory.getDisplayName(null)).toBeNull();
    });
});
