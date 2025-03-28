import {Portfolio} from '@models/portfolio/portfolio.model';
import {PerformanceSettingsComponent} from './performance-settings.component';
import {AssetType, FactorAttributionSettings, PerformanceSettings, PerformanceTimePeriod} from '@blk/explore-ui-core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('Performance Settings Component', () => {
    let fixture: ComponentFixture<PerformanceSettingsComponent>;
    let component: PerformanceSettingsComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [PerformanceSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: []
        });

        fixture = TestBed.createComponent(PerformanceSettingsComponent);
        component = fixture.componentInstance;

        component.performanceSettings = new PerformanceSettings();
        component.performanceSettings.timePeriod = new PerformanceTimePeriod();
        component.performanceSettings.timePeriod.shortName = 'child';
        component.performanceSettings.parentPerformanceSettings = new PerformanceSettings();
        component.performanceSettings.parentPerformanceSettings.timePeriod = new PerformanceTimePeriod();
        component.performanceSettings.parentPerformanceSettings.timePeriod.shortName = 'parent';
        component.portfolio = new Portfolio('PEP');
        component.factorAttributionSettings = new FactorAttributionSettings( { factorAttributionType: AssetType.MULTI_ASSET});
        component.showAdvancedAttributionSettings = false;
        component.sourceName = 'Widget';
        component.ngOnInit();
    });

    it('should create an instance', () => {
        expect(component).toBeTruthy();
        expect(component.timePeriod).toBeDefined();
        expect(component.factorAttributionSettings).toBeDefined();
        expect(component.showAdvancedAttributionSettings).toBeDefined();
        expect(fixture).toMatchSnapshot();
    });

    it('Should create with the extra sections', () => {
        component.showAdditionalPerformanceSettings = true;
        component.showAttributionSettings = true;
        component.showExpostSettings = true;
        component.showAdvancedAttributionSettings = true;
        fixture.detectChanges();
        expect(fixture).toMatchSnapshot();
    });

    it('Test resetTimePeriod', () => {
        expect(component.timePeriod.shortName).toBe('child');
        component.resetTimePeriod();
        expect(component.timePeriod.shortName).toBe('parent');
        expect(component.timePeriod.sourceName).toBe('Widget');
    });

    it('Test timePeriodChanged', () => {
        const newTimePeriod = new PerformanceTimePeriod();
        newTimePeriod.shortName = 'new';

        // Fire the event.
        component.onTimePeriodChange(newTimePeriod);

        // Validate that the performance settings has been changed accordingly.
        expect(component.performanceSettings.parentPerformanceSettings.timePeriod.shortName).toBe('parent');
        expect(component.performanceSettings.timePeriod.shortName).toBe(newTimePeriod.shortName);
        expect(component.performanceSettings.timePeriod === newTimePeriod).toBeTruthy();
    });
});
