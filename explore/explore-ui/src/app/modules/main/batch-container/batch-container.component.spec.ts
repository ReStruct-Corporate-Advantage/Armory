import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BatchContainerComponent} from './batch-container.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {BatchExportingStore} from '../../../stores';
import {Report} from '@models/workspace/report.model';
import {BatchContainerStatus} from '@enums/batch-reporting/batch-container-status.enum';

describe('BatchContainerComponent', () => {
    let component: BatchContainerComponent;
    let fixture: ComponentFixture<BatchContainerComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [BatchContainerComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        BatchExportingStore.init();
        fixture = TestBed.createComponent(BatchContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Test getCurrentReport$ subscription', () => {
        component.ngOnInit();

        const report = new Report();
        jest.spyOn(report, 'getWidgetsInOrder').mockImplementation(() => {});
        BatchExportingStore.currentReport$.next(report);
        expect(report.getWidgetsInOrder).toHaveBeenCalled();
        expect(component.batchReport).toBe(report);
        expect(BatchExportingStore.getBatchContainerStatus()).toEqual(BatchContainerStatus.LOADING);
    });
});
