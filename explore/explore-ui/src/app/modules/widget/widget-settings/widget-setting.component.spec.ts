import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {WidgetSettingComponent} from './widget-setting.component';
import {TestUtils} from '@utils/test.utils';
import {Widget} from '@models/widget/widget.model';
import {WidgetConfigFactory} from '../../../factories';
import {WidgetDataStore} from '@models/dataStore/widget-data-store.model';
import {WorkspaceStore} from '@stores/index';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {ColumnConfig, WidgetConfigType, WidgetInputType} from '@blk/explore-ui-core';
import {ColumnSet} from '@blk/explore-ui-column-option';

/**
 * Test cases for Widget setting component
 */
describe('WidgetSettingComponent', () => {
    let component: WidgetSettingComponent;
    let fixture: ComponentFixture<WidgetSettingComponent>;

    beforeAll((done) => {
        TestUtils.initialize(done);
        WorkspaceStore.init();
        WorkspaceStore.updateCurrentPortfolio(new Portfolio('PEP'));
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [WidgetSettingComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(WidgetSettingComponent);
        component = fixture.componentInstance;

        const widget = new Widget(WidgetConfigType.RISK_EXPOSURE);

        component.widgetConfigInput = WidgetConfigFactory.getInputsForWidgetConfigByName(WidgetConfigType.RISK_EXPOSURE, 'topBottomFilter');
        component.inputs = widget.dataStore.metaData.inputs;
    });

    it('Tests that the expected methods are called', () => {
        const componentSpy = jest.spyOn(component, 'initializeComponent');

        component.ngOnInit();

        expect(componentSpy.mock.calls.length).toStrictEqual(1);
    });

    it('should set parent data store for child spritelet widgets', () => {
        const widget = new Widget(WidgetConfigType.FACTOR_GRAPHING_PIE_CHART);
        const childColumnSet = new ColumnSet();
        childColumnSet.columns.push(ColumnConfig.createColumn('rfv_std_port', 'PORT', 'rfv_std_port_776'));
        widget.dataStore.metaData.inputs.set(WidgetInputType.COLUMNS, childColumnSet);

        const parentColumnSet = new ColumnSet();
        parentColumnSet.columns.push(
            ColumnConfig.createColumn('rfv_factor_vol', 'ALL', 'rfv_factor_vol_5'),
            ColumnConfig.createColumn('rfv_std_port', 'PORT', 'rfv_std_port_776'),
            ColumnConfig.createColumn('rfv_std_bench', 'BENCH', 'rfv_std_bench_5633'),
            ColumnConfig.createColumn('rfv_std_active', 'ACTIVE', 'rfv_std_active_63456')
        );
        const parentDataStore = new WidgetDataStore();
        parentDataStore.metaData.inputs.set(WidgetInputType.COLUMNS, parentColumnSet);
        widget.dataStore.parentDataStore = parentDataStore;
        widget.dataStore.isDependentOnParentForData = true;

        component.widgetType = widget.configType;
        component.widgetConfigInput = WidgetConfigFactory.getInputsForWidgetConfigByName(WidgetConfigType.FACTOR_GRAPHING_PIE_CHART, WidgetInputType.COLUMNS);
        component.inputs = widget.dataStore.metaData.inputs;
        component.widgetInput = childColumnSet;
        component.widgetDataStore = widget.dataStore;

        component.initializeComponent();
        expect(component.parentInputs).toEqual(parentDataStore.metaData.inputs);
    });

    it('should rely on parent columns for factor time series spritelet', () => {
        const widget = new Widget(WidgetConfigType.FACTOR_GRAPHING_TIME_SERIES);
        const childColumnSet = new ColumnSet();
        childColumnSet.columns.push(ColumnConfig.createColumn('rfv_std_port', 'PORT', 'rfv_std_port_776'));
        widget.dataStore.metaData.inputs.set(WidgetInputType.COLUMNS, childColumnSet);

        const parentColumnSet = new ColumnSet();
        parentColumnSet.columns.push(
            ColumnConfig.createColumn('rfv_factor_vol', 'ALL', 'rfv_factor_vol_5'),
            ColumnConfig.createColumn('rfv_std_port', 'PORT', 'rfv_std_port_776'),
            ColumnConfig.createColumn('rfv_std_bench', 'BENCH', 'rfv_std_bench_5633'),
            ColumnConfig.createColumn('rfv_std_active', 'ACTIVE', 'rfv_std_active_63456')
        );
        const parentDataStore = new WidgetDataStore();
        parentDataStore.metaData.inputs.set(WidgetInputType.COLUMNS, parentColumnSet);
        widget.dataStore.parentDataStore = parentDataStore;
        widget.dataStore.isDependentOnParentForMetaData = true;

        component.widgetType = widget.configType;
        component.widgetConfigInput = WidgetConfigFactory.getInputsForWidgetConfigByName(WidgetConfigType.FACTOR_GRAPHING_TIME_SERIES, WidgetInputType.COLUMNS);
        component.inputs = widget.dataStore.metaData.inputs;
        component.widgetInput = childColumnSet;
        component.widgetDataStore = widget.dataStore;

        component.initializeComponent();
        expect(component.parentInputs).toEqual(parentDataStore.metaData.inputs);
    });
});
