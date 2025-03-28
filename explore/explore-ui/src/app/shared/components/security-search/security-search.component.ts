import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges
} from '@angular/core';
import compositionColumnsJson from '@assets/composition-config/CompositionColumnsConfig.json';
import portSummaryCompositionColumnsJson from '@assets/composition-config/PortfolioSummaryCompositionConfig.json';
import {
    AuxGridColumnType,
    AuxGridOptions,
    AuxRadioInterface,
    AuxSearchSelectOptionsInterface,
    AuxSelectOption,
    AuxSelectSelectionChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {
    AddPortfolioTrackingParameters,
    AddPortSource,
    AlertConstants,
    ColumnConfig,
    ColumnConstants,
    CoreColumnUtils,
    CoreCommonConstants,
    CoreDefinitionStore,
    DateStore,
    DateValue,
    EntityType,
    ErrorTypeConstants,
    ExploreDialogParam,
    ExplorePortfolioTypeEnum,
    ExploreSelectOption,
    ExploreSelectOptionGroup,
    Favorite,
    ModellingColumn,
    ResponseData,
    SubscribableComponent,
    TelemetryActionConstants,
    TelemetryAddEntitiesParameters,
    TelemetryCustomPortfolioTrackingParameters,
    TelemetryService,
    UIErrorParameters,
    WayToAddSecurity,
    WidgetConfigInput,
    WidgetInput
} from '@blk/explore-ui-core';
import {PortfolioSearchConstants, PortfolioSearchItem, PortfolioSearchUtils} from '@blk/explore-ui-portfolio-search';
import {CommonConstants} from '@constants/common.constants';
import {CompositionConstants} from '@constants/composition.constants';
import {RequestConstants} from '@constants/request.constants';
import {ModellingType} from '@enums/modelling-type.enum';
import {RuleUnit} from '@enums/rule-unit.enum';
import {AllRules} from '@interfaces/all-rules.interface';
import {PortfolioItem} from '@interfaces/portfolio-item.interface';
import {SecuritySearchItem} from '@interfaces/security-search-item.interface';
import {Security} from '@interfaces/security.interface';
import {ShowCompositionTableInterface} from '@interfaces/show-composition-table.interface';
import {AdhocPortParams} from '@models/portfolio/adhocModelling/adhoc-port-params.model';
import {NewPortfolioHoldingChange} from '@models/portfolio/composition/new-portfolio-holding-change.model';
import {NumericCellEditor} from '@models/portfolio/composition/numeric-cell-editor';
import {PortfolioHoldingChange} from '@models/portfolio/composition/portfolio-holding-change.model';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {RulesBasedPortfolio} from '@models/portfolio/rule-based-portfolio.model';
import {BaseRule} from '@models/portfolio/tradeRules/base-rule.model';
import {PortfolioSecuritiesRule} from '@models/portfolio/tradeRules/portfolio-securities-rule.model';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {ExplorePortfolioSearchService} from '@services/explore-portfolio-search/explore-portfolio-search.service';
import {FavoriteService} from '@services/favorite';
import {NotificationService} from '@services/notification';
import {PortfolioService} from '@services/portfolio';
import {SecuritySearchService} from '@services/security-search/security-search.service';
import {WorkspaceStore} from '@stores/workspace.store';
import {AppUtils} from '@utils/app.utils';
import {CompositionUtils} from '@utils/composition.utils';
import {ColDef, ColGroupDef, GridApi, GridReadyEvent, ICellRendererParams, RowNode} from 'ag-grid-community';
import {cloneDeep, difference, isEmpty, isNil} from 'lodash';
import {takeUntil} from 'rxjs/operators';
import {AppStore} from '../../../app.store';
import {RuleFactory} from '../../../factories/rule.factory';
import {SecurityRule} from '@models/portfolio/tradeRules/security-rule.model';
import {DesignateValueList} from '@interfaces/designate-value-list.interface';
import {NumberUtils} from '@utils/number.utils';
import {LoadFavoriteAction} from '@models/favorite/load-favorite-action.model';
import {SecurityUtils} from '@utils/security.utils';
import {SecuritySearchTypeEnum} from '@enums/security-search-type.enum';
import {ColumnSelectorOption, ColumnSet, LibColumnUtils} from '@blk/explore-ui-column-option';
import {forkJoin, of} from 'rxjs';
import {PortfolioType} from '../add-portfolio-modal/portfolio-type.enum';
import {ReportGroup} from '@models/workspace/report-group.model';
import {IndexSearchTreeItem} from '@models/portfolio/index-search-tree-item.model';
import {Sector} from '@blk/explore-ui-breakdown';
import {BreakdownUtils} from '@utils/breakdown.utils';

/**
 * Shared security search component.  Contains the security search bar and a table showing selected securities.
 */
@Component({
    selector: 'app-security-search',
    templateUrl: './security-search.component.html',
    styleUrls: ['./security-search.component.scss']
})
export class SecuritySearchComponent extends SubscribableComponent implements OnInit, OnChanges {

    static readonly SPECIFIC_PORTFOLIO = 'specificPortfolio';
    /**
     * Mapping of selected securities' cusip -> security data
     */
    @Input()
    selectedSecurities: Map<string, Security>;

    @Input()
    modellingType: ModellingType;

    @Input()
    currentPortfolio: WhatIfPortfolio;

    @Input()
    portBreakdownChildren?: Sector[];

    @Input()
    tableSize = 'normal';

    @Input()
    allRules: AllRules;

    @Input()
    hideModellingColumn: boolean;

    @Output()
    showCompositionTable = new EventEmitter<ShowCompositionTableInterface>();

    @Output()
    modelingColumnUpdated = new EventEmitter<ColumnConfig>();

    @Output()
    clearSecurities = new EventEmitter();

    @Output()
    showUploadListChanged = new EventEmitter();

    @Output()
    portNMVEmitter = new EventEmitter<string>();

    @Input()
    createFromScratch: boolean;

    @Input()
    isCustomPortfolio: boolean;

    @Input()
    adhocPortParams: AdhocPortParams;

    @Input()
    telemetryCustomPortfolioStats: TelemetryCustomPortfolioTrackingParameters[] = [];

    @Input()
    customColDef: ColDef | ColGroupDef;

    @Input()
    showCalculateNAVOption: boolean;

    @Input()
    showUploadList = false;

    @Input()
    isCalculateNAVDisabled = true;

    /**
     * TBD: refraining from showing "full" favorites view for loading what-if's
     * due to space crunch
     */
    @Input()
    favoriteViewToJustSelectWhatIfs = false;

    @Output()
    changeInSelectedSecurities = new EventEmitter();

    @Output()
    isCalculateNAVDisabledChange = new EventEmitter<boolean>();

    @Output()
    openWhatIfLoadSlimModal: EventEmitter<boolean> = new EventEmitter<boolean>();

    isSecuritySelectionModalOpen = false;
    securityIdentifiers: IterableIterator<string>;
    uploadedSecurities: Map<string, Security>;
    securityResults: SecuritySearchItem[];
    isApplyButtonDisabled = false;
    tableMap: Map<string, RowNode>;
    splitRowNodes: RowNode[][];
    ModellingType = ModellingType;
    expandModellingFlag = false;
    invalidSecurities: string[];
    uploadType: WayToAddSecurity;
    designateValuesToCusipMap: Map<string, number>;
    modelingColumns: ExploreSelectOptionGroup[];
    selectedModelingColumn: ColumnConfig;

    // SECURITY ADDITION options -> by security / from portfolio / from iShares
    securitySearchTypeEnum = SecuritySearchTypeEnum;
    securitySearchOptions: AuxRadioInterface[];
    securitySearchType: SecuritySearchTypeEnum = SecuritySearchTypeEnum.BY_SECURITY;
    isIsharesSelectorModalOpen = false;
    ishareDefinitionsTree: ColumnSelectorOption[];
    widgetConfigInput: WidgetConfigInput;
    inputs: Map<string, WidgetInput>;
    isApplyButtonForIsharesModalDisabled = {value: 0};

    // config for the grid that displays the securities selected
    gridOptions: AuxGridOptions;

    private gridApi: GridApi;

    /* copy enum to allow usage in template */
    readonly addPortSourceEnum = AddPortSource.SECURITY_SEARCH;
    readonly PORTFOLIO: string = 'Portfolio';
    readonly COLUMNS = 'columns';

    readonly typeWhatIf: number = PortfolioType.WHAT_IF;
    /* to be passed just as a placeholder to the add-portfolio modal */
    readonly reportGroup = new ReportGroup();

    searchType: string;

    whatIfMode = false;
    loadFavAction: LoadFavoriteAction;
    selectProps: AuxSearchSelectOptionsInterface;
    basePortfolioType: ExplorePortfolioTypeEnum;

    addToPortfolio: string;
    leafPortfolios: string[] = [];
    // to track non-custom portfolio add entity events
    telemetryAddEntityStats: TelemetryAddEntitiesParameters[] = [];

    portNameLevelInBrkdn: number;

    constructor(private cdRef: ChangeDetectorRef, private securitySearchService: SecuritySearchService, public portfolioSearchService: ExplorePortfolioSearchService, private notificationService: NotificationService, private favoriteService: FavoriteService) {
        super();
    }

    /**
     * OnInit initializes the ag-grid
     */
    ngOnInit() {
        // initialize security search options - by security, from portfolios, from ishares
        this.initSecurityAdditionOptions();

        // init selectProps
        const selectProps = PortfolioSearchUtils.getSelectProps();
        selectProps.data[0].values[1].isSelected = true;
        this.selectProps = selectProps;

        this.gridOptions = {
            onGridReady: event => this.gridReady(event),
            defaultColDef: {
                floatingFilter: false
            },
            suppressContextMenu: true,
            columnDefs: this.getColDefs()
        };

        this.initializeModelingColumns();

        AppStore.expandModellingSubject$.pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((expandModellingFlag) => {
                this.expandModellingFlag = expandModellingFlag;
            });

        this.searchType = this.modellingType === ModellingType.POSITION ? 'regular' : 'parametric';

        // update addToPortfolio to the current portfolio name
        this.addToPortfolio = this.currentPortfolio?.portName;
    }

    /**
     * ngOnChanges hook to refresh the ag-grid related config
     */
    ngOnChanges(changes: SimpleChanges): void {
        if (changes.currentPortfolio) {
            // making sure to clear the selectedSecurities to clear the table to switch of portfolio
            if (!isEmpty(this.selectedSecurities)) {
                this.clearSecurities.emit();
            }

            // finally refresh the grid
            if (this.gridApi) {
                if (changes.modellingType) {
                    this.gridApi.updateGridOptions({columnDefs: this.getColDefs()});
                }
                this.gridApi.updateGridOptions({rowData: []});
            }

            this.initializeModelingColumns();
        }
        if (!isEmpty(changes.portBreakdownChildren?.currentValue)) {
            this.portNameLevelInBrkdn = BreakdownUtils.getColumnLevelInBreakdown(changes.portBreakdownChildren.currentValue, 'portfolio_name', 0);
        }
        if (changes.allRules && changes.allRules.currentValue) {
            this.createFromScratch = true;
            this.applySecurities(ModellingType.POSITION);
            this.updateSecurityTable(this.allRules);
        }
        this.basePortfolioType = this.currentPortfolio?.getTelemetricPortfolioType();
    }


    /**
     * This method initializes the radio button group for security search type selection.
     */
    initSecurityAdditionOptions(): void {
        this.securitySearchOptions = [{
            label: SecuritySearchTypeEnum.BY_SECURITY,
            eventData: SecuritySearchTypeEnum.BY_SECURITY,
            checked: this.securitySearchType === SecuritySearchTypeEnum.BY_SECURITY
        }, {
            label: SecuritySearchTypeEnum.FROM_PORTFOLIOS,
            eventData: SecuritySearchTypeEnum.FROM_PORTFOLIOS,
            checked: this.securitySearchType === SecuritySearchTypeEnum.FROM_PORTFOLIOS
        }, {
            label: SecuritySearchTypeEnum.FROM_ISHARES,
            eventData: SecuritySearchTypeEnum.FROM_ISHARES,
            checked: this.securitySearchType === SecuritySearchTypeEnum.FROM_ISHARES
        }];
    }

    /**
     * Callback to open widget ishares selector modal
     */
    openIsharesSelectorModal(): void {
        this.ishareDefinitionsTree = LibColumnUtils.getAvailableTree(CoreDefinitionStore.iSharesDefinitions);
        this.isIsharesSelectorModalOpen = true;
    }

    /**
     * Close ishares selector modal, bound with emit event
     */
    closeIsharesSelectorModal(apply: boolean): void {
        this.isIsharesSelectorModalOpen = false;
        this.ishareDefinitionsTree = [];
        const selectedIshareDefs = this.inputs.get('columns') as ColumnSet;
        if (apply) {
            if (selectedIshareDefs.columns) {
                selectedIshareDefs.columns.forEach(ishareDef => {
                    const row: Security = {
                        cusip: ishareDef.cusip,
                        description: ishareDef.columnTitle,
                        ticker: ishareDef.columnTag,
                        currentValue: 0.0,
                        newValue: 0.0,
                        alpha: 0.0
                    };
                    this.gridApi.applyTransaction({add: [row]});

                    // add security to list of selected if valid
                    if (isNil(row.error)) {
                        this.selectedSecurities.set(row.cusip, row);
                    }
                    this.isApplyButtonDisabled = false;
                    this.changeInSelectedSecurities.emit();
                });
                // size columns to fit space once security is added and grid is visible
                setTimeout(() => this.gridApi.sizeColumnsToFit());
            }
        }
        selectedIshareDefs.columns = [];
    }

    /**
     * Initialize modeling columns
     */
    initializeModelingColumns() {
        const availableColumns = this.getAvailableColumns();
        // For Portfolio/Index allocation default modeling column will be NAV % and for others NMV %
        const selectedColumnTag = this.modellingType === ModellingType.PORTFOLIO || (this.modellingType === ModellingType.POSITION && this.securitySearchType === SecuritySearchTypeEnum.FROM_PORTFOLIOS)
            ? CompositionConstants.PCT_NAV_GROUP
            : CompositionConstants.PCT_NOTIONAL_MARKET_VALUE;
        this.selectedModelingColumn = new ColumnConfig(availableColumns.find(availableColumn => availableColumn.columnTag === selectedColumnTag));
        this.modelingColumnUpdated.emit(this.selectedModelingColumn);
        this.modelingColumns = [new ExploreSelectOptionGroup()];
        CompositionConstants.COMPOSITION_EDITABLE_COLUMNS.filter(col => !col.includes(CompositionConstants.ACTIVE_COLUMN))
            .forEach(column => {
                const modelingColumn = availableColumns.find(availableColumn => availableColumn.columnTag === column);
                if (modelingColumn) {
                    this.modelingColumns[0].values.push(new ExploreSelectOption(modelingColumn.columnTitle, new ColumnConfig(modelingColumn), modelingColumn.columnTag === this.selectedModelingColumn.columnTag));
                }
            });
    }

    /**
     * return available columns for config
     */
    private getAvailableColumns() {
        return this.modellingType === ModellingType.PORTFOLIO || (this.modellingType === ModellingType.POSITION && this.securitySearchType === SecuritySearchTypeEnum.FROM_PORTFOLIOS)
            ? cloneDeep(portSummaryCompositionColumnsJson['defaultPortfolioSummaryColumns'])
            : cloneDeep(compositionColumnsJson['availableColumns']);
    }

    /**
     * Callback to initialize the grid APIs
     */
    protected gridReady(event: GridReadyEvent): void {
        this.gridApi = event.api;
    }

    /**
     * Grid cell renderer for cusip and adds warning icon if the security has an error
     */
    protected cusipCellRenderer(params: ICellRendererParams): HTMLElement {
        // must place icon inside wrapper in order to center in cell
        const cusipWrapper = document.createElement('div');
        cusipWrapper.style.height = '100%';
        cusipWrapper.style.display = 'flex';
        cusipWrapper.style.alignItems = 'center';

        // display warning if present
        if (!isNil(params.data.error)) {
            const cusipWarningIcon = document.createElement('aux-icon');
            cusipWarningIcon.setAttribute('slot', 'target');
            cusipWarningIcon.setAttribute('type', 'alert');
            cusipWarningIcon.setAttribute('state', 'warning');
            cusipWrapper.appendChild(cusipWarningIcon);

            const cusipWarningText = document.createElement('div');
            cusipWarningText.setAttribute('slot', 'content');
            cusipWarningText.setAttribute('style', 'inline-size: 650px; overflow-wrap: break-word');
            cusipWarningText.textContent = params.data.error;

            const cusipWarningPopover = document.createElement('aux-popover');
            cusipWarningPopover.setAttribute('trigger', 'hover');
            cusipWarningPopover.appendChild(cusipWarningIcon);
            cusipWarningPopover.appendChild(cusipWarningText);

            cusipWrapper.appendChild(cusipWarningPopover);
        }

        // cusip string
        const cusipText = document.createElement('span');
        cusipText.textContent = params.data.cusip;
        cusipWrapper.appendChild(cusipText);

        return cusipWrapper;
    }

    /**
     * Grid cell renderer for delete icon
     */
    protected deleteCellRenderer(params: ICellRendererParams): HTMLElement {
        // Create the x icon for deleting a row in grid
        const deleteIcon = document.createElement('aux-icon');
        deleteIcon.setAttribute('type', 'clear');
        deleteIcon.setAttribute('state', 'secondary');
        deleteIcon.addEventListener('click', () => this.deleteSecurity(params.data));

        // must place icon inside wrapper in order to center in cell
        const iconWrapper = document.createElement('div');
        iconWrapper.style.height = '100%';
        iconWrapper.style.display = 'flex';
        iconWrapper.style.alignItems = 'center';
        iconWrapper.style.justifyContent = 'center';
        iconWrapper.appendChild(deleteIcon);

        return iconWrapper;
    }

    /**
     * Triggered when window width is changed and resizes grid columns
     */
    @HostListener('window:resize')
    onResize(): void {
        this.gridApi.sizeColumnsToFit();
    }

    /**
     * Add a new security to the grid
     * @param security Security to add
     */
    addSecurity(security: SecuritySearchItem): void {
        if (this.selectedSecurities.has(security.cusip + CommonConstants.COLON + this.addToPortfolio)) {
            // duplicate security, do not add
            return;
        }

        // add security to grid
        const row: Security = {
            error: security.error,
            cusip: security.cusip,
            description: security.description,
            securityGroup: security.securityGroup,
            sedol: security.sedol,
            isin: security.isin,
            addToPortfolio: this.addToPortfolio,
            currentValue: this.modellingType === ModellingType.POSITION && this.currentPortfolio ?
                this.fetchCurrentValueForColumn(
                    this.currentPortfolio.composition.data,
                    security.cusip,
                    this.currentPortfolio.composition.columns,
                    this.addToPortfolio,
                    this.addToPortfolio === this.currentPortfolio.portName,
                    this.portNameLevelInBrkdn
                )(
                    this.selectedModelingColumn.columnTag,
                    true
                ) : 0.0,
            newValue: 0.0,
            alpha: 0.0,
            riskContributionPercentage: 0.0
        };
        this.gridApi.applyTransaction({
            add: [row]
        });

        // size columns to fit space once security is added and grid is visible
        if (!this.expandModellingFlag) {
            this.gridApi.sizeColumnsToFit();
        }

        // add security to list of selected if valid
        if (isNil(row.error)) {
            this.selectedSecurities.set(this.getKeyForSelectedSecurity(row), row);
        }
        this.isApplyButtonDisabled = false;
        this.isCalculateNAVDisabled = false;
        this.isCalculateNAVDisabledChange.emit(this.isCalculateNAVDisabled);

        const trackingParameters = {
            securitiesUploadedSuccessfully: 1,
            securitiesFailedToUpload: 0,
            wayToAddSecurity: WayToAddSecurity.SEARCH_FOR_SECURITIES,
            modellingColumnUsed: ModellingType[this.selectedModelingColumn.columnTag],
            addedEntityType: EntityType.SECURITY,
            basePortfolioType: this.basePortfolioType
        };
        // If current portfolio is not a custom portfolio then track the add to specific portfolio feature also
        if (!this.isCustomPortfolio) {
            trackingParameters[SecuritySearchComponent.SPECIFIC_PORTFOLIO] = this.currentPortfolio?.portName !== this.addToPortfolio;
            this.telemetryAddEntityStats.push(new TelemetryAddEntitiesParameters(trackingParameters));
        } else {
            this.telemetryCustomPortfolioStats.push(new TelemetryCustomPortfolioTrackingParameters(trackingParameters));
        }
        this.changeInSelectedSecurities.emit();
    }

    /**
     * Fetches Current notional pct value from table if security is present else return 0
     */
    fetchCurrentValueForColumn(
        compositionData: ResponseData,
        cusip: string,
        columns: string[],
        addToPort?: string,
        isAddToPortRoot?: boolean,
        portNameLevelInBrkdn?: number
    ): (columnToGet: string, formatData: boolean) => number {
        // Update the currentNotionalPct of Security with the composition table value if the cusip is present in the composition table.
        let rowDataList: ResponseData[] = [];
        CompositionUtils.findRowDataListBasedOnCusip(
            compositionData,
            cusip,
            addToPort,
            isAddToPortRoot,
            portNameLevelInBrkdn,
            rowDataList
        );

        return (
            columnToGet: string,
            formatData?: boolean
        ): number => {
            if (isEmpty(rowDataList)) {
                return 0;
            }

            if (formatData) {
                rowDataList = cloneDeep(rowDataList);
                for (let i = rowDataList.length - 1; i >= 0; i--) {
                    // Format the composition data to be in sync with composition table
                    CompositionUtils.formatData(rowDataList[i], columns);
                }
            }

            return rowDataList
                .map(rowData => rowData.data[columns.indexOf(columnToGet + '_after')])
                .reduce((prev, curr) => prev + curr, 0);
        };
    }

    /**
     * Delete a specific security (row in grid)
     * @param security  Security to delete
     */
    deleteSecurity(security: Security): void {
        this.selectedSecurities.delete(this.getKeyForSelectedSecurity(security));

        this.gridApi.applyTransaction({remove: [security]});
        this.changeInSelectedSecurities.emit();
    }

    /**
     * Deletes all securites from grid
     */
    deleteAllSecurities(removeInvalidSecurities?: boolean): void {
        // clear list of selected securities
        if (removeInvalidSecurities) {
            this.selectedSecurities.forEach((value: Security) => {
                if (!isEmpty(value.error)) {
                    this.deleteSecurity(value);
                }
            });
            this.telemetryCustomPortfolioStats.push(new TelemetryCustomPortfolioTrackingParameters({
                isSecuritiesCleared: true
            }));
        } else {
            this.selectedSecurities.clear();
            // clear grid
            this.gridApi.updateGridOptions({rowData: []});
        }
        if (this.showCalculateNAVOption && this.isCalculateNAVDisabled) {
            this.isCalculateNAVDisabled = true;
            this.isCalculateNAVDisabledChange.emit(this.isCalculateNAVDisabled);
            this.portNMVEmitter.emit(CoreCommonConstants.EMPTY_STRING);
        }
        this.changeInSelectedSecurities.emit();
    }

    /**
     * Shows or hides upload screen
     */
    toggleUploadList(): void {
        this.showUploadList = !this.showUploadList;
        this.showUploadListChanged.emit();
    }

    /**
     * Validates securities against the server to ensure the cusip is valid
     */
    validateAndAddSecurities(entities: Map<string, any>, uploadType?: WayToAddSecurity): void {
        // create space separated list of cusips
        if (this.modellingType === ModellingType.PORTFOLIO) {
            this.addPortfoliosToGrid(
                new Map([...entities.entries()].filter(item => isNil(item[1].portfolioType))), // prod portfolio
                new Map([...entities.entries()].filter(item => !isNil(item[1].portfolioType))) // what-if portfolios
            );
        } else {
            const cusipList = Array.from(entities.keys()).map(arr => arr.split(CommonConstants.COLON)[CommonConstants.SECURITY_INDEX]).join(' ');

            this.securitySearchService.searchSecurity$(cusipList, DateStore.getDefaultMaxDateString(), true)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe((results: SecuritySearchItem[]) => {
                    this.validateReceivedSecurities(results, entities, uploadType);
                });
            this.isCalculateNAVDisabled = false;
            this.isCalculateNAVDisabledChange.emit(this.isCalculateNAVDisabled);
        }
    }

    /**
     * adds What-if & prod portfolios to the grid
     */
    addPortfoliosToGrid(prodPortfolios: Map<string, any>, whatIfPortfolios: Map<string, any>): void {
        if (prodPortfolios?.size + whatIfPortfolios?.size > CompositionConstants.MAX_NUMBER_OF_PORTS_TO_UPLOAD) {
            this.notificationService.error('The limit for portfolio upload is ' + CompositionConstants.MAX_NUMBER_OF_PORTS_TO_UPLOAD + ' at a time. Please reduce the list content to ' + CompositionConstants.MAX_NUMBER_OF_PORTS_TO_UPLOAD + ' rows of portfolios and try again.', undefined, undefined, true);
            return;
        }

        const types: Set<string> = new Set<string>();
        const owners: Set<string> = new Set<string>();
        for (const value of whatIfPortfolios.values()) {
            CompositionConstants.WHAT_IF_TYPES_ALIAS_MAP.get(value.portfolioType).forEach(type => types.add(type));
            owners.add(value.owner);
        }

        const prodPortObs$ = this.portfolioSearchService.searchPortfolio$([...prodPortfolios.keys()].map(arr => arr.split(CommonConstants.COLON)[CommonConstants.SECURITY_INDEX]).join(' '), true, false, 'Loading Portfolios', true);

        const hasPitType = !![...types].filter(type => type !== CompositionConstants.WHATIF_RULES.TYPE).length;
        const hasTtType: boolean = types.has(CompositionConstants.WHATIF_RULES.TYPE);
        const pitPortObs$ = !hasPitType ? of<Favorite[]>([]) : this.favoriteService.getSlimFavorites$([...owners].join(CommonConstants.COMMA_SEPARATOR), [...types].filter(type => type !== CompositionConstants.WHATIF_RULES.TYPE).join(CommonConstants.COMMA_SEPARATOR), 'Loading Portfolios', 'date');
        const ttPortObs$ = !hasTtType ? of<Favorite[]>([]) : this.favoriteService.getSlimFavorites$([...owners].join(CommonConstants.COMMA_SEPARATOR), [CompositionConstants.WHATIF_RULES.TYPE].join(CommonConstants.COMMA_SEPARATOR), 'Loading Portfolios', 'modellingType');

        forkJoin([prodPortObs$, pitPortObs$, ttPortObs$])
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                ([prodPorts, pitPorts, ttPorts]) => {
                    try {
                        this.addPortfoliosAfterInfoFetch(prodPortfolios, whatIfPortfolios, prodPorts, [...pitPorts, ...ttPorts]);
                    } catch (e) {
                        this.notificationService.error('Could not parse the file. Please review the upload file and try again.', undefined, undefined, true);
                    }
                });
    }

    /**
     * callback on adding portfolios once their info has been fetched from the server
     */
    private addPortfoliosAfterInfoFetch(prodPortfolios: Map<string, any>, whatIfPortfolios: Map<string, any>, prodPorts, whatIfPorts: Favorite[]): void {
        this.addAllPortItemsToGrid(prodPorts.searchResults.map(port => new PortfolioSearchItem(port.ticker, port.fullName, port.currency, port.code, undefined, port.id, prodPortfolios.get(port.ticker).newValue)));
        const whatIfPortsToAdd = whatIfPorts.filter(port => whatIfPortfolios.has(port.title));
        const pitPortsToRemove = whatIfPortsToAdd.filter(port =>
            CompositionConstants.TYPES_TO_FETCH_DATE_FIELD.indexOf(port.type) !== -1 &&
            (this.currentPortfolio?.datePicker.date || this.adhocPortParams.date.date) !== port.description.split(CompositionConstants.FAV_ID_DELIMITER)[1]
        );
        const ttPortsToRemove = whatIfPortsToAdd.filter(port => port.type === CompositionConstants.WHATIF_RULES.TYPE &&
            !isEmpty(port.description.split(CompositionConstants.FAV_ID_DELIMITER)[1]) &&
            ModellingType.PORTFOLIO.toString() === port.description.split(CompositionConstants.FAV_ID_DELIMITER)[1]
        );
        this.addAllPortItemsToGrid(difference(whatIfPortsToAdd, [...ttPortsToRemove, ...pitPortsToRemove]).map(result => new PortfolioSearchItem(result.description.split(CompositionConstants.FAV_ID_DELIMITER)[0], result.title, undefined, undefined, result.type, result.id, whatIfPortfolios.get(result.title).newValue)));
        this.showPopulatedGrid();
        const portsNotFound = [
            ...difference([...prodPortfolios.keys()], prodPorts.searchResults.map(port => port.ticker)),
            ...difference([...whatIfPortfolios.keys()], whatIfPortsToAdd.map(wifPort => wifPort.title))
        ];
        if (!isEmpty(portsNotFound)) {
            this.notificationService.error('Portfolios ' + portsNotFound.join(',  ') + ' could not be found. Please check the name of the what-if portfolio, the type, as well as the owner, and try again.', undefined, undefined, true);
        }
        if (!isEmpty(pitPortsToRemove)) {
            this.notificationService.error('What-if portfolios ' + pitPortsToRemove.map(pitPort => pitPort.title).join(',  ') + ' are not available on ' + (this.currentPortfolio?.datePicker.date || this.adhocPortParams.date.date) + '.', undefined, undefined, true);
        }
        if (!isEmpty(ttPortsToRemove)) {
            this.notificationService.error('What-if portfolios ' + ttPortsToRemove.map(pitPort => pitPort.title).join(',  ') + ' can\'t be added. ' + AlertConstants.BODY.INVALID_WHATIF_RULE_PORT, undefined, undefined, true);
        }
    }

    /**
     * show grid after addition of portfolios
     */
    showPopulatedGrid(): void {
        // show the grid
        this.showUploadList = false;
        this.showUploadListChanged.emit();
        this.cdRef.detectChanges();

        // size columns to fit space once security is added and grid is visible
        this.gridApi.sizeColumnsToFit();
        this.changeInSelectedSecurities.emit();
    }

    /**
     * Method called when leafPortfolios is changed
     */
    onLeafPortfoliosUpdated(leafPortfolios: Set<string>): void {
        this.leafPortfolios.length = 0;
        this.leafPortfolios.push(...leafPortfolios);
    }

    /**
     * Update each security and add them to the grid
     */
    addSecuritiesToTheGrid(securities: SecuritySearchItem[]): void {
        this.selectedSecurities.clear();
        securities.forEach(item =>
            this.getSecurityIdentifiers(item)
                .filter(identifier => !isEmpty(identifier))
                .forEach(identifier =>
                    Array.from(this.uploadedSecurities.entries())
                        // check if the key of uploaded security match with one of the identifier or in case the uploaded security key is an underlying portfolio we check if it includes a COLON and then match the identifier with part of the key
                        .filter(([key, _value]) => key === identifier || (key.includes(CommonConstants.COLON) && key.split(CommonConstants.COLON)[0] === identifier))
                        .forEach(([_key, value]) => this.setSecurityInformation(cloneDeep(item) as Security, value))
                )
        );

        // add securities to grid
        this.gridApi.applyTransaction({
            add: Array.from(this.selectedSecurities.values())
        });

        // show the grid
        this.isApplyButtonDisabled = !this.selectedSecurities?.size;
        this.showUploadList = false;
        this.showUploadListChanged.emit();
        this.cdRef.detectChanges();

        // size columns to fit space once security is added and grid is visible
        this.gridApi.sizeColumnsToFit();
    }

    /**
     * Closes Security selection modal and add relevant securities to the grid
     */
    closeSecuritySelectionModal(ISINSecuritiesMap: Map<string, SecuritySearchItem>): void {
        this.isSecuritySelectionModalOpen = false;
        if (ISINSecuritiesMap instanceof CustomEvent) {
            return;
        }
        // Remove all the securities that map to a similar identifier and then add the selected one
        this.securityResults = [...this.securityResults.filter(result => !Array.from(this.uploadedSecurities.keys())
            .map(key => key.split(CommonConstants.COLON)[CommonConstants.SECURITY_INDEX])
            .filter(key => key.length === 12).includes(result.isin)),
            ...Array.from(ISINSecuritiesMap.values())];
        this.telemetryCustomPortfolioStats.push(new TelemetryCustomPortfolioTrackingParameters({
            securitiesUploadedSuccessfully: this.securityResults.length,
            securitiesFailedToUpload: this.invalidSecurities.length,
            wayToAddSecurity: this.uploadType,
            modellingColumnUsed: ModellingType[this.selectedModelingColumn.columnTag],
            addedEntityType: EntityType.SECURITY,
            basePortfolioType: this.basePortfolioType
        }));
        this.addSecuritiesToTheGrid(this.securityResults);
        this.changeInSelectedSecurities.emit();
        this.portNMVEmitter.emit(SecurityUtils.calculateNav(this.selectedSecurities, this.designateValuesToCusipMap));
    }

    /**
     * Method called when modelingColumn is changed
     */
    onModelingColumnChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        // Do not show any warning if no selected security
        if (isEmpty(this.selectedSecurities)) {
            this.updateModelingColumn(event);
            return;
        }
        // Open Warning Dialog
        this.notificationService.openDialog(
            new ExploreDialogParam(
                AlertConstants.TYPE.ALERT_WITH_OPTIONS,
                AlertConstants.HEADER.CHANGE_MODELING_COLUMN,
                this.modellingType === ModellingType.PORTFOLIO ? AlertConstants.BODY.CHANGE_MODELING_COLUMN_PORTFOLIO : AlertConstants.BODY.CHANGE_MODELING_COLUMN,
                AlertConstants.BTN.YES,
                AlertConstants.BTN.NO,
                this.updateModelingColumn,
                this.revertChanges,
                event
            )
        );
    }

    /**
     * Method called when addToPortfolio is changed
     */
    onAddToPortfolioChanged(changedPortfolio: string): void {
        this.addToPortfolio = changedPortfolio;
    }

    /**
     * callback function to update the modeling column
     */
    updateModelingColumn = (event) => {
        const updatedModelingColumn: ColumnConfig = (event.detail.value as AuxSelectOption).value;
        if (this.selectedModelingColumn.columnTag !== updatedModelingColumn.columnTag) {
            this.selectedModelingColumn = updatedModelingColumn;
            this.modelingColumnUpdated.emit(this.selectedModelingColumn);
            // filter out the existing modeling column from grid
            const gridColDefs = this.gridApi.getColumnDefs().filter(colDef => !!colDef['field']
                && colDef.headerName !== CompositionConstants.PCT_NAV_CONTRIBUTION);
            const modelingColumnDef: ColGroupDef | ColDef = cloneDeep(this.getDefaultModelingColumnDefs());
            modelingColumnDef.headerName = (event.detail.value as AuxSelectOption).displayValue;
            modelingColumnDef[CommonConstants.COLUMN_TAG] = updatedModelingColumn.columnTag;
            if (!isEmpty((modelingColumnDef as ColGroupDef).children)) {
                (modelingColumnDef as ColGroupDef).children.forEach(child => child[CommonConstants.COLUMN_TAG] = updatedModelingColumn.columnTag);
            }
            gridColDefs.push(modelingColumnDef);
            gridColDefs.push(this.getDeleteColumnDefs());
            this.gridApi.updateGridOptions({columnDefs: gridColDefs});
            // size columns to fit space once modelingColumn is changed
            this.gridApi.sizeColumnsToFit();

            const rowData = this.gridApi.getRenderedNodes().map(rowNode => rowNode.data);
            rowData.forEach(row => {
                row.currentValue = this.modellingType === ModellingType.POSITION && !this.isCustomPortfolio ?
                    this.fetchCurrentValueForColumn(
                        this.currentPortfolio.composition.data,
                        row.cusip,
                        this.currentPortfolio.composition.columns,
                        this.addToPortfolio,
                        this.addToPortfolio === this.currentPortfolio.portName,
                        this.portNameLevelInBrkdn
                    )(
                        this.selectedModelingColumn.columnTag,
                        false
                    ) : 0.0;
                row.newValue = 0;
            });
            this.gridApi.updateGridOptions({rowData});
        }
    }

    /**
     * revert the selected column to the previously selected column
     */
    revertChanges = () => {
        this.modelingColumns[0].values.forEach(colValue => colValue.isSelected = (colValue.value as ColumnConfig).columnTag === this.selectedModelingColumn.columnTag);
        // reinitialize the data for dropdown so that changes to selected column reflects correctly
        this.modelingColumns = [...this.modelingColumns];
        this.cdRef.markForCheck();
        return;
    }

    /**
     * Applies the securities to composition table
     */
    applySecurities(modellingType: ModellingType, ev?: MouseEvent): void {
        this.isApplyButtonDisabled = true;
        this.gridApi.showLoadingOverlay();
        this.splitRowNodes = this.getRowNodesSplitByErrors();
        // Create rules with the valid rules if not creating adhoc portfolio
        // for addhoc portfolio rules are already created and processed
        if (!this.createFromScratch) {
            const rules = this.convertTableToRules(this.splitRowNodes[0]);
            if (!isEmpty(rules) && this.modellingType === ModellingType.PORTFOLIO && this.currentPortfolio instanceof RulesBasedPortfolio) {
                rules.forEach(rule => (this.currentPortfolio as RulesBasedPortfolio).addTradeRule(rule));
            }
            this.showCompositionTable.emit({
                callbackFunction: this.updateSecurityTable,
                tradeRule: rules,
                sourceOfRules: RequestConstants.SECURITY_SEARCH,
                refreshCachedResponse: AppUtils.isCtrlPressed(ev)
            });
        }
        if (modellingType !== ModellingType.PORTFOLIO) {
            this.tableMap = this.convertTableToMap(this.splitRowNodes[0]);
        }
        this.trackSecurityAddViaTelemetry();
        // to set the scroll to left after apply
        setTimeout(() => this.gridApi.setFocusedCell(0, 'description'), 0);
    }

    trackSecurityAddViaTelemetry(): void {
        this.telemetryAddEntityStats.forEach(stats => {
            stats.modellingColumnUsed = ModellingColumn[this.selectedModelingColumn.columnTag];
            TelemetryService.track(TelemetryActionConstants.USER_BEHAVIOUR.ADD_ENTITIES, stats);
        });
        this.telemetryAddEntityStats.length = 0;
    }

    /**
     * Updates the security table with skipped rules,if any
     */
    updateSecurityTable = (allrules?: AllRules): void => {
        this.deleteAllSecurities();
        const errorRowData = this.splitRowNodes[1].map((node: any) => node.data);
        // Set the error Row data for selected securities
        if (!isEmpty(errorRowData)) {
            errorRowData.forEach(nodeData => this.selectedSecurities.set(this.getKeyForSelectedSecurity(nodeData as Security), nodeData as Security));
        }
        if (this.gridApi) {
            this.gridApi.applyTransaction({add: errorRowData});
        }
        const newNodes = [];
        const skippedRulesForEachDate = allrules ? allrules.skippedRules : this.currentPortfolio.skippedRulesForEachDate;
        if (!isEmpty(skippedRulesForEachDate)) {
            const errorMessage = (skippedRulesForEachDate[0] as SecurityRule).hasAssetValidationError ? CompositionConstants.ASSET_VALIDATION_ERROR : CompositionConstants.ANALYTICS_NOT_FOUND_FOR_SECURITIES.LINE_1;
            setTimeout(() => this.notificationService.openDialog(
                new ExploreDialogParam(
                    AlertConstants.TYPE.ALERT,
                    'Warning',
                    errorMessage +
                    CompositionConstants.ANALYTICS_NOT_FOUND_FOR_SECURITIES.LINE_2,
                    AlertConstants.BTN.OK
                )), 0);

            skippedRulesForEachDate.forEach((skippedRule) => {
                this.updateTableForRule(skippedRule, newNodes, true);
            });
        }
        if (allrules) {
            allrules.processedRules.forEach((processedRule) => {
                this.updateTableForRule(processedRule, newNodes, false);
            });
        }
        this.gridApi.updateGridOptions({rowData: newNodes});

        if (!this.expandModellingFlag) {
            this.gridApi.sizeColumnsToFit();
        }
    }

    /**
     * Updates the security table for given rule
     */
    updateTableForRule = (rule: BaseRule, newNodes: any[], isSkippedRule?: boolean): void => {
        // Grab the corresponding node from the table
        const node = this.tableMap.get(rule.lineItem);
        if (isSkippedRule) {
            // Set the error
            node.data.error = (rule instanceof SecurityRule && rule.hasAssetValidationError) ? CompositionConstants.ASSET_VALIDATION_ERROR : CompositionConstants.ANALYTICS_NOT_FOUND_FOR_SECURITIES.LINE_1;
        }
        newNodes.push(node.data as Security);
        this.selectedSecurities.set(rule.lineItem + CommonConstants.COLON + (node.data as Security).addToPortfolio, node.data as Security);
    }

    /**
     * Iterates over the table to create a map of cusip to node object
     */
    convertTableToMap(validRowNodes: any[]): Map<string, RowNode> {
        const tableIterable = validRowNodes.map((node: any) => [node.data.cusip, node]);
        return new Map(tableIterable as [string, RowNode][]);
    }

    /**
     * Returns a filtered list of rules without any errors
     */
    getRowNodesSplitByErrors(): RowNode[][] {
        const validRowNodes = [];
        const errorRowNodes = [];
        this.gridApi.forEachNode(node => node.data.error ? errorRowNodes.push(node) : validRowNodes.push(node));
        return [validRowNodes, errorRowNodes];
    }

    /**
     * Gets the item type(Portfolio or Security)
     */
    getItemType(): string {
        if (this.modellingType === ModellingType.PORTFOLIO) {
            return CommonConstants.PORTFOLIO;
        } else if (this.modellingType === ModellingType.POSITION) {
            return this.securitySearchType === SecuritySearchTypeEnum.FROM_PORTFOLIOS ? CompositionConstants.RuleType.PORTFOLIO_SECURITIES : CommonConstants.SECURITY;
        }
    }

    /**
     * Returns the after column name / field id
     */
    getAfterColumnName(itemType: string): string {
        if (itemType === CommonConstants.SECURITY) {
            return 'newNotionalPct';
        } else if (itemType === CommonConstants.PORTFOLIO) {
            return CompositionConstants.PCT_NAV_GROUP_AFTER;
        }
    }

    /**
     * Iterates over each row to create security rules
     */
    convertTableToRules(validRowNodes: RowNode[]): BaseRule[] {
        const itemType = this.getItemType();
        const columnName = 'newValue';
        return validRowNodes
            .filter(node => node.data.cusip)
            .map(node => {
                const rule: BaseRule = RuleFactory.createRule(node.data.cusip, node.data[columnName], itemType, RuleUnit[this.selectedModelingColumn.columnTag.toUpperCase()], node.data['id'], node.data.portfolioType, node.data.addToPortfolio);
                if (rule instanceof PortfolioSecuritiesRule) {
                    rule.title = node.data.description;
                }
                return rule;
            });
    }

    /**
     * Event handler for emitPortfolio event
     */
    addPortfolio = (portfolioSearchItem: PortfolioSearchItem, callback?: (...arg: any[]) => void): void => {
        if (!portfolioSearchItem.id) {
            this.addPortfolioToTable(portfolioSearchItem);
            return;
        }

        // if name of the wht-f we are trying to add is same as that of an alreayd added one
        // then simply return;
        if (!this.isValidNameForWhatIfToBeAdded(portfolioSearchItem)) {
            return;
        }

        // Load the portfolio info
        const port: Portfolio = PortfolioService.getPortfolioObject(portfolioSearchItem);
        // load the details from fav since it's a Position Based Portfolio
        this.favoriteService.getFavorite$(port.id, 'Getting what-if to add')
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((savedFavorite: Portfolio) => {
                port.deserialize(savedFavorite.serialize());
                // Check if it's a Position Based Portfolio OR an Adhoc Portfolio
                if ([CompositionConstants.WHATIF_POS.TYPE, CompositionConstants.ADHOC_PORT].indexOf(portfolioSearchItem.type) !== -1) {
                    // do not process further if it's an invalid Position Based Portfolio(port date is diff than workpad date)
                    if (!this.isValidPositionBasedPortfolio(port as PortfolioWithPositions)) {
                        return;
                    }
                    // update portfolioSearchItem ticker and remove the date
                    if (portfolioSearchItem.ticker.indexOf(CompositionConstants.FAV_ID_DELIMITER) !== -1) {
                        portfolioSearchItem.ticker = portfolioSearchItem.ticker.split(CompositionConstants.FAV_ID_DELIMITER)[0];
                    }
                } else if ([CompositionConstants.WHATIF_RULES.TYPE, CompositionConstants.ADHOC_PORT_GROUP].indexOf(portfolioSearchItem.type) !== -1) {
                    if (!this.isValidRuleBasedPortfolio(port as RulesBasedPortfolio)) {
                        return;
                    }
                }

                if (callback) {
                    // use callback if one was passed
                    callback(portfolioSearchItem);
                } else  {
                    // go for regular callback
                    this.addPortfolioToTable(portfolioSearchItem);
                }
            });

        this.telemetryCustomPortfolioStats.push(new TelemetryCustomPortfolioTrackingParameters({
            modellingColumnUsed: ModellingType[this.selectedModelingColumn.columnTag],
            addedEntityType: EntityType.PORTFOLIO,
            basePortfolioType: this.basePortfolioType
        }));
    };

    /**
     * update the grid if portfolio is valid
     */
    private addPortfolioToTable(portfolioSearchItem: any) {
        const securityKey: string = !!portfolioSearchItem.id ? portfolioSearchItem.ticker.concat(CompositionConstants.FAV_ID_DELIMITER, portfolioSearchItem.fullName) : portfolioSearchItem.ticker;
        if (this.selectedSecurities.has(securityKey)) {
            const selectedSecurity: Security = this.selectedSecurities.get(securityKey);
            // if we have the same ticker and fullName, that points to a duplicate item
            // but since it's possible to have a different id and same name, it may not be a duplicate item after all
            // hence we want to prompt the user for the reason before returning
            if (!!selectedSecurity['id'] && !!portfolioSearchItem.id && selectedSecurity['id'] !== portfolioSearchItem.id) {
                this.promptIsDifferentWhatIfWithSameName();
            }
            // duplicate record, do not add
            return;
        }

        // add security to grid
        const row: PortfolioItem = {
            id: portfolioSearchItem.id,
            cusip: portfolioSearchItem.ticker,
            description: portfolioSearchItem.fullName,
            currentValue: 0,
            newValue: !isNil(portfolioSearchItem.newValue) ? portfolioSearchItem.newValue : 0.0,
            isPort: true,
            portfolioType: portfolioSearchItem.type,
        };
        console.log(row);
        this.gridApi.applyTransaction({add: [row]});

        // size columns to fit space once security is added and grid is visible
        setTimeout(() => this.gridApi.sizeColumnsToFit());

        // add record to list of selected
        this.selectedSecurities.set(!!row.id ? row.cusip.concat(CompositionConstants.FAV_ID_DELIMITER, row.description) : row.cusip, row);
        this.isApplyButtonDisabled = false;
        this.changeInSelectedSecurities.emit();
    }

    /**
     * check if selected Position Based Portfolio is saved for a date different from that of workpad
     *
     * returns true indicating same date for portfolio (port with positions) and workpad
     * else, return false
     */
    isValidPositionBasedPortfolio(portfolio: PortfolioWithPositions): boolean {
        // if it's an adhoc port, then we should pick the date from adhoc port params instead
        // as the current portfolio may not have anything
        const currentPortfolioDate = this.isCustomPortfolio
            ? this.adhocPortParams.date.date
            : WorkspaceStore.getCurrentPortfolio().datePicker.date;

        if ((portfolio as PortfolioWithPositions).date !== currentPortfolioDate) {
            this.notificationService.openDialog(new ExploreDialogParam(
                AlertConstants.TYPE.ALERT,
                AlertConstants.HEADER.INVALID_WHATIF_PORT,
                AlertConstants.BODY.INVALID_WHATIF_PORT.replace('WHATIF_PORT_DATE', portfolio.date),
                AlertConstants.BTN.OK,
                null,
                null,
                () => {
                }
            ));
            return false;
        }
        return true;
    }

    /**
     * returns false if rule Based Portfolio is based on port/index modeling
     * else, return true
     */
    isValidRuleBasedPortfolio(portfolio: RulesBasedPortfolio): boolean {
        if (portfolio.modellingType === ModellingType.PORTFOLIO) {
            this.notificationService.openDialog(new ExploreDialogParam(
                AlertConstants.TYPE.ALERT,
                AlertConstants.HEADER.INVALID_WHATIF_PORT,
                AlertConstants.BODY.INVALID_WHATIF_RULE_PORT,
                AlertConstants.BTN.OK,
                null,
                null,
                () => {
                }
            ));
            return false;
        }

        return true;
    }

    /**
     * refrain from added a what-if portfolio whose name is same as that of an already added one
     */
    private isValidNameForWhatIfToBeAdded(portfolioSearchItem: PortfolioSearchItem) {
        if (this.currentPortfolio?.holdingChanges
                .filter(change => change instanceof NewPortfolioHoldingChange)
                .map((change: PortfolioHoldingChange) => change.title)
                .filter(title => !isEmpty(title))
                .find(title => title === portfolioSearchItem.fullName)
            ||
            (this.isCustomPortfolio && this.selectedSecurities?.has(portfolioSearchItem.ticker.concat(CompositionConstants.FAV_ID_DELIMITER, portfolioSearchItem.fullName)))
        ) {
            this.promptIsDifferentWhatIfWithSameName();
            return false;
        }

        return true;
    }

    /**
     * prompt that the what-if being added is a different what-if but with
     * the same name as that of an already added one
     */
    private promptIsDifferentWhatIfWithSameName() {
        this.notificationService.openDialog(new ExploreDialogParam(
            AlertConstants.TYPE.ALERT,
            AlertConstants.HEADER.INVALID_WHATIF_PORT,
            AlertConstants.BODY.INVALID_WHATIF_PORT_DUPLICATE_NAME,
            AlertConstants.BTN.OK,
            null,
            null,
            () => {
                // do nothing
            }
        ));
    }

    /**
     * Track portfolio with Telemetry
     */
    trackPortfolioTelemetry(portfolioSearchItem: PortfolioSearchItem): void {
        const addingEntityTrackingParameters = new TelemetryAddEntitiesParameters({
            securitiesUploadedSuccessfully: this.securityResults?.length,
            securitiesFailedToUpload: this.invalidSecurities?.length,
            wayToAddSecurity: this.uploadType,
            modellingColumnUsed: ModellingType[this.selectedModelingColumn?.columnTag],
            addedEntityType: EntityType.PORTFOLIO,
            basePortfolioType: this.basePortfolioType,
            addedPortfolioType: this.whatIfMode ? ExplorePortfolioTypeEnum.WHAT_IF : ExplorePortfolioTypeEnum.PORTFOLIO
        });
        TelemetryService.track(TelemetryActionConstants.USER_BEHAVIOUR.ADD_ENTITIES, addingEntityTrackingParameters);
        const dateObjectToUse: DateValue = this.currentPortfolio?.datePicker;
        const portfolioTrackingParams = new AddPortfolioTrackingParameters(
            portfolioSearchItem.ticker,
            dateObjectToUse?.date,
            portfolioSearchItem.type === this.PORTFOLIO ? 1 : 0,
            this.addPortSourceEnum);
        TelemetryService.track(
            TelemetryActionConstants.PORTFOLIO.ADD_PORTFOLIO,
            portfolioTrackingParams
        );
    }

    getColDefs(): (ColDef | ColGroupDef)[] {
        let columnDefinitions: (ColDef | ColGroupDef)[] = [
            {
                headerName: this.isPortModellingOrAddSecurityFromPort() ? 'Portfolio' : 'Security',
                field: 'cusip',
                width: 100,
                suppressSizeToFit: true,
                ...(this.modellingType !== ModellingType.PORTFOLIO ? {cellRenderer: params => this.cusipCellRenderer(params)} : {}),
            },
            {
                ...(this.isPortModellingOrAddSecurityFromPort() ? {headerName: 'Portfolio Name'} : {}),
                field: 'description',
                type: 'auxTextColumn',
                minWidth: 265
            },
            {
                field: 'securityGroup',
                type: 'auxTextColumn',
                minWidth: 140,
                hide: this.isPortModellingOrAddSecurityFromPort() || (this.securitySearchType === SecuritySearchTypeEnum.FROM_ISHARES)
            },
            {
                headerName: 'SEDOL',
                field: 'sedol',
                type: 'auxTextColumn',
                minWidth: 100,
                hide: !isNil(this.customColDef) || this.isPortModellingOrAddSecurityFromPort() || (this.securitySearchType === SecuritySearchTypeEnum.FROM_ISHARES)
            },
            {
                headerName: 'ISIN',
                field: 'isin',
                type: 'auxTextColumn',
                minWidth: 140,
                hide: !isNil(this.customColDef) || this.isPortModellingOrAddSecurityFromPort() || (this.securitySearchType === SecuritySearchTypeEnum.FROM_ISHARES)
            },
            {
                headerName: 'Add to Portfolio',
                field: 'addToPortfolio',
                type: [
                    AuxGridColumnType.AUX_TEXT_COLUMN,
                    AuxGridColumnType.AUX_RIGHT_ALIGN_COLUMN
                ],
                minWidth: 140,
                hide: !isNil(this.customColDef) || this.isPortModellingOrAddSecurityFromPort() || this.isCustomPortfolio || this.createFromScratch || (this.securitySearchType === SecuritySearchTypeEnum.FROM_ISHARES)
            },
            {
                field: 'id',
                type: 'auxTextColumn',
                hide: true
            },
            {
                field: 'rowType',
                type: 'auxTextColumn',
                hide: true
            }
        ];

        if (!this.createFromScratch) {
            columnDefinitions.push(this.getDefaultModelingColumnDefs());
        }

        if (!isNil(this.customColDef)) {
            columnDefinitions.push(this.customColDef);
        }

        columnDefinitions.push(this.getDeleteColumnDefs());

        const keyColTagMapping = compositionColumnsJson['securitySearchKeyColTagMapping'];

        // filter out the columns for which user do not have perms like sedol
        columnDefinitions = columnDefinitions.filter((colDef: ColDef | ColGroupDef) => {
            let showColumn = true;
            const colKey = colDef['field'];

            if (colKey && (colKey === 'id' || colKey === 'rowType')) {
                return false;
            }

            if (colKey && colKey !== 'newValue' && colKey !== 'alpha' && colKey !== 'addToPortfolio' && colKey !== 'riskContributionPercentage') {
                const colTag = keyColTagMapping[colKey] ? keyColTagMapping[colKey] : colKey;
                const columnDef = CoreColumnUtils.getColumnDefByTag(colTag);
                showColumn = !!columnDef;
            }
            return showColumn;
        });
        return columnDefinitions;
    }

    /**
     * return true if modelling type is PORTFOLIO or POSITION with add security from port true
     */
    isPortModellingOrAddSecurityFromPort() {
        return this.modellingType === ModellingType.PORTFOLIO || (this.modellingType === ModellingType.POSITION && this.securitySearchType === SecuritySearchTypeEnum.FROM_PORTFOLIOS);
    }

    getDefaultModelingColumnDefs(): ColGroupDef | ColDef {
        const colDef = this.isCustomPortfolio && this.modellingType === ModellingType.PORTFOLIO
            ? {
                headerName: 'NAV Contribution %',
                field: 'newValue',
                type: 'auxNumberColumn',
                filter: 'auxNumberFilter',
                columnTag: 'pct_nav_group',
                minWidth: 140,
                editable: true,
                valueFormatter: params => NumberUtils.numberColumnFormatter(params),
                valueSetter: params => NumberUtils.percentageValueSetter(params)
            }
            : {
                headerName: this.modellingType === ModellingType.PORTFOLIO || (this.securitySearchType === SecuritySearchTypeEnum.FROM_PORTFOLIOS && this.modellingType === ModellingType.POSITION) ? 'NAV Contribution %' : 'Notional Market Value %',
                children: [
                    {
                        headerName: 'Current',
                        field: 'currentValue',
                        minWidth: 80,
                        maxWidth: 140,
                        type: 'auxNumberColumn',
                        filter: 'auxNumberFilter',
                        columnTag: this.modellingType === ModellingType.PORTFOLIO ? 'pct_nav_group' : 'pct_notional_val',
                        valueFormatter: params => NumberUtils.numberColumnFormatter(params),
                        hide: this.isCustomPortfolio
                    },
                    {
                        headerName: 'New',
                        field: 'newValue',
                        minWidth: 80,
                        maxWidth: 140,
                        type: 'auxNumberColumn',
                        filter: 'auxNumberFilter',
                        columnTag: this.modellingType === ModellingType.PORTFOLIO ? 'pct_nav_group' : 'pct_notional_val',
                        editable: true,
                        valueFormatter: params => NumberUtils.commaSeparatedColumnFormatter(params.value),
                        valueSetter: params => NumberUtils.percentageValueSetter(params)
                    }
                ]
            };
        if (colDef.editable) {
            (colDef as ColDef).cellEditor = NumericCellEditor;
        } else {
            (colDef.children[1] as ColDef).cellEditor = NumericCellEditor;
        }
        return colDef;
    }

    private getDeleteColumnDefs(): ColDef {
        return {
            minWidth: 38,
            width: 38,
            maxWidth: 38,
            suppressSizeToFit: true,
            suppressHeaderMenuButton: true,
            filter: false,
            sortable: false,
            cellRenderer: params => this.deleteCellRenderer(params)
        };
    }

    onSecuritySearchOptionChanged(securitySearchType: SecuritySearchTypeEnum): void {

        if (securitySearchType === SecuritySearchTypeEnum.FROM_ISHARES) {
            this.ishareDefinitionsTree = LibColumnUtils.getAvailableTree(CoreDefinitionStore.iSharesDefinitions);
            this.widgetConfigInput = {inputConfigType: this.COLUMNS, inputName: this.COLUMNS, inputTitle: this.COLUMNS};
            this.inputs = new Map<string, WidgetInput>([[this.COLUMNS, new ColumnSet()]]);
        } else {
            this.ishareDefinitionsTree = [];
            this.widgetConfigInput = {inputConfigType: undefined, inputName: undefined, inputTitle: undefined};
        }
        this.securitySearchType = securitySearchType;

        // making sure to clear the selectedSecurities to clear the table to switch of portfolio
        if (!isEmpty(this.selectedSecurities)) {
            this.clearSecurities.emit();
        }

        // finally refresh the grid
        this.gridApi.updateGridOptions({columnDefs: this.getColDefs()});
        this.gridApi.updateGridOptions({rowData: []});

        this.initializeModelingColumns();
    }

    validateReceivedSecurities(results: SecuritySearchItem[], securities: Map<string, Security>, uploadType: WayToAddSecurity): void {
        this.securityIdentifiers = securities.keys();
        this.uploadedSecurities = cloneDeep(securities);
        this.invalidSecurities = [];
        this.securityResults = results;
        // Validate uploaded securities
        for (const entry of securities.entries()) {
            let isValid = results.some(result => this.getSecurityIdentifiers(result).includes(entry[0].split(CommonConstants.COLON)[CommonConstants.SECURITY_INDEX]));
            if (isValid && !isNil(this.customColDef)) {
                isValid = !isNaN(entry[1][(this.customColDef as any).field]);
            }
            if (!isValid) {
                this.invalidSecurities.push(entry[0]);
            }
        }
        this.uploadType = uploadType;
        if (this.invalidSecurities.length > 0) {
            let errorMessage = AlertConstants.NOTIFICATION.ERROR_LOADING_SECURITIES + CommonConstants.COLON;
            this.invalidSecurities.forEach(security => errorMessage += CommonConstants.SINGLE_SPACE + security + CommonConstants.COMMA_SEPARATOR);
            // remove extra ',' at end and show error message
            this.notificationService.error(errorMessage.slice(0, -1), ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_VALIDATE_RECEIVED_SECURITIES_ERROR);
        }
        // if we get more securities from the server, allow user to select a security if a particular identifier maps to multiple securities
        if (results.length > securities.size) {
            this.isSecuritySelectionModalOpen = true;
            this.cdRef.detectChanges();
        } else {
            // go through results from server and update each of its corresponding securities, and clear the error
            this.addSecuritiesToTheGrid(results);
            const trackingParameters = {
                securitiesUploadedSuccessfully: results.length,
                securitiesFailedToUpload: this.invalidSecurities.length,
                wayToAddSecurity: uploadType,
                modellingColumnUsed: ModellingType[this.selectedModelingColumn.columnTag],
                addedEntityType: EntityType.SECURITY,
                basePortfolioType: this.basePortfolioType
            };
            // If current portfolio is not a custom portfolio then track the add to specific portfolio feature also
            if (!this.isCustomPortfolio) {
                const isAddToPortfolioFunctionalityUsedWhileUpload = Array.from(this.uploadedSecurities.values()).some(security => !isEmpty(security.addToPortfolio) && (security.addToPortfolio !== this.currentPortfolio.portName));
                trackingParameters[SecuritySearchComponent.SPECIFIC_PORTFOLIO] = isAddToPortfolioFunctionalityUsedWhileUpload;
                this.telemetryAddEntityStats.push(new TelemetryAddEntitiesParameters(trackingParameters));
            } else {
                this.telemetryCustomPortfolioStats.push(new TelemetryCustomPortfolioTrackingParameters(trackingParameters));
            }
        }
        this.changeInSelectedSecurities.emit();
    }

    /**
     * Returns true if there are invalid securities present
     */
    isInvalidSecuritiesPresent(): boolean {
        return Array.from(this.selectedSecurities?.values())?.some(security => !isEmpty(security.error));
    }

    /**
     * handle what if mode / port search mode switching
     */
    switchToWhatIfMode(event: CustomEvent | boolean): void {
        const isWhatIf: boolean = event instanceof CustomEvent
            ? event?.detail?.value?.displayValue === PortfolioSearchConstants.WHAT_IF_PORTFOLIO
            : event;
        if (isWhatIf) {
            if (!this.favoriteViewToJustSelectWhatIfs) {
                // go for regular what if load modal if it's not required to open the modal to "just" select what-if's
                this.loadFavAction = this.portfolioSearchService.enableWhatIfSearch(this.addPortfolio);
            } else {
                // emit the message to open modal to select what-if's
                this.openWhatIfLoadSlimModal.emit(true);
            }
            this.whatIfMode = true;
            // reset the aux-select options
            const selectProps = PortfolioSearchUtils.getSelectProps();
            selectProps.data[0].values[1].isSelected = true;
            this.selectProps = selectProps;
        } else {
            this.whatIfMode = false;
        }
    }

    /**
     * returns array of security identifiers
     */
    getSecurityIdentifiers(security: SecuritySearchItem): string[] {
        return [security.isin, security.sedol, security.cusip, security.ticker, security.bbTicker?.replace(/\s/g, CommonConstants.ESCAPED_SPACE_CHAR)];
    }

    /**
     * updates checkbox to enable/disable designateValue checkbox
     */
    calculateNAV() {
        if (this.selectedSecurities.size !== 0 && this.modellingType === ModellingType.POSITION && this.selectedModelingColumn.columnTag !== ColumnConstants.PCT_NOTIONAL_MARKET_VAL) {
            const rules: BaseRule[] = [];
            this.selectedSecurities.forEach((value, key) => rules.push(new SecurityRule(key, value.newValue)));
            // Send request to BE to calculate total NMV for securities
            this.securitySearchService.updateDesignateValue$(rules, this.adhocPortParams.date.date, this.selectedModelingColumn.columnTag === ColumnConstants.CUR_FACE ? RuleUnit.CUR_FACE : RuleUnit.NOTIONAL_MV, this.adhocPortParams.currency, true)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe((results: DesignateValueList) => {
                    this.designateValuesToCusipMap = results.designateValue;
                    if (results.securitySearchItems.length <= this.selectedSecurities.size) {
                        this.portNMVEmitter.emit(SecurityUtils.calculateNav(this.selectedSecurities, this.designateValuesToCusipMap));
                    }
                });
        }
        this.isCalculateNAVDisabled = true;
        this.isCalculateNAVDisabledChange.emit(this.isCalculateNAVDisabled);
    }

    private setSecurityInformation(item: Security, security: Security) {
        if (isNil(security)) {
            return;
        }
        item.error = undefined;
        item.addToPortfolio = security.addToPortfolio;
        item.newValue = security.newValue;
        item.alpha = security.alpha;
        item.riskContributionPercentage = security.riskContributionPercentage;
        item.currentValue = this.modellingType === ModellingType.POSITION && !this.isCustomPortfolio ?
            this.fetchCurrentValueForColumn(
                this.currentPortfolio.composition.data,
                item.cusip,
                this.currentPortfolio.composition.columns,
                this.addToPortfolio,
                this.addToPortfolio === this.currentPortfolio.portName,
                this.portNameLevelInBrkdn
            )(
                this.selectedModelingColumn.columnTag,
                false
            ) : security.currentValue;
        const key = !isNil(security.addToPortfolio) ? this.getKeyForSelectedSecurity(item, security.addToPortfolio) : item.cusip;
        this.selectedSecurities.set(key, item);
    }

    /**
     * get the key for the selected security that would be a combination of cusip and the portfolio
     * to which we ae adding the security
     */
    private getKeyForSelectedSecurity(security: Security, addToPortfolio?: string): string {
        return !isEmpty(security.addToPortfolio) ? security.cusip + CommonConstants.COLON + (addToPortfolio || security.addToPortfolio) : security.cusip;
    }

    /**
     * one-liner function to loop over search items and add them to the grid
     */
    addAllPortItemsToGrid: (...arg) => void = (searchItems: Set<PortfolioSearchItem | IndexSearchTreeItem | AdhocPortParams>) => searchItems.forEach(item => this.addPortfolioToTable(item));
}
