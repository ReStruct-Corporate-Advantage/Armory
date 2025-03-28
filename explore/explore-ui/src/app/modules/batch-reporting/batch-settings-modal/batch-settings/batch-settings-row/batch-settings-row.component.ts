import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import {
    AuxContextMenuInterface,
    AuxSelectOption,
    AuxSelectOptionGroup,
    AuxSelectSelectionChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {
    AddPortfolioTrackingParameters,
    AddPortSource, CalendarDateUtils,
    CoreCommonConstants, CoreDefinitionStore,
    DateValue,
    SubscribableComponent,
    TelemetryActionConstants,
    TelemetryService
} from '@blk/explore-ui-core';
import {PortfolioSearchComponent, PortfolioSearchItem, PortfolioSearchUtils} from '@blk/explore-ui-portfolio-search';
import {FavoriteConstants} from '@constants/favorite.constants';
import {BatchExportRunAs} from '@enums/batch-reporting/batch-export-run-as.enum';
import {ExportConfig} from '@interfaces/export-config.interface';
import {BatchRowConfig} from '@models/batch-reporting/batch-row-config.model';
import {EpnlSettings} from '@models/batch-reporting/epnl-settings.model';
import {ExcelExportConfig} from '@models/export/excel-export-config.model';
import {PDFExportConfig} from '@models/export/pdf-export-config.model';
import {FavoriteCallback, LoadFavoriteAction} from '@models/favorite/load-favorite-action.model';
import {Benchmark} from '@models/portfolio/benchmark.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Report} from '@models/workspace/report.model';
import {BatchReportingService} from '@services/batch-reporting/batch-reporting.service';
import {cloneDeep, isNil, upperCase} from 'lodash';
import {takeUntil} from 'rxjs/operators';
import {forkJoin, Observable, of} from 'rxjs';

import {AppStore} from '../../../../../app.store';
import {BenchmarkConstants, CompositionConstants, ExportConstants} from '../../../../../constants';
import {ExplorePortfolioSearchService, FavoriteService, PortfolioService} from '../../../../../shared/services';
import {BatchExportingStore, DefinitionsStore} from '../../../../../stores';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {ModalStateAction} from '@models/favorite/modal-state-action.enum';
import {ModalStateActionInfo} from '@models/favorite/modal-state-action-info.interface';
import {BatchRowDownloadStatus} from '@enums/batch-reporting/batch-row-download-status.enum';

@Component({
    selector: 'app-batch-settings-row',
    templateUrl: './batch-settings-row.component.html',
    styleUrls: ['./batch-settings-row.component.scss', '../batch-settings.component.scss']
})
export class BatchSettingsRowComponent extends SubscribableComponent implements OnInit, OnChanges {
    @Input() rowConfig: BatchRowConfig;
    @Input() isSelected: boolean;
    @Input() isRowDisabled: boolean;
    @Output() selectBatchSettingsRow = new EventEmitter<BatchRowConfig>();
    @Output() updateAllActiveRowsFlag = new EventEmitter<void>();
    @Output() removeBatchRowHandler = new EventEmitter<CustomEvent>();
    @Input() rowIndex: string;
    @ViewChild('portfolioSearch', {static: false}) portfolioSearch: PortfolioSearchComponent;

    runAsOptions: AuxSelectOptionGroup[];
    currencyOptions: AuxSelectOptionGroup[];
    reportOptions: AuxSelectOptionGroup[];
    exportAsOptions: AuxSelectOptionGroup[];

    portfolioLoading = false; // Flag for if the row is loading a portfolio

    dateContextMenu: BatchSettingsContextMenu;
    currencyContextMenu: BatchSettingsContextMenu;
    reportsContextMenu: BatchSettingsContextMenu;
    exportAsSelection: AuxSelectOption;
    whatIfSearchMode = false;
    searchMode = false;
    whatIfLoaded = false;
    currentPortfolioHeaderTitle: string;

    isPortfolioSettingsModalOpen = false;
    // Storing benchmark of portfolio to assign it back in case run as is change to portgroup
    oldBenchmark: Benchmark;
    /* copy enum to allow usage in template */
    readonly addPortSourceEnum = AddPortSource.BATCH_SCREEN_MODAL;
    readonly PORTFOLIO: string = 'Portfolio';

    readonly PORT_GROUP_CURRENCY: string = 'PortGroup Currency';
    readonly PORTFOLIO_CURRENCY: string = 'Portfolio Currency';
    readonly BatchRowDownloadStatus = BatchRowDownloadStatus;

    constructor(public portfolioSearchService: ExplorePortfolioSearchService, protected batchReportingService: BatchReportingService, protected appStore: AppStore, protected favoriteService: FavoriteService, private changeDetectorRef: ChangeDetectorRef) {
        super();
    }

    ngOnInit() {
        this.initializeRunAsOptions();
        this.populateReportOptions();
        // Set the populateReportOptions method onto the batchRow so we can update the aux-select component
        this.rowConfig.reinitializeReportOptions = this.populateReportOptions;
        this.initializeExportAsOptions();
        this.createContextMenus();

        this.appStore.isLoadFavoriteModalOpen$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((isLoadFavoriteModalOpen: ModalStateActionInfo) => {
                if (
                    !!CompositionConstants.WHAT_IF_FAVORITE_TYPES.get(isLoadFavoriteModalOpen.favoriteType) &&
                    (isLoadFavoriteModalOpen.reason === ModalStateAction.MODAL_CANCELED && isLoadFavoriteModalOpen.sourceUniqueId === this.rowIndex)
                ) {
                    this.whatIfSearchMode = false;
                    this.searchMode = true;
                    setTimeout(() => {
                        PortfolioSearchUtils.refreshSelectPropsFromParent(this.portfolioSearch, 0, this.whatIfLoaded);
                        this.changeDetectorRef.detectChanges();
                    });
                }
            });
    }

    ngOnChanges(changes: SimpleChanges): void {
        // If a new rowConfig comes in and it's an actual portfolio, then we need to load port info
        if (changes.rowConfig && changes.rowConfig.currentValue.portfolio.portName) {
            this.onPortfolioChanged(changes.rowConfig.currentValue.portfolio);
        }
    }

    /**
     * Display text for the reports selected section
     */
    reportsSelectedText(): string {
        return this.rowConfig.reports.length === 1 ? this.rowConfig.reports[0].title : this.rowConfig.reports.length + ' reports selected';
    }

    setRowConfigActive(value: boolean) {
        this.rowConfig.active = value;
        this.updateAllActiveRowsFlag.emit();
    }

    initializeRunAsOptions(): void {
        this.runAsOptions = [{
            values: [
                {
                    displayValue: 'Portfolios',
                    value: BatchExportRunAs.PORTFOLIOS,
                    isSelected: this.rowConfig.runAs === BatchExportRunAs.PORTFOLIOS
                },
                {
                    displayValue: 'PortGroup',
                    value: BatchExportRunAs.PORTGROUP,
                    isSelected: this.rowConfig.runAs === BatchExportRunAs.PORTGROUP
                }
            ]
        }];
    }

    /**
     * Initialize portfolio from portfolio search item
     */
    initializePortfolio = (portfolioSearchItem: PortfolioSearchItem): void => {
        // Do not fetch portfolio info if user hits enter without modifying portfolioSearchItem as it would lead to loss of portfolio settings in case of batch report favorites.
        if (isNil(portfolioSearchItem) || (this.portfolioSearch?.initialSearchString && portfolioSearchItem.ticker && upperCase(this.portfolioSearch?.initialSearchString) === upperCase(portfolioSearchItem.ticker))) {
            return;
        }

        this.onPortfolioChanged(PortfolioService.getPortfolioObject(portfolioSearchItem, this.rowConfig.portfolio.datePicker), true);
    };

    /**
     * Track portfolio with Telemetry
     */
    trackPortfolioTelemetry(portfolioSearchItem: PortfolioSearchItem): void {
        const dateObjectToUse: DateValue = this.rowConfig.portfolio.datePicker;
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
     * Track portfolio with Telemetry after a date has been changed
     */
    trackPortfolioTelemetryAfterDateChange(dateValue: DateValue) {
        // TODO track portfolio when the portfolio date was changes
    }

    /**
     * Fetch port info from the server when the portfolio is changed
     */
    onPortfolioChanged(portfolio: Portfolio, firstInitialization?: boolean): void {
        if (isNil(portfolio)) {
            return;
        }

        this.fetchPortInfo(portfolio, firstInitialization);
    }

    /**
     * Callback when the runAs option is changed
     */
    onRunAsChanged(batchExportRunAs: BatchExportRunAs): void {
        this.rowConfig.runAs = batchExportRunAs;
        // Clearing out benchmarks array so the benchmark options do not duplicate after the server call
        this.rowConfig.portfolio.benchmarks = [];
        // We want to call onPortfolioChanged again because we want to update the benchmark options
        // This won't make an actual call to the server because at this time the port info is already cached
        this.onPortfolioChanged(this.rowConfig.portfolio);
    }

    /**
     * Callback when the date picker value gets changed
     */
    onDateChanged(): void {
        // Fetch port info for the new date
        this.fetchPortInfo(this.rowConfig.portfolio);
        this.trackPortfolioTelemetryAfterDateChange(this.rowConfig.portfolio.datePicker);
    }

    /**
     * Fetch port info for the portfolio passed in
     */
    fetchPortInfo(portfolio: Portfolio, firstInitialization?: boolean): void {
        let epnlSettings;
        if (!isNil(this.rowConfig.portfolio)) {
            epnlSettings = this.rowConfig.portfolio.epnlSettings;
        }
        this.portfolioLoading = true;
        this.oldBenchmark = portfolio.benchmark;
        const updatedPortObs = this.batchReportingService.fetchPortInfo$(portfolio, true, this.rowConfig.runAs);
        const observablesList: Observable<any>[] = [updatedPortObs];

        // If epnlSettings exist, we parse fromDate and endDate and push the observables to the observablesList. We then use the parsed date values to update epnlSettings for rowConfig.portfolio
        if (epnlSettings) {
            const startDateObs = this.batchReportingService.parseEPNLDate$(epnlSettings.calCode, epnlSettings.fromDate) || of(null);
            const endDateObs =  this.batchReportingService.parseEPNLDate$(epnlSettings.calCode, epnlSettings.toDate) || of(null);
            observablesList.push(startDateObs, endDateObs);
        }
        forkJoin(observablesList).subscribe((observables) => {
            const [updatedPort, startDate, endDate] = observables;
            this.initializeCurrencyOptions(updatedPort);
            this.rowConfig.portfolio = cloneDeep(updatedPort);
            if (startDate) {
                epnlSettings.fromDate.date = startDate;
            }
            if (endDate) {
                epnlSettings.toDate.date = endDate;
            }
            this.validateCalendar();
            this.rowConfig.portfolio.epnlSettings = epnlSettings;
            this.setEpnlCalendar();
            this.updateBenchmarksForRowPortfolio(this.oldBenchmark, firstInitialization, this.rowConfig.portfolio);
            this.portfolioLoading = false;
            this.currentPortfolioHeaderTitle = updatedPort.getPortfolioHeaderTitle();
            this.whatIfLoaded = updatedPort instanceof WhatIfPortfolio;
            this.whatIfSearchMode = false;
            this.searchMode = false;
            this.changeDetectorRef.markForCheck();
        }, (error) => {
            // Set the portfolio portName to an empty string to disable the row
            this.rowConfig.portfolio.portName = CoreCommonConstants.EMPTY_STRING;
            this.portfolioLoading = false;
        });
    }

    /**
     * Validates the calendar of the portfolio
     */
    validateCalendar(): void {
        // Make sure the calendar exists. Else, default to the first calendar (US)
        const calendarToUse = CalendarDateUtils.getCalendarByCode(CoreDefinitionStore.calendars, this.rowConfig.portfolio.datePicker.calCode);
        this.rowConfig.portfolio.datePicker.calCode = calendarToUse.calendarCode;
    }

    createContextMenus(): void {
        this.dateContextMenu = {
            specificActions: [{label: 'Cascade date to all rows'}],
            onItemClicked: () => {
                this.batchReportingService.cascadeDateToAllRows(this.rowConfig);
                // Update the port info for all rows to update things like currency/benchmark that can change with the date
                for (let i = 0; i < BatchExportingStore.getCurrentBatchReport().batchRowConfigs.length; i++) {
                    const rowConfig = BatchExportingStore.getCurrentBatchReport().batchRowConfigs[i];
                    // Skip the current BatchRowConfig as the port info would have already been fetched when the date was changed
                    if (rowConfig === this.rowConfig) {
                        continue;
                    }
                    // Re-assign value to trigger onChanges for the BatchRowConfig so it can be updated through the regular flow
                    BatchExportingStore.getCurrentBatchReport().batchRowConfigs[i] = cloneDeep(rowConfig);
                }
            }
        };
        this.currencyContextMenu = {
            specificActions: [{label: 'Cascade currency to all rows'}],
            onItemClicked: () => {
                this.batchReportingService.cascadeCurrencyToAllRows(this.rowConfig);
            }
        };
        this.reportsContextMenu = {
            specificActions: [{label: 'Cascade report options to All Rows'}],
            onItemClicked: () => {
                this.batchReportingService.cascadeReportOptionsToAllRows(this.rowConfig);
            }
        };
    }
    /**
     * Gets all the currencies and formats them into an object that can be used by the select box component
     */
    initializeCurrencyOptions(portfolio: Portfolio): void {
        // If the portfolio doesn't match the row, then don't proceed with updating currency
        if (portfolio !== this.rowConfig.portfolio && this.rowConfig.portfolio.isInitialized()) {
            return;
        }
        const currencyOptions: AuxSelectOptionGroup[] = [{values: []}];
        currencyOptions[0].values.push({displayValue: 'Portfolio group currency', value: this.PORT_GROUP_CURRENCY, isSelected: this.PORT_GROUP_CURRENCY === portfolio.currency});
        currencyOptions[0].values.push({displayValue: 'Portfolio currency', value: this.PORTFOLIO_CURRENCY, isSelected: this.PORTFOLIO_CURRENCY === portfolio.currency});
        for (const currency of DefinitionsStore.currency) {
            currencyOptions[0].values.push({displayValue: currency, value: currency, isSelected: portfolio.currency === currency});
        }
        this.currencyOptions = currencyOptions;
    }

    /**
     * Callback when the currency dropdown has been changed
     * @param event - event from the web component
     */
    onCurrencyChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        if (event.detail.value && (event.detail.value as AuxSelectOption).value !== this.rowConfig.portfolio.currency) {
            this.rowConfig.portfolio.currency = (event.detail.value as AuxSelectOption).value;
        }
    }

    /**
     * Populates the reportOptions that are passed to the aux-select component
     */
    populateReportOptions = () => {
        this.reportOptions = this.batchReportingService.populateReportOptions(this.rowConfig, this.reportOptions);
    };

    initializeExportAsOptions(): void {
        this.exportAsOptions = [{values: []}];
        const isExcelExport: boolean = this.rowConfig.exportConfig instanceof ExcelExportConfig;
        this.exportAsOptions[0].values.push({
            displayValue: ExportConstants.EXCEL,
            value: (isExcelExport) ? this.rowConfig.exportConfig : new ExcelExportConfig(),
            isSelected: isExcelExport
        });
        this.exportAsOptions[0].values.push({
            displayValue: ExportConstants.PDF,
            value: (this.rowConfig.exportConfig instanceof PDFExportConfig) ? this.rowConfig.exportConfig : new PDFExportConfig(),
            isSelected: !isExcelExport
        });
        this.exportAsSelection = isExcelExport ? this.exportAsOptions[0].values[0] : this.exportAsOptions[0].values[1];
    }

    openReportFavoritesModal(event: CustomEvent): void {
        this.appStore.openLoadFavoriteModal$.next(
            new LoadFavoriteAction({
                type: FavoriteConstants.LAYOUT,
                treeType: FavoriteConstants.LAYOUT_FOLDER,
                displayName: FavoriteConstants.REPORT_PASCAL + 's',
                callback: this.addFavoriteReportsToBatchRow,
                headerDisplayName: FavoriteConstants.REPORT_PASCAL,
                ignoreEnterpriseTree: false,
                showAladdinFavorites: true
            }));
    }

    addFavoriteReportsToBatchRow: FavoriteCallback = (favId: number, loadingMessage: string, ctrlPressed: boolean, isGlobal: boolean) => {
        this.favoriteService.getFavorite$(favId, loadingMessage, isGlobal, ctrlPressed)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((favoriteReport: Report) => {
                // If we didn't get a report back, don't do anything
                if (isNil(favoriteReport)) {
                    return;
                }
                // TODO: Load multiple favorite reports
                // Add the favorite report to the BatchRowConfig
                this.rowConfig.reports.push(favoriteReport);
                this.populateReportOptions();
            }, error => {
                // TODO: error handling when you can't add a favorite report
                console.error(error);
            });
    };

    onReportSelectionChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.rowConfig.isEpnlReport = false;
        const reports = [];
        (event.detail.value as AuxSelectOption[]).forEach(option => {
            if (option.displayValue === ExportConstants.EPNL_REPORT) {
                this.rowConfig.isEpnlReport = true;
            } else {
                reports.push(option.value);
            }
        });
        this.initializeEPNLSettings();
        this.rowConfig.reports = reports;
    }

    /**
     * Method to initialize epnl settings if epnl report is selected
     */
    private initializeEPNLSettings() {
        if (this.rowConfig.isEpnlReport) {
            if (isNil(this.rowConfig.portfolio.epnlSettings)) {
                this.rowConfig.portfolio.epnlSettings = new EpnlSettings();
                this.setEpnlCalendar();
            }
            // Update run as value to port group
            this.onRunAsChanged(BatchExportRunAs.PORTGROUP);
            this.initializeRunAsOptions();
            // update export config to pdf
            this.updateExportAsValue(this.exportAsOptions[0].values[1].value);
            this.changeDetectorRef.markForCheck();
        }
    }

    /**
     * Method to set epnl calender in epnl settings
     */
    public setEpnlCalendar(): void {
        if (this.rowConfig.portfolio.epnlSettings) {
            if (!CalendarDateUtils.calendarExists(CoreDefinitionStore.calendars, this.rowConfig.portfolio.epnlSettings.calCode)) {
                this.rowConfig.portfolio.epnlSettings.calCode = this.rowConfig.portfolio.datePicker.calCode;
            }
        }
    }

    onExportAsChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.updateExportAsValue((event.detail.value as AuxSelectOption).value);
    }

    updateExportAsValue(exportConfig: ExportConfig) {
        if (this.rowConfig.exportConfig === exportConfig) {
            // If the user selected the same option just get out of here
            return;
        }
        // If the user selected to update the exportConfig to be ExcelExportConfig, then we need to replace the PDFExportConfig (at index 1) within the exportAsOptions
        // Else, then we need to replace the ExcelExportConfig (at index 0) within the exportAsOptions
        const exportAsIndex = exportConfig instanceof ExcelExportConfig ? 1 : 0;
        this.exportAsOptions[0].values[exportAsIndex].value = this.rowConfig.exportConfig;
        this.exportAsSelection.isSelected = false;
        this.exportAsSelection = this.exportAsOptions[0].values[exportConfig instanceof ExcelExportConfig ? 0 : 1];
        this.exportAsSelection.isSelected = true;
        // Take the ExportConfig from the event
        this.rowConfig.exportConfig = exportConfig;
    }

    /**
     * Open portfolio settings modal
     */
    openPortfolioSettingsModal(): void {
        if (!this.rowConfig.portfolio.portName) {
            return;
        }
        this.isPortfolioSettingsModalOpen = true;
    }

    /**
     * Close portfolio settings modal, bound with emit event
     */
    closePortfolioSettingsModal(portfolio?: Portfolio): void {
        this.isPortfolioSettingsModalOpen = false;
        if (portfolio) {
            this.rowConfig.portfolio = portfolio;
        }
    }

    onBatchRowRemoved(event: MouseEvent): void {
        const customEvent = new CustomEvent('build', {detail: {originalEvent: event, batchRowConfig: this.rowConfig}});
        this.removeBatchRowHandler.emit(customEvent);
    }

    /**
     * Callback event listener for a right click event
     */
    onOpenContextMenuRightClicked(): void {
        // If the user right clicks, set this row to be the selected row
        this.selectBatchSettingsRow.emit(this.rowConfig);
    }

    /**
     * Returns benchmark options for batch portfolios
     */
    addBatchDefaultBenchmarkOptions(): Benchmark[] {
        // Create the Risk and performance options
        const updatedBenchmarks = Array<Benchmark>();
        updatedBenchmarks.push(Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 1, BenchmarkConstants.BENCH_PRIMARY));
        updatedBenchmarks.push(Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 2, BenchmarkConstants.BENCH_SECONDARY));
        updatedBenchmarks.push(Benchmark.create(BenchmarkConstants.PERFORM, 1, BenchmarkConstants.BENCH_PRIMARY));
        updatedBenchmarks.push(Benchmark.create(BenchmarkConstants.PERFORM, 2, BenchmarkConstants.BENCH_SECONDARY));

        return updatedBenchmarks;
    }

    /**
     * Update benchmark and benchmark options for batch row config portfolio
     */
    updateBenchmarksForRowPortfolio(oldBenchmark: Benchmark, firstInitialization: boolean, portfolio: Portfolio) {
        if (!isNil(this.rowConfig.runAs) && this.rowConfig.runAs === BatchExportRunAs.PORTFOLIOS && portfolio.isCompositeOrPortGroup()) {
            portfolio.benchmarks = this.addBatchDefaultBenchmarkOptions();
            if (firstInitialization) {
               portfolio.benchmark = Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 1, BenchmarkConstants.BENCH_PRIMARY);
            }
        }

        if (!firstInitialization && oldBenchmark) {
            // Set the same benchmark if other or none benchmark is selected
            // We check for both upper case because there are Prism favorites that return type as 'OTHER' when we expect 'Other' in Explore
            // If the old benchmark is an 'other' benchmark, just set that
            if (upperCase(oldBenchmark.type) === upperCase(BenchmarkConstants.OTHER_BENCH)) {
                oldBenchmark.type = BenchmarkConstants.OTHER_BENCH;
                portfolio.benchmark = oldBenchmark;
            } else if (upperCase(oldBenchmark.type) === upperCase(BenchmarkConstants.NONE_BENCH)) {
                portfolio.benchmark = Benchmark.create(BenchmarkConstants.NONE_BENCH);
            } else {
                // Iterate through the portfolio's benchmarks and find one matching of type and order (ex. 'RISK' 1)
                let bench = portfolio.benchmarks.find(benchmark => (benchmark.type === oldBenchmark.type && benchmark.order === oldBenchmark.order));
                // If we found a matching benchmark, we can use the old benchmark with the correct name
                // We do this because of the case where users switch between runAs Portfolios and PortGroup
                if (bench) {
                    oldBenchmark.name = bench.name;
                    portfolio.benchmark = oldBenchmark;
                } else {
                    // Else, just default to the first non-market benchmark
                    bench = portfolio.benchmarks.find(benchmark => benchmark.type !== BenchmarkConstants.BENCH_TYPE_MARKET);

                    // If we found a benchmark, set it. If not, just default to whatever the oldBenchmark was originally
                    portfolio.benchmark = bench ? bench : oldBenchmark;
                }
            }
        }
    }

    /**
     * invoke what-if favorite modal
     */
    enableWhatIfSearch(): void {
        this.searchMode = true;
        this.whatIfSearchMode = true;
        this.portfolioSearchService.enableWhatIfSearch(this.initializePortfolio, true, this.rowIndex);
    }

    /**
     * on portfolio change button clicked
     */
    onPortfolioChangeClicked(event: MouseEvent): void {
        if (event.target['label'] === 'Change') {
            this.enableWhatIfSearch();
        } else {
            this.searchMode = false;
            this.whatIfSearchMode = false;
        }
    }
}

interface BatchSettingsContextMenu {
    specificActions: AuxContextMenuInterface[];
    onItemClicked: () => void;
}
