import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HorizontalDisplayFormComponent} from './horizontal-display-form.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('HorizontalDisplayFormComponent', () => {
    let component: HorizontalDisplayFormComponent;
    let fixture: ComponentFixture<HorizontalDisplayFormComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [HorizontalDisplayFormComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(HorizontalDisplayFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit on enabled', () => {
        const emitSpy = jest.spyOn(component.enabled, 'emit');
        component.onEnabled(1, true);
        expect(emitSpy).toHaveBeenCalledTimes(1);
        expect(emitSpy).toHaveBeenCalledWith({
            index: 1,
            value: true
        });
    });

    it('should emit on updated', () => {
        const emitSpy = jest.spyOn(component.updated, 'emit');
        component.onUpdated(1, {
            name: 'key',
            value: 'val'
        });
        expect(emitSpy).toHaveBeenCalledTimes(1);
        expect(emitSpy).toHaveBeenCalledWith({
            index: 1,
            value: {
                name: 'key',
                value: 'val'
            }
        });
    });

    it('should emit on deleted', () => {
        const emitSpy = jest.spyOn(component.deleted, 'emit');
        component.onDeleted(1);
        expect(emitSpy).toHaveBeenCalledTimes(1);
        expect(emitSpy).toHaveBeenCalledWith(1);
    });

    it('should emit on selected', () => {
        const emitSpy = jest.spyOn(component.selected, 'emit');
        component.onSelected(1);
        expect(emitSpy).toHaveBeenCalledTimes(1);
        expect(emitSpy).toHaveBeenCalledWith(1);
    });
});
