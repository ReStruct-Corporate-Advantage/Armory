import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ModellingType} from '@enums/modelling-type.enum';
import {concatMap, first, takeUntil} from 'rxjs/operators';
import {WorkspaceStore} from '../../../stores';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {isNil} from 'lodash';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {RulesBasedPortfolio} from '@models/portfolio/rule-based-portfolio.model';
import {getSortedColumns} from '../../../vizualizations/table';
import {CompositionDataService} from './services/composition-data.service';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {CompositionUtils} from '@utils/composition.utils';
import {Breakdown} from '@blk/explore-ui-breakdown';
import {BaseRule} from '@models/portfolio/tradeRules/base-rule.model';
import {RuleFactory} from '../../../factories/rule.factory';
import {NotificationService} from '@services/notification';
import {RefreshCompositionConfig} from '@interfaces/refresh-composition-config.interface';
import {AppStore} from '../../../app.store';
import {
    ErrorTypeConstants,
    ExploreModellingChangeLevel,
    SubscribableComponent,
    TelemetryActionConstants,
    TelemetryCompositionChangeTrackingParameters,
    TelemetryService,
    TelemetryUtil,
    TelemetryWhatIfPortfolioTrackingParameters,
    UIErrorParameters
} from '@blk/explore-ui-core';
import {ExpandedState} from '@models/widget/inputs/expanded-state.model';
import {RequestConstants} from '@constants/request.constants';
import {ShowCompositionTableInterface} from '@interfaces/show-composition-table.interface';
import {IRowNode, NewValueParams} from 'ag-grid-community';
import {SecurityRule} from '@models/portfolio/tradeRules/security-rule.model';
import {BreakdownTreeRule} from '@models/portfolio/tradeRules/breakdown-tree-rule.model';
import {PortfolioRule} from '@models/portfolio/tradeRules/portfolio-rule.model';

/**
 * Component class for composition modelling model
 */
@Component({
    selector: 'app-composition-modelling',
    templateUrl: './composition-modelling.component.html',
    styleUrls: ['./composition-modelling.component.scss']
})
export class CompositionModellingComponent extends SubscribableComponent implements OnInit {

    modelingCategories: Record<string, number[]>; // Categories and options holder
    isWhatIfPortfolio: boolean;
    showCompositionTable = false;
    portfolio: WhatIfPortfolio;
    compositionPayload: WidgetPayload;
    eventHandlerMap: Map<string, Function>;
    disableResetButton = true;
    disableProRataOption = false;
    showEfficientFrontierPanel = false;

    constructor(private compositionDataService: CompositionDataService, private changeDetectorRef: ChangeDetectorRef, private notificationService: NotificationService,
                private appStore: AppStore) {
        super();
    }

    /**
     * OnInit hook
     */
    ngOnInit(): void {
        this.eventHandlerMap = new Map<string, Function>([['tradeAction', this.tradeActionHandler]]);

        WorkspaceStore.getCurrentPortfolio$()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(this.compositionRefreshCallback);

        this.appStore.updateCompositionPayload$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(portfolio => {
                if (portfolio === this.portfolio) {
                    // we want to update composition data only if portfolio received is current portfolio
                    this.compositionRefreshCallback(portfolio);
                    // prompt to reload widget after updating the composition payload
                    if (this.compositionPayload && this.compositionPayload.notification) {
                        this.notificationService.widgetReloadPrompt$.next(this.compositionPayload.notification);
                    }
                }
            });

        this.appStore.clearHoldingChangesAndRefreshComposition$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((portfolio: WhatIfPortfolio) => {
                portfolio.clearHoldingChanges();
                this.callForRefreshComposition({portfolio});
            });
    }

    /**
     * success callback to refresh composition payload
     * when an updated portfolio is received
     */
    compositionRefreshCallback = portfolio => {
        this.isWhatIfPortfolio = portfolio instanceof WhatIfPortfolio;
        if (this.isWhatIfPortfolio) {
            this.portfolio = portfolio as WhatIfPortfolio;
            this.modelingCategories = CompositionUtils.getModellingCategories(this.portfolio);
            if (this.portfolio.modellingType != null) {
                this.compositionPayload = CompositionUtils.refreshCompositionData(this.portfolio, this.eventHandlerMap);
                this.showCompositionTable = true;
            }
        }
        this.disableResetButton = CompositionUtils.disableResetButton(this.portfolio);
        this.disableProRataOption = CompositionUtils.disableProRataOption(this.portfolio);
        this.changeDetectorRef.markForCheck();
    };

    /**
     * Preserve natural key order
     */
    maintainNaturalOrder(): number {
        return 0;
    }

    /**
     * Set the type of modelling action the user has selected and wishes to do
     */
    setModellingType(type: number): void {
        this.showCompositionTable = false;
        this.changeDetectorRef.markForCheck();

        // set portfolio modelling type
        this.portfolio.setModellingType(type);
        this.trackWhatIfTypeViaTelemetry(type);

        // based on modelling type set, create new whatIfPortfolio instance
        const newWhatIfPort: WhatIfPortfolio = this.portfolio.modellingType === ModellingType.SECTOR || this.portfolio.modellingType === ModellingType.PORTFOLIO
            ? new RulesBasedPortfolio() : new PortfolioWithPositions();
        newWhatIfPort.copyFrom(this.portfolio);
        newWhatIfPort.fullName = this.portfolio.fullName;
        newWhatIfPort.compositionConfig = CompositionUtils.createCompositionConfig(newWhatIfPort, this.eventHandlerMap);
        newWhatIfPort.parentPortfolio = this.portfolio.parentPortfolio;
        if (newWhatIfPort instanceof PortfolioWithPositions) {
            newWhatIfPort.date = this.portfolio.datePicker.date;
            newWhatIfPort.latestOptimizationRunDetails = [];
            newWhatIfPort.updateOptimizationSettings();
        }

        this.compositionDataService.fetchDefaultCompositionBreakdown$(newWhatIfPort)
            .pipe(
                concatMap(breakdown => {
                    newWhatIfPort.compositionSetting.breakdownTree = breakdown as Breakdown;
                    // based on modelling type set, load the composition data for this portfolio
                    return this.compositionDataService.fetchHoldingChangesFollowedByCompositionData$(newWhatIfPort);
                })
            )
            .subscribe(compositionData => {
                // add composition data to the new what if portfolio
                newWhatIfPort.composition = compositionData;
                CompositionUtils.updateTradingColumn(newWhatIfPort);

                // replace it as current portfolio
                const index = WorkspaceStore.getCurrentWorkpad().getAllPortfolios().indexOf(this.portfolio);
                WorkspaceStore.getCurrentWorkpad().getAllPortfolios()[index] = newWhatIfPort;
                WorkspaceStore.updateCurrentPortfolio(newWhatIfPort);
            });
    }

    /**
     * Tracks via telemetry the type of what-if portfolio created
     */
    trackWhatIfTypeViaTelemetry(type: number): void {
        const whatIfPortfolioTypeParams = new TelemetryWhatIfPortfolioTrackingParameters({typeOfPortfolio: TelemetryUtil.getTelemetricType(type)});
        TelemetryService.track(TelemetryActionConstants.USER_BEHAVIOUR.ADD_WHAT_IF_PORTFOLIO, whatIfPortfolioTypeParams);
    }

    /**
     * This method is responsible to create trade action and execute that based on user action. Execution of trade
     * action will update UI and create holding changes corresponding to that Trade action to be used to calculate new
     * analytics.
     */
    tradeActionHandler = (portfolio: WhatIfPortfolio, params: NewValueParams) => {
        // If the format for the updated value is not correct replace it with old value
        if (!isNil(params.newValue) && params.newValue.toString().includes('undefined')) {
            params.node.data[params.column.getParent().getGroupId() + '_after'] = params.oldValue;
            params.api.refreshCells();
            return;
        }
        // Create a trade rule
        const tradeRule: BaseRule = RuleFactory.createRuleBasedOnAction(portfolio, params);
        if (isNil(tradeRule)) {
            return;
        }

        if (portfolio instanceof RulesBasedPortfolio) {
            portfolio.addTradeRule(tradeRule);
        }
        const telemetryCompositionChangeTrackingParameters = new TelemetryCompositionChangeTrackingParameters();
        telemetryCompositionChangeTrackingParameters.portfolioType = portfolio.getTelemetricPortfolioType();
        telemetryCompositionChangeTrackingParameters.modellingLevel = this.getModellingLevel(params.node, tradeRule);
        TelemetryService.track(TelemetryActionConstants.USER_BEHAVIOUR.COMPOSITION_CHANGE, telemetryCompositionChangeTrackingParameters);
        let expandedState: ExpandedState;
        if (params.api && params.api['serverSideRowModel'] && params.api['serverSideRowModel'].datasource && params.api['serverSideRowModel'].datasource.qssp) {
            expandedState = params.api['serverSideRowModel'].datasource.qssp.expandedState;
        }
        this.callForRefreshComposition({
            portfolio,
            tradeRule: [tradeRule],
            sortModel: !isNil(params.api) ? getSortedColumns(params.api.getColumnState()) : undefined,
            expandedState
        });
    }

    /**
     * returns at what level modelling change was made
     */
    getModellingLevel(node: IRowNode, tradeRule: BaseRule): ExploreModellingChangeLevel {
        if (tradeRule instanceof SecurityRule) {
            return ExploreModellingChangeLevel.EXPLORE_MODELLING_CHANGE_LEVEL_SECURITY;
        } else if (tradeRule instanceof BreakdownTreeRule) {
            return ExploreModellingChangeLevel.EXPLORE_MODELLING_CHANGE_LEVEL_SECTOR;
        } else if (tradeRule instanceof PortfolioRule) {
            return node.group ? ExploreModellingChangeLevel.EXPLORE_MODELLING_CHANGE_LEVEL_PORTGROUP : ExploreModellingChangeLevel.EXPLORE_MODELLING_CHANGE_LEVEL_PORTFOLIO;
        }
        return ExploreModellingChangeLevel.EXPLORE_MODELLING_CHANGE_LEVEL_UNSPECIFIED;
    }

    /**
     * function to reset composition data to its original state
     */
    resetComposition(): void {
        const holdingChangesToBeRetained = [...this.portfolio.holdingChanges.filter(change => change.addedDuringWhatIfInitialization)];
        // keep holding changes that were generated while adding securities
        if ((this.portfolio as PortfolioWithPositions).latestOptimizationRunDetails?.length > 0) {
            // clear out latest optimization details after click on reset composition
            (this.portfolio as PortfolioWithPositions).latestOptimizationRunDetails = [];
            holdingChangesToBeRetained.push(...this.portfolio.holdingChangesGeneratedForAddedSecurities);
        }
        this.portfolio.clearHoldingChanges(holdingChangesToBeRetained);
        this.callForRefreshComposition({portfolio: this.portfolio});
    }

    /**
     * generic function to call for composition data refresh
     */
    callForRefreshComposition(refreshCompositionConfig: RefreshCompositionConfig & ShowCompositionTableInterface): void {
        this.showCompositionTable = false;
        this.changeDetectorRef.markForCheck();
        this.compositionDataService.fetchHoldingChangesFollowedByCompositionData$(refreshCompositionConfig.portfolio, refreshCompositionConfig.tradeRule, refreshCompositionConfig.refreshCachedResponse)
            .pipe(first())
            .subscribe(compositionData => {
                refreshCompositionConfig.portfolio.composition = compositionData;
                if (refreshCompositionConfig.sourceOfRules === RequestConstants.SECURITY_SEARCH) {
                    // we only want to retain the newly added securities
                    refreshCompositionConfig.portfolio.addHoldingChangesForAddedSecurities();
                }
                this.compositionPayload = CompositionUtils.refreshCompositionData(refreshCompositionConfig.portfolio, this.eventHandlerMap, refreshCompositionConfig.sortModel, refreshCompositionConfig.expandedState);
                if (!refreshCompositionConfig.showNotification || !isNil(refreshCompositionConfig.portfolio.compositionSetting.isOptimizationCashSettingChecked)) {
                    this.notificationService.widgetReloadPrompt$.next(this.compositionPayload.notification);
                }
                this.showCompositionTable = true;
                this.changeDetectorRef.markForCheck();
                // Callback function for executing something using received data from the server.
                if (refreshCompositionConfig.callbackFunction) {
                    refreshCompositionConfig.callbackFunction();
                }
                this.disableResetButton = CompositionUtils.disableResetButton(this.portfolio);
                this.disableProRataOption = CompositionUtils.disableProRataOption(this.portfolio);
            }, error => {
                this.notificationService.error(error, ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_FETCH_HOLDING_CHANGES_FOLLOWED_BY_COMPOSITION_DATA_ERROR);
                this.showCompositionTable = true;
                if (refreshCompositionConfig.callbackFunction) {
                    refreshCompositionConfig.callbackFunction();
                }
                this.changeDetectorRef.markForCheck();
            });
    }
}
