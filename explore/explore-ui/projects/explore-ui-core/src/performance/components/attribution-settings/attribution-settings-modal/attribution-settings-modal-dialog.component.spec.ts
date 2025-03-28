import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AttributionSettingsModalDialogComponent } from './attribution-settings-modal-dialog.component';
import {of} from 'rxjs';

describe('AttributionSettingsModalDialogComponent', () => {
    let component: AttributionSettingsModalDialogComponent;
    let fixture: ComponentFixture<AttributionSettingsModalDialogComponent>;

    beforeEach(() => {
        fixture = TestBed.createComponent(AttributionSettingsModalDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close modal', () => {
        component.isOpen = true;
        component.closeModal();
        expect(component.isOpen).toBe(false);
    });

    it('should emit factorsUpdated event when closeAndSetFactors is called', () => {
        const selectedFactors = [{ eventData: 'factor1' }, { eventData: 'factor2' }];
        jest.spyOn(component['factorsUpdated'], 'emit');
        // jest.spyOn(component['auxPickList'], 'getSourceSelection').mockReturnValue(Promise.resolve(selectedFactors));
        component.auxPickList.getSourceSelection = jest.fn(() => {
            return of([ {
                eventData: 'factor1',
                children: undefined
            }, {
                eventData: 'factor2',
                children: undefined
            }]).toPromise();
        });

        component.closeAndSetFactors();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(component.factorsUpdated.emit).toHaveBeenCalledWith(['factor1', 'factor2']);
        });
    });
});
