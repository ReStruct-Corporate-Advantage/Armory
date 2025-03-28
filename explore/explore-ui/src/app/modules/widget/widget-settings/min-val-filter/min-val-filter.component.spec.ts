import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {MinValFilterComponent} from './min-val-filter.component';
import {MinValFilter} from '@models/widget/inputs/min-val-filter.model';
import {Widget} from '@models/widget/widget.model';
import {WidgetConfigFactory} from '../../../../factories';
import {TestUtils} from '@utils/test.utils';
import {ExploreSelectOption, WidgetConfigType} from '@blk/explore-ui-core';

describe('Minimum Value Filtering Component test cases', () => {
    let component: MinValFilterComponent;
    let fixture: ComponentFixture<MinValFilterComponent>;
    let widget;

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [MinValFilterComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(MinValFilterComponent);
        component = fixture.componentInstance;
        component.widgetInput = new MinValFilter({
            value: 0.02,
            columnKey: 'pct_mv_1',
            positionColumnType: 'PORT',
            columnTag: 'pct_mv',
            useAbsolute: true
        });
        widget = new Widget(WidgetConfigType.PRA);

        component.widgetConfigInput = WidgetConfigFactory.getInputsForWidgetConfigByName(WidgetConfigType.PRA, 'minValFilter');
        component.inputs = widget.dataStore.metaData.inputs;
    });

    it('check if component initialize correctly', () => {
        jest.spyOn(component, 'getInput').mockReturnValue(null);
        jest.spyOn(component, 'getAllWidgetColumns').mockReturnValue(null);
        jest.spyOn(component, 'setupDisplayDataForColumns').mockReturnValue(null);
        jest.spyOn(component, 'setSubtotalAbleColumn').mockReturnValue(null);

        component.initializeComponent();

        expect(component.isSelectedColumnSubtotalAble).toBeUndefined();
        expect(component.filterData).toBeUndefined();
        expect(component.widgetColumn).toBeUndefined();
        expect(component.columns).toBeNull();

        // Default values
        expect(component.widgetInput.value).toBe(0.02);
        expect(component.widgetInput.columnKey).toBe('pct_mv_1');
    });

    it('Initialize stackedDropdown data', () => {
        const dataForDropdown: ExploreSelectOption[] = [
            new ExploreSelectOption('Factor Level', 'rfv_factor_lvl_64', false),
            new ExploreSelectOption('Factor Vol', 'rfv_factor_vol_5', false),
            new ExploreSelectOption('Factor Exposure', 'rfv_exp_port_35', false),
            new ExploreSelectOption('Benchmark Factor Exposure', 'rfv_exp_bench_756', false),
            new ExploreSelectOption('Active Factor Exposure', 'rfv_exp_active_546', false),
            new ExploreSelectOption('Standalone Risk', 'rfv_std_port_776', false),
            new ExploreSelectOption('Benchmark Standalone Risk', 'rfv_std_bench_5633', false),
            new ExploreSelectOption('Active Standalone Risk', 'rfv_std_active_63456', false),
            new ExploreSelectOption('Risk Contribution', 'rfv_contrib_port_4', false),
            new ExploreSelectOption('Benchmark Risk Contribution', 'rfv_contrib_bench_674', false),
            new ExploreSelectOption('Active Risk Contribution', 'rfv_contrib_active_645', false)
        ];
        component.initializeComponent();

        expect(component.columns.columns.length).toBe(13);
        expect(component.filterData[0].values).toStrictEqual(dataForDropdown);
    });

    it('Toggle useAbsolute boolean', () => {
        // Initially it's true
        expect(component.widgetInput.useAbsolute).toBeTruthy();

        component.toggleAbsoluteValue();

        // Toggle use Absolute value
        expect(component.widgetInput.useAbsolute).toBeFalsy();
    });

    it('change in numeric value stepper test case', () => {
        component.onNumericValueChange({detail: {value: '3'}} as CustomEvent);
        expect(component.widgetInput.value).toBe(3);
    });

    it('on Filter change  should  get update in widgetInput', () => {
        component.initializeComponent();

        const event = {detail: {value: {value: 'rfv_contrib_port_4'}}};
        component.onFilterSelectionChange(event as CustomEvent);
        expect(component.widgetInput.columnTag).toBe('rfv_contrib_port');
        expect(component.widgetInput.columnKey).toBe('rfv_contrib_port_4');
    });
});
