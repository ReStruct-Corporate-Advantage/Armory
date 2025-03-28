import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ScatterDrilldownSettingsComponent} from './scatter-drilldown-settings.component';
import {ScatterDrilldownSetting} from '@models/widget/inputs/chart-settings/scatter-drilldown-setting.model';
import {GridLines} from '@models/widget/inputs/chart-settings/grid-lines.model';
import {WidgetInput} from '@blk/explore-ui-core';

describe('ScatterDrilldownSettingsComponent', () => {
    let component: ScatterDrilldownSettingsComponent;
    let fixture: ComponentFixture<ScatterDrilldownSettingsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ScatterDrilldownSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ScatterDrilldownSettingsComponent);
        component = fixture.componentInstance;
        component.widgetInput = new ScatterDrilldownSetting({groupByFirstLevelData: false});
    });

    it('should initialize gridLines', () => {
        component.inputs = new Map<string, WidgetInput>();
        component.inputs.set('showGridLines', new GridLines());
        component.initializeComponent();

        expect(component.gridLines instanceof GridLines).toBeTruthy();
    });

    describe('Test onRadioGroupChanged method', () => {
        it('onRadioGroupChanged should change the value properly', () => {
            // Change it to 'Drilldown into Breakdown Levels'
            component.onRadioGroupChanged({eventData: true});
            expect(component.widgetInput.groupByFirstLevelData).toEqual(true);

            // Change it to 'Drilldown into Sector'
            component.onRadioGroupChanged({eventData: false});
            expect(component.widgetInput.groupByFirstLevelData).toEqual(false);
        });
    });

    describe('Test initializeDrilldownOptions method', () => {
        it('initializeDrilldownOptions should create options properly', () => {
            component.initializeDrilldownOptions();

            // First option
            expect(component.drilldownOptions[0].label).toEqual('Drilldown into sector');
            expect(component.drilldownOptions[0].eventData).toEqual(false);
            expect(component.drilldownOptions[0].checked).toEqual(true);

            // Second option
            expect(component.drilldownOptions[1].label).toEqual('Drilldown into breakdown levels');
            expect(component.drilldownOptions[1].eventData).toEqual(true);
            // The treat as zero options should be checked
            expect(component.drilldownOptions[1].checked).toEqual(false);
        });
    });
});
