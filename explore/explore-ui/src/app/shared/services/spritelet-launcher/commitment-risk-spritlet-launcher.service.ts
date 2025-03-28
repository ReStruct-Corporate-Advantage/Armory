import {AbstractSpriteletLauncherService} from '@services/spritelet-launcher/abstract-spritelet-launcher.service';
import {Widget} from '@models/widget/widget.model';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {WidgetConstants} from '@constants/widget.constants';
import {WorkspaceStore} from '../../../stores';
import {Injectable} from '@angular/core';
import {GetContextMenuItemsParams} from 'ag-grid-community';
import {ColumnConstants, TokenConstants, TokenUtils, WidgetConfigType, WidgetInputType} from '@blk/explore-ui-core';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {FundCusip} from '@models/widget/inputs/fund-cusip.model';

/**
 * Spritelet launcher responsible for launching a Commitment risk widget
 */
@Injectable({
    providedIn: 'root'
})
export class CommitmentRiskSpritletLauncherService extends AbstractSpriteletLauncherService {

    /**
     * Method invoked to launch a spritelet
     */
    launchSpritelet(widget: Widget, event: SpriteletEvent): void {
        const report = WorkspaceStore.getCurrentReport();
        const spriteletWidget = TokenUtils.isFeatureEnabled(TokenConstants.ENABLE_COMMITMENT_RISK) ? new Widget(WidgetConfigType.COMMITMENT_RISK_CHART) : new Widget(WidgetConfigType.COMMITMENT_RISK_CHART_LEGACY);
        const params = event.params as GetContextMenuItemsParams;
        const widgetColSet = widget.dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet;
        const cusipColumn = widgetColSet.columns.find((col) => ColumnConstants.CUSIP === col.columnTag);
        let hiddenCusipColumn = null;
        if (!cusipColumn) {
            hiddenCusipColumn = widget.dataStore.data.requestConfig.columns.find(col => (col.isHidden && ColumnConstants.CUSIP === col.columnTag));
        }
        const cusipColumnKey = cusipColumn ? cusipColumn.columnKey : hiddenCusipColumn.columnKey;
        const cusip = params.node.data[cusipColumnKey] ? params.node.data[cusipColumnKey] : params.value;
        spriteletWidget.dataStore.metaData.inputs.set(WidgetInputType.FUND_CUSIP, new FundCusip(cusip));
        this.addSpriteletWidgetToReport(widget, spriteletWidget, report);
    }

    /**
     * Unique action key that maps to a particular spritelet launcher service
     */
    getSpriteletActionKey(): string {
        return WidgetConstants.COMMITMENT_RISK_SPRITELET.ACTION_KEY;
    }
}
