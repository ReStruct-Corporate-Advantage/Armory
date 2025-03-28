import {TestUtils} from '@utils/test.utils';
import {beforAllDataServiceTest, validateService} from '@services/widget/functions-for-data-service.testutil';
import {Widget} from '@models/widget/widget.model';
import {TreeMapWidgetDataService} from '@services/widget/tree-map-widget-data.service';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {ColumnConfig, WidgetConfigType, WidgetInput, WidgetInputType} from '@blk/explore-ui-core';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {ColorScale} from '@models/widget/inputs/chart-settings/color-scale.model';
import {WorkspaceStore} from '@stores/workspace.store';
import {BehaviorSubject} from 'rxjs';
import {Report} from '@models/workspace/report.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {ColorScaleFormatOption} from '@enums/color-scale-format-option';
import {ColorScaleMidpointOption} from '@enums/color-scale-midpoint-option';

describe('TreeMapWidgetDataService Test', () => {
    let service: TreeMapWidgetDataService;
    let exploreDataRequestService: ExploreDataRequestService;

    let widgetInputs: Map<string, WidgetInput>;
    let widget: Widget;
    let columnSetSize: ColumnSet;
    let columnSize: ColumnConfig;
    let columnSetColor: ColumnSet;
    let columnColor: ColumnConfig;

    beforeAll(() => {
        exploreDataRequestService = beforAllDataServiceTest();
        service = new TreeMapWidgetDataService(exploreDataRequestService);
    });

    beforeEach( (done) => {
        TestUtils.initialize(done);

        widgetInputs = new Map<string, WidgetInput>();
        widget = new Widget();

        columnSize = new ColumnConfig();
        columnSize.columnTag = 'x';
        columnSetSize = new ColumnSet();
        columnSetSize.columns.push(columnSize);

        columnColor = new ColumnConfig();
        columnColor.columnTag = 'y';
        columnSetColor = new ColumnSet();
        columnSetColor.columns.push(columnColor);

        widgetInputs.set(WidgetInputType.SIZE_COLUMN_ALT_NAME, columnSetSize);
        widgetInputs.set(WidgetInputType.COLOUR_COLUMN, columnSetColor);
    });

    afterEach( () => {
        jest.restoreAllMocks();
    });

    /**
     *
     */
    it('validate service', () => {
        validateService(service, [WidgetConfigType.TREEMAP], 'Y');
    });

    /**
     *
     */
    it('modifyWidgetInputsForRequest', () => {
        // Run the method
        service['modifyWidgetInputsForRequest'](widgetInputs, widget);

        // Validate

        // Validate that the columns sets
        expect(widgetInputs.has(WidgetInputType.COLUMNS)).toStrictEqual(true);
        expect(widgetInputs.has(WidgetInputType.SIZE_COLUMN_ALT_NAME)).toStrictEqual(false);
        expect(widgetInputs.has(WidgetInputType.COLOUR_COLUMN)).toStrictEqual(false);

        // Validate the resulting column set
        const columnSet: ColumnSet = widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet;
        expect(columnSet.columns.length).toStrictEqual(2);

        // Validate the columns in the column set.
        columnSet.columns.forEach(function(column: ColumnConfig) {
            let expectedColumn;

            if (column.columnTag === columnSize.columnTag) {
                expectedColumn = columnSize;
            } else if (column.columnTag === columnColor.columnTag) {
                expectedColumn = columnColor;
            }

            expect(column).toBe(expectedColumn);
        });
    });
    it('should test customVizConfig', () => {
        const displayInputs = new Map();
        displayInputs.set('colorScale', {format: ColorScaleFormatOption.THREE_COLOR_SCALE, midpoint: ColorScaleMidpointOption.ZERO_CENTERED, colors: ['#8c0200', '#bc0300', '#d90400']} as ColorScale);

        WorkspaceStore.init();
        WorkspaceStore.currentReport$ = new BehaviorSubject<Report>(new Report());
        WorkspaceStore.currentWorkpad$.next(new FlatWorkpad());

        expect(service['customVizConfig']({displayInputs} as any, widgetInputs)).toEqual({isComparisonMode: false, colorScaleFormat: ColorScaleFormatOption.THREE_COLOR_SCALE, colorScaleMidpoint: ColorScaleMidpointOption.ZERO_CENTERED, colorScaleColors: ['#8c0200', '#bc0300', '#d90400']});
    });
});

