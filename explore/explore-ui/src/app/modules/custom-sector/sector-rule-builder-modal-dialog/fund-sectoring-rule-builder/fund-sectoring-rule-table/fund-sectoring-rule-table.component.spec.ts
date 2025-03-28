import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FundSectoringRuleTableComponent} from './fund-sectoring-rule-table.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {FundSectoringService} from '@services/fund-sectoring/fund-sectoring.service';
import {BreakdownTreeNode, CustomSector, CustomSectorType, FundSectoringRecordKey, FundSectoringTableRecord, LinkedFavoriteSector, SectorUtils} from '@blk/explore-ui-breakdown';
import {WorkspaceStore} from '../../../../../stores';
import {BehaviorSubject, of} from 'rxjs';
import {RowNode} from 'ag-grid-community';

describe('FundsTableComponent', () => {
    let component: FundSectoringRuleTableComponent;
    let fixture: ComponentFixture<FundSectoringRuleTableComponent>;

    const fundSectoringServiceStub = {
        getPortfolioSectorTableRecords$: jest.fn(),
        getIndexSectorTableRecords$: jest.fn(),
        getFundSectorTableRecords$: jest.fn()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [FundSectoringRuleTableComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{provide: FundSectoringService, useValue: fundSectoringServiceStub}]
        });

        fixture = TestBed.createComponent(FundSectoringRuleTableComponent);
        component = fixture.componentInstance;
        component.isLoading$ = new BehaviorSubject(false);
        WorkspaceStore.init();
        fundSectoringServiceStub.getFundSectorTableRecords$.mockReturnValue(of([]));
        fundSectoringServiceStub.getIndexSectorTableRecords$.mockReturnValue(of([]));
        fundSectoringServiceStub.getPortfolioSectorTableRecords$.mockReturnValue(of([]));
    });

    it('Test OnInit', () => {
        component.customSectorType = CustomSectorType.PORTFOLIO;
        jest.spyOn(<any>component, 'initTableData').mockReturnValue(null);
        component.ngOnInit();
        expect(component.gridOptions.autoGroupColumnDef.headerName).toEqual('Portfolios');
        expect(component.gridOptions.columnDefs.length).toEqual(3);
        expect(fundSectoringServiceStub.getPortfolioSectorTableRecords$).toHaveBeenCalled();
        component.customSectorType = CustomSectorType.INDEX;
        component.ngOnInit();
        expect(component.gridOptions.columnDefs.length).toEqual(3);
        expect(component.gridOptions.autoGroupColumnDef.headerName).toEqual('Portfolios');
        expect(fundSectoringServiceStub.getIndexSectorTableRecords$).toHaveBeenCalled();
        component.customSectorType = CustomSectorType.FUND;
        component.ngOnInit();
        expect(component.gridOptions.columnDefs.length).toEqual(2);
        expect(component.gridOptions.autoGroupColumnDef.headerName).toEqual('Cusips');
        expect(fundSectoringServiceStub.getFundSectorTableRecords$).toHaveBeenCalled();
        expect(component['initTableData']).toHaveBeenCalledTimes(3);
    });
    it('Test initTableData', () => {
        const customSector = new CustomSector();
        customSector.title = 'Current Custom Sector';
        const topLevelNodeCustomSector = new CustomSector();
        topLevelNodeCustomSector.title = 'Top Level Custom Sector';
        const topLevelNodeCustomSectorNode = new BreakdownTreeNode();
        topLevelNodeCustomSectorNode.sectorModel = new LinkedFavoriteSector();
        (topLevelNodeCustomSectorNode.sectorModel as LinkedFavoriteSector).sector = topLevelNodeCustomSector;
        const parentNodeCustomSector = new CustomSector();
        parentNodeCustomSector.title = 'Parent Custom Sector';
        const parentNode = new BreakdownTreeNode();
        parentNode.sectorModel = new LinkedFavoriteSector();
        (parentNode.sectorModel as LinkedFavoriteSector).sector = parentNodeCustomSector;
        parentNode.parent = topLevelNodeCustomSectorNode;
        const tableData: FundSectoringTableRecord[] = [];
        const recordAsChild = {nodeName: 'PEP child', cusip: 'BRS1234', description: 'PEP Child Test', nodePath: ['PEP', 'PEP child']};
        tableData.push({nodeName: 'CORE-HQ', cusip: 'BRS123', description: 'Core HQ', nodePath: ['CORE-HQ']});
        tableData.push({nodeName: 'PEP', cusip: 'BRS124', description: 'PEP', nodePath: ['PEP'], childRecords: [recordAsChild]});
        tableData.push(recordAsChild);
        tableData.push({nodeName: 'BELSH', cusip: 'BRS125', description: 'BELSH', nodePath: ['BELSH']});
        component.sectorNode = new BreakdownTreeNode();
        component.sectorNode.parent = parentNode;
        component.sectorNode.sectorModel = new LinkedFavoriteSector();
        (component.sectorNode.sectorModel as LinkedFavoriteSector).sector = customSector;
        initializeMapping(component.assignedRecordsMapping, customSector, parentNodeCustomSector);
        component.assignedRecordsMapping.set({nodeName: 'BEN-T', cusip: 'BRS12645'}, [topLevelNodeCustomSector]);
        component['initTableData'](tableData);
        const expectedRowData: FundSectoringTableRecord[] = [];
        expectedRowData.push({
            nodeName: 'CORE-HQ', cusip: 'BRS123', description: 'Core HQ', nodePath: ['CORE-HQ'], isSelected: true,
            isSelectable: true, assignedCustomSectors: 'Parent Custom Sector'
        });
        expectedRowData.push({
            nodeName: 'PEP', cusip: 'BRS124', description: 'PEP', nodePath: ['PEP'], childRecords: [recordAsChild],
            isSelectable: false, assignedCustomSectors: 'Custom Sector 1'
        });
        expectedRowData.push({
            nodeName: 'PEP child', cusip: 'BRS1234', description: 'PEP Child Test', nodePath: ['PEP', 'PEP child'],
            isSelectable: false
        });
        expectedRowData.push({
            nodeName: 'BELSH', cusip: 'BRS125', description: 'BELSH', nodePath: ['BELSH'], isSelected: true,
            isSelectable: true, assignedCustomSectors: ''
        });
        expectedRowData.push({
            nodeName: 'IP', cusip: 'BRS126', nodePath: ['IP'],
            isSelectable: true, assignedCustomSectors: 'Parent Custom Sector'
        });
        expectedRowData.push({
            nodeName: 'BEN', cusip: 'BRS1264', nodePath: ['BEN'],
            isSelectable: false, assignedCustomSectors: 'Custom Sector 2'
        });
        expectedRowData.push({
            nodeName: 'BEN-T', cusip: 'BRS12645', nodePath: ['BEN-T'],
            isSelectable: true, assignedCustomSectors: 'Top Level Custom Sector'
        });
        expect(component.rowData).toEqual(expectedRowData);
    });

    it('Test rowSelected', function () {
        const currentCustomSector = new CustomSector();
        const parentCustomSector = new CustomSector();
        component.sectorNode = new BreakdownTreeNode();
        component.sectorNode.parent = new BreakdownTreeNode();
        component.sectorNode.sectorModel = new LinkedFavoriteSector();
        (component.sectorNode.sectorModel as LinkedFavoriteSector).sector = currentCustomSector;
        component.sectorNode.parent.sectorModel = new LinkedFavoriteSector();
        (component.sectorNode.parent.sectorModel as LinkedFavoriteSector).sector = parentCustomSector;
        const rowNode = createAgGridRow({nodeName: 'PEP', cusip: 'BRS123', isSelected: true});
        const childNode1 = createAgGridRow({nodeName: 'IP', cusip: 'BRS143', isSelected: true, isSelectable: true});
        const childNode2 = createAgGridRow({nodeName: 'BELSH', cusip: 'BRS144', isSelected: false, isSelectable: true});
        const childNode3 = createAgGridRow({nodeName: 'BELSH', cusip: 'BRS144', isSelected: false, isSelectable: false});
        rowNode.childrenAfterGroup = [childNode1, childNode2, childNode3];
        component['rowSelected'](rowNode);
        expect(SectorUtils.getRecordKeyFromMap(component.assignedRecordsMapping, 'PEP')).toBeDefined();
        expect(component.assignedRecordsMapping.get(SectorUtils.getRecordKeyFromMap(component.assignedRecordsMapping, 'PEP')).includes(currentCustomSector)).toBeTruthy();
        component['rowSelected'](rowNode);
        expect(component.assignedRecordsMapping.get(SectorUtils.getRecordKeyFromMap(component.assignedRecordsMapping, 'PEP')).includes(currentCustomSector)).toBeTruthy();
        expect(component.assignedRecordsMapping.get(SectorUtils.getRecordKeyFromMap(component.assignedRecordsMapping, 'PEP')).length).toEqual(1);
        expect(childNode1.setSelected).not.toHaveBeenCalled();
        expect(childNode2.setSelected).toHaveBeenCalled();
        expect(childNode3.setSelected).not.toHaveBeenCalled();
        component.assignedRecordsMapping.clear();
        component.assignedRecordsMapping.set({nodeName: 'PEP', cusip: 'BRS123'}, [parentCustomSector]);
        component['rowSelected'](rowNode);
        expect(component.assignedRecordsMapping.get(SectorUtils.getRecordKeyFromMap(component.assignedRecordsMapping, 'PEP')).includes(currentCustomSector)).toBeTruthy();
        expect(component.assignedRecordsMapping.get(SectorUtils.getRecordKeyFromMap(component.assignedRecordsMapping, 'PEP')).length).toEqual(2);
    });

    it('Test rowDeSelected', function () {
        const currentCustomSector = new CustomSector();
        component.sectorNode = new BreakdownTreeNode();
        component.sectorNode.sectorModel = new LinkedFavoriteSector();
        (component.sectorNode.sectorModel as LinkedFavoriteSector).sector = currentCustomSector;
        const rowNode = createAgGridRow({nodeName: 'PEP', cusip: 'BRS123', isSelected: false});
        rowNode.childrenAfterGroup = [];
        component.assignedRecordsMapping.clear();
        component.assignedRecordsMapping.set({nodeName: 'PEP', cusip: 'BRS123'}, [currentCustomSector]);
        component.selectedRecords = [{nodeName: 'PEP', cusip: 'BRS123'}];
        component['rowDeselected'](rowNode);
        expect(component.assignedRecordsMapping.get(SectorUtils.getRecordKeyFromMap(component.assignedRecordsMapping, 'PEP')).includes(currentCustomSector)).toBeFalsy();
        expect(component.selectedRecords.length === 0).toBeTruthy();
    });

    it('Test deselectChildren', function () {
        const rowNode = createAgGridRow({nodeName: 'CORE', cusip: 'BRS11', isSelected: false, isSelectable: true});
        let childNode1 = createAgGridRow({nodeName: 'IP', cusip: 'BRS143', isSelected: false, isSelectable: false});
        let childNode2 = createAgGridRow({nodeName: 'BELSH', cusip: 'BRS144', isSelected: true, isSelectable: true});
        let childNode3 = createAgGridRow({nodeName: 'BELSH', cusip: 'BRS144', isSelected: true, isSelectable: true});
        rowNode.childrenAfterGroup = [childNode1, childNode2, childNode3];
        // Deselect if all are selected
        component['deSelectChildren'](rowNode);
        expect(childNode1.setSelected).not.toHaveBeenCalled();
        expect(childNode2.setSelected).toHaveBeenCalledWith(false);
        expect(childNode3.setSelected).toHaveBeenCalledWith(false);
        // Don't deselect if any one is deselected
        childNode1 = createAgGridRow({nodeName: 'IP', cusip: 'BRS143', isSelected: false, isSelectable: false});
        childNode2 = createAgGridRow({nodeName: 'BELSH', cusip: 'BRS144', isSelected: true, isSelectable: true});
        childNode3 = createAgGridRow({nodeName: 'BELSH', cusip: 'BRS144', isSelected: false, isSelectable: true});
        rowNode.childrenAfterGroup = [childNode1, childNode2, childNode3];
        component['deSelectChildren'](rowNode);
        expect(childNode1.setSelected).not.toHaveBeenCalled();
        expect(childNode2.setSelected).not.toHaveBeenCalled();
        expect(childNode3.setSelected).not.toHaveBeenCalled();
    });

    it('Test selectParent', function () {
        // Parent undefined
        component['selectParent'](new RowNode());
        // Node is root
        const rowNode = createAgGridRow({nodeName: 'CORE', cusip: 'BRS11', isSelected: true, isSelectable: true});
        let parentNode = createAgGridRow({nodeName: 'CORE', cusip: 'BRS11', isSelected: true, isSelectable: true});
        rowNode.parent = parentNode;
        parentNode.level = -1;
        component['selectParent'](rowNode);
        expect(parentNode.setSelected).not.toHaveBeenCalled();
        parentNode.level = 1;
        // Parent Node is selected
        component['selectParent'](rowNode);
        expect(parentNode.setSelected).not.toHaveBeenCalled();
        // Parent node is not selected but all children are not selected
        parentNode = createAgGridRow({nodeName: 'CORE', cusip: 'BRS11', isSelected: false, isSelectable: true});
        rowNode.parent = parentNode;
        const childNode1 = createAgGridRow({nodeName: 'IP', cusip: 'BRS143', isSelected: true, isSelectable: true});
        let childNode2 = createAgGridRow({nodeName: 'BELSH', cusip: 'BRS144', isSelected: false, isSelectable: true});
        const childNode3 = createAgGridRow({nodeName: 'BELSH', cusip: 'BRS144', isSelected: true, isSelectable: true});
        parentNode.childrenAfterGroup = [childNode1, childNode2, childNode3];
        component['selectParent'](rowNode);
        expect(parentNode.setSelected).not.toHaveBeenCalled();
        // Parent node is not selected and all children are selected
        childNode2 = createAgGridRow({nodeName: 'BELSH', cusip: 'BRS144', isSelected: true, isSelectable: true});
        parentNode.childrenAfterGroup = [childNode1, childNode2, childNode3];
        component['selectParent'](rowNode);
        expect(parentNode.setSelected).toHaveBeenCalledWith(true);
    });

    it('Test deselectParent', function () {
        // Parent undefined
        component['deselectParent'](new RowNode());
        // Node is root
        const rowNode = createAgGridRow({nodeName: 'CORE', cusip: 'BRS11', isSelected: true, isSelectable: true});
        let parentNode = createAgGridRow({nodeName: 'CORE', cusip: 'BRS11', isSelected: false, isSelectable: true});
        rowNode.parent = parentNode;
        parentNode.level = -1;
        component['deselectParent'](rowNode);
        expect(parentNode.setSelected).not.toHaveBeenCalled();
        parentNode.level = 1;
        // Parent Node is deselected
        component['deselectParent'](rowNode);
        expect(parentNode.setSelected).not.toHaveBeenCalled();
        // Parent node is selected and any one children is deselected
        parentNode = createAgGridRow({nodeName: 'CORE', cusip: 'BRS11', isSelected: true, isSelectable: true});
        rowNode.parent = parentNode;
        const childNode1 = createAgGridRow({nodeName: 'IP', cusip: 'BRS143', isSelected: true, isSelectable: true});
        let childNode2 = createAgGridRow({nodeName: 'BELSH', cusip: 'BRS144', isSelected: true, isSelectable: true});
        const childNode3 = createAgGridRow({nodeName: 'BELSH', cusip: 'BRS144', isSelected: false, isSelectable: true});
        parentNode.childrenAfterGroup = [childNode1, childNode2, childNode3];
        component['deselectParent'](rowNode);
        expect(parentNode.setSelected).toHaveBeenCalledWith(false);
    });

});

function initializeMapping(assignedRecordsMapping: Map<FundSectoringRecordKey, CustomSector[]>, currentCustomSector: CustomSector, parentCustomSector: CustomSector): void {
    const customSector1 = new CustomSector();
    customSector1.title = 'Custom Sector 1';
    const customSector2 = new CustomSector();
    customSector2.title = 'Custom Sector 2';
    assignedRecordsMapping.set({nodeName: 'PEP', cusip: 'BRS124'}, [customSector1]);
    assignedRecordsMapping.set({nodeName: 'CORE-HQ', cusip: 'BRS123'}, [parentCustomSector, currentCustomSector]);
    assignedRecordsMapping.set({nodeName: 'BELSH', cusip: 'BRS125'}, [currentCustomSector]);
    assignedRecordsMapping.set({nodeName: 'IP', cusip: 'BRS126'}, [parentCustomSector]);
    assignedRecordsMapping.set({nodeName: 'BEN', cusip: 'BRS1264'}, [customSector2]);
}

function createAgGridRow(rowData: FundSectoringTableRecord): RowNode {
    const rowNode = new RowNode();
    rowNode.data = rowData;
    rowNode.selectable = rowData.isSelectable;
    const isSelectedStub = jest.fn();
    isSelectedStub.mockReturnValue(rowData.isSelected);
    rowNode.isSelected = isSelectedStub;
    rowNode.setSelected = jest.fn();
    return rowNode;
}
