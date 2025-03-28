import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter, Input,
    OnInit,
    Output
} from '@angular/core';
import {
    CoreFavoriteConstants,
    ErrorTypeConstants,
    ExploreRadioButton,
    SubscribableComponent, 
    UIErrorParameters
} from '@blk/explore-ui-core';
import {
    AuxButtonSizeEnum,
    AuxButtonTypeEnum,
    AuxRadioInterface
} from '@blk/aladdin-angular-components';
import {WorkspaceStore} from '@stores/workspace.store';
import {catchError, concatMap, take, takeUntil} from 'rxjs/operators';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {RiskParityCase} from '@enums/risk-parity-case.enum';
import {SaveFavoriteAction} from '@models/favorite/save-favorite-action.model';
import {FavoriteConstants} from '@constants/favorite.constants';
import {AppStore} from '../../../../app.store';
import {OPTIMIZATION_LOAD_FAIL_MESSAGE} from '@optimization-settings/constants/optimization-notification-messages.constants';
import {OptimizationDataService} from '../../../optimization/services/optimization-data.service';
import {NotificationService} from '@services/notification';
import {RiskParitySettings} from '@models/portfolio/optimization/risk-parity-settings.model';
import {OptimizationConstants} from '@constants/optimization.constants';
import {OptimizationRunService} from '../../../optimization/services/optimization-run.service';
import {forkJoin, Observable, of, throwError} from 'rxjs';
import {OptimizationStatusStore} from '../../../optimization/stores/optimization-status.store';
import {CompositionDataService} from '../../../main/composition-modelling/services/composition-data.service';
import {InvestmentUniverseSettings} from '@models/portfolio/investmentUniverse/investment-universe-settings.model';
import {ObjectiveSettings} from '@models/portfolio/objectives/objective.settings.model';
import {OptimizationService} from '@optimization-configuration/services/optimization-service.interface';
import {OptimizationSummary} from '@optimization-settings-configuration/models/optimization-summary.model';
import {ExploreOptimizationSettingsService} from '@optimization-settings/service/explore-optimization-settings.service';
import {OptimizationStatus} from '@interfaces/optimization-status.interface';
import {LoadingService} from '../../../loading/service/loading.service';
import {CompositionUtils} from '@utils/composition.utils';
import {OptimizationCompositeService} from '../../../optimization/services/optimization-composite-service';

@Component({
  selector: 'app-risk-parity-main',
  templateUrl: './risk-parity-main.component.html',
  styleUrls: ['./risk-parity-main.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

/**
 * Risk parity main component to control the risk parity screen
 */
export class RiskParityMainComponent extends SubscribableComponent implements OnInit {

    readonly CoreFavoriteConstants = CoreFavoriteConstants;
    readonly AuxButtonTypeEnum = AuxButtonTypeEnum;
    readonly AuxButtonSizeEnum = AuxButtonSizeEnum;
    optimizationStatus: OptimizationStatus;
    currentPort: PortfolioWithPositions;
    riskParityOptions: AuxRadioInterface[] = [];
    launchOptimizationSettings = false;
    type: string;
    investmentUniverseSettings: InvestmentUniverseSettings;
    objectiveSettings: ObjectiveSettings = new ObjectiveSettings();
    optimizationSummaries$: Observable<OptimizationSummary[]>;
    riskParityOptionsDescription: string = OptimizationConstants.RISK_PARITY_ABSOLUTE_TITLE + OptimizationConstants.RISK_PARITY_ACTIVE_TITLE;
    private optimizationDataService: OptimizationDataService;
    private optimizationRunService: OptimizationRunService;
    private optimizationService: OptimizationService;
    private exploreOptimizationSettingsService: ExploreOptimizationSettingsService;
    @Input() disableResetButton: boolean;
    @Output() close: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() resetComposition: EventEmitter<void> = new EventEmitter();

    constructor(
        private compositionDataService: CompositionDataService,
        private loadingService: LoadingService,
        private optimizationCompositeService: OptimizationCompositeService,
        private appStore: AppStore,
        private changeDetectorRef: ChangeDetectorRef,
        private notificationService: NotificationService
    ) {
        super();
        this.optimizationDataService = optimizationCompositeService.getOptimizationDataService();
        this.optimizationService = optimizationCompositeService.getOptimizationService();
        this.optimizationRunService = optimizationCompositeService.getOptimizationRunService();
        this.exploreOptimizationSettingsService = optimizationCompositeService.getExploreOptimizationSettingsService();
    }

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        // initialize optimization status for current portfolio
        WorkspaceStore.getCurrentPortfolio$()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((port: Portfolio) => {
                if (!(port instanceof PortfolioWithPositions)) {
                    return;
                }

                this.currentPort = port;
                this.optimizationStatus = OptimizationStatusStore.getOptimizationsStatus(port);
                if (!this.optimizationStatus) {
                    this.optimizationStatus = {
                        completionFlag: true,
                        spinnerFlag: false
                    };
                }
                this.changeDetectorRef.markForCheck();
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

        this.optimizationSummaries$ = this.optimizationService.getRiskParityOptimizationSummaries$(this.currentPort.riskParitySettings.riskParityCase);
        this.initializeRiskParityOptions();
        this.investmentUniverseSettings = this.currentPort.riskParitySettings.investmentUniverseSettings;
        this.objectiveSettings = this.currentPort.riskParitySettings.objectiveSettings;
        this.changeDetectorRef.detectChanges();
  }

    /**
     * initialize risk parity options
     */
    initializeRiskParityOptions(): void {
        this.riskParityOptions = OptimizationConstants.RISK_PARITY_OPTIONS.map(option =>
            new ExploreRadioButton(option.label, this.currentPort.riskParitySettings.riskParityCase === option.value, false, {riskParityType: option.value})
        );
        this.optimizationSummaries$ = this.optimizationService.getRiskParityOptimizationSummaries$(this.currentPort.riskParitySettings.riskParityCase);
        this.exploreOptimizationSettingsService.loadRiskParitySettings();
        this.changeDetectorRef.detectChanges();
    }

    /**
     * on restore default
     */
    onRestoreDefault(): void {
      const settings: RiskParitySettings = new RiskParitySettings();
      settings.setDefaultObjective();
      this.optimizationDataService.updateRiskParitySettings(settings);
    }

    /**
     * on load action
     */
    onLoad(): boolean {
        this.optimizationDataService
            .loadOptimizationSettings$(true)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({error: (error: any) => {
                this.notificationService.error(OPTIMIZATION_LOAD_FAIL_MESSAGE, ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_LOAD_OPTIMIZATION_SETTINGS_ERROR);
                console.error(error);
            }});
        return false;
    }

    /**
     * on save action
     */
    onSave(): void {
        this.appStore.saveFavoriteAction$.next(
            new SaveFavoriteAction(
                (WorkspaceStore.getCurrentPortfolio() as PortfolioWithPositions).riskParitySettings,
                FavoriteConstants.RISK_PARITY_SETTINGS_PASCAL,
                FavoriteConstants.RISK_PARITY_SETTINGS,
                FavoriteConstants.RISK_PARITY_SETTINGS_FOLDER
            ));
    }

    /**
     * on modal closed
     */
    onClose(): void {
        this.close.emit();
    }

    /**
     * On run clicked
     */
    onRun(): void {
        CompositionUtils.updateStatusFlagsAndStore(this.currentPort, false, true, this.optimizationStatus, this.appStore.optimizationOngoing$);
        this.optimizationRunService.run$(false, false, true)
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
     * On Risk Parity Changed
     */
    onRiskParityOptionchanged(riskParityType: RiskParityCase): void {
        this.currentPort.riskParitySettings.riskParityCase = riskParityType;
        // initialize risk parity options again
        this.initializeRiskParityOptions();
    }

    /**
     * On Edit icon clicked
     */
    onEdit(type: string): void {
        this.type = type;
        this.launchOptimizationSettings = true;
    }

    /**
     * modal closed handler
     */
    onModalClosed(): void {
        this.launchOptimizationSettings = false;
        this.changeDetectorRef.detectChanges();
    }

    /**
     * Reset composition
     */
    onResetComposition(): void {
        this.resetComposition.emit();
    }
}
