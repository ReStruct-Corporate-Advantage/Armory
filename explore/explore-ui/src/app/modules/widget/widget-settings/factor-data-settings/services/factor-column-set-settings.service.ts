import {FactorColumnSetSettingsServiceInterface} from '@blk/explore-ui-extended-column-option';
import {CalendarDateUtils, ColumnConfig, DateFormatConstants, getWidgetType, WidgetConfigInput, WidgetConfigType, WidgetInput} from '@blk/explore-ui-core';
import {CoreRiskConstants} from '@blk/explore-ui-risk';
import {WidgetConfigFactory} from '../../../../../factories';
import {ColumnUtils} from '@utils/column.utils';
import {WorkspaceStore} from '@stores/workspace.store';
import {Injectable} from '@angular/core';
import {ColDef} from 'ag-grid-community';
import {generateColumn} from '../../../../../vizualizations/table';
import {WidgetUtils} from '@utils/widget.utils';
import {cloneDeep} from 'lodash';
import {DataRequestConstants} from '@constants/data-request.constants';

@Injectable({
    providedIn: 'root'
})
/**
 * This service implements the app level methods for the interface FactorColumnSetSettingsServiceInterface for factor-column-set-settings.component.ts
 */
export class FactorColumnSetSettingsService implements FactorColumnSetSettingsServiceInterface {

    getWidgetConfigInputForBreakdown(): WidgetConfigInput {
        return cloneDeep(WidgetConfigFactory.getInputsForWidgetConfigByName(WidgetConfigType.FACTOR_DATA, CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN));
    }

    updateColumnWithDerivedSettings(column: ColumnConfig, inputs: Map<string, WidgetInput>): void {
        ColumnUtils.updateColumnWithWidgetAndPortfolioSettings(column, WorkspaceStore.getCurrentPortfolio(), inputs, WidgetConfigType.FACTOR_DATA);
        ColumnUtils.updateFxFactorColumn(column, WorkspaceStore.getCurrentPortfolio());
    }

    createSpecifiedShocksRequest(isCreateNewScenarioFlow: boolean): any {
        const requestParams: any = {};
        const widgetConfigInputForBreakdown = this.getWidgetConfigInputForBreakdown();
        requestParams[CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN] = JSON.stringify(widgetConfigInputForBreakdown.default);

        if (isCreateNewScenarioFlow) {
            return requestParams;
        }

        WorkspaceStore.getCurrentPortfolio().addRequestParams(requestParams);

        requestParams.type = getWidgetType(WidgetConfigType.PRA);
        requestParams.dataFormat = DataRequestConstants.DATA_FORMAT.COMPACT_JSON;
        requestParams.isPortGroupSummaryRequest = false;
        requestParams.todayDate = CalendarDateUtils.getDateInFormat(CalendarDateUtils.checkOverrideAndGetToday(), DateFormatConstants.MMDDYYYY_SLASH);
        return requestParams;
    }

    createAuxGridColDefs(columns: ColumnConfig[], columnHeaderDetails?: any): ColDef[] {
        return columns.map(column => {
            const vizColumnConfig = WidgetUtils.createVizColumn({
                column,
                isHidden: false,
                columnKey: undefined,
                splitColumnKeys: undefined,
                configType: undefined,
                response: undefined,
                columnHeaderDetails
            });
            return generateColumn(vizColumnConfig);
        });
    }

    getSpecifiedScenarioDataUrl(isCreateNewScenarioFlow: boolean): string {
        return isCreateNewScenarioFlow ? DataRequestConstants.DATA_REQUEST_URL.FACTOR_TREE_DATA : DataRequestConstants.DATA_REQUEST_URL.RISK_DATA;
    }

}
