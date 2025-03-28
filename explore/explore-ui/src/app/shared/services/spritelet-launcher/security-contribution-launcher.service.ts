import {Injectable} from '@angular/core';
import {
    ColumnConstants,
    CoreWidgetConfigStore,
    PerformanceSettings,
    WidgetConfigType,
    WidgetInputType
} from '@blk/explore-ui-core';
import {CoreRiskConstants, RiskSettings} from '@blk/explore-ui-risk';
import {WidgetConstants} from '@constants/widget.constants';
import {WidgetDataStoreMetaData} from '@models/dataStore/widget-data-store-meta-data.model';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {FactorBlockInput} from '@models/widget/inputs/factor-block-input.model';
import {Widget} from '@models/widget/widget.model';
import {AbstractSpriteletLauncherService} from '@services/spritelet-launcher/abstract-spritelet-launcher.service';
import {GetContextMenuItemsParams} from 'ag-grid-community';
import {WorkspaceStore} from '../../../stores';
import {ColumnSet} from '@blk/explore-ui-column-option';

/**
 * Launches Security Contribution child spritelet from parent FBA widget
 */
@Injectable({
    providedIn: 'root'
})
export class SecurityContributionLauncherService extends AbstractSpriteletLauncherService {

    /**
     * Action key for spritelet
     */
    getSpriteletActionKey(): string {
        return WidgetConstants.FACTOR_SECURITY_CONTRIBUTION.ACTION_KEY;
    }

    /**
     * Creates security contribution spritelet from parent FBA widget
     * @param widget  Parent FBA widget
     * @param event  Row event from grid
     * @param callbackMethod  Callback for after spritelet is created
     */
    launchSpritelet(widget: Widget, event: SpriteletEvent, callbackMethod?: (any) => void): void {
        const gridParams = event.params as GetContextMenuItemsParams;


        const spriteletWidget = new Widget(WidgetConfigType.FACTOR_SECURITY_CONTRIBUTION);
        spriteletWidget.showSettings = false;
        spriteletWidget.title = this.getWidgetTitle(widget, event);
        // specific fields required for security contribution data request
        const factorBlockInput = new FactorBlockInput();
        factorBlockInput.isBlock = gridParams.node.group;
        factorBlockInput.blockPath = gridParams.node.data['rfv_block_path'];
        spriteletWidget.dataStore.metaData.inputs.set(FactorBlockInput.configType, factorBlockInput);

        // security contributors spritelet is dependent on parent widget for metadata
        spriteletWidget.dataStore.parentDataStore = widget.dataStore;
        spriteletWidget.dataStore.isDependentOnParentForMetaData = true;

        this.setWidgetInputs(spriteletWidget.dataStore.metaData, widget.dataStore.metaData);

        this.addSpriteletWidgetToReport(widget, spriteletWidget, WorkspaceStore.getCurrentReport());
    }

    /**
     * Copy metadata inputs from parent widget to child spritelet
     */
    private setWidgetInputs(spriteletMetaData: WidgetDataStoreMetaData, parentMetaData: WidgetDataStoreMetaData): void {
        this.copyWidgetInput(WidgetInputType.COLUMNS, spriteletMetaData, parentMetaData);
        this.copyWidgetInput(RiskSettings.CONFIG_TYPE, spriteletMetaData, parentMetaData);
        this.copyWidgetInput(PerformanceSettings.CONFIG_TYPE, spriteletMetaData, parentMetaData);
        this.copyWidgetInput(CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN, spriteletMetaData, parentMetaData);
    }

    /**
     * Method to get spritlet widget title
     */
    private getWidgetTitle(widget: Widget, event: SpriteletEvent): string {
        const spriteletWidgetConfig = CoreWidgetConfigStore.getChartConfigForType(WidgetConfigType.FACTOR_SECURITY_CONTRIBUTION);
        const params = event.params as GetContextMenuItemsParams;
        // if it is a group node we can directly get the title from node key
        if (params.node.group === true) {
            return spriteletWidgetConfig.title + ' to ' + params.node.key;
        }
        const widgetColSet = widget.dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet;
        const titleColumn = widgetColSet.columns.find((col) => ColumnConstants.FBA_TITLE === col.columnTag);
        let hiddenTitleColumn = null;
        if (!titleColumn) {
            hiddenTitleColumn = widget.dataStore.data.requestConfig.columns.find(col => (col.isHidden && ColumnConstants.FBA_TITLE === col.columnTag));
        }
        const titleColumnKey = titleColumn ? titleColumn.columnKey : hiddenTitleColumn.columnKey;
        const title = params.node.data[titleColumnKey] ? params.node.data[titleColumnKey] : params.value ;
        return spriteletWidgetConfig.title + ' to ' + title;
    }

}
