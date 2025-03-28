import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Inject,
    Input,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import {Observable} from 'rxjs';
import {OptimizationSummary} from '@optimization-settings-configuration/models/optimization-summary.model';
import {OPTIMIZATION_SERVICE} from '../../tokens/optimization-service.token';
import {OptimizationService} from '../../services/optimization-service.interface';
import {AuxButtonSizeEnum, AuxButtonTypeEnum, AuxNotificationGroup, AuxNotificationGroupConfig, AuxNumericStepperValueChangedDetailInterface} from '@blk/aladdin-angular-components';
import {isNil} from 'lodash';
import {
    CoreFavoriteConstants,
    ExploreRadioButton,
    SubscribableComponent,
    TelemetryActionConstants,
    TelemetryModellingHelpClickParameters,
    TelemetryService, TokenConstants, TokenUtils
} from '@blk/explore-ui-core';
import {OptimizationConstants} from '@constants/optimization.constants';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {AppUtils} from '@utils/app.utils';
import {OptoRunConfig} from '@optimization-settings/interfaces/opto-run-config.interface';
import {takeUntil} from 'rxjs/operators';
import {ExportDownloadingStatus} from '@interfaces/export-downloading-status.interface';
import {AppStore} from '../../../../app.store';
import { AdvancedRiskSettings } from '@blk/explore-ui-risk';
import {LatestOptimizationRunDetails} from '@models/portfolio/optimization/latest-optimization-run-details';

@Component({
    selector: 'app-optimization',
    templateUrl: './optimization.component.html',
    styleUrls: ['./optimization.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptimizationComponent extends SubscribableComponent implements OnInit {
    readonly CoreFavoriteConstants = CoreFavoriteConstants;
    readonly AuxButtonTypeEnum = AuxButtonTypeEnum;
    readonly AuxButtonSizeEnum = AuxButtonSizeEnum;

    @Input() currentPort: PortfolioWithPositions;
    @Input() disableResetButton: boolean;
    @Input() isOptimizationInProgress: boolean;
    @Output() close: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() save: EventEmitter<void> = new EventEmitter();
    @Output() load: EventEmitter<void> = new EventEmitter();
    @Output() restoreDefault: EventEmitter<void> = new EventEmitter();
    @Output() run: EventEmitter<OptoRunConfig> = new EventEmitter<OptoRunConfig>();
    @Output() cancelOptimization: EventEmitter<void> = new EventEmitter();
    @Output() downloadROSRequest: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() efficientFrontierRun: EventEmitter<number> = new EventEmitter<number>();
    @Output() resetComposition: EventEmitter<void> = new EventEmitter();

    @ViewChild('runNotification', {static: true}) runNotification: AuxNotificationGroup;

    optimizationSummaries$: Observable<OptimizationSummary[]>;
    launchOptimizationSettings = false;
    type: string;
    subType: string;
    showNotification = false;
    readonly notificationId = 'notification-id';
    mipTimeLimit: number = 1;
    finalMipTimeLimit: number = 60;
    popoverOpen: boolean = false;
    exportingInProgress: boolean;
    exploreOptoApiRequestAccess: boolean;
    isAdvancedRiskSettingsModalOpen = false;
    latestOptoRunDetails: LatestOptimizationRunDetails;

    timeoutOptions: ExploreRadioButton[];
    timeoutType: string = OptimizationConstants.FIRST_SOLUTION;

    constructor(@Inject(OPTIMIZATION_SERVICE) private optimizationService: OptimizationService, private appStore: AppStore, private changeDetectorRef: ChangeDetectorRef) {
        super();
    }

    ngOnInit(): void {
        if (this.currentPort.latestOptimizationRunDetails !== null && this.currentPort.latestOptimizationRunDetails.length > 0) {
            this.latestOptoRunDetails = this.currentPort.latestOptimizationRunDetails[0];
        }
        this.optimizationSummaries$ = this.optimizationService.getOptimizationSummaries$();
        this.initializeTimeoutOptions();
        this.exploreOptoApiRequestAccess = TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_OPTO_API_REQUEST_ACCESS);
        this.appStore.updateCompositionPayload$.subscribe(port => this.changeDetectorRef.detectChanges());
        this.appStore.exportDownloadingStatus$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((downloadStatus: ExportDownloadingStatus) => {
                this.exportingInProgress = !!(isNil(downloadStatus?.exportComposite) && downloadStatus?.downloadInProgress);
                this.changeDetectorRef.detectChanges();
            });
    }

    onRestoreDefault(): boolean {
        this.restoreDefault.emit();
        return false;
    }

    onLoad(): boolean {
        this.load.emit();
        return false;
    }

    onSave(): void {
        this.save.emit();
    }

    onRun(event: CustomEvent): void {
        // if Run Optimization button is clicked with Ctrl and shift together, set debug context to true to enable additional conditional logging
        const debugCtx = AppUtils.isCtrlPressed(event) && AppUtils.isShiftPressed(event);
        this.runNotification.close(this.notificationId);
        this.run.emit({mipTimeLimit: this.getTimeLimit(this.timeoutType), hardRefresh: AppUtils.isCtrlPressed(event), debugContext: debugCtx});
    }

    /**
     * handler for canceling the optimization
     */
    onCancelOptimization(): void {
        this.cancelOptimization.emit();
    }

    /**
     * handler for downloading the ROS request
     */
    onDownloadROSRequest(event: MouseEvent): void {
        const hardDownload = AppUtils.isCtrlPressed(event);
        this.downloadROSRequest.emit(hardDownload);
    }

    /**
     * handler for efficient frontier trades call
     */
    onEfficientFrontierRun(): void {
        this.runNotification.close(this.notificationId);
        this.efficientFrontierRun.emit(this.getTimeLimit(this.timeoutType));
    }


    /**
     * returns the time limit number
     */
    getTimeLimit(timeoutType: string): number {
        let timeLimit;
        if (timeoutType === OptimizationConstants.MAX_TIMEOUT_LIMIT) {
            // maximum of 15 minutes
            timeLimit = 15 * 60;
        } else if (timeoutType === OptimizationConstants.TIMEOUT_LIMIT) {
            // time limit from the stepper
            timeLimit = this.finalMipTimeLimit;
        }

        return timeLimit;
    }

    onClose(navigateToFeasibilityReport?: boolean): void {
        this.close.emit(navigateToFeasibilityReport);
    }

    onEdit(type: string, subType: string): void {
        this.type = type;
        this.subType = subType;
        this.launchOptimizationSettings = true;
    }

    onModalClosed(hasChanges: boolean): void {
        this.launchOptimizationSettings = false;
        if (hasChanges && !this.showNotification) {
            this.displayNotification();
        }
    }

    onNotificationClosed(): void {
        this.showNotification = false;
    }

    private displayNotification(): void {
        const notification: AuxNotificationGroupConfig = this.optimizationService.getRunUpdateNotification();
        if (notification) {
            notification.id = this.notificationId;
            this.showNotification = true;
            this.runNotification.open(notification);
        }
    }

    // Method to update value of mipTimeLimit when value is changed
    onValueChanged(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>) {
        this.mipTimeLimit = Number(event.detail.value);
    }

    onIterationValueChanged(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>) {
        this.currentPort.optimizationSettings.iterations = Number(event.detail.value);
    }

    getIterationsCount(): number {
        return this.currentPort.optimizationSettings.iterations;
    }

    // Method to handle when done is clicked on timeout selector
    onDoneClicked() {
        if (isNil(this.mipTimeLimit)) {
            this.mipTimeLimit = 1;
        }
        this.finalMipTimeLimit = this.mipTimeLimit * 60;
        this.popoverOpen = false;
    }

    // Method to close timeout popover screen when cancel is pressed
    onCancelClicked() {
        this.popoverOpen = false;
    }

    //Update popover state
    onPopOverOpened() {
        this.popoverOpen = true;
    }

    // initalize timeout options
    initializeTimeoutOptions(): void {
        this.timeoutOptions = OptimizationConstants.TIMEOUT_OPTIONS.map(option =>
            new ExploreRadioButton(option.label, this.timeoutType === option.value, false, {helpText: option.title, timeoutType: option.value})
        );
    }

    /**
     * On timeout option changed
     * @param eventData
     */
    onTimeoutOptionChanged(eventData: any): void {
        this.timeoutType = eventData.timeoutType;
        // initalize timeout options again
        this.initializeTimeoutOptions();
    }

    /**
     * Track via telemetry if help popover was opened
     */
    trackViaTelemetry(helpOption: string): void {
        const modellingHelpClickParameters = new TelemetryModellingHelpClickParameters({modellingHelpOption: helpOption});
        TelemetryService.track(TelemetryActionConstants.USER_BEHAVIOUR.MODELLING_CLICK_ON_HELP, modellingHelpClickParameters);
    }

    isEfficientEnabled(): boolean {
        return this.currentPort.optimizationSettings.isEfficientFrontierEnabled && this.currentPort.optimizationSettings.iterationType === OptimizationConstants.MANUAL_ITERATION_TYPE;
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
    updateAdvancedRiskSettings(advancedRiskSettingEvent: AdvancedRiskSettings): void {
        this.currentPort.optimizationSettings.optimizationAdvancedRiskSettings = advancedRiskSettingEvent;
    }

    /**
     * Close advanced risk settings modal, bound with emit event
     */
    closeAdvancedRiskSettingsModal(): void {
        this.isAdvancedRiskSettingsModalOpen = false;
    }

    /**
     * Reset composition
     */
    onResetComposition(): void {
        this.resetComposition.emit();
    }
}
