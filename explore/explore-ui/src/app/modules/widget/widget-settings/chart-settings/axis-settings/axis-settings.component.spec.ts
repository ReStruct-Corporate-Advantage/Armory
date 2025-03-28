import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TestUtils} from '@utils/test.utils';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {Widget} from '@models/widget/widget.model';
import {ChartWidgetInputConfigType, WidgetConfigType} from '@blk/explore-ui-core';
import {WidgetConfigFactory} from '../../../../../factories';
import {AxisSettingsComponent} from './axis-settings.component';
import {AxisSettings, AxisType} from '@models/widget/inputs/chart-settings/axis-settings.model';

describe('AxisSettingsComponent', () => {
    let component: AxisSettingsComponent;
    let fixture: ComponentFixture<AxisSettingsComponent>;
    let widget;

    /**
     * Performs required initialisation before any test is run
     */
    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    /**
     * Performs required initialisation before each test is run
     */
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AxisSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(AxisSettingsComponent);
        component = fixture.componentInstance;
        widget = new Widget(WidgetConfigType.BAR);

        component.widgetConfigInput = WidgetConfigFactory.getInputsForWidgetConfigByName(WidgetConfigType.BAR, ChartWidgetInputConfigType.PRIMARY_AXIS_SETTINGS);
        component.inputs = widget.dataStore.metaData.inputs;
        component.axisType = AxisType.PRIMARY;
    });

    it('should test initializeComponent', () => {
        expect(component.widgetInput).toBeUndefined();

        component.initializeComponent();

        expect(component.widgetInput instanceof AxisSettings);
        expect(component.widgetInput.axisType).toEqual(AxisType.PRIMARY);
        expect(component.axisTitleInputLabel).toEqual('Primary axis override');
    });

    it('should test input changes', () => {
        component.initializeComponent();

        // onAxisTitleChanged
        expect(component.widgetInput.axisTitle).toBeUndefined();

        let event: any = {detail: {value: 'newAxisTitle'}};
        component.onAxisTitleChanged(event);
        expect(component.widgetInput.axisTitle).toEqual('newAxisTitle');

        // onHideAxisTitleChanged
        expect(component.widgetInput.hideAxisTitle).toBeUndefined();

        event = {detail: {value: {checked: true}}};
        component.onHideAxisTitleChanged(event);
        expect(component.widgetInput.hideAxisTitle).toBeTruthy();

        // onYLowerBoundChanged
        expect(component.widgetInput.yLowerBound).toBeUndefined();

        event = {detail: {value: '10'}};
        component.onYLowerBoundBlur(event);
        expect(component.widgetInput.yLowerBound).toBe(10);

        event = {detail: {value: '0'}};
        component.onYLowerBoundBlur(event);
        expect(component.widgetInput.yLowerBound).toBe(0);

        event = {detail: {value: ''}};
        component.onYLowerBoundBlur(event);
        expect(component.widgetInput.yLowerBound).toBeNull();

        // onYUpperBoundChanged
        event = {detail: {value: '100'}};
        component.onYUpperBoundBlur(event);
        expect(component.widgetInput.yUpperBound).toBe(100);

        // onYIntervalChanged
        event = {detail: {value: '5'}};
        component.onYIntervalChanged(event);
        expect(component.widgetInput.yInterval).toBe(5);

        // resetYLowerBound
        component.resetYLowerBound();
        expect(component.widgetInput.yLowerBound).toBeNull();

        // resetYUpperBound
        component.resetYUpperBound();
        expect(component.widgetInput.yUpperBound).toBeNull();

        // resetYInterval
        component.resetYInterval();
        expect(component.widgetInput.yInterval).toBeNull();
    });

    it('should test onYUpperBoundBlur', () => {
        component.initializeComponent();
        let event: any = {detail: {value: '50'}};

        component.widgetInput.yLowerBound = 100;
        component.onYUpperBoundBlur(event);
        expect(component.widgetInput.yLowerBound).toBe(50);

        component.widgetInput.yLowerBound = 100;
        event = {detail: {value: '200'}};
        component.onYUpperBoundBlur(event);
        expect(component.widgetInput.yLowerBound).toBe(100);

        component.widgetInput.yLowerBound = undefined;
        event = {detail: {value: '200'}};
        component.onYUpperBoundBlur(event);
        expect(component.widgetInput.yLowerBound).toBeUndefined();

        component.widgetInput.yLowerBound = 50;
        event = {detail: {value: undefined}};
        component.onYUpperBoundBlur(event);
        expect(component.widgetInput.yLowerBound).toBe(50);
    });

    it('should test onYLowerBoundBlur', () => {
        component.initializeComponent();
        let event: any = {detail: {value: '100'}};

        component.widgetInput.yUpperBound = 50;
        component.onYLowerBoundBlur(event);
        expect(component.widgetInput.yUpperBound).toBe(100);

        component.widgetInput.yUpperBound = 200;
        component.onYLowerBoundBlur(event);
        expect(component.widgetInput.yUpperBound).toBe(200);

        component.widgetInput.yUpperBound = 200;
        event = {detail: {value: undefined}};
        component.onYLowerBoundBlur(event);
        expect(component.widgetInput.yUpperBound).toBe(200);

        component.widgetInput.yUpperBound = undefined;
        event = {detail: {value: '50'}};
        component.onYLowerBoundBlur(event);
        expect(component.widgetInput.yUpperBound).toBeUndefined();
    });
});
