import {Component, Input, OnInit} from '@angular/core';
import {
    GetRowIdParams,
    GridApi,
    GridOptions,
    GridReadyEvent,
    RowNode,
    RowSelectedEvent,
    IRowNode
} from 'ag-grid-community';
import {BreakdownTreeNode, CustomSector, CustomSectorType, FundSectoringRecordKey, FundSectoringTableRecord, SectorUtils} from '@blk/explore-ui-breakdown';
import {WorkspaceStore} from '../../../../../stores';
import FundSectoringConfig from '../../../../../../assets/fund-sectoring-config/fund-sectoring-config.json';
import {cloneDeep, isUndefined} from 'lodash';
import {FundSectoringService} from '@services/fund-sectoring/fund-sectoring.service';
import {CommonConstants} from '@constants/common.constants';
import {BehaviorSubject, Observable} from 'rxjs';
import {finalize, takeUntil} from 'rxjs/operators';
import {SubscribableComponent} from '@blk/explore-ui-core';

@Component({
    selector: 'app-fund-sectoring-rule-table',
    templateUrl: './fund-sectoring-rule-table.component.html',
    styleUrls: ['./fund-sectoring-rule-table.component.scss']
})
export class FundSectoringRuleTableComponent extends SubscribableComponent implements OnInit {

    @Input()
    customSectorType: CustomSectorType;

    @Input()
    sectorNode: BreakdownTreeNode;

    @Input()
    selectedRecords: Array<FundSectoringRecordKey> = [];

    @Input()
    assignedRecordsMapping: Map<FundSectoringRecordKey, CustomSector[]> = new Map<FundSectoringRecordKey, CustomSector[]>();

    @Input()
    isLoading$: BehaviorSubject<boolean>;

    recordsLoaded: FundSectoringTableRecord[];

    rowData = [];

    gridOptions: GridOptions;

    gridApi: GridApi;

    constructor(private fundSectoringService: FundSectoringService) {
        super();
    }

    ngOnInit() {
        this.initGridOptions();
        this.loadTableData();
    }

    /**
     * Method to load table data
     */
    private loadTableData(): void {
        let tableDataObservable: Observable<Array<FundSectoringTableRecord>>;
        switch (this.customSectorType) {
            case CustomSectorType.PORTFOLIO:
                tableDataObservable = this.fundSectoringService.getPortfolioSectorTableRecords$(WorkspaceStore.getCurrentPortfolio());
                break;
            case CustomSectorType.INDEX:
                tableDataObservable = this.fundSectoringService.getIndexSectorTableRecords$(WorkspaceStore.getCurrentPortfolio());
                break;
            case CustomSectorType.FUND:
                tableDataObservable = this.fundSectoringService.getFundSectorTableRecords$(WorkspaceStore.getCurrentPortfolio());
                break;
        }
        this.isLoading$.next(true);
        tableDataObservable.pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.isLoading$.next(false))).subscribe(
            (tableRecords: FundSectoringTableRecord[]) => {
                this.recordsLoaded = tableRecords;
                this.initTableData(tableRecords);
            }
        );
    }

    /**
     * Method to reinitialize grid data
     */
    refreshTableData() {
        this.initTableData(this.recordsLoaded);
    }


    /**
     * Method to initialize data to be shown in Ag Grid Table
     * @param tableRecords
     */
    private initTableData(tableRecords: FundSectoringTableRecord[]): void {
        const recordsNotListed: Array<FundSectoringTableRecord> = this.getAssignedRecordsNotListed(tableRecords).map((recordKey: FundSectoringRecordKey) => {
            return {nodeName: recordKey.nodeName, cusip: recordKey.cusip, nodePath: [recordKey.nodeName]};
        });
        tableRecords = tableRecords.concat(recordsNotListed);
        tableRecords.forEach((tableRecord: any) => {
            this.setTableRecordFields(tableRecord);
        });
        this.setNestedRecordsSelectableField(tableRecords);
        this.setRowData(tableRecords);
    }

    /**
     * Method to set nested records selectable field
     * @param tableRecords
     */
    private setNestedRecordsSelectableField(tableRecords: FundSectoringTableRecord[]) {
        tableRecords.filter((record: FundSectoringTableRecord) => {
            return !record.isSelectable;
        }).forEach((record: FundSectoringTableRecord) => {
            this.markChildRecordsSelectableField(record);
        });
    }

    /**
     * Method to mark all the nested/child records as non-selectable
     * @param tableRecord
     */
    private markChildRecordsSelectableField(tableRecord: FundSectoringTableRecord) {
        if (tableRecord.childRecords && tableRecord.childRecords.length > 0) {
            tableRecord.childRecords.forEach(
                (childRecord: FundSectoringTableRecord) => {
                    childRecord.isSelectable = tableRecord.isSelectable;
                    this.markChildRecordsSelectableField(childRecord);
                }
            );
        }
    }

    /**
     * Method called when grid row is selected
     * @param row
     */
    private rowSelected(row: IRowNode) {
        const currentRecord: FundSectoringRecordKey = SectorUtils.getRecordKeyFromMap(this.assignedRecordsMapping, row.data.nodeName);
        const customSectors = currentRecord ? this.assignedRecordsMapping.get(currentRecord) : undefined;
        if (customSectors) {
            if (customSectors.length === 0 || customSectors.some(
                customSector => this.isTableRecordSelectable(customSector, this.sectorNode))
            ) {
                this.selectedRecords.push(currentRecord);
                if (!customSectors.includes(this.sectorNode.getCustomSector())) {
                    customSectors.push(this.sectorNode.getCustomSector());
                }
            }
        } else {
            this.selectedRecords.push({nodeName: row.data.nodeName, cusip: row.data.cusip});
            this.assignedRecordsMapping.set({
                nodeName: row.data.nodeName,
                cusip: row.data.cusip
            }, [this.sectorNode.getCustomSector()]);
        }
        this.selectChildren(row);
        this.selectParent(row);
    }

    /**
     * Method called when grid row is deselected
     * @param row
     */
    private rowDeselected(row: IRowNode) {
        const currentRecord: FundSectoringRecordKey = SectorUtils.getRecordKeyFromMap(this.assignedRecordsMapping, row.data.nodeName);
        const customSectors = currentRecord ? this.assignedRecordsMapping.get(currentRecord) : undefined;
        if (customSectors) {
            const customSectorIndex = customSectors.indexOf(this.sectorNode.getCustomSector());
            if (customSectorIndex > -1) {
                customSectors.splice(customSectorIndex, 1);
            }
        }
        const selectedRecordEntry = this.selectedRecords.find((recordKey: FundSectoringRecordKey) => {
            return recordKey.nodeName === row.data.nodeName;
        });
        if (selectedRecordEntry) {
            this.selectedRecords.splice(this.selectedRecords.indexOf(selectedRecordEntry), 1);
        }
        this.deSelectChildren(row);
        this.deselectParent(row);

    }

    /**
     * Method to select all children rows of group node
     * @param row
     */
    private selectChildren(row: IRowNode) {
        row.childrenAfterGroup.forEach((childNode: IRowNode) => {
            if (childNode.data.isSelectable && !childNode.isSelected()) {
                childNode.setSelected(true);
            }
        });
    }

    /**
     * Method to check if children should be deselected  and deselect all children rows of group node
     * @param row
     */
    private deSelectChildren(row: IRowNode) {
        const allowChildrenDeSelect = !row.childrenAfterGroup.some((childNode: IRowNode) => {
            return childNode.selectable && !childNode.isSelected();
        });
        if (!allowChildrenDeSelect) {
            return;
        }
        row.childrenAfterGroup.forEach((childNode: IRowNode) => {
            if (childNode.data.isSelectable && childNode.isSelected()) {
                childNode.setSelected(false);
            }
        });
    }

    /**
     * Method to check if parent should be selected and select parent row of  node
     * @param row
     */
    private selectParent(row: IRowNode) {
        if (isUndefined(row.parent) || row.parent.level < 0) {
            return;
        }
        if (!row.parent.isSelected()) {
            const selectParent = !row.parent.childrenAfterGroup.some((childNode: IRowNode) => {
                return !childNode.isSelected();
            });
            if (selectParent) {
                row.parent.setSelected(true);
            }
        }
    }

    /**
     * Method to check if parent should be deselected and deselect parent row of  node
     * @param row
     */
    private deselectParent(row: IRowNode) {
        if (isUndefined(row.parent) || row.parent.level < 0) {
            return;
        }
        if (row.parent.isSelected()) {
            const deselectParent = row.parent.childrenAfterGroup.some((childNode: IRowNode) => {
                return !childNode.isSelected();
            });
            if (deselectParent) {
                row.parent.setSelected(false);
            }
        }
    }

    /**
     * Set grid fields like isSelected, isSelectable and assignedCustomSectors for provided Record
     * @param tableRecord
     */
    private setTableRecordFields(tableRecord: FundSectoringTableRecord) {
        const recordKey = SectorUtils.getRecordKeyFromMap(this.assignedRecordsMapping, tableRecord.nodeName);
        if (recordKey) {
            const assignedCustomSectors = this.assignedRecordsMapping.get(recordKey);
            if (assignedCustomSectors.indexOf(this.sectorNode.getCustomSector()) > -1) {
                tableRecord.isSelected = true;
            }
            tableRecord.assignedCustomSectors = assignedCustomSectors.filter((customSector: CustomSector) => {
                return customSector !== this.sectorNode.getCustomSector();
            }).map((customSector: CustomSector) => {
                return customSector.getTitle();
            }).join(CommonConstants.COMMA_SEPARATOR);
            tableRecord.isSelectable = assignedCustomSectors.some((customSector: CustomSector) => {
                return this.isTableRecordSelectable(customSector, this.sectorNode);
            });
        } else {
            tableRecord.isSelectable = true;
        }
    }

    /**
     * Method to check if table record can be selected or assigned to current sector
     * @param assignedCustomSector
     * @param currentSectorNode
     */
    private isTableRecordSelectable(assignedCustomSector: CustomSector, currentSectorNode: BreakdownTreeNode) {
        return assignedCustomSector === currentSectorNode.getCustomSector() ||
            (currentSectorNode.parent?.isCustomSectorNode() && this.isTableRecordSelectable(assignedCustomSector, currentSectorNode.parent));
    }

    /**
     * Get list of records that are assigned to any custom sector in breakdown tree but not listed in records loaded like portfolios/ Funds
     * @param listedRecords
     */
    private getAssignedRecordsNotListed(listedRecords: FundSectoringTableRecord[]): FundSectoringRecordKey[] {
        let assignedRecords = Array.from(this.assignedRecordsMapping.keys());
        assignedRecords = assignedRecords.filter((assignedRecord: FundSectoringRecordKey) => {
            return this.assignedRecordsMapping.get(assignedRecord).length !== 0;
        });
        if (isUndefined(listedRecords) || listedRecords.length === 0) {
            return assignedRecords;
        }
        listedRecords.forEach((record: FundSectoringTableRecord) => {
            const index: number = assignedRecords.findIndex(assignedRecord => assignedRecord.nodeName === record.nodeName);
            if (index !== -1) {
                assignedRecords.splice(index, 1);
            }
        });
        return assignedRecords;
    }

    /**
     * Method to set row data for ag grid
     * @param rowData
     */
    private setRowData(rowData: any[]) {
        this.rowData = rowData;
        if (this.gridApi) {
            this.gridApi.updateGridOptions({rowData: this.rowData});
            this.setSelectedNodes();
        }
    }

    /**
     * set selected nodes in ag grid
     */
    private setSelectedNodes() {
        this.gridApi.forEachNode((rowNode: RowNode) => {
            if (rowNode.data.isSelected) {
                rowNode.setSelected(true);
            }
        });
    }

    /**
     * Method to initialize grid options of ag grid
     */
    private initGridOptions(): void {
        const self = this;
        this.gridOptions = cloneDeep(FundSectoringConfig.gridOptions) as GridOptions;
        this.gridOptions.defaultColDef = FundSectoringConfig.defaultColDef;
        this.gridOptions.columnDefs = cloneDeep(FundSectoringConfig.columnDefinitions);
        this.gridOptions.autoGroupColumnDef = cloneDeep(FundSectoringConfig.groupColumnDefinition);
        if (this.customSectorType === CustomSectorType.FUND) {
            this.gridOptions.autoGroupColumnDef.headerName = 'Cusips';
            this.gridOptions.columnDefs.splice(0, 1);
        }
        this.gridOptions.onGridReady = (event: GridReadyEvent) => {
            self.gridApi = event.api;
            setTimeout(() => {
                self.gridApi.sizeColumnsToFit();
            });
            self.setRowData(self.rowData);
        };
        this.gridOptions.getRowId = (params: GetRowIdParams) => params.data.nodeName;

        this.gridOptions.getDataPath = (data: any) => {
            return data.nodePath;
        };
        this.gridOptions.isRowSelectable = (rowNode: RowNode) => {
            return rowNode.data.isSelectable;
        };
        this.gridOptions.onRowSelected = (event: RowSelectedEvent) => {
            if (event.node.isSelected()) {
                this.rowSelected(event.node);
            } else {
                this.rowDeselected(event.node);
            }
        };
    }

}
