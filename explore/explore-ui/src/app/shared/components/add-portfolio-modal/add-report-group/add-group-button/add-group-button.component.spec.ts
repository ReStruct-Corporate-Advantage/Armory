import {AddGroupButtonComponent} from './add-group-button.component';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('AddGroupButtonComponent', () => {
    let component: AddGroupButtonComponent;
    let fixture: ComponentFixture<AddGroupButtonComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AddGroupButtonComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(AddGroupButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Test openAddReportGroupModal', () => {
        component.openAddReportGroupModal();
        expect(component.isAddReportGroupModalOpen).toBeTruthy();
    });

    it('Test addReportGroupButtonClickedCallback with Done', () => {
        jest.spyOn(component.addReportGroupDoneClicked, 'emit');
        component.addReportGroupButtonClickedCallback(true);
        expect(component.isAddReportGroupModalOpen).toBeFalsy();
        expect(component.addReportGroupDoneClicked.emit).toHaveBeenCalledTimes(1);
    });

    it('Test addReportGroupButtonClickedCallback with Cancel', () => {
        jest.spyOn(component.addReportGroupDoneClicked, 'emit');
        component.addReportGroupButtonClickedCallback(false);
        expect(component.isAddReportGroupModalOpen).toBeFalsy();
        expect(component.addReportGroupDoneClicked.emit).toHaveBeenCalledTimes(0);
    });
});

