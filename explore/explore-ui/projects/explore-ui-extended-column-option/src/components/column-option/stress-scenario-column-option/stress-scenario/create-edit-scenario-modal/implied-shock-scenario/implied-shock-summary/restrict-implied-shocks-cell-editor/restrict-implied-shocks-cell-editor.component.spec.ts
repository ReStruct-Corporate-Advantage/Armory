import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RestrictImpliedShocksCellEditorComponent } from './restrict-implied-shocks-cell-editor.component';
import { KeyboardEventKey } from '@blk/aladdin-angular-components';

describe('RestrictImpliedShocksCellEditorComponent', () => {
    let component: RestrictImpliedShocksCellEditorComponent;
    let fixture: ComponentFixture<RestrictImpliedShocksCellEditorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ RestrictImpliedShocksCellEditorComponent ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(RestrictImpliedShocksCellEditorComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with params', () => {
        const params = { value: 'shock1,shock2', eGridCell: {} };
        component.agInit(params);
        expect(component.restrictImpliedShocks).toEqual(['shock1', 'shock2']);
        expect(component.updatedRestrictImpliedShocks).toEqual(['shock1', 'shock2']);
        expect(component.targetEl).toEqual(params.eGridCell);
    });

    it('should get value', () => {
        component.restrictImpliedShocks = ['shock1', 'shock2'];
        expect(component.getValue()).toEqual('shock1,shock2');
    });

    it('should stop event propagation on tab key down', () => {
        const event = new KeyboardEvent('keydown', { key: KeyboardEventKey.Tab });
        jest.spyOn(event, 'stopPropagation');
        component.onKeyDown(event);
        expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('should update restrictImpliedShocks on change', () => {
        const newShocks = ['shock3', 'shock4'];
        component.onRestrictImpliedShocksChanged(newShocks);
        expect(component.updatedRestrictImpliedShocks).toEqual(newShocks);
    });

    it('should handle button click', () => {
        const params = { stopEditing: jest.fn() };
        component.params = params;
        component.updatedRestrictImpliedShocks = ['shock3', 'shock4'];
        component.handleButtonClick();
        expect(component.restrictImpliedShocks).toEqual(['shock3', 'shock4']);
        expect(params.stopEditing).toHaveBeenCalled();
    });

    it('should handle close icon click', () => {
        const params = { stopEditing: jest.fn() };
        component.params = params;
        component.handleCloseIconClick();
        expect(params.stopEditing).toHaveBeenCalled();
    });
});
