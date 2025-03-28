import {Injectable} from '@angular/core';
import {OptimizationColDef} from '@optimization-settings-configuration/models/optimization-col-def';
import {ColDef} from 'ag-grid-community';
import {AuxGridColumnType} from '@blk/aladdin-angular-components';

@Injectable({
    providedIn: 'root'
})
export class OptimizationGridService {
    processColumns(columns: OptimizationColDef[]): ColDef[] {
        return columns.map((column: OptimizationColDef) => this.transformColumn(column));
    }

    private transformColumn(column: OptimizationColDef): ColDef {
        const newColumn = {
            ...column,
            suppressHeaderMenuButton: true,
            suppressFilter: true,
        };
        if (newColumn.type === AuxGridColumnType.AUX_CHECKBOX_COLUMN) {
            newColumn.type = AuxGridColumnType.AUX_TEXT_COLUMN;
            newColumn.filter = 'auxTextFilter';
        }
        return newColumn;
    }
}
