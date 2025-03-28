import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ExportHubTableComponent} from './export-hub-table.component';
import {GridReadyEvent} from 'ag-grid-community';

describe('ExportHubTableComponent', () => {
    let component: ExportHubTableComponent;
    let fixture: ComponentFixture<ExportHubTableComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [ExportHubTableComponent]
        });
        fixture = TestBed.createComponent(ExportHubTableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize commonGridOptions on ngOnInit', () => {
        component.rowData = [{ id: 1, name: 'Test' }];
        component.ngOnInit();
        expect(component.commonGridOptions.headerHeight).toBe(40);
        expect(component.commonGridOptions.rowData).toEqual([{ id: 1, name: 'Test' }]);
    });

    it('should update rowData on ngOnChanges', () => {
        component.gridApi = { updateGridOptions: jest.fn() } as any;
        component.rowData = [{ id: 1, name: 'Test' }];
        component.ngOnChanges({ rowData: { currentValue: component.rowData } } as any);
        expect(component.gridApi.updateGridOptions).toHaveBeenCalledWith({ rowData: [{ id: 1, name: 'Test' }] });
    });

    it('should set gridApi and update grid options on gridReady', () => {
        const mockEvent = {
            api: {
                sizeColumnsToFit: jest.fn(),
                updateGridOptions: jest.fn()
            }
        } as unknown as GridReadyEvent;
        component.rowData = [{ id: 1, name: 'Test' }];
        component['gridReady'](mockEvent);
        expect(component.gridApi).toBe(mockEvent.api);
        expect(mockEvent.api.sizeColumnsToFit).toHaveBeenCalled();
        expect(mockEvent.api.updateGridOptions).toHaveBeenCalledWith({ rowData: [{ id: 1, name: 'Test' }] });
    });
});
