import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ExpostTimeSeriesSettingsComponent} from './expost-time-series-settings.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('ExpostTimeSeriesSettingsComponent', () => {
    let component: ExpostTimeSeriesSettingsComponent;
    let fixture: ComponentFixture<ExpostTimeSeriesSettingsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ExpostTimeSeriesSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ExpostTimeSeriesSettingsComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
