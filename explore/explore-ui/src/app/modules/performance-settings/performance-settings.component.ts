import {Component, Input, OnInit} from '@angular/core';
import {ColumnConfig, ExpostSettings, FactorAttributionSettings, PerformanceSettings, PerformanceTimePeriod, TelemetryGenericEventParameters} from '@blk/explore-ui-core';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {PerformanceAttributionSettingsService} from './services/performance-attribution-settings.service';
import {PerformanceTimePeriodSettingsService} from './services/performance-time-period-settings.service';

@Component({
    selector: 'app-performance-settings',
    templateUrl: './performance-settings.component.html',
    styleUrls: ['./performance-settings.component.scss']
})
export class PerformanceSettingsComponent implements OnInit {
    @Input() portfolio: Portfolio;
    @Input() performanceSettings: PerformanceSettings;
    @Input() expostSettings: ExpostSettings;
    @Input() showExpostSettings: boolean;
    @Input() showAdditionalPerformanceSettings: boolean;
    @Input() showAdditionalPerformanceSettingsAttributes: number;
    @Input() showAttributionSettings: boolean;
    @Input() columns: ColumnConfig[];
    @Input() isColumnUpdateEnabled: boolean;
    @Input() isApplyButtonDisabled: any;
    @Input() showAdvancedAttributionSettings = false;
    @Input() factorAttributionSettings: FactorAttributionSettings;
    @Input() sourceName: string;
    @Input() telemetryData?: TelemetryGenericEventParameters;

    timePeriod: PerformanceTimePeriod;
    isTemplateExpanded = true;

    /**
     * Init the control.
     */
    ngOnInit(): void {
        PerformanceTimePeriodSettingsService.portfolio = this.portfolio;
        PerformanceAttributionSettingsService.portfolioAssetType = this.portfolio.assetType;
        this.setTimePeriod();
        this.performanceSettings.sourceName = this.performanceSettings.sourceName || this.sourceName;
        this.performanceSettings.attributionSettings.sourceName = this.performanceSettings.attributionSettings.sourceName || this.sourceName;
        this.timePeriod.sourceName = this.timePeriod.sourceName || this.sourceName;
    }

    /**
     * Function to set the time period for the control to use.
     */
    private setTimePeriod() {
        // In performance settings there may be a parent hooked up.  If there is and the time period is from the parent
        // make a copy of it. so we do not change the parent.
        // NOTE:  That we are comparing with === rather than .equals as we want the exact instance.
        if (this.performanceSettings.timePeriod === this.performanceSettings.parentPerformanceSettings.timePeriod) {
            this.timePeriod = this.performanceSettings.timePeriod.createCopy();
        } else {
            this.timePeriod = this.performanceSettings.timePeriod;
        }
        this.timePeriod.parentTimePeriod = this.performanceSettings.parentPerformanceSettings?.timePeriod;
    }

    /**
     * reset local time period
     */
    resetTimePeriod(): void {
        this.performanceSettings.timePeriod = undefined;
        this.setTimePeriod();
        this.timePeriod.sourceName = this.timePeriod.sourceName || this.sourceName;
    }

    /**
     * update object for time period
     */
    onTimePeriodChange(timePeriod: PerformanceTimePeriod): void {
        // Only need to change the time period if it is not the instance already in the performanceSettings.
        if (this.performanceSettings.timePeriod !== timePeriod) {
            this.performanceSettings.timePeriod = timePeriod;
        }
    }
}
