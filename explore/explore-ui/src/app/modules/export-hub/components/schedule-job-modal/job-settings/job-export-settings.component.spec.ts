import {ComponentFixture, TestBed} from '@angular/core/testing';
import {JobExportSettingsComponent} from './job-export-settings.component';
import {AuxSelectOption, AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {ExportHubJob} from '@blk/aladdin-graph-everything/analytics/portfolio_analytics/export_hub/v1/export_hub_job_pb';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('JobExportSettingsComponent', () => {
    let component: JobExportSettingsComponent;
    let fixture: ComponentFixture<JobExportSettingsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [JobExportSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });
        fixture = TestBed.createComponent(JobExportSettingsComponent);
        component = fixture.componentInstance;
        component.scheduledJobConfig = new ExportHubJob();
        // component.scheduledJobConfig.jobExportSettings = new JobExportSettings();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize job settings with default values', () => {
        component.ngOnInit();
        expect(component.exportAsOptions.length).toBeGreaterThan(0);
    });

    it('should set job name', () => {


        component.onJobNameChanged('abc');

        expect(component.scheduledJobConfig.getName()).toBe('abc');
    });

    it('should set export type to CSV', () => {
        const event: CustomEvent<AuxSelectSelectionChangedDetailInterface> = new CustomEvent('change', {
            detail: { value: { value: 'CSV' } as AuxSelectOption }
        });

        component.onExportOptionChanged(event);

        expect(component.scheduledJobConfig.getExportType()).toBe('CSV');
    });

    it('should set export type to JSON', () => {
        const event: CustomEvent<AuxSelectSelectionChangedDetailInterface> = new CustomEvent('change', {
            detail: { value: { value: 'JSON' } as AuxSelectOption }
        });

        component.onExportOptionChanged(event);

        expect(component.scheduledJobConfig.getExportType()).toBe('JSON');
    });

});
