import {Widget} from '@models/widget/widget.model';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {WorkspaceStore} from '@stores/workspace.store';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {CoreRiskConstants, RiskSettings} from '@blk/explore-ui-risk';
import {cloneDeep} from 'lodash';
import {GetContextMenuItemsParams} from 'ag-grid-community';
import {ColumnConfig, WidgetConfigType} from '@blk/explore-ui-core';
import {PortfolioOverrideInput} from '@models/widget/inputs/portfolio-override-input.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {FundCusip} from '@models/widget/inputs/fund-cusip.model';
import {
    AbstractPgsChartSpriteletLauncherService
} from '@services/spritelet-launcher/abstract-pgs-chart-spritelet-launcher.service';
import {Injectable} from '@angular/core';
@Injectable({
    providedIn: 'root'
})
export abstract class PgsPnlTimeseriesTableSpritletLauncherService extends AbstractPgsChartSpriteletLauncherService {

    abstract isMandatoryColumn(column: ColumnConfig): boolean;

    protected setChildWidgetColumns(_childWidget: Widget, _parentWidget: Widget, _params: any, _isRowBased: boolean) {
        // Do nothing as the columns are already set
    }

    protected getColumns(_columns: ColumnConfig[], _params: any): ColumnConfig[] {
        return [];
    }

    protected doLaunchSpritlet(childWidget: Widget, parentWidget: Widget, event: SpriteletEvent) {
        childWidget.showSettings = false;
        const currentPortfolio = WorkspaceStore.getCurrentPortfolio();

        // Find risk settings
        const callerColumnId = event.params.column.getColId();
        // check if this column exists in widget
        const callerColumn = (parentWidget.dataStore.metaData.inputs.get('columns') as ColumnSet).columns
            .find(col => col.columnKey === callerColumnId);

        const params = event.params as GetContextMenuItemsParams;

        const requestedPort = this.resolveRequestedPort(params, currentPortfolio, parentWidget);

        if (parentWidget.configType === WidgetConfigType.PGS) {
            childWidget.dataStore.metaData.inputs.set(PortfolioOverrideInput.PORTFOLIO_OVERRIDE_INPUT, new PortfolioOverrideInput({portfolio: requestedPort, shortName: '', updateBenchAndCurrency: true}));
        } else if (parentWidget.configType === WidgetConfigType.RISK_EXPOSURE && params.node.level !== 0) {
            // add fundCusip only when launched from RnE and other than top level row
            childWidget.dataStore.metaData.inputs.set(FundCusip.configType, new FundCusip(requestedPort));
        }

        if (callerColumn) {
            const positionColumnType = callerColumn.positionColumnType;
            (childWidget.dataStore.metaData.inputs.get('columns') as ColumnSet).removeColumnIf(col => !this.isMandatoryColumn(col) && col.positionColumnType !== positionColumnType);
        }

        // Find and set risk settings
        let riskSettings: RiskSettings;
        if (callerColumn) {
            riskSettings = callerColumn.optionValues.find(ov => ov instanceof RiskSettings) as RiskSettings;
        } else {
            // It is the action column and in this case create a new Risk settings
            riskSettings = new RiskSettings();
            riskSettings.advancedRiskSettings.name = CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET;
            riskSettings.economyRiskSettings.name = CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET;
            riskSettings.exposureRiskSettings.name = CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET;
            riskSettings.hvarRiskSettings.name = CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET;
            riskSettings.mcvarRiskSettings.name = CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET;
        }
        childWidget.dataStore.metaData.inputs.set(CoreRiskConstants.RISK_SETTINGS, cloneDeep(riskSettings));
    }

    resolveRequestedPortForNonActionCol(params: any, portNameCol: ColumnConfig, _currentPortfolio: Portfolio): string {
        return params.node.data[portNameCol?.columnKey]
            ? params.node.data[portNameCol.columnKey]
            : params.node?.key;
    }

    /**
     * Set customVizConfig for chart widget that gets created
     * @protected
     * @param _node
     * @param _childWidget
     * @param _isSpriteletLaunch
     */
    public setCustomVizConfigSettings(_node: any, _childWidget: Widget, _isSpriteletLaunch: boolean): void {
        // Intentionally kept empty
    }
}
