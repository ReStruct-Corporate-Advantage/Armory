import {
    ChangeDetectorRef,
    Component,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import {
    AddPortfolioTrackingParameters,
    AddPortSource,
    AlertConstants,
    CoreCommonConstants,
    DateValue,
    ExploreDialogParam,
    ExploreSelectOptionGroup,
    SubscribableComponent,
    TelemetryActionConstants,
    TelemetryService,
} from '@blk/explore-ui-core';
import {PortfolioSearchComponent, PortfolioSearchItem, PortfolioSearchUtils} from '@blk/explore-ui-portfolio-search';
import {BatchExportRunAs} from '@enums/batch-reporting/batch-export-run-as.enum';
import {Benchmark} from '@models/portfolio/benchmark.model';
import {PortfolioTooltipInfo} from '@models/portfolio/portfolio-tooltip-info.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {ExplorePortfolioSearchService} from '@services/explore-portfolio-search/explore-portfolio-search.service';
import {NotificationService} from '@services/notification';
import {PortfolioService} from '@services/portfolio';
import {PublishStateService} from '@services/publishState/publish-state.service';
import {isEmpty, isNil} from 'lodash';
import {takeUntil} from 'rxjs/operators';
import {AppStore} from '../../../app.store';
import {BenchmarkConstants} from '../../../constants';
import {BenchmarkSelectorUtils} from './benchmark-selector.utils';
import {ModalStateAction} from '@models/favorite/modal-state-action.enum';
import {ModalInvokeSource} from '@models/favorite/modal-invoke-source.enum';
import {ModalStateActionInfo} from '@models/favorite/modal-state-action-info.interface';
import {PortfolioUtils} from '@utils/portfolio.utils';
import {AdhocPortfolio} from '@models/portfolio/adhoc-portfolio.model';
import {AuxSearchSelectOptionsInterface} from '@blk/aladdin-angular-components';
import {ICellEditorAngularComp} from 'ag-grid-angular';
import {ICellEditorParams} from 'ag-grid-community';

@Component({
    selector: 'app-benchmark-selector',
    templateUrl: './benchmark-selector.component.html',
    styleUrls: ['./benchmark-selector.component.scss']
})
/**
 * This component controls the benchmark selection from batch and from the input panel.
 */
export class BenchmarkSelectorComponent extends SubscribableComponent implements OnInit, OnChanges, ICellEditorAngularComp {

    /** START ** ag-grid cell editor fields */
    private params: ICellEditorParams;
    inAgGrid = false;
    showProgressForGridCell = false;
    /** END ** ag-grid cell editor fields */

    /** Portfolio containing its possible benchmarks */
    @Input() portfolio: Portfolio;
    /** Flag to allow 'other' benchmark option */
    @Input() allowOther: boolean;
    @Input() showLabel = true;
    @Input() label = 'Benchmark';
    @Input() disablePopover?: boolean;
    @Input() batchRunAs?: BatchExportRunAs;
    @Input() isDisabled = false;
    @Input() triggerWidgetReloadEvents = true;
    @Input() isBenchmarkAdhoc = false;

    @ViewChild('portfolioSearch', { static: false }) portfolioSearch: PortfolioSearchComponent;

    benchmarkOptions: ExploreSelectOptionGroup[];
    displayPortfolioSearch: boolean;
    benchmarkHeader: string;
    otherBenchmarkHeader: string;
    benchInfoLoadingComplete: boolean;
    tooltipInfo: PortfolioTooltipInfo = new PortfolioTooltipInfo();
    showBenchPopover = false;
    showOtherPopover = false;
    dropdownOpenedFlag = false;
    otherBenchmarkLabel: string;
    isWhatIfSelected: boolean;
    searchType = 'parametric';

    /* copy enum to allow usage in template */
    readonly addPortSourceEnum = AddPortSource.BENCHMARK_SELECTOR;
    readonly PORTFOLIO: string = 'Portfolio';
    readonly BENCH: string = 'Bench ';
    previousBenchObject: Benchmark;

    // what-if modal state variables
    whatIfSearchMode = false;
    searchMode = false;
    whatIfLoaded = false;
    currentPortfolioHeaderTitle: string;

    selectProps: AuxSearchSelectOptionsInterface = PortfolioSearchUtils.getSelectProps();
    enableCancelButton = false;

    /**
     * constructor
     */
    constructor(public portfolioSearchService: ExplorePortfolioSearchService, private portfolioService: PortfolioService, private changeDetectorRef: ChangeDetectorRef, private notificationService: NotificationService, private publishStateService: PublishStateService, private appStore: AppStore) {
        super();
    }

    ngOnInit() {
        // subscription to re-initialize benchmark options
        this.appStore.updateBenchmarkOption$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(portfolio => this.initBenchMarkOptions(portfolio));

        this.appStore.isLoadFavoriteModalOpen$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((isLoadFavoriteModalOpen: ModalStateActionInfo) => {
                if (PortfolioUtils.canTransitToRegularSearchMode(isLoadFavoriteModalOpen, ModalInvokeSource.BENCH_SELECTOR, ModalStateAction.MODAL_CANCELED)) {
                    this.whatIfSearchMode = false;
                    this.searchMode = true;
                    setTimeout(() => {
                        PortfolioSearchUtils.refreshSelectPropsFromParent(this.portfolioSearch, 0, this.whatIfLoaded);
                        this.changeDetectorRef.detectChanges();
                    });
                }
            });
    }

    /**
     * Detects changes to the portfolio input and updates the benchmark options
     */
    ngOnChanges(changes: SimpleChanges): void {
        if (changes.portfolio || changes.batchRunAs) {
            this.initBenchMarkOptions(null, !!changes.portfolio);
        }
    }

    /**
     * set Default Settings for benchmark selected
     */
    setDefaultSettingsForBenchmark(portfolio: Portfolio) {
        if (!portfolio) {
            return;
        }

        if (portfolio.benchmark && portfolio?.benchmark?.type === BenchmarkConstants.OTHER_BENCH) {
            this.displayPortfolioSearch = true;
            this.otherBenchmarkLabel = portfolio.benchmark.name;
            let portfolioSearchItem: PortfolioSearchItem = new PortfolioSearchItem(portfolio.benchmark.name);
            if (!isNil(portfolio.benchmark?.portfolio?.id)) { // Assign the id to PortfolioSearchItem if any
                portfolioSearchItem.id = portfolio.benchmark.portfolio.id;
            }
            if (portfolio.benchmark?.portfolio instanceof WhatIfPortfolio) {
                portfolioSearchItem = new PortfolioSearchItem(
                    portfolio.benchmark.name,
                    portfolio.benchmark.portfolio.fullName,
                    undefined,
                    undefined,
                    'WHATIF_POS',
                    portfolio.benchmark.portfolio.id,
                    undefined
                );
            }
            this.setOtherBenchmark(portfolioSearchItem);
        } else {
            this.otherBenchmarkLabel = CoreCommonConstants.EMPTY_STRING;
            this.displayPortfolioSearch = false;
            this.setBenchmarkPortfolio();
        }
    }

    /**
     * Action taken when the benchmark is changed
     */
    onBenchmarkClicked(benchmark: Benchmark): void {
        if (benchmark) {
            this.displayPortfolioSearch = benchmark.type === BenchmarkConstants.OTHER_BENCH;
            if (this.displayPortfolioSearch) {
                this.searchMode = true;
                this.whatIfSearchMode = false;
                this.enableCancelButton = false;
            }
            this.setBenchmark(benchmark);
            // require the flag check because event gets triggered both at
            // manual change as well as programmatic change in aux-select
            if (this.dropdownOpenedFlag) {
                this.triggerWidgetReload();
                this.dropdownOpenedFlag = false;
            }
        }
    }

    /**
     * Handler to detect if benchmark select dropdown is opened
     */
    onDropdownOpened(): void {
        this.dropdownOpenedFlag = true;
    }

    /**
     * Function to update the benchmark.
     * Doesn't account for benchmarks set by other
     * @param bench is the data contained in the event object.
     */
    setBenchmark(bench: Benchmark): void {
        this.previousBenchObject = this.portfolio.benchmark;
        this.portfolio.benchmark = bench;
        // reset 'Other' bench's to defaults values when we change it.
        if (bench.type === BenchmarkConstants.OTHER_BENCH) {
            this.otherBenchmarkHeader = undefined;
            this.portfolio.benchmark.portfolio = undefined;
            this.portfolio.benchmark.name = this.otherBenchmarkLabel;
        }
        this.resetReport();
        if (bench.type !== BenchmarkConstants.OTHER_BENCH) {
            this.otherBenchmarkLabel = CoreCommonConstants.EMPTY_STRING;
            this.isWhatIfSelected = false;
            this.whatIfLoaded = false;
            this.setBenchmarkPortfolio();
            if (!(this.portfolio instanceof AdhocPortfolio)) {
                this.publishStateService.fetchPublishedState$(this.portfolio).subscribe();
            }
        }
    }

    /**
     * Track portfolio with Telemetry
     */
    trackPortfolioTelemetry(portfolioSearchItem: PortfolioSearchItem): void {
        const dateObjectToUse: DateValue = this.portfolio.datePicker;
        const portfolioTrackingParams = new AddPortfolioTrackingParameters(
            portfolioSearchItem.ticker,
            dateObjectToUse.date,
            portfolioSearchItem.type === this.PORTFOLIO ? 1 : 0,
            this.addPortSourceEnum);
        TelemetryService.track(
            TelemetryActionConstants.PORTFOLIO.ADD_PORTFOLIO,
            portfolioTrackingParams
        );
    }

    /**
     *    Set a portfolio as an "Other" benchmark
     *    Takes a PortfolioSearchItem to set such portfolio as the new Benchmark
     */
    setOtherBenchmark = (portfolioSearchItem: PortfolioSearchItem): void => {
        this.enableCancelButton = false;
        const self: BenchmarkSelectorComponent = this;

        // If the benchmark does not have a ticker then don't do anything.
        if (portfolioSearchItem && portfolioSearchItem.ticker === '') {
           return;
        }

        if (!this.portfolioService.isValidWhatIfBench(this.portfolio, this.portfolio.benchmark.portfolio, this.previousBenchObject, portfolioSearchItem)) {
            return;
        }

        // Load the portfolio info
        const port: Portfolio = PortfolioService.getPortfolioObject(portfolioSearchItem, this.portfolio.datePicker, false);

        port.isBench = true;

        this.showProgressForGridCell = true;

        this.portfolioService.fetchPortfolioInformation$(port, { isLightVersion: true, includeMandate: false }, true)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (payload: Portfolio) => {
                    if (payload instanceof Portfolio) {
                        // Now force the report to be reset.
                        self.resetReport();
                        if (this.portfolioService.isValidWhatIfBench(self.portfolio, payload, this.previousBenchObject)) {
                            this.previousBenchObject = self.portfolio.benchmark;
                            // Set the benchmark and portfolio values after the portfolio loads
                            self.portfolio.benchmark = new Benchmark({
                                name: payload.portName,
                                type: BenchmarkConstants.OTHER_BENCH,
                                portfolio: payload
                            });
                            self.portfolio.benchmark.portfolio = payload;
                            self.portfolio.benchmark.portfolio.isBench = true;
                            // set the state variables once port is loaded
                            this.currentPortfolioHeaderTitle = self.portfolio.benchmark.portfolio.portName;
                            this.setTooltipInfo(payload.portName, payload.fullName, payload.currency, payload.indexWeights);
                            this.whatIfLoaded = this.isWhatIfSelected = payload instanceof WhatIfPortfolio;
                            this.whatIfSearchMode = false;
                            this.searchMode = false;
                            this.publishStateService.fetchPublishedState$(this.portfolio).subscribe();
                        }
                    } else {
                        console.error(payload);
                    }
                },
                (error) => {
                    this.notificationService.openDialog(
                        new ExploreDialogParam(
                            AlertConstants.TYPE.ALERT,
                            AlertConstants.HEADER.PORT_INFO_MISSING,
                            AlertConstants.BODY.PORT_INFO_MISSING,
                            AlertConstants.BTN.OK
                        ));
                    console.error(error);
                    this.showProgressForGridCell = false;
                    this.changeDetectorRef.markForCheck();
                },
                () => {
                    this.showProgressForGridCell = false;
                    this.changeDetectorRef.markForCheck();
                }
            );

        // Invokes prompt to reload widget data
        this.triggerWidgetReload();
    };

    resetReport(): void {
        // This function clears the widgets content in the workpad
        return;
    }

    /**
     * Fetch benchmark info and/or Fetch tooltip info
     */
    setBenchmarkPortfolio(showBenchPopover?: boolean) {
        this.toggleBenchAndOtherPopover(showBenchPopover);
        if (this.portfolio?.benchmark?.type && !this.portfolio.benchmark.type.toUpperCase().includes(BenchmarkConstants.BENCH_AGGREGATE.toUpperCase())) {
            // In  case benchmark type is None and benchmark name is undefined then we need to default the benchmark name to None
            if (this.portfolio.benchmark?.type === BenchmarkConstants.NONE_BENCH && isEmpty(this.portfolio.benchmark.name)) {
                this.portfolio.benchmark.name = BenchmarkConstants.NONE_BENCH;
            }
            const benchPortfolio = new Portfolio(this.portfolio.benchmark.name, this.portfolio.datePicker, null);
            benchPortfolio.isBench = true;
            // The date should be the current date of the portfolio
            this.portfolioService.fetchPortfolioInformation$(benchPortfolio, { isLightVersion: true, includeMandate: false }, true)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe((payload: Portfolio) => {
                    if (payload instanceof Portfolio) {
                        this.benchInfoLoadingComplete = true;
                        this.portfolio.benchmark.portfolio = payload;
                        this.setTooltipInfo(payload.portName, payload.fullName, payload.currency, payload.indexWeights);
                        // set the header for the benchmark
                        const benchmarkHeader = this.tooltipInfo.portName + ' | ' + this.tooltipInfo.fullName;
                        showBenchPopover ? this.benchmarkHeader = benchmarkHeader : this.otherBenchmarkHeader = benchmarkHeader;

                    } else {
                        console.error(payload);
                        this.benchmarkHeader = 'Failed to retrieve portfolio details';
                    }
                    this.changeDetectorRef.markForCheck();
                }, error => {
                    console.error(error.message);
                    this.benchmarkHeader = 'Failed to retrieve portfolio details';
                    this.changeDetectorRef.markForCheck();
                });
        }
    }

    /**
     * Hovering on benchmark makes HTTP request to fetch the benchmark information.
     * Not adding debounce on this method itself, but on showing tooltip because network request take time to get data.
     * So if debounce is added on the method itself, the time to get data back would take longer (debounce time + network time).
     * fetchPortfolioInformation method makes http request only for the first time and get data from cache.
     */
    openPopover(showBenchPopover?: boolean): void {
        this.benchInfoLoadingComplete = false;

        // create a tooltip where we will place all the info for the popover
        this.tooltipInfo = new PortfolioTooltipInfo();


        // If there is no benchmark, nothing to show
        if (showBenchPopover && this.portfolio.benchmark.type === BenchmarkConstants.NONE_BENCH) {
            this.benchmarkHeader = this.portfolio.benchmark.type;
            return;
        }

        // if the benchmark is of type Bench Aggregate, change the header name and return
        if (showBenchPopover && this.portfolio.benchmark.type === BenchmarkConstants.BENCH_AGGREGATE) {
            this.benchmarkHeader = BenchmarkConstants.GROUP_AGGREGATE + ' - ' + this.portfolio.benchmark.name;
            return;
        }

        if (showBenchPopover && this.portfolio.benchmark.type === BenchmarkConstants.OTHER_BENCH) {
            this.benchmarkHeader = this.portfolio.benchmark.type;
            return;
        }
        // if no 'Other' benchmark has been set, return
        if (!showBenchPopover && !this.portfolio.benchmark.name) {
            return;
        }

        this.setBenchmarkPortfolio(showBenchPopover);
    }

    /**
     * Closes normal benchmark popover and other popover that displays custom benchmark
     */
    closePopovers(): void {
        this.showBenchPopover = false;
        this.showOtherPopover = false;
        this.benchmarkHeader = undefined;
        this.otherBenchmarkHeader = undefined;
        this.changeDetectorRef.markForCheck();
    }

    /**
     * Toggle bench and other popover status
     */
    toggleBenchAndOtherPopover(showBenchPopover?: boolean): void {
        this.showBenchPopover = !!showBenchPopover;
        this.showOtherPopover = !showBenchPopover;
    }

    /**
     * Set Tooltip Info
     */
    private setTooltipInfo(portName: string, fullName: string, currency: string, indexWeights?: any): void {
        this.tooltipInfo.portName = portName;
        this.tooltipInfo.fullName = fullName;
        this.tooltipInfo.currency = currency;
        // sort by index weights by decreasing weight
        indexWeights?.sort((a, b) => (a.weight > b.weight) ? -1 : 1);
        this.tooltipInfo.indexWeights = indexWeights;
    }

    /**
     * Trigger the notification service to show the widget reload message.
     * NOTE:  In batch mode we do not want this to happen so there is now a switch.
     *        I suspect this also means that the control is not created in the correct way,
     *        an event should be triggered and the consumer cam then act on it.
     */
    private triggerWidgetReload() {
        if (this.triggerWidgetReloadEvents) {
            this.notificationService.invokeWidgetReloadPrompt();
        }
    }

    /**
     * callback for emitWhatIfProp event to update isWhatIfSelected boolean
     */
    updateWhatIfBench(newValue: boolean): void {
        this.isWhatIfSelected = newValue;
    }

    /**
     * reusable method to initialize benchmark options for benchmark selector
     *
     * @param portfolio
     * @param newPortDetected
     */
    private initBenchMarkOptions(portfolio?: Portfolio, newPortDetected?: boolean): void {
        const portToUse: Portfolio = portfolio ? portfolio : this.portfolio;
        if (newPortDetected) {
            this.previousBenchObject = null;
        }
        if (portfolio || newPortDetected) {
            this.whatIfLoaded = this.isWhatIfSelected = !!(portToUse.benchmark?.portfolio instanceof WhatIfPortfolio);
        }
        this.benchmarkOptions = BenchmarkSelectorUtils.getBenchmarkOptions(portToUse.benchmarks, portToUse, this.allowOther);
        this.setDefaultSettingsForBenchmark(portToUse);
    }

    /**
     * invoke what-if favorite modal
     */
    enableWhatIfSearch(): void {
        this.whatIfSearchMode = true;
        this.portfolioSearchService.enableWhatIfSearch(this.setOtherBenchmark, true, undefined, ModalInvokeSource.BENCH_SELECTOR);
    }

    /**
     * on portfolio change/cancel button clicked
     */
    onPortfolioChangeClicked(cancel?: boolean): void {
        if (!cancel) {
            this.searchMode = true;
            this.enableCancelButton = true;
            if (this.whatIfLoaded) {
                // if we have a what-if port loaded, then open the modal
                this.enableWhatIfSearch();
            } else {
                this.whatIfSearchMode = false;
            }
        } else {
            this.searchMode = false;
            this.whatIfSearchMode = false;
            this.enableCancelButton = false;
            this.selectProps = PortfolioSearchUtils.getSelectProps();
            this.selectProps.selected = {
                ...this.selectProps.data[0].values[0]
            };
        }
    }

    /** START ** ag-grid cell editor hooks */

    agInit(params: ICellEditorParams): void {
        this.params = params;
        this.portfolio = params['portfolio'];
        this.batchRunAs = params['batchRunAs'];
        this.disablePopover = params['disablePopover'];
        this.allowOther = params['allowOther'];
        this.isDisabled = params['isDisabled'];
        this.showLabel = params['showLabel'];
        this.triggerWidgetReloadEvents = params['triggerWidgetReloadEvents'];
        this.initBenchMarkOptions(this.portfolio);
        this.params.onKeyDown = (event: KeyboardEvent) => event.stopPropagation();
        this.inAgGrid = true;
        this.searchType = 'regular';
    }

    getValue(): Benchmark {
        return this.portfolio.benchmark;
    }

    /** END ** ag-grid cell editor hooks */
}
