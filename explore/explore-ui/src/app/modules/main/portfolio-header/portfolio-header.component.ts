import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {takeUntil} from 'rxjs/operators';
import {PortfolioSearchComponent, PortfolioSearchItem, PortfolioSearchUtils} from '@blk/explore-ui-portfolio-search';
import {ExploreIndexSearchService, ExplorePortfolioSearchService, NotificationService, PortfolioService, SearchedIndexData} from '../../../shared/services';
import {WorkspaceStore} from '../../../stores';
import {
    AddPortfolioTrackingParameters,
    AddPortSource,
    AlertConstants,
    CalendarDateUtils,
    ExploreDialogParam,
    SubscribableComponent,
    TelemetryActionConstants,
    TelemetryService,
    TelemetryWhatIfPortfolioTrackingParameters
} from '@blk/explore-ui-core';
import {WorkpadUtils} from '@utils/workpad.utils';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {PortfolioTooltipInfo} from '@models/portfolio/portfolio-tooltip-info.model';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {cloneDeep, isEmpty, isNil} from 'lodash';
import {CustomSector} from '@blk/explore-ui-breakdown';
import {AdhocPortfolio} from '@models/portfolio/adhoc-portfolio.model';
import {SaveFavoriteAction} from '@models/favorite/save-favorite-action.model';
import {AppStore} from '../../../app.store';
import {CompositionConstants} from '@constants/composition.constants';
import {ModellingType} from '@enums/modelling-type.enum';
import {AuxAdvancedTreeListInterface, AuxSearchSelectOptionsInterface} from '@blk/aladdin-angular-components';
import {IndexResearchTreeUtils} from '@utils/index-research-tree.utils';
import {FavoriteConstants} from '@constants/favorite.constants';
import {isAdhocPort} from '@interfaces/base-adhoc-portfolio.interface';
import {ModalStateAction} from '@models/favorite/modal-state-action.enum';
import {ModalStateActionInfo} from '@models/favorite/modal-state-action-info.interface';
import {ModalInvokeSource} from '@models/favorite/modal-invoke-source.enum';
import {PortfolioUtils} from '@utils/portfolio.utils';
import {NewPortfolioHoldingChange} from '@models/portfolio/composition/new-portfolio-holding-change.model';
import {CompositionDataService} from '../composition-modelling/services/composition-data.service';
import {LookThroughSettingsWithRules} from '@models/lookthrough/look-through-settings-with-rules.model';

/**
 * Portfolio Header Component
 *  holds portfolio title (or portfolio search on search mode), what-if and compare button to open the modals
 *
 * @example
 *  <app-portfolio-header></app-portfolio-header>
 */
@Component({
    selector: 'app-portfolio-header',
    templateUrl: './portfolio-header.component.html',
    styleUrls: ['./portfolio-header.component.scss']
})
export class PortfolioHeaderComponent extends SubscribableComponent implements OnInit {

    /**
     * the original list of indexes
     */
    indexResearchTreeData: AuxAdvancedTreeListInterface[];

    searchMode = false;

    currentPortfolioHeaderTitle: string;
    tooltipInfo: PortfolioTooltipInfo;
    popoverHeader: string;

    isSaveAsPortfolioDisabled = false;

    isWhatIfPortfolioLoaded = false;
    isIndexResearchPortfolio = false;

    currentPort: Portfolio;

    isWhatIfMode = false;

    isExposureBasedPortfolio = false;

    @ViewChild('portfolioSearch', {static: false}) portfolioSearch: PortfolioSearchComponent;

    /* copy enum to allow usage in template */
    readonly addPortSourceEnum = AddPortSource.PORTFOLIO_HEADER_BAR;
    readonly PORTFOLIO: string = 'Portfolio';

    selectProps: AuxSearchSelectOptionsInterface = PortfolioSearchUtils.getSelectProps();

    /**
     * constructor
     */
    constructor(private compositionDataService: CompositionDataService, public portfolioSearchService: ExplorePortfolioSearchService, private portfolioService: PortfolioService, private notificationService: NotificationService, private appStore: AppStore, private cdRef: ChangeDetectorRef, private indexSearchService: ExploreIndexSearchService) {
        super();
    }

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        this.tooltipInfo = new PortfolioTooltipInfo();
        WorkspaceStore.getCurrentPortfolio$()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((port: Portfolio) => {
                if (port) {
                    this.currentPort = port;
                    this.currentPortfolioHeaderTitle = port.getPortfolioHeaderTitle();
                    this.tooltipInfo.currency = port.currency;
                    // clone index weights and sort by decreasing weight
                    this.tooltipInfo.indexWeights = [...(port.indexWeights ?? [])].sort((a, b) => (a.weight > b.weight) ? -1 : 1);
                    this.popoverHeader = port.fullName ? port.portName + ' | ' + port.fullName : port.portName;
                    this.isWhatIfPortfolioLoaded = port instanceof WhatIfPortfolio;
                    this.isExposureBasedPortfolio = this.isWhatIfPortfolioLoaded && (port as WhatIfPortfolio).modellingType === ModellingType.EXPOSURE;
                    this.isIndexResearchPortfolio = port.isIndexResearchPortfolio;
                    this.isSaveAsPortfolioDisabled = (port instanceof WhatIfPortfolio && isNil(port.modellingType)) || (isAdhocPort(port) && isNil(port.adhocParams));
                    // Close the portfolio search after selecting another portfolio from the sidebar
                    this.searchMode = false;
                }
            });

        // get the indexes and create the picklist tree
        this.indexSearchService.searchIndex$()
            .subscribe((data: SearchedIndexData) => {
                this.indexResearchTreeData = IndexResearchTreeUtils.createIndexTree(data.searchResults);
            });

        this.appStore.isLoadFavoriteModalOpen$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((isLoadFavoriteModalOpen: ModalStateActionInfo) => {
                if (PortfolioUtils.canTransitToRegularSearchMode(isLoadFavoriteModalOpen, ModalInvokeSource.PORT_HEADER, ModalStateAction.MODAL_CANCELED)) {
                    this.isWhatIfMode = false;
                    this.searchMode = true;
                    setTimeout(() => {
                        PortfolioSearchUtils.refreshSelectPropsFromParent(this.portfolioSearch, 0, this.isWhatIfPortfolioLoaded);
                        this.cdRef.detectChanges();
                    });
                }
            });
    }

    /**
     * on portfolio change button clicked
     */
    onPortfolioChangeClicked(cancel?: boolean): void {
        if (!cancel) {
            if (this.isWhatIfPortfolioLoaded) {
                // if we have a what-if port loaded, then open the modal
                this.searchMode = true;
                this.enableWhatIfSearch();
            } else {
                this.isWhatIfMode = false;
                this.searchMode = true;
            }
        } else {
            this.isWhatIfMode = false;
            this.searchMode = false;
            this.selectProps = PortfolioSearchUtils.getSelectProps();
            this.selectProps.selected = {
                ...this.selectProps.data[0].values[0]
            };
        }
    }

    /**
     * on change portfolio
     */
    onChangePortfolio = (portfolioSearchItem: PortfolioSearchItem, isIndexResearchPortfolio?: boolean): void  => {
        const datepicker = WorkspaceStore.getCurrentPortfolio() ?
            WorkspaceStore.getCurrentPortfolio().datePicker :
            CalendarDateUtils.getDefaultDateObject();
        // Setting calCode to null so that the default of the new portfolio is set
        datepicker.calCode = null;
        this.portfolioService.fetchPortfolioInformation$(
            PortfolioService.getPortfolioObject(portfolioSearchItem, datepicker, isIndexResearchPortfolio),
            { isLightVersion: true, includeMandate: true })
            .subscribe((response: Portfolio) => {
                this.retainPortfolioSettings(response);
                WorkspaceStore.updatePortfolioInComparisonConfig(WorkspaceStore.getCurrentPortfolio(), response);
                WorkspaceStore.replaceCurrentPortfolio(response);
                this.notificationService.invokeWidgetReloadPrompt();
                this.searchMode = false;
            }, error => {
                this.notificationService.openDialog(
                    new ExploreDialogParam(
                        AlertConstants.TYPE.ALERT,
                        AlertConstants.HEADER.PORT_INFO_MISSING,
                        AlertConstants.BODY.PORT_INFO_MISSING,
                        AlertConstants.BTN.OK
                    ));
                console.error(error);
            });
    };

    /**
     * Track portfolio with Telemetry
     */
    trackPortfolioTelemetry(portfolioSearchItem: PortfolioSearchItem) {
        const datepicker = WorkspaceStore.getCurrentPortfolio() ?
            WorkspaceStore.getCurrentPortfolio().datePicker :
            CalendarDateUtils.getDefaultDateObject();
        const portfolioTrackingParams = new AddPortfolioTrackingParameters(
            portfolioSearchItem.ticker,
            datepicker.date,
            portfolioSearchItem.type === this.PORTFOLIO ? 1 : 0,
            this.addPortSourceEnum);

        TelemetryService.track(
            TelemetryActionConstants.PORTFOLIO.ADD_PORTFOLIO,
            portfolioTrackingParams
        );
    }

    /**
     * Handler for 'add what if' button
     */
    addWhatIfPortfolio(): void {
        const newWhatIfPort: WhatIfPortfolio = WorkpadUtils.addWhatIfPortfolioAndShowComposition();
        if (isEmpty(newWhatIfPort.holdingChanges) && !newWhatIfPort.isFactorExposureBasedComposition()) {
            return;
        }
        this.compositionDataService.fetchCompositionDataForColumns$(newWhatIfPort)
            .subscribe(compositionData => {
                // add composition data to the new what if portfolio
                newWhatIfPort.composition = compositionData;
                this.appStore.updateCompositionPayload$.next(newWhatIfPort);
            });
    }

    /**
     * save as portfolio action handler
     */
    saveAsPortfolio(): void {
        const whatIfPort: WhatIfPortfolio = this.currentPort as WhatIfPortfolio;
        let favType, folder: string;
        if (isAdhocPort(this.currentPort) && !isNil(this.currentPort.adhocParams)) {
            favType = this.currentPort instanceof AdhocPortfolio ? CompositionConstants.ADHOC_PORT : CompositionConstants.ADHOC_PORT_GROUP;
            folder = this.currentPort instanceof AdhocPortfolio ? CompositionConstants.PORT_WITH_POSITIONS.ROOT_FOLDER_NAME : CompositionConstants.PORT_WITH_RULES.ROOT_FOLDER_NAME;
        } else if (whatIfPort.modellingType === ModellingType.SECTOR || whatIfPort.modellingType === ModellingType.PORTFOLIO) {
            favType = CompositionConstants.PORT_WITH_RULES.TYPE;
            folder = CompositionConstants.PORT_WITH_RULES.ROOT_FOLDER_NAME;
        } else if ((this.currentPort as WhatIfPortfolio).modellingType === ModellingType.POSITION && !(isAdhocPort(this.currentPort))) {
            favType = CompositionConstants.PORT_WITH_POSITIONS.TYPE;
            folder = CompositionConstants.PORT_WITH_POSITIONS.ROOT_FOLDER_NAME;
        }

        this.appStore.saveFavoriteAction$.next(new SaveFavoriteAction(whatIfPort, folder.toLowerCase(), favType, FavoriteConstants.PORTFOLIO_FOLDER, this.updatePortfolioName, undefined, false));
        TelemetryService.track(TelemetryActionConstants.USER_BEHAVIOUR.SAVE_WHAT_IF, new TelemetryWhatIfPortfolioTrackingParameters({
            typeOfPortfolio: whatIfPort.getTelemetricPortfolioType(),
            hasOtherWhatIfs: whatIfPort.holdingChanges?.some(change => change instanceof NewPortfolioHoldingChange && !isNil(change.id)),
        }));
    }

    /**
     * Updates the portfolio name in the header
     * portfolioNameSubject$ - used to update the portfolio name in the sidebar
     */
    updatePortfolioName = () => {
        this.currentPortfolioHeaderTitle = this.currentPort.getPortfolioHeaderTitle();
        this.appStore.portfolioNameSubject$.next(this.currentPort.getDisplayTitle());
    }

    /**
     * after creating new portfolio object and fetching port info from server
     * we still want to retain split, look-through and filter tab settings
     */
    private retainPortfolioSettings(portfolio: Portfolio): void {
        if (isNil(this.currentPort) || isNil(portfolio)) {
            return;
        }

        if (!portfolio.lookthroughSettings) {
            portfolio.lookthroughSettings = new LookThroughSettingsWithRules();
        }
        portfolio.lookthroughSettings.copyFrom(this.currentPort.lookthroughSettings);
        portfolio.splitPositionSettings = cloneDeep(this.currentPort.splitPositionSettings);
        if (portfolio.filter && this.currentPort.filter && !this.currentPort.filter.isFilterEmpty()) {
            portfolio.filter.customSector = new CustomSector();
            portfolio.filter.customSector.copyFrom(this.currentPort.filter.customSector);
        }
        if (!isEmpty(this.currentPort.applyFilterTo)) {
            portfolio.applyFilterTo = this.currentPort.applyFilterTo;
        }
    }

    /**
     * Set searchmode to false if index research popover is closed
     */
    onIndexResearchPopoverClosed(): void {
        this.searchMode = false;
        this.cdRef.detectChanges();
    }

    /**
     * Changes portfolio with the index research portfolio selected from advanced tree list
     */
    onIndexSelectionChanged(event: CustomEvent): void {
        // simply return in case a parent node is clicked
        if (event.detail.value[0].children) {
            return;
        }
        // Change portfolio in case a child node is selected
        this.onChangePortfolio(new PortfolioSearchItem(event.detail.value[0].ticker, event.detail.value[0].fullName), true);
    }

    /**
     * invoke what-if favorite modal
     */
    enableWhatIfSearch(): void {
        this.isWhatIfMode = true;
        this.portfolioSearchService.enableWhatIfSearch(this.onChangePortfolio, true, undefined, ModalInvokeSource.PORT_HEADER);
    }
}
