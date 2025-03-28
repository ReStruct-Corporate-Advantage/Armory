import {Injectable} from '@angular/core';
import {ColumnConfig, WidgetConfigType, WidgetInputType} from '@blk/explore-ui-core';
import {WidgetConstants} from '@constants/widget.constants';
import {
    PgsPnlTimeseriesTableSpritletLauncherService
} from '@services/spritelet-launcher/pgs-pnl-timeseries-table-spritlet-launcher.service';
import {Widget} from '@models/widget/widget.model';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {ColumnSet, FactorSettingsColumnOption} from '@blk/explore-ui-column-option';
import {WorkspaceStore} from '@stores/workspace.store';
import {GetContextMenuItemsParams} from 'ag-grid-community';
import {PortfolioOverrideInput} from '@models/widget/inputs/portfolio-override-input.model';
import {CoreRiskConstants, RiskSettings} from "@blk/explore-ui-risk";
import {cloneDeep} from "lodash";
import {
    DiversificationScoreFactorSettings
} from "@models/widget/inputs/chart-settings/diversification-score-factor-settings";

@Injectable({
    providedIn: 'root'
})
export class DiversificationScoreTableSpriteletLauncherService extends PgsPnlTimeseriesTableSpritletLauncherService {

    readonly mandatoryColumnTags = ['date'];

    protected getChildConfigType(): WidgetConfigType {
        return WidgetConfigType.DIVERSIFICATION_TS;
    }

    protected getColumns(columns: ColumnConfig[], params: any): ColumnConfig[] {
        return [];
    }

    getSpriteletActionKey(): string {
        return WidgetConstants.DIVERSIFICATION_SCORE_TIMESERIES.ACTION_KEY;
    }

    isMandatoryColumn(column: ColumnConfig): boolean {
        return this.mandatoryColumnTags.includes(column.columnTag);
    }

    protected doLaunchSpritlet(childWidget: Widget, parentWidget: Widget, event: SpriteletEvent) {
        const currentPortfolio = WorkspaceStore.getCurrentPortfolio();
        let callerColumnId = event.params.column.getColId();
        const indexOfPipe = callerColumnId.indexOf('|');
        if (indexOfPipe >= 0) {
            // This is a child column we need the parent column
            callerColumnId = callerColumnId.substring(0, indexOfPipe);
        }
        const params = event.params as GetContextMenuItemsParams;
        const requestedPort = this.resolveRequestedPort(params, currentPortfolio, parentWidget);
        childWidget.dataStore.metaData.inputs.set(PortfolioOverrideInput.PORTFOLIO_OVERRIDE_INPUT, new PortfolioOverrideInput({portfolio: requestedPort, shortName: '', updateBenchAndCurrency: true}));
        // check if this column exists in widget
        const callerColumn = (parentWidget.dataStore.metaData.inputs.get('columns') as ColumnSet).columns
            .find(col => col.columnKey === callerColumnId);
        if (callerColumn) {
            // This means the spritelet was launched from a column, let's filter out the columns based on the useType of the caller column
            const positionColumnType = callerColumn.positionColumnType;
            (childWidget.dataStore.metaData.inputs.get('columns') as ColumnSet).removeColumnIf(col => !this.isMandatoryColumn(col) && col.positionColumnType !== positionColumnType);
            for (const ov of callerColumn.optionValues) {
                if (ov instanceof RiskSettings) {
                    childWidget.dataStore.metaData.inputs.set(CoreRiskConstants.RISK_SETTINGS, cloneDeep(ov));
                }
                if (ov instanceof FactorSettingsColumnOption) {
                    const diversificationScoreFactorSettings = new DiversificationScoreFactorSettings(ov.serialize());
                    childWidget.dataStore.metaData.inputs.set(WidgetInputType.DIVERSIFICATION_SCORE_FACTOR_SETTINGS, diversificationScoreFactorSettings);
                }
            }
        }
        childWidget.showSettings = true;
    }
}
