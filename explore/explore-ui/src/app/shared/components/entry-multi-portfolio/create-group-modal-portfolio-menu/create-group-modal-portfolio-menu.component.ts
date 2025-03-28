import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {forkJoin, Observable, of, BehaviorSubject} from 'rxjs';
import {catchError, map, switchMap, tap} from 'rxjs/operators';
import {cloneDeep, isNil} from 'lodash';
import {
    AuxSelectOption,
    AuxSelectSelectionChangedDetailInterface,
    AuxTextInput,
    AuxTextInputValueChangedDetailInterface,
} from '@blk/aladdin-angular-components';
import {ExplorePortfolioSearchService, NotificationService, PortfolioService, WorkpadService} from '@services/index';
import {WorkspaceStore} from '@stores/index';
import {WorkspaceUtils} from '@utils/index';
import {ReportGroup} from '@models/workspace/report-group.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Report} from '@models/workspace/report.model';
import {PortfolioSearchItem} from '@blk/explore-ui-portfolio-search';
import {IndexSearchTreeItem} from '@models/portfolio/index-search-tree-item.model';
import {AdhocPortParams} from '@models/portfolio/adhocModelling/adhoc-port-params.model';
import {AlertConstants, CalendarDateUtils, ExploreDialogParam, ExploreSelectOption, ExploreSelectOptionGroup, ExploreCheckbox
} from '@blk/explore-ui-core';
import {PortfolioType, PortfolioTypeEnumUtils} from '../../add-portfolio-modal/portfolio-type.enum';
import {AddCustomPortfolioComponent} from '../../add-portfolio-modal/add-custom-portfolio/add-custom-portfolio.component';
import {ComparisonConfig} from '@models/config/comparison-config.model';
import { CommonConstants } from '@constants/common.constants';
import { AddPortfolioModalComponent } from '../../add-portfolio-modal/add-portfolio-modal.component';
import { AddPortfolioService } from '../../add-portfolio-modal/add-portfolio.service';
import { ExploreConstants } from '@constants/explore.constants';

@Component({
    selector: 'app-create-group-modal-portfolio-menu',
    templateUrl: './create-group-modal-portfolio-menu.component.html',
    styleUrls: ['./create-group-modal-portfolio-menu.component.scss']
})
export class CreateGroupModalPortfolioMenuComponent extends AddPortfolioModalComponent implements OnInit {
    @ViewChild('editTextInput', {static: false}) editText: AuxTextInput;
    // variables to control modal open/close event
    @Output() modalClosed = new EventEmitter();
    @Output() addReportGroupButtonClicked = new EventEmitter<boolean>();
    @Input() isOpen: boolean;
    @Input() portfolioType = PortfolioType.PORTFOLIO;
    @Input() reportGroup: ReportGroup;
    @Input() loadFavActionCallback: (...arg) => void;
    @Input() onAddCallback: (...arg) => void;
    // Reference to the custom portfolio element
    @ViewChild('customPortfolio', {static: false}) customPortfolio: AddCustomPortfolioComponent;

    constructor(
        public portfolioSearchService: ExplorePortfolioSearchService,
        protected portfolioService: PortfolioService,
        protected addPortfolioService: AddPortfolioService,
        protected workpadService: WorkpadService,
        protected notificationService: NotificationService
    ) {
        super(portfolioSearchService, portfolioService, addPortfolioService, workpadService, notificationService);
    }

    readonly reportGrpBtnLabel = CommonConstants.BUTTON_TEXT.REPORT_GROUP;

    portfolioTypeEnum = PortfolioType;
    modalTitle: string;

    checkedReportGroupList: ReportGroup[];
    groupName: string = '';

    // report group currently being edited
    editingReportGroup: ReportGroup;

    // The comparison configuration for the current report.
    comparisonConfig: ComparisonConfig;

    // Flag used to control enabling the anchor setting.
    isComparisonListEmpty$ = new BehaviorSubject(true);
    isComparisonEnabled = false;
    isEditMode: boolean;

    // list of selected portfolios
    selectedPortfolioTickers: Set<PortfolioSearchItem|IndexSearchTreeItem|AdhocPortParams>;

    // all report groups in the workspace
    reportGroupList: ReportGroup[];

    // Variables used to bind the checkbox/dropdown selection items.
    anchorOptions: ExploreSelectOptionGroup[];
    readonly NONE_ANCHOR_OPTION_LABEL = 'None';
    
    allPortfolios: Portfolio[];
    comparisonStackedData: ExploreCheckbox[];

  

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        super.ngOnInit();
        this.reportGroupList = [];
        this.selectedPortfolioTickers = new Set<PortfolioSearchItem|IndexSearchTreeItem|AdhocPortParams>();
        this.modalTitle = PortfolioTypeEnumUtils.displayName(this.portfolioType);
        this.allPortfolios = [];
        // construct anchorStackedData based on comparisonConfig
        this.anchorOptions = [new ExploreSelectOptionGroup()];
        this.anchorOptions[0].values.push(new ExploreSelectOption(this.NONE_ANCHOR_OPTION_LABEL, this.NONE_ANCHOR_OPTION_LABEL, true));

    }

    /**
     * Event when the anchor portfolio is changed.
     */
    setSelectedAnchorValue(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        // Update the selected item.
        this.anchorOptions[0].values.forEach(item => item.isSelected = item.value === (event.detail.value as AuxSelectOption).value);
    }

    /**
     * Event when the search input is changed.
    */
    onSearchInputChanged(searchTerm: string): void {
        this.isComparisonEnabled = true;
        const portfolioSearchItem = new PortfolioSearchItem(searchTerm);
        const portfolio: Portfolio = PortfolioService.getPortfolioObject(portfolioSearchItem, CalendarDateUtils.getDefaultDateObject(), portfolioSearchItem instanceof IndexSearchTreeItem);
        this.anchorOptions[0].values.push(new ExploreSelectOption(portfolio.portName, portfolio.portId, false, false, portfolio.portId));
        this.allPortfolios.push(portfolio);
        this.selectedPortfolioTickers.add(portfolioSearchItem);
      }


    /**
     * Event when a portfolio is removed from the list of selected portfolios.
    */
    onPortfolioRemoved(portfolio: PortfolioSearchItem): void {
        // Clone the current anchorOptions values
        const clonedAnchorOptionsValues = cloneDeep(this.anchorOptions[0].values);
        // Filter out the portfolio to be removed from the cloned values
        const updatedAnchorOptionsValues = clonedAnchorOptionsValues.filter(option => option.displayValue !== portfolio.ticker);
        this.anchorOptions = [new ExploreSelectOptionGroup()];
        // Reset and repopulate the anchorOptions with the updated values
        this.anchorOptions[0].values = updatedAnchorOptionsValues;
        this.allPortfolios = this.allPortfolios.filter(p => p.portId !== portfolio.id);

        for (let item of this.selectedPortfolioTickers) {
            if (item instanceof AdhocPortParams) {
                continue;
            }
            if (item.ticker === portfolio.ticker) {
                this.selectedPortfolioTickers.delete(item);
                break; // Exit the loop once the item is found and deleted
            }
        }
    }

    /**
     * Event when all portfolios are removed from the list of selected portfolios.
    */
    onAllPortfolioRemoved(): void {
        this.anchorOptions = [new ExploreSelectOptionGroup()];
        this.selectedPortfolioTickers.clear();
        this.anchorOptions[0].values.push(new ExploreSelectOption(this.NONE_ANCHOR_OPTION_LABEL, this.NONE_ANCHOR_OPTION_LABEL, true));

    }


    /**
     * Add existing portfolios to workspace
     */
    addExistingPortfoliosToWorkspace(): Observable<boolean> {
        // Rename the workpad's report groups if their names have changed or create the report group if it's new
        const workpadReportGroups: ReportGroup[] = WorkspaceStore.getWorkspace().getReportGroups();
        this.reportGroupList.forEach(modalRG => {
            const found = workpadReportGroups.find(rpg => rpg.id === modalRG.id);
            if (found) {
                if (modalRG.title !== found.title) {
                    found.title = modalRG.title;
                }
            } else {
                const reportTitle = WorkspaceUtils.getNewReportTitle(modalRG.reports);
                modalRG.reports.push(new Report(reportTitle));
                WorkspaceStore.getWorkspace().addWorkpads(modalRG);
            }
        });

        // Get all the portfolio information.
        const observableQueue: Observable<any>[] = [];
        if (this.portfolioType !== PortfolioType.CUSTOM) {
            this.selectedPortfolioTickers.forEach(portItem => {
                // determine if it's a custom portfolio
                if (!(portItem instanceof AdhocPortParams)) {
                    observableQueue.push(
                        this.portfolioService.fetchPortfolioInformation$(

                            PortfolioService.getPortfolioObject(portItem, CalendarDateUtils.getDefaultDateObject(), portItem instanceof IndexSearchTreeItem),
                            { isLightVersion: true, includeMandate: true }
                        ).pipe(
                            tap(result => {
                                console.log('Fetched portfolio information:', result);
                            }),
                            catchError(error => {
                                this.notificationService.openDialog(
                                    new ExploreDialogParam(
                                        AlertConstants.TYPE.ALERT,
                                        AlertConstants.HEADER.PORT_INFO_MISSING,
                                        AlertConstants.BODY.PORT_INFO_MISSING,
                                        AlertConstants.BTN.OK
                                    )
                                );
                                return of(error);
                            })
                        )
                    );
                }
            });
        } else {
            observableQueue.push(
                this.customPortfolio.addCustomPortfolioToSelectedPortfolioList()
            );
        }
        return forkJoin(observableQueue).pipe(
            map((ports: any[]) => {
                return ports.filter((port: any) => port instanceof Portfolio);
            }),
            // For each portfolio returned, add it to the selected report groups or give each it's own workpad.
            switchMap((ports: Portfolio[]) => {
                if (ports?.length) {
                    this.addPortfoliosToWorkpads(ports);
                    WorkspaceStore.workspace$.next(WorkspaceStore.getWorkspace());
                    this.closeModal();
                    return of(true);
                }}),
            catchError((error) => {
                return of(false);
            })
        );
    }

    addPortfoliosToWorkpads(ports: Portfolio[]) {
        if (this.reportGroup) {
            this.reportGroup.addPortfolios(ports);
            WorkspaceStore.updateCurrentWorkpad(this.reportGroup);
        } else if (this.addPortfolioService.reportGroupList.length !== 0) {
            const workpadReportGroups = WorkspaceStore.getWorkspace().getReportGroups();
            this.addPortfolioService.reportGroupList.forEach((reportGroup, index) => {
                const found = workpadReportGroups.find(rpg => rpg.id === reportGroup.id);
                // It should always be found since report groups that don't exist in the workpad should be added above
                if (found) {
                    found.addPortfolios(ports);
                    // set the first workpad as the currentWorkpad
                    if (index === 0) {
                        WorkspaceStore.updateCurrentWorkpad(found);
                    }
                }
            });
        } else {
            ports.forEach((port, index) => {
                this.createWorkpadForAddedPortfolio(port, index);
            });
        }
        if (isNil(this.comparisonConfig)) {
            this.comparisonConfig = new ComparisonConfig();
        }
        //add ports to comparisonConfig.portComparisonList
        ports.forEach(port => {
            this.comparisonConfig.portComparisonList.push(port.portId);
        });
        // Set the selected anchor.
        // We should only check this if the user has actually selected some things to compare.
        const selectedAnchor = this.anchorOptions[0].values.find(obj => obj.isSelected);
        if (selectedAnchor) {
            // Map the displayValue of the selected anchor to one of the ports in portComparisonList
            const anchorPort = ports.find(port => port.portName === selectedAnchor.displayValue);
            this.comparisonConfig.portAnchorId = anchorPort ? anchorPort.portId : undefined;
        } else {
            this.comparisonConfig.portAnchorId = undefined;
        }
        WorkspaceStore.getCurrentWorkpad().comparisonConfigMap.set(WorkspaceStore.getCurrentReport().comparisonConfigId, this.comparisonConfig);
        WorkspaceStore.validateWorkpadAndUpdate(this.reportGroup, null, null, null, true);

    }

    /**
     * function to be called when Add button is clicked upon
     */
    addReportGroup(): void {
        const newReportGroup = new ReportGroup();
        newReportGroup.isOpen = true;
        this.editingReportGroup = newReportGroup;
        this.reportGroupList.push(newReportGroup);
        this.reportGroup = this.reportGroupList[this.reportGroupList.indexOf(this.editingReportGroup)];
        // Check if groupName is null, empty, or contains only whitespace and set it to NEW_REPORT_GROUP_TITLE if it is
        if (!this.groupName || this.groupName.trim() === '') {
            this.groupName = ExploreConstants.NEW_REPORT_GROUP_TITLE;
        }
        this.reportGroupList[this.reportGroupList.indexOf(this.editingReportGroup)].title = this.groupName;
        this.isOpen = false;
        this.addExistingPortfoliosToWorkspace().subscribe();
    }

    /**
     * function to be called when Add button is clicked upon
     */
    onAddClick(): void {
        if (this.loadFavActionCallback) {
            // In case we pass a favorite action callback, for special cases where we need more control
            this.onAddCallback(this.selectedPortfolioTickers);
            this.closeModal();
        } else {
            // happens generally
            this.addExistingPortfoliosToWorkspace().subscribe();
        }
    }

    /**
     * Callback for Report Group button Add click event
     */
    addReportGroupButtonClickedCallback(isDoneClicked: boolean) {
        this.isOpen = false;
        this.addReportGroupButtonClicked.emit(isDoneClicked);
    }

    /**
     * Handle input change if needed
     */
    onColumnTitleValueChanged(event: CustomEvent<AuxTextInputValueChangedDetailInterface>): void {
        this.groupName = event.detail.value;
    }
}
