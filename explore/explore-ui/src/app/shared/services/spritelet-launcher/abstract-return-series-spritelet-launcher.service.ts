import {ColumnConstants, UseType} from '@blk/explore-ui-core';
import {AbstractReturnSpriteletLauncherService} from './abstract-return-spritelet-launcher.service';
import {Widget} from '@models/widget/widget.model';
import {ReturnSpriteletInput} from '@models/widget/inputs/return-spritelet-input.model';
import {GetContextMenuItemsParams, GetMainMenuItemsParams, IRowNode} from 'ag-grid-community';
import {Breakdown, SectorRuleInfo, SectorRuleUtils} from '@blk/explore-ui-breakdown';
import {SectorRule} from '@models/portfolio/tradeRules/sector-rule.model';
import {ColumnSet} from '@blk/explore-ui-column-option';

/**
 * Base class for the Return spritelet launch events that are invoked from a Return Analysis widget
 */
export abstract class AbstractReturnSeriesSpriteletLauncherService extends AbstractReturnSpriteletLauncherService {

    /**
     * AbstactReturnSpriteletLauncherService.initializeSpritelet(Widget, GetContextMenuItemsParams | GetMainMenuItemsParams)
     */
    protected initializeSpritelet(spriteletWidget: Widget, params: GetContextMenuItemsParams | GetMainMenuItemsParams): void {
        const contextMenuParams = params as GetContextMenuItemsParams;
        const widgetColumnSet = spriteletWidget.dataStore.metaData.inputs.get('columns') as ColumnSet;
        const spriteletInput = new ReturnSpriteletInput();
        spriteletInput.pnlID = contextMenuParams.node.data[ColumnConstants.PNL_ID];
        const secDesc = contextMenuParams.node.data[widgetColumnSet.getColumnBasedOnColTagAndUse(ColumnConstants.PNL_SEC_DESC, UseType.ALL).columnKey];
        spriteletInput.nodeDesc =  secDesc ? secDesc : contextMenuParams.value;
        spriteletInput.sectorPathRules = this.getSectorRulesForNode(contextMenuParams.node, spriteletWidget.dataStore.parentDataStore.metaData.inputs.get('breakdownTree') as Breakdown, widgetColumnSet);
        spriteletWidget.dataStore.metaData.inputs.set('returnSpriteletInput', spriteletInput);
    }

    /**
     * Set sector rules to identify node in the tree based on node and breakdown passed in
     */
    private getSectorRulesForNode (node: IRowNode, breakdownTree: Breakdown, columnSet: ColumnSet): SectorRule[] {
        const sectorPathRules: SectorRule[] = [];
        const sectorRulesInfo: SectorRuleInfo[] = [];

        // For leaf level add the cusip amd strategy information
        if (!node.group) {
            SectorRuleUtils.createCusipIdentificationInformation(sectorRulesInfo, node, columnSet);
        }
        // If no breakdown is applied then add the strategy path information as that would be used by default when no breakdown is set
        if (!breakdownTree || breakdownTree.isEmpty()) {
            SectorRuleUtils.createStrategyPathInformation(node, sectorRulesInfo);
        } else {
            const nodeToUse =  node.group ? node : node.parent;
            // Extract the sector info based on breakdown applied
            SectorRuleUtils.createSectorInformation(breakdownTree, nodeToUse, sectorRulesInfo);
        }
        const sectorRule: SectorRule = new SectorRule(null, null, sectorRulesInfo);
        sectorPathRules.push(sectorRule);
        return sectorPathRules;
    }
}


