import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {AuxGridFontSize, AuxGridOptions, AuxGridPaddingSize} from '@blk/aladdin-angular-components';
import {GridApi, GridReadyEvent} from 'ag-grid-community';

@Component({
    selector: 'export-hub-table',
    templateUrl: './export-hub-table.component.html',
})
export class ExportHubTableComponent implements OnInit, OnChanges {

    gridApi: GridApi;
    @Input() gridOptions: AuxGridOptions = {};
    @Input() rowData: any[];
    @Input() fontSize: AuxGridFontSize = 'normal';
    @Input() paddingSize : AuxGridPaddingSize = 'normal';

    commonGridOptions: AuxGridOptions;

    ngOnInit(): void {
        this.commonGridOptions = {
            onGridReady: this.gridReady,
            defaultColDef: {
                floatingFilter: false,
                flex: 1,
            },
            ensureDomOrder: true,
            domLayout: 'normal',
            headerHeight: 40,
            ...this.gridOptions,
            rowData: this.rowData
        };
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.rowData) {
            this.gridApi?.updateGridOptions({rowData: this.rowData});
        }
    }

    /**
     * Ag grid event
     */
    private gridReady = (event: GridReadyEvent): void => {
        this.gridApi = event.api;
        this.gridApi.sizeColumnsToFit();
        this.gridApi.updateGridOptions({rowData: this.rowData});
    };
}
