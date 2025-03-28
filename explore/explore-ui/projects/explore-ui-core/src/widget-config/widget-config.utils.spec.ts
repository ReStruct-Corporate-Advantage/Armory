import {FavoriteType} from '../favorite/enums';
import {WidgetConfigType, WidgetInputType} from './enums';
import {WidgetConfigUtils} from './widget-config.utils';

describe('WidgetConfigUtils', () => {
    /**
     * Test case for method getWidgetInputFavoriteType
     */
    it('Test getWidgetInputFavoriteType', () => {
        expect(WidgetConfigUtils.getWidgetInputFavoriteType(WidgetConfigType.RISK_EXPOSURE, WidgetInputType.BREAKDOWN_TREE, 'breakdownTree')).toBe(FavoriteType.BREAKDOWN);
        expect(WidgetConfigUtils.getWidgetInputFavoriteType(WidgetConfigType.PRA, WidgetInputType.BREAKDOWN_TREE, 'riskFactorBreakdown')).toBe(FavoriteType.FACTOR_BREAKDOWN);
        expect(WidgetConfigUtils.getWidgetInputFavoriteType(WidgetConfigType.RISK_EXPOSURE, WidgetInputType.COLUMNS, WidgetInputType.COLUMNS)).toBe(FavoriteType.REPORT);
        expect(WidgetConfigUtils.getWidgetInputFavoriteType(WidgetConfigType.RETURNS, WidgetInputType.COLUMNS, WidgetInputType.COLUMNS)).toBe(FavoriteType.RETURN_REPORT);
        expect(WidgetConfigUtils.getWidgetInputFavoriteType(WidgetConfigType.PRA, WidgetInputType.COLUMNS, WidgetInputType.COLUMNS)).toBe(FavoriteType.RISK_REPORT);
        expect(WidgetConfigUtils.getWidgetInputFavoriteType(WidgetConfigType.PGS, WidgetInputType.COLUMNS, WidgetInputType.COLUMNS)).toBe(FavoriteType.MULTI_REPORT);
        expect(WidgetConfigUtils.getWidgetInputFavoriteType(WidgetConfigType.PIE, WidgetInputType.COLUMNS, WidgetInputType.COLUMNS)).toBe(FavoriteType.CHART_REPORT);
        expect(WidgetConfigUtils.getWidgetInputFavoriteType(WidgetConfigType.PIE, WidgetInputType.CUSTOM_FILTER, WidgetInputType.CUSTOM_FILTER)).toBe(FavoriteType.CUSTOM_SEC);
        expect(WidgetConfigUtils.getWidgetInputFavoriteType(WidgetConfigType.COMMITMENT_RISK, WidgetInputType.COLUMNS, WidgetInputType.COLUMNS)).toBe(FavoriteType.COMMITMENT_RISK_REPORT);
    });

    it('Test isReturnSpriteletWidget function', () => {
        expect(WidgetConfigUtils.isReturnSpritelet(WidgetConfigType.RETURNS_DRILLDOWN_TIME_SERIES)).toBeTruthy();
        expect(WidgetConfigUtils.isReturnSpritelet(WidgetConfigType.RETURNS_DRILLDOWN_PERF_DETAIL)).toBeTruthy();
        expect(WidgetConfigUtils.isReturnSpritelet(WidgetConfigType.RETURNS_PERF_DETAIL)).toBeTruthy();
        expect(WidgetConfigUtils.isReturnSpritelet(WidgetConfigType.RETURNS_MANAGER_SELECTION)).toBeTruthy();
        expect(WidgetConfigUtils.isReturnSpritelet(WidgetConfigType.RETURNS_FX_ATTRIBUTION)).toBeTruthy();
        expect(WidgetConfigUtils.isReturnSpritelet(WidgetConfigType.RETURNS_TIME_SERIES)).toBeTruthy();
        expect(WidgetConfigUtils.isReturnSpritelet(WidgetConfigType.RETURNS)).toBeFalsy();
    });

    it('Test isExpostWidget function', () => {
        expect(WidgetConfigUtils.isExpostWidget(WidgetConfigType.EXPOST_RETURNS)).toBeTruthy();
        expect(WidgetConfigUtils.isExpostWidget(WidgetConfigType.EXPOST_TIME_SERIES)).toBeTruthy();
        expect(WidgetConfigUtils.isExpostWidget(WidgetConfigType.EXPOST_STATS)).toBeTruthy();
        expect(WidgetConfigUtils.isExpostWidget(WidgetConfigType.PGS)).toBeFalsy();
    });

});
