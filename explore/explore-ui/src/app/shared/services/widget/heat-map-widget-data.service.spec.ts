import {TestUtils} from '@utils/test.utils';
import {beforAllDataServiceTest, validateService} from '@services/widget/functions-for-data-service.testutil';
import {HeatMapWidgetDataService} from '@services/widget/heat-map-widget-data.service';
import {Breakdown, ColumnSector} from '@blk/explore-ui-breakdown';
import {Widget} from '@models/widget/widget.model';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {WidgetConfigType, WidgetInput, WidgetInputType} from '@blk/explore-ui-core';

describe('HeatMapWidgetDataService Test', () => {
    let service: HeatMapWidgetDataService;
    let exploreDataRequestService: ExploreDataRequestService;

    let xBreakdown: Breakdown;
    let yBreakdown: Breakdown;
    let columnSectorX: ColumnSector;
    let columnSectorY: ColumnSector;
    let widgetInputs: Map<string, WidgetInput>;
    let widget: Widget;

    let deepCloneAndOptionalStripToSpecifiedLevelSpy;

    beforeAll(() => {
        exploreDataRequestService = beforAllDataServiceTest();
        service = new HeatMapWidgetDataService(exploreDataRequestService);
    });

    beforeEach( (done) => {
        TestUtils.initialize(done);

        columnSectorX = new ColumnSector();
        columnSectorX.columnTag = 'x';
        columnSectorY = new ColumnSector();
        columnSectorY.columnTag = 'y';

        xBreakdown = new Breakdown();
        xBreakdown.addChild(columnSectorX);
        yBreakdown = new Breakdown();
        yBreakdown.addChild(columnSectorY);

        widgetInputs = new Map<string, WidgetInput>();
        widget = new Widget();

        deepCloneAndOptionalStripToSpecifiedLevelSpy = jest.spyOn(Breakdown, 'deepCloneAndOptionalStripToSpecifiedLevel');
    });

    afterEach( () => {
        jest.restoreAllMocks();
    });

    /**
     *
     */
    it('validate service', () => {
        validateService(service, [WidgetConfigType.HEATMAP], 'Y');
    });

    /**
     *
     */
    it('modifyWidgetInputsForRequest - both breakdowns are not specified', () => {
        widgetInputs.set(WidgetInputType.BREAKDOWN_TREE, undefined);
        widgetInputs.set(WidgetInputType.COLUMN_BREAKDOWN_TREE, undefined);

        runModifyWidgetInputsForRequestAndValidate(false, 0, undefined, undefined, undefined);
    });

    /**
     *
     */
    it('modifyWidgetInputsForRequest - both breakdowns are specified', () => {
        widgetInputs.set(WidgetInputType.BREAKDOWN_TREE, xBreakdown);
        widgetInputs.set(WidgetInputType.COLUMN_BREAKDOWN_TREE, yBreakdown);

        runModifyWidgetInputsForRequestAndValidate(true, 1, true, columnSectorX.columnTag, columnSectorY.columnTag);
    });

    /**
     *
     */
    it('modifyWidgetInputsForRequest - Xbreakdown specified, YBreakdown is not specified', () => {
        widgetInputs.set(WidgetInputType.BREAKDOWN_TREE, xBreakdown);

        runModifyWidgetInputsForRequestAndValidate(true, 1, false, columnSectorX.columnTag, undefined);
    });

    /**
     *
     */
    it('modifyWidgetInputsForRequest - Xbreakdown is not specified, YBreakdown is specified', () => {
        widgetInputs.set(WidgetInputType.COLUMN_BREAKDOWN_TREE, yBreakdown);

        runModifyWidgetInputsForRequestAndValidate(true, 0, false, columnSectorY.columnTag, undefined);
    });

    /**
     *
     * @param hasBreakdownTree indicates whether breakdown tree input should be present in the inputs
     * after the method completes
     * @param deepCloneAndOptionalStripToSpecifiedLevelCalledTimes how many times Breakdown.deepCloneAndOptionalStripToSpecifiedLevel
     * is expected to be called
     * @param hasSecondLevel whether a breakdown in the breakdown tree input should have a second level
     * @param firstLvlColTag an expected column tag of the first level sector in breakdown in the breakdown tree input
     * @param secondLevelColTag an expected column tag of the second level sector in breakdown in the breakdown tree input
     * (only checked if hasSecondLevel is true)
     * @return a breakdown mapped to the breakdown tree input
     */
    function runModifyWidgetInputsForRequestAndValidate(hasBreakdownTree: boolean, deepCloneAndOptionalStripToSpecifiedLevelCalledTimes: number,
                                                        hasSecondLevel: boolean, firstLvlColTag: string, secondLevelColTag: string): void {
        // Run the method
        service['modifyWidgetInputsForRequest'](widgetInputs, widget);

        // Validate
        expect(deepCloneAndOptionalStripToSpecifiedLevelSpy).toHaveBeenCalledTimes(deepCloneAndOptionalStripToSpecifiedLevelCalledTimes);
        if (deepCloneAndOptionalStripToSpecifiedLevelCalledTimes > 0) {
            // Only X-axis breakdown is expected to be cloned and stripped to the 1st level
            expect(deepCloneAndOptionalStripToSpecifiedLevelSpy).toHaveBeenCalledWith(xBreakdown, 1);
        }
        expect(widgetInputs.has(WidgetInputType.BREAKDOWN_TREE)).toStrictEqual(hasBreakdownTree);
        expect(widgetInputs.has(WidgetInputType.COLUMN_BREAKDOWN_TREE)).toStrictEqual(false);

        if (hasBreakdownTree) {
            const breakdownForRequest: Breakdown = widgetInputs.get(WidgetInputType.BREAKDOWN_TREE) as Breakdown;
            // Validate breakdown
            expect(breakdownForRequest.children.length).toStrictEqual(1);

            const sectorL1: ColumnSector = breakdownForRequest.children[0] as ColumnSector;
            expect(sectorL1.columnTag).toStrictEqual(firstLvlColTag);

            if (hasSecondLevel) {
                expect(sectorL1.children).toBeDefined();
                expect(sectorL1.children.length).toStrictEqual(1);

                const sectorL2: ColumnSector = sectorL1.children[0] as ColumnSector;
                expect(sectorL2.columnTag).toStrictEqual(columnSectorY.columnTag);
                expect(sectorL2.children).toBeUndefined();
            } else if (sectorL1.children) {
                expect(sectorL1.children.length).toStrictEqual(0);
            }
        }
    }
});

