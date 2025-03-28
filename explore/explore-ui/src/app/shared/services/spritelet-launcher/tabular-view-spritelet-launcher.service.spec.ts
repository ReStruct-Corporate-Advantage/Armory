import {TestBed} from '@angular/core/testing';
import {ColumnConstants, WidgetConfigType, WidgetInputType} from '@blk/explore-ui-core';
import {TestUtils} from '@utils/test.utils';
import {WorkspaceStore} from '../../../stores';
import {Report} from '@models/workspace/report.model';
import {Widget} from '@models/widget/widget.model';
import {WidgetConstants} from '@constants/widget.constants';
import {TabularViewSpriteletLauncherService} from '@services/spritelet-launcher/tabular-view-spritelet-launcher.service';
import {Breakdown, ColumnSector} from '@blk/explore-ui-breakdown';
import {TimeSeriesSettings} from '@models/widget/inputs/chart-settings/time-series-settings.model';
import {ColumnSet} from '@blk/explore-ui-column-option';

/**
 * Test cases for TabularViewSpriteletLauncherService
 */
describe('TabularViewSpriteletLauncherService', () => {
    let service: TabularViewSpriteletLauncherService;

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        service = TestBed.inject(TabularViewSpriteletLauncherService);
        WorkspaceStore.init();
        WorkspaceStore.updateCurrentReport(new Report());
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
        expect(service.getSpriteletActionKey()).toBe(WidgetConstants.TABULAR_VIEW_SPRITELET.ACTION_KEY);
    });

    describe('launchSpritelet Test', () => {
        it('test launchSpritelet', ()  => {
            const widget = new Widget(WidgetConfigType.PIE);
            service.launchSpritelet(widget, null);
            const spriteletWidget = WorkspaceStore.getCurrentReport().widgets[0];
            expect(spriteletWidget.configType).toBe(WidgetConfigType.RISK_EXPOSURE);
            expect(spriteletWidget.title).toBe('Risk and Exposure');
            const spriteletMetaData = spriteletWidget.dataStore.metaData.inputs;
            const widgetMetaData = widget.dataStore.metaData.inputs;
            expect(spriteletMetaData.get(WidgetInputType.BREAKDOWN_TREE).equals(widgetMetaData.get(WidgetInputType.BREAKDOWN_TREE))).toBeTruthy();
            const columns = spriteletMetaData.get(WidgetInputType.COLUMNS) as ColumnSet;
            expect(columns.columns.length).toBe(3);
            expect(columns.columns[0].columnTag).toBe(ColumnConstants.COLUMN_TAG.SEC_DESC);
            expect(columns.columns[1].columnTag).toBe(ColumnConstants.COLUMN_TAG.CUSIP);
            expect(columns.columns[2].columnTag).toBe(ColumnConstants.COLUMN_TAG.PCT_NOTIONAL_MARKET_VAL);
        });

        it('test launchSpritelet - with stacked breakdown and sector breakdown', ()  => {
            // Only sector breakdown
            const widget = new Widget(WidgetConfigType.BAR);
            service.launchSpritelet(widget, null);
            let spriteletWidget = WorkspaceStore.getCurrentReport().widgets[0];
            let spriteletMetaData = spriteletWidget.dataStore.metaData.inputs;
            let widgetMetaData = widget.dataStore.metaData.inputs;
            expect(spriteletMetaData.get(WidgetInputType.BREAKDOWN_TREE).equals(widgetMetaData.get(WidgetInputType.BREAKDOWN_TREE))).toBeTruthy();

            // Both sector breakdown and stacked breakdown
            WorkspaceStore.getCurrentReport().widgets = [];
            widget.title = 'Custom Title';
            const breakdown: Breakdown = new Breakdown();
            // Add a sub sector.
            const child: ColumnSector = new ColumnSector();
            child.columnName = 'Country Name';
            child.columnTag = 'country';
            child.positionColumnType = 'ALL';
            child.dataType = 'String';
            child.useNoneBuckets = false;
            breakdown.addChild(child);
            breakdown.title = 'countryName';
            widget.dataStore.metaData.inputs.set(WidgetInputType.STACKED_BREAKDOWN_TREE, breakdown);
            service.launchSpritelet(widget, null);
            spriteletWidget = WorkspaceStore.getCurrentReport().widgets[0];
            expect(spriteletWidget.title).toBe('Custom Title');
            spriteletMetaData = spriteletWidget.dataStore.metaData.inputs;
            widgetMetaData = widget.dataStore.metaData.inputs;
            const combinedBreakdown = Breakdown.deepCloneAndOptionalStripToSpecifiedLevel(widgetMetaData.get(WidgetInputType.BREAKDOWN_TREE) as Breakdown);
            combinedBreakdown.append(Breakdown.deepCloneAndOptionalStripToSpecifiedLevel(widgetMetaData.get(WidgetInputType.STACKED_BREAKDOWN_TREE) as Breakdown));
            expect(spriteletMetaData.get(WidgetInputType.BREAKDOWN_TREE).equals(combinedBreakdown)).toBeTruthy();

            // Equal stacked and sector breakdown
            WorkspaceStore.getCurrentReport().widgets = [];
            widget.dataStore.metaData.inputs.set(WidgetInputType.STACKED_BREAKDOWN_TREE, Breakdown.deepCloneAndOptionalStripToSpecifiedLevel(widgetMetaData.get(WidgetInputType.BREAKDOWN_TREE) as Breakdown));
            service.launchSpritelet(widget, null);
            spriteletWidget = WorkspaceStore.getCurrentReport().widgets[0];
            expect(spriteletWidget.title).toBe('Custom Title');
            spriteletMetaData = spriteletWidget.dataStore.metaData.inputs;
            widgetMetaData = widget.dataStore.metaData.inputs;
            expect(spriteletMetaData.get(WidgetInputType.BREAKDOWN_TREE).equals(widgetMetaData.get(WidgetInputType.BREAKDOWN_TREE))).toBeTruthy();

            // Only stacked breakdown
            WorkspaceStore.getCurrentReport().widgets = [];
            widget.dataStore.metaData.inputs.set(WidgetInputType.BREAKDOWN_TREE, null);
            service.launchSpritelet(widget, null);
            spriteletWidget = WorkspaceStore.getCurrentReport().widgets[0];
            spriteletMetaData = spriteletWidget.dataStore.metaData.inputs;
            widgetMetaData = widget.dataStore.metaData.inputs;
            expect(spriteletMetaData.get(WidgetInputType.BREAKDOWN_TREE).equals(widgetMetaData.get(WidgetInputType.STACKED_BREAKDOWN_TREE))).toBeTruthy();
        });

        it('should not have TimeSeriesSettings in table spritelet from Time Series Chart', () => {
            const widget = new Widget(WidgetConfigType.TIME_SERIES);
            WorkspaceStore.getCurrentReport().addWidget(widget);

            expect(WorkspaceStore.getCurrentReport().widgets.length).toBe(1);

            widget.dataStore.metaData.inputs.set(TimeSeriesSettings.INPUT_CONFIG_NAME, new TimeSeriesSettings({chartType: 'line', dateFormat: 'Aladdin date format', includeTotalValues: false, frequency: 'DAILY', periods: 10}));
            service.launchSpritelet(widget, null);

            expect(WorkspaceStore.getCurrentReport().widgets.length).toBe(2);

            const spriteletWidget = WorkspaceStore.getCurrentReport().widgets[1];
            expect(spriteletWidget.dataStore.metaData.inputs.get(TimeSeriesSettings.INPUT_CONFIG_NAME)).toBeUndefined();
        });
    });
});
