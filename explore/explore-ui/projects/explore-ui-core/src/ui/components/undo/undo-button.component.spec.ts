import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {UndoButtonComponent} from './undo-button.component';

describe('UndoButtonComponent', () => {
    let component: UndoButtonComponent;
    let fixture: ComponentFixture<UndoButtonComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [UndoButtonComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(UndoButtonComponent);
        component = fixture.componentInstance;
        component.callback = jest.fn();

        fixture.detectChanges();
    });
    it('should run the passed in callback onUndoClick', () => {
        component.onUndoClick();

        expect(component.callback).toHaveBeenCalled();
    });
});
