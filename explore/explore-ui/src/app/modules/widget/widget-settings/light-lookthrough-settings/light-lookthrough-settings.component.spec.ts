import {ComponentFixture, TestBed} from '@angular/core/testing';
import {LightLookthroughSettingsComponent} from './light-lookthrough-settings.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {LightLookthrough} from '@models/lookthrough/light-lookthrough.model';

describe('LightLookthroughSettingsComponent', () => {
    let component: LightLookthroughSettingsComponent;
    let fixture: ComponentFixture<LightLookthroughSettingsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [LightLookthroughSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(LightLookthroughSettingsComponent);
        component = fixture.componentInstance;
        component.widgetInput = new LightLookthrough();
    });

    it('Test initializeComponent method', () => {
        component.widgetInput = new LightLookthrough();
        component.initializeComponent();
        expect(component.isEnabled).toBeFalsy();
        component.widgetInput = new LightLookthrough(true);
        component.initializeComponent();
        expect(component.isEnabled).toBeTruthy();
    });
    it('Test onCheckBoxChanged method', () => {
        const event = {detail: {value: {checked: true}}};
        component.onCheckBoxChanged(event as CustomEvent);
        expect(component.isEnabled).toBeTruthy();
    });
});
