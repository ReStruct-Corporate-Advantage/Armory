import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {isNil} from 'lodash';
import {AdvancedRiskSettings} from '../../models/advanced-risk-settings/advanced-risk-settings.model';
import {RiskSettings} from '../../models/risk-settings/risk-settings.model';
import {EconomyRiskSettingsComponent} from '../economy-risk-settings/economy-risk-settings.component';
import {ExposureRiskSettingsComponent} from '../exposure-risk-settings/exposure-risk-settings.component';
import {PositionModeSettings} from '../../models/position-mode-settings/position-mode-settings.model';
import {TokenUtils, TokenConstants, WidgetConfigType} from '@blk/explore-ui-core';
import {BehaviorSubject} from 'rxjs';

/**
 * Risk Settings Component
 *
 * @example
 *  <aux-tab-content slot="content" class="tab-content-container">
 *      <explore-risk-settings *ngIf="selectedOption === 2"
 *                         [riskSettings]="portfolio.portfolioRiskSettings">
 *      </explore-risk-settings>
 *  </aux-tab-content>
 */
@Component({
    selector: 'explore-risk-settings',
    templateUrl: './risk-settings.component.html',
    styleUrls: ['./risk-settings.component.scss']
})
export class RiskSettingsComponent implements OnInit, AfterViewInit {
    @ViewChild('economyRiskSettingsComponent', {static: false}) economyRiskSettingsComponent: EconomyRiskSettingsComponent;
    @ViewChild('exposureRiskSettingsComponent', {static: false}) exposureRiskSettingsComponent: ExposureRiskSettingsComponent;
    @ViewChild('riskSettingsContainer', {static: false}) riskSettingsContainer: ElementRef;

    @Input() riskSettings: RiskSettings;
    @Input() dependsOnExposure: boolean;
    @Input() dependsOnEconomy: boolean;
    @Input() showHVARSettings: boolean;
    @Input() showTrimmedHVARSettings: boolean;
    @Input() showMCVARSettings: boolean;

    @Input() showPositionModes = false;
    @Input() positionModeSettings: PositionModeSettings;
    @Input() showFilterScalingOptions = false;

    isAdvancedRiskSettingsModalOpen = false;

    isScreenSmall = false;
    isRiskSettingChanged: boolean;

    // specific to Factor Data widget risk settings
    readonly CLASS_PADDING_FACTOR_SETTINGS = 'layout-padding-factor-economy-settings';
    @Input() widgetType: string;
    @Input() hideEconomyDate = false;
    @Input() isColumnOption = false;
    calledFromFactorDataWidget = false;
    classNamePaddingFactorSettings: string;
    isRiskSettingChanged$ = new BehaviorSubject<boolean>(false);

    constructor(private changeDetectorRef: ChangeDetectorRef) {
    }

    /**
     * Init hook
     */
    ngOnInit(): void {
        if (isNil(this.dependsOnExposure)) {
            this.dependsOnExposure = true;
        }
        if (isNil(this.dependsOnEconomy)) {
            this.dependsOnEconomy = true;
        }
        if (isNil(this.showHVARSettings) && TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_RAS_HVAR_COLS)) {
            this.showHVARSettings = true;
        }
        if (this.showTrimmedHVARSettings && TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_RAS_HVAR_COLS)) {
            this.showTrimmedHVARSettings = true;
        }
        if (isNil(this.showMCVARSettings) && TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_RAS_MCVAR_COLS)) {
            this.showMCVARSettings = true;
        }

        // specific to Factor Data widget risk settings
        this.calledFromFactorDataWidget = this.widgetType === WidgetConfigType.FACTOR_DATA;
        this.classNamePaddingFactorSettings = this.isColumnOption ? '' : this.CLASS_PADDING_FACTOR_SETTINGS;
    }

    /**
     * AfterViewInit hook
     * This is required since @ViewChild elements can only be referenced in this hook. Elements would still be undefined in OnInit hook
     */
    ngAfterViewInit(): void {
        // setTimout is used to wait for the element being rendered; otherwise offsetWidth will return 0
        setTimeout(() => {
            this.isScreenSmall = this.riskSettingsContainer.nativeElement.offsetWidth < 600;
            this.updateRiskSettingFlag();
        });
    }

    /**
     * Risk settings reset logic
     */
    resetRiskSettings(): void {
        this.riskSettings.economyRiskSettings.resetSettings();
        this.economyRiskSettingsComponent.calledAfterPeriodReset = this.riskSettings.economyRiskSettings.setDefaultPeriod();
        this.economyRiskSettingsComponent.updatePeriodList();
        this.economyRiskSettingsComponent.calledAfterOverlapReset = this.riskSettings.economyRiskSettings.setDefaultOverlap();
        this.economyRiskSettingsComponent.dateValueObject = this.riskSettings.economyRiskSettings.dateObject;
        this.economyRiskSettingsComponent.refreshWeightingList();
        this.economyRiskSettingsComponent.refreshRiskHorizonList();
        this.riskSettings.exposureRiskSettings.resetSettings();
        if (!this.calledFromFactorDataWidget) {
            this.exposureRiskSettingsComponent.refreshRiskModelList();
        }
        this.riskSettings.advancedRiskSettings.resetSettings();

        // After resetting toggle the boolean to be false to disabled button
        this.isRiskSettingChanged = false;
        this.isRiskSettingChanged$.next(this.isRiskSettingChanged);
    }

    /**
     * Risk Setting composed of three different settings
     * If any of those settings changed then set isRiskSettingChanged to true, otherwise set it to false
     */
    updateRiskSettingFlag(): void {
        this.isRiskSettingChanged = this.riskSettings.economyRiskSettings.isEconomyRiskSettingChanged() ||
            this.riskSettings.exposureRiskSettings.isExposureRiskSettingsChanged() ||
            this.riskSettings.advancedRiskSettings.isAdvancedRiskSettingChanged() ||
            this.riskSettings.hvarRiskSettings.isHVarRiskSettingsChanged();

        this.isRiskSettingChanged$.next(this.isRiskSettingChanged);

        // update view of 'Restore default' button in HTML
        this.changeDetectorRef.markForCheck();
    }

    /**
     * Open advanced risk settings modal
     */
    openAdvancedRiskSettingsModal(): void {
        this.isAdvancedRiskSettingsModalOpen = true;
    }

    /**
     * update riskSettings.advancedRiskSettings with new value from advancedRiskSettings modal
     */
    updateAdvancedRiskSettings($event: AdvancedRiskSettings): void {
        this.riskSettings.advancedRiskSettings = $event;
        this.changeDetectorRef.markForCheck();
    }

    updatePositionModeSettings($event: PositionModeSettings): void {
        this.changeDetectorRef.markForCheck();
    }

    /**
     * Close advanced risk settings modal, bound with emit event
     */
    closeAdvancedRiskSettingsModal(): void {
        this.isAdvancedRiskSettingsModalOpen = false;
    }

}
