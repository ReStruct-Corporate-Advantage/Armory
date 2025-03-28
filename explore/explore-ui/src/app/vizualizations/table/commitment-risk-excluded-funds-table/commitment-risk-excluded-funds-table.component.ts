import {Component} from '@angular/core';
import {ExploreTableComponent} from '../explore-table/explore-table.component';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {ColDef, ICellRendererParams} from 'ag-grid-community';
import {AuxBadgeStyleEnum, AuxBadgeSizeEnum, AuxBadgeTypeEnum} from '@blk/aladdin-angular-components';

@Component({
    selector: 'app-commitment-risk-excluded-funds-table',
    templateUrl: '../explore-table/explore-table.component.html',
    styleUrls: ['../explore-table/explore-table.component.scss'],
})
export class CommitmentRiskExcludedFundsTableComponent extends ExploreTableComponent {

    private readonly NO_DATA_COLUMN_TAGS = ['acrm_ex_mv', 'acrm_ex_contributions', 'acrm_ex_distributions', 'acrm_ex_risk_exp', 'acrm_ex_vint_year'];

    private readonly APACS_ASSET_TYPE_COLUMN_TAG = 'acrm_ex_asset_type';
    private readonly APACS_ASSET_TYPE_SUPPORTED_COLUMN_TAG = 'acrm_ex_supp_apacs';


    /**
     * Creates column definitions for the table columns
     */
    protected createTableColDefs(widgetPayload: WidgetPayload): ColDef[] {
        const colDefs = super.createTableColDefs(widgetPayload);
        // override the specified column tags with custom cell renderers
        colDefs.forEach(colDef => {
            if (colDef['colTag'] === this.APACS_ASSET_TYPE_COLUMN_TAG) {
                colDef.cellRenderer = this.assetTypeCellRenderer;
            } else if (this.NO_DATA_COLUMN_TAGS.includes(colDef['colTag'])) {
                colDef.cellRenderer = this.noDataCellRenderer;
                // some columns may be numerical, but we should treat them as text to support "No Data"
                colDef.filter = 'agTextColumnFilter';
            }
        });
        return colDefs;
    }

    /**
     * When value is "No Data", adds warning badge in front
     */
    protected noDataCellRenderer = (params: ICellRendererParams) => {
        if (params.value !== 'No Data') {
            return params.formatValue(params.value);
        }
        return this.getBadgeHTML(params.value);
    }

    /**
     * When APACS Asset Type is unsupported based on Yes/No column APACS_ASSET_TYPE_SUPPORTED_COLUMN_TAG, adds a warning badge in front of asset type
     */
    protected assetTypeCellRenderer = (params: ICellRendererParams) => {
        const isSupportedAssetType = params.data[this.APACS_ASSET_TYPE_SUPPORTED_COLUMN_TAG] !== 'No';
        if (isSupportedAssetType) {
            return params.formatValue(params.value);
        }
        return this.getBadgeHTML(params.value);
    }

    private getBadgeHTML(value: string): string {
        return `<div style="display: flex; align-items: center">
                    <aux-badge badge-style="${AuxBadgeStyleEnum.WARNING}" type="${AuxBadgeTypeEnum.ICON}" size="${AuxBadgeSizeEnum.PINPOINT}""></aux-badge>
                    <span style="padding-left: 4px">${value}</span>
                </div>`;
    }
}
