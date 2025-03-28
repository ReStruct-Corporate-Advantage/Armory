import {ComponentFixture, TestBed} from '@angular/core/testing';

import {JobSchedulerModalComponent} from './job-scheduler-modal.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('JobSchedulerModalComponent', () => {
    let component: JobSchedulerModalComponent;
    let fixture: ComponentFixture<JobSchedulerModalComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [JobSchedulerModalComponent]
        });
        fixture = TestBed.createComponent(JobSchedulerModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit modalClosed event and set isOpen to false when closeModal is called', () => {
        jest.spyOn(component.modalClosed, 'emit');
        component.isOpen = true;

        component.closeModal();

        expect(component.isOpen).toBe(false);
        expect(component.modalClosed.emit).toHaveBeenCalled();
    });
});
