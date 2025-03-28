import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output
} from '@angular/core';
import {catchError, concatMap, finalize, take, takeUntil} from 'rxjs/operators';
import {OptimizationDataService} from '../../services/optimization-data.service';
import {NotificationService} from '@services/notification';
import {OptimizationRunService} from '../../services/optimization-run.service';
import {
    OPTIMIZATION_LOAD_FAIL_MESSAGE,
    OPTIMIZATION_RESTORE_DEFAULT_MESSAGE
} from '@optimization-settings/constants/optimization-notification-messages.constants';
import {CompositionDataService} from '../../../main/composition-modelling/services/composition-data.service';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {LoadingService} from '../../../loading/service/loading.service';
import {OptimizationStatus} from '@interfaces/optimization-status.interface';
import {WorkspaceStore} from '../../../../stores';
import {OptimizationStatusStore} from '../../stores/optimization-status.store';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {forkJoin, of, throwError} from 'rxjs';
import {
    AlertConstants,
    CommonUtils,
    ErrorTypeConstants,
    EventType,
    SubscribableComponent,
    TelemetryActionConstants,
    TelemetryGenericEventParameters,
    TelemetryService,
    TokenConstants,
    TokenUtils,
    UIErrorParameters
} from '@blk/explore-ui-core';
import {OptoRunConfig} from '@optimization-settings/interfaces/opto-run-config.interface';
import {AppStore} from '../../../../app.store';
import {Http2BmsService} from '@services/bms';
import {ExportUtils} from '@utils/export/export.utils';
import {RequestConstants} from '@constants/request.constants';
import {CompositionUtils} from '@utils/composition.utils';
import {OptimizationCompositeService} from '../../services/optimization-composite-service';
import {AuxRadioInterface} from '@blk/aladdin-angular-components';
import {OptimizationTypeEnum} from '@enums/optimization-type.enum';
import {isEmpty, isNil} from 'lodash';
import {OptimizationSettings} from '@models/portfolio/optimization/optimization-settings.model';
import {AppUtils} from '@utils/app.utils';
import {
    isNotDeprecatedActiveSectorConstraint,
    isValidDeprecatedActiveSectorConstraint
} from '@optimization-settings/constraints-settings/utils/constraint.utils';
import {MeanVarianceTypeEnum} from '@enums/mean-variance-type.enum';

@Component({
    selector: 'app-optimization-main',
    templateUrl: './optimization-main.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptimizationMainComponent extends SubscribableComponent implements OnInit {
    @Input() disableResetButton: boolean;
    @Output() close: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() showCompositionTable: EventEmitter<void> = new EventEmitter();
    @Output() resetComposition: EventEmitter<void> = new EventEmitter();

    currentPort: WhatIfPortfolio;
    optimizationStatus: OptimizationStatus;
    optimizationOptions: AuxRadioInterface[];

    exploreRiskBudgetingVisible = false;
    private optimizationDataService: OptimizationDataService;
    private optimizationRunService: OptimizationRunService;

    constructor(private notificationService: NotificationService,
                private changeDetectorRef: ChangeDetectorRef,
                private http2BmsService: Http2BmsService,
                private appStore: AppStore,
                private loadingService: LoadingService,
                private compositionDataService: CompositionDataService,
                private optimizationCompositeService: OptimizationCompositeService) {
        super();
        this.optimizationDataService = optimizationCompositeService.getOptimizationDataService();
        this.optimizationRunService = optimizationCompositeService.getOptimizationRunService();
    }

    ngOnInit() {
        this.exploreRiskBudgetingVisible = TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_RISK_BUDGETING_VISIBLE);

        // initialize optimization status for current portfolio
        WorkspaceStore.getCurrentPortfolio$()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((port: Portfolio) => {
                if (!(port instanceof WhatIfPortfolio)) {
                    return;
                }

                this.currentPort = port;
                if (isNil((this.currentPort as PortfolioWithPositions).optimizationType)) {
                    (this.currentPort as PortfolioWithPositions).optimizationType = OptimizationTypeEnum.MEAN_VARIANCE;
                }
                this.initOptimizationCases();
                this.optimizationStatus = OptimizationStatusStore.getOptimizationsStatus(port);
                if (!this.optimizationStatus) {
                    this.optimizationStatus = {
                        completionFlag: true,
                        spinnerFlag: false
                    };
                }
                this.changeDetectorRef.markForCheck();

                const optoSettings = (this.currentPort as PortfolioWithPositions).optimizationSettings;
                if (optoSettings instanceof OptimizationSettings && optoSettings.isFirstLoad && optoSettings.sectorConstraints.some(constraint => !isNotDeprecatedActiveSectorConstraint(constraint.positionType, constraint.constraintTag))) {
                    optoSettings.isFirstLoad = false;
                    this.alertNotification(AlertConstants.BODY.DEPRECATED_SECTOR_CONSTRAINTS, false);
                }
            });

        // update spinner flag to show/hide the optimization spinner
        this.optimizationDataService.appStore.optimizationOngoing$
            .asObservable()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((spinnerFlag: boolean) => {
                this.optimizationStatus.spinnerFlag = spinnerFlag;
                this.changeDetectorRef.markForCheck();
            });

        // track the status of app spinner
        // if app spinner is up, we want to hide opto spinner
        // if app spinner is not up, we check if the optimization has completed
        // if not completed, we bring up the opto spinner again
        this.loadingService.isLoading$()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((isAppSpinnerLoading: boolean) => {
                const updatedSpinnerStatus = isAppSpinnerLoading ? false : !this.optimizationStatus.completionFlag;
                this.optimizationDataService.appStore.optimizationOngoing$.next(updatedSpinnerStatus);
            });
    }

    /**
     * initialize dropdown for optimization cases(risk parity and mean variance)
     */
    private initOptimizationCases(): void {
        this.optimizationOptions = [{
            label: MeanVarianceTypeEnum.SECURITY,
            eventData: OptimizationTypeEnum.MEAN_VARIANCE,
            checked: (this.currentPort as PortfolioWithPositions).optimizationType === OptimizationTypeEnum.MEAN_VARIANCE
        }, {
            label: MeanVarianceTypeEnum.SECTOR,
            eventData: MeanVarianceTypeEnum.SECTOR,
            checked: (this.currentPort as PortfolioWithPositions).optimizationType === OptimizationTypeEnum.MEAN_VARIANCE_SECTOR
        }];
        if (this.exploreRiskBudgetingVisible) {
            this.optimizationOptions.push({
                label: OptimizationTypeEnum.RISK_BUDGETING,
                eventData: OptimizationTypeEnum.RISK_BUDGETING,
                checked: (this.currentPort as PortfolioWithPositions).optimizationType === OptimizationTypeEnum.RISK_BUDGETING
            });
        }
    }

    /**
     * Handler for selecting between mean variance and risk parity optimization options
     */
    onOptimizationCaseChanged(optimizationCase: OptimizationTypeEnum) {
        if (optimizationCase === OptimizationTypeEnum.MEAN_VARIANCE) {
            (this.currentPort as PortfolioWithPositions).optimizationType = OptimizationTypeEnum.MEAN_VARIANCE;
        } else if (optimizationCase === OptimizationTypeEnum.MEAN_VARIANCE_SECTOR) {
            (this.currentPort as PortfolioWithPositions).optimizationType = OptimizationTypeEnum.MEAN_VARIANCE_SECTOR;
        } else if (optimizationCase === OptimizationTypeEnum.RISK_BUDGETING) {
            (this.currentPort as PortfolioWithPositions).optimizationType = OptimizationTypeEnum.RISK_BUDGETING;
        }
    }

    onClose(goToFeasibilityReport?: boolean): void {
        this.close.emit(goToFeasibilityReport);
    }

    onSave(): void {
        this.optimizationDataService.saveOptimizationSettings();
    }

    onLoad(): void {
        this.optimizationDataService
            .loadOptimizationSettings$()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((settings) => {
                if (settings instanceof OptimizationSettings && settings.sectorConstraints.some(constraint => !isNotDeprecatedActiveSectorConstraint(constraint.positionType, constraint.constraintTag))) {
                    this.alertNotification(AlertConstants.BODY.DEPRECATED_SECTOR_CONSTRAINTS, false);
                }
            }, (error: any) => {
                this.notificationService.error(OPTIMIZATION_LOAD_FAIL_MESSAGE, ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_LOAD_OPTIMIZATION_SETTINGS_ERROR);
                console.error(error);
            });
    }

    onRestoreDefault(): void {
        this.optimizationDataService.restoreDefaultOptimizationSettings();
        this.notificationService.success(OPTIMIZATION_RESTORE_DEFAULT_MESSAGE);
    }

    /**
     * Send the request to get the optimization response and download the file
     */
    onDownloadROSRequest(hardDowload: boolean): void {
        if (this.currentPort instanceof PortfolioWithPositions) {
            // Error notification when user tries to download ROS request with invalid deprecated sector constraints
            if (this.containsInvalidDeprecatedActiveSectorConstraints()) {
                return;
            }
        }
        // If the request is for downloading the ROS request set the downloading spinner to true
        this.appStore.updateExportDownloadingStatus(true);
        this.http2BmsService.post$(RequestConstants.GET_OPTIMIZATION_RESPONSE, this.optimizationRunService.createOptoRequest(this.currentPort as PortfolioWithPositions, hardDowload, true))
            .pipe(takeUntil(this.ngUnsubscribe), finalize(() => {
                this.appStore.updateExportDownloadingStatus(false);
            }))
            .subscribe(response => {
                    const decompressedResponse = CommonUtils.decompressResponse(response?.data?.compressedResponse).data;
                    ExportUtils.download(decompressedResponse, this.currentPort.portName + '_' + (this.currentPort as PortfolioWithPositions).date, 'text/plain', undefined, false, false);
                    if (!isEmpty(decompressedResponse.warningMessage)) {
                        this.notificationService.warning(response.data.warningMessage, ErrorTypeConstants.UI_VALIDATION_WARNING, null, true);
                    }
                },
                (error: any) => {
                    this.notificationService.error('Failed to download Risk Optimization Server request', ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_ON_DOWNLOAD_ROS_REQUEST_ERROR);
                    console.log(error);
                });
    }

    onRun(optoRunConfig: OptoRunConfig): void {
        if (this.currentPort instanceof PortfolioWithPositions) {
            this.currentPort.optimizationSettings.mipTimeLimit = optoRunConfig.mipTimeLimit;
            // Error notification when user tries to download ROS request with invalid deprecated sector constraints
            if (this.containsInvalidDeprecatedActiveSectorConstraints()) {
                return;
            }
        }
        CompositionUtils.updateStatusFlagsAndStore(this.currentPort, false, true, this.optimizationStatus, this.appStore.optimizationOngoing$);
        this.optimizationRunService.run$(optoRunConfig.hardRefresh, optoRunConfig.debugContext)
            .pipe(
                concatMap((portfolio: PortfolioWithPositions) =>
                    // fetch holding changes and return them along with the portfolio in consideration
                    forkJoin([of(portfolio), this.compositionDataService.fetchHoldingChangesFollowedByCompositionData$(portfolio)])
                        .pipe(catchError(error => throwError({error, portfolio})))
                ),
                take(1)
            ).subscribe({
            next: ([port, compositionData]) => {
                CompositionUtils.updateStatusFlagsAndStore(port, true, false, this.optimizationStatus, this.appStore.optimizationOngoing$);
                port.composition = compositionData;
                this.optimizationDataService.appStore.updateCompositionPayload$.next(port);
            },
            error: errObj => {
                this.notificationService.error(`ERROR: ${errObj.error.message}`, ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_ON_RUN_ERROR, true);
                // update the optimization state for the portfolio received with error object
                CompositionUtils.updateStatusFlagsAndStore(errObj.portfolio, true, false, this.optimizationStatus, this.appStore.optimizationOngoing$);
            }
        });
    }

    /**
     * Reset composition table
     */
    onResetComposition() {
        this.resetComposition.emit();
    }

    /**
     * Cancel optimization request
     */
    onCancelOptimization(): void {
        CompositionUtils.updateStatusFlagsAndStore(this.currentPort, true, false, this.optimizationStatus, this.appStore.optimizationOngoing$);
        this.optimizationRunService.cancelOptimization$.next();
    }

    /**
     * Error notification when user tries to download ROS request with invalid deprecated sector constraints
     * and log in telemetry
     * @private
     */
    private containsInvalidDeprecatedActiveSectorConstraints(): boolean {
        if ((this.currentPort as PortfolioWithPositions).optimizationSettings.sectorConstraints.some(constraint => !isNotDeprecatedActiveSectorConstraint(constraint.positionType, constraint.constraintTag) && !isValidDeprecatedActiveSectorConstraint(constraint))) {
            this.alertNotification(AlertConstants.BODY.INVALID_DEPRECATED_SECTOR_CONSTRAINTS, true);
            TelemetryService.track(TelemetryActionConstants.GENERIC_EVENT, new TelemetryGenericEventParameters(EventType.DEPRECATED_ACTIVE_SECTOR_CONSTRAINTS_RUN));
            return true;
        }
        return false;
    }

    /**
     * open dialog modal for deprecated sector constraints
     */
    private alertNotification(message: string, isError: boolean): void {
        AppUtils.alertNotification(
            null,
            AlertConstants.HEADER.DEPRECATED_SECTOR_CONSTRAINTS,
            message,
            AlertConstants.BTN.OK,
            null,
            null,
            this.notificationService,
            isError ? AlertConstants.TYPE.ALERT : AlertConstants.TYPE.PROMPT
        );
    }
}
