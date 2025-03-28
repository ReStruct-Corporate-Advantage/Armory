/**
 * Test cases for ConfigTypeFactory model class
 */
import {WidgetConfigFactory} from './widget-config.factory';
import riskExposure from '../../assets/widget-configs/risk-and-exposure-widget.json';
import returnsWidget from '../../assets/widget-configs/return-analysis-widget.json';
import returnChartWidget from '../../assets/widget-configs/return-chart-widget.json';
import praBar from '../../assets/widget-configs/pra-bar-widget.json';
import praWidget from '../../assets/widget-configs/pra-widget.json';
import pie from '../../assets/widget-configs/pie-chart-widget.json';
import {TestUtils} from '@utils/test.utils';
import {CoreWidgetConfigStore} from '@blk/explore-ui-core';

describe('WidgetConfigFactory tests', () => {
    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    /**
     * Test case for method getWidgetSizeFromConfig
     */
    it('Test getWidgetSizeFromConfig', function () {
        const expectedSize: any = {sizeX: 8, sizeY: 6};
        expect(JSON.stringify(WidgetConfigFactory.getWidgetSizeFromConfig('riskExposure'))).toBe(JSON.stringify(expectedSize));
    });


    /**
     * Test case for method getInputsForWidgetConfigType
     */
    it('Test getInputsForWidgetConfigType', () => {
        expect(WidgetConfigFactory.getInputsForWidgetConfigType('pie')).toBeDefined();
        expect(WidgetConfigFactory.getInputsForWidgetConfigType('pie').length).toBe(9);
        expect(WidgetConfigFactory.getInputsForWidgetConfigType('pie')[0].inputConfigType).toBe('columns');
        expect(WidgetConfigFactory.getInputsForWidgetConfigType('pie')[1].inputConfigType).toBe('breakdownTree');
        expect(WidgetConfigFactory.getInputsForWidgetConfigType('pie')[2].inputConfigType).toBe('isLightLookthroughEnabled');
        expect(WidgetConfigFactory.getInputsForWidgetConfigType('pie')[3].inputConfigType).toBe('hideUnassignedFilter');
        expect(WidgetConfigFactory.getInputsForWidgetConfigType('pie')[4].inputConfigType).toBe('topBottomFilter');
        expect(WidgetConfigFactory.getInputsForWidgetConfigType('pie')[5].inputConfigType).toBe('customFilter');
        expect(WidgetConfigFactory.getInputsForWidgetConfigType('pie')[6].inputConfigType).toBe('normalizedFlag');
        expect(WidgetConfigFactory.getInputsForWidgetConfigType('pie')[7].inputConfigType).toBe('pieChartDisplay');
        expect(WidgetConfigFactory.getInputsForWidgetConfigType('pie')[8].inputConfigType).toBe('chartSettings');
    });

    /**
     * Test case for method isCreateNestedNoneBuckets
     */
    it('Test isCreateNestedNoneBuckets', function () {
        expect(WidgetConfigFactory.isCreateNestedNoneBuckets('riskExposure')).toBe(false);
        expect(WidgetConfigFactory.isCreateNestedNoneBuckets('pie')).toBe(true);
    });

    /**
     * Test case for method isCreateNestedOtherBuckets
     */
    it('Test isCreateNestedOtherBuckets', function () {
        expect(WidgetConfigFactory.isCreateNestedOtherBuckets('riskExposure')).toBe(false);
        expect(WidgetConfigFactory.isCreateNestedOtherBuckets('pie')).toBe(true);
    });

    /**
     * Test case for method getHideTopBottomSectorToggle
     */
    it('Test getHideTopBottomSectorToggle for PRAWidget', function () {
        expect(WidgetConfigFactory.getHideTopBottomSectorToggle('praWidget')).toBeDefined();
        expect(WidgetConfigFactory.getHideTopBottomSectorToggle('praWidget')).toEqual(true);
    });

    /**
     * Test case for method getShowGridTransitionControl
     */
    it('Test getShowGridTransitionControl', function () {
        expect(WidgetConfigFactory.getShowGridTransitionControl('praWidget')).toBeUndefined();
        expect(WidgetConfigFactory.getShowGridTransitionControl('pie')).toBe(true);
    });


    /**
     * Test case for method getChartConfigForType
     */
    it('Test getChartConfigForType', function () {
        expect(CoreWidgetConfigStore.getChartConfigForType('returnsWidget')).toBeDefined();
        expect(CoreWidgetConfigStore.getChartConfigForType('dummy')).toBeUndefined();
    });

    /**
     * Test case for method getColumnCategoryForType
     */
    it('Test getColumnCategoryForType', function () {
        expect(WidgetConfigFactory.getColumnCategoryForType('pie')).toBeDefined();
        expect(WidgetConfigFactory.getColumnCategoryForType('returnChartWidget') === null).toBe(true);
    });

    /**
     * Test case for method getHideBreakdownInSorting
     */
    it('Test getHideBreakdownInSorting', function () {
        expect(WidgetConfigFactory.getHideBreakdownInSorting('praBar')).toBeDefined();
        expect(WidgetConfigFactory.getHideBreakdownInSorting('praBar')).toEqual(true);
    });

    /**
     * Test case for method getHideTopBottomSectorToggle
     */
    it('Test getHideTopBottomSectorToggle', function () {
        expect(WidgetConfigFactory.getHideTopBottomSectorToggle('praBar')).toBeDefined();
        expect(WidgetConfigFactory.getHideTopBottomSectorToggle('praBar')).toEqual(true);
    });

    /**
     * Test case for method getWidgetChartingLib
     */
    it('Test getWidgetChartingLib', function () {
        expect(WidgetConfigFactory.getWidgetChartingLib('returnsWidget')).toBe('agGrid');
        expect(WidgetConfigFactory.getWidgetChartingLib('pie')).toEqual('hc');
    });

    /**
     * Test case for method getShowCompareTabs
     */
    it('Test getShowCompareTabs', function () {
        expect(WidgetConfigFactory.getShowCompareTabs('bar')).toBeFalsy();
        expect(WidgetConfigFactory.getShowCompareTabs('pie')).toBeTruthy();
    });

    it('Test getShowTableSearch', () => {
        expect(WidgetConfigFactory.getShowTableSearch('riskExposure')).toEqual(true);
        expect(WidgetConfigFactory.getShowTableSearch('bar')).toEqual(false);
    });
});
