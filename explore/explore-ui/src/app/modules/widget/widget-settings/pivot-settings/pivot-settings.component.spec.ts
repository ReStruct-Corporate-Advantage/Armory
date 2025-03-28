import {PivotSettingsComponent} from './pivot-settings.component';
import {PivotTableSettingsModel} from '@models/widget/inputs/pivot-table-settings.model';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('PivotSettingsComponent', () => {
    let component: PivotSettingsComponent;
    let fixture: ComponentFixture<PivotSettingsComponent>;

    /**
     * Performs required initialisation before each test is run
     */
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [PivotSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(PivotSettingsComponent);
        component = fixture.componentInstance;
        component.inputs = new Map<string, PivotTableSettingsModel>();
        component.widgetConfigInput = {inputConfigType: 'pivotSettings', inputTitle: 'Settings', inputName: 'pivotSettings'};
    });

    describe('Test initializeComponent method', () => {
        it('initializeComponent should initialize enablePortBench if we have widgetInput', () => {
            component.widgetInput = new PivotTableSettingsModel({portBenchActiveEnabled: false});
            component.initializeComponent();
            expect(component.enablePortBench).toBeFalsy();
        });

        it('initializeComponent should initialize enablePortBench to false', () => {
            component.initializeComponent();
            expect(component.widgetInput).not.toBeUndefined();
            expect(component.inputs.get('pivotSettings')).toBe(component.widgetInput);
        });
    });

    describe('Test onPortBenchActiveChanged method', () => {
        it('onPortBenchActiveChanged should change the value properly', () => {
            component.widgetInput = new PivotTableSettingsModel({portBenchActiveEnabled: false});
            const event = {detail: {value: {checked: true}}};
            component.onPortBenchActiveChanged(event as CustomEvent);
            expect(component.widgetInput.portBenchActiveEnabled).toBeTruthy();
            expect(component.enablePortBench).toBeTruthy();
        });
    });

});

