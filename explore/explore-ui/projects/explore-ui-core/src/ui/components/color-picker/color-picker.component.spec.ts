import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ColorPickerComponent} from './color-picker.component';
import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange, SimpleChanges} from '@angular/core';

describe('ColorPickerComponent', () => {
    let component: ColorPickerComponent;
    let fixture: ComponentFixture<ColorPickerComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ColorPickerComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ColorPickerComponent);
        component = fixture.componentInstance;
        component.color = 'rgb(211,211,211)';
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Test changeColor', () => {
        const event = {detail: {color: {rgb: [214, 52, 52]}}};
        component.changeColor(event as any);
        expect(component.color).toEqual('rgb(214,52,52)');
    });

    it('Test On Changes', () => {
        const changes: SimpleChanges = {
            color: {
                currentValue: 'rgb(214,52,52)',
                previousValue: '',
                firstChange: true
            } as SimpleChange
        };
        component.ngOnChanges(changes);
        expect(component.hexValue).toEqual('#d63434');
        changes.color.currentValue = '#D53434';
        component.ngOnChanges(changes);
        expect(component.hexValue).toEqual('#D53434');
        changes.color.currentValue = '#d53434';
        component.ngOnChanges(changes);
        expect(component.hexValue).toEqual('#d53434');
    });
});
