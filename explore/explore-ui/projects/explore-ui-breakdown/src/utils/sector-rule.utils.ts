import {cloneDeep} from 'lodash';
import {IRowNode} from 'ag-grid-community';
import {UseType} from '@blk/explore-ui-core';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {CustomSectorRule} from '../models/sector/custom-sector/custom-sector-rule.model';
import {ColumnSectorRule} from '../models/sector/column-sector/column-sector-rule.model';
import {GroupRule} from '../models/sector/group-rule.model';
import {SectorRuleInfo} from '../models/sector/sector-rule-info.model';
import {CustomSectorRuleInfo} from '../models/sector/custom-sector/custom-sector-rule-info.model';
import {CustomSectorType} from '../enums/custom-sector-type.enum';
import {ColumnSector} from '../models/sector/column-sector/column-sector.model';
import {SectorConstants} from '../constants/sector.constants';

export class SectorRuleUtils {
    static createCusipIdentificationInformation(sectorRulesInfo: SectorRuleInfo[], node: IRowNode, widgetColumnSet: ColumnSet): void {
        // Find index of cusip and strategy columns.
        const cusipCol = widgetColumnSet.getColumnBasedOnColTagAndUse(SectorConstants.PNL_CUSIP, UseType.ALL);
        const strategyIdCol = widgetColumnSet.getColumnBasedOnColTagAndUse(SectorConstants.PNL_STRATEGY_ID, UseType.ALL);

        if (cusipCol) {
            const subSector = this.getSubSector('Cusip', 'cusip');
            sectorRulesInfo.push(new SectorRuleInfo(subSector, node.data[cusipCol.columnKey]));
        }
        if (strategyIdCol) {
            const subSector = this.getSubSector('Strategy Id', 'strategy_id');
            sectorRulesInfo.push(new SectorRuleInfo(subSector, node.data[strategyIdCol.columnKey]));
        }
    }

    /**
     * Based on the breakdown and node passed in create sector rules info that identifies the node in the tree
     */
    static createSectorInformation(breakdownTree: any, node: IRowNode, sectorRulesInfo: SectorRuleInfo[]): void {

        // Form breakdown path till portfolio node.
        if (!node.parent || node.parent.level === -1 /* second condition strictly for ag-grid row-nodes */) {
            return;
        }

        // Fetch first sector of breakdown tree.
        let subSector = cloneDeep(breakdownTree.children[0]);
        for (let i = 1; i < node.level; i++) {
            // Go to level on which modification is made.
            // For performance breakdown we show multi level but the breakdown is actually single level
            // Therefore checking that subSector is not undefined ensures that the code will not break
            if (subSector) {
                subSector = cloneDeep(subSector.children[0]);
            }
        }
        let value = node.key;

        // If value is None it means that this was not bucketed and doesn't have any value for this sector.. so pass null instead
        if (value === SectorConstants.NONE) {
            value = null;
        }

        if (subSector && (subSector.sectorRuleType !== SectorConstants.ConfigType.LINKED_FAVORITE_SECTOR)) {
            // TODO: Why remove the child subsectors??
            // If subsector is defined remove child subsectors
            subSector.children = [];
            sectorRulesInfo.push(new SectorRuleInfo(subSector, value));

        } else if (subSector && subSector.sectorRuleType === SectorConstants.ConfigType.LINKED_FAVORITE_SECTOR) {
            if (subSector.sector.sectorRuleType === SectorConstants.ConfigType.CUSTOM_SECTOR) {
                // For custom subsector used custom sector rule.
                sectorRulesInfo.push(new CustomSectorRuleInfo(subSector, value));
            }
            // TODO: Breakdown support?
        }

        // call to populate parent value.
        this.createSectorInformation(breakdownTree, node.parent, sectorRulesInfo);
    }

    /**
     * Method to create the path of a node in the tree based on strategy path breakdown
     */
    static createStrategyPathInformation(node: IRowNode, sectorRulesInfo: SectorRuleInfo[]): void {
        const pathsToParent = [];
        if (!node.group) {
            this.getPathToRoot(node.parent, pathsToParent);
        } else {
            this.getPathToRoot(node, pathsToParent);
        }
        const subSector = this.getSubSector('Strategy Name', 'strategy_name');
        pathsToParent.reverse();
        sectorRulesInfo.push(new SectorRuleInfo(subSector, pathsToParent.join(': ')));
    }

    /**
     * Get path of a node to root in the tree
     */
    static getPathToRoot(node: any, pathsToParent: any): void {
        if (!node.parent) {
            return;
        }
        pathsToParent.push(node.key);
        this.getPathToRoot(node.parent, pathsToParent);
    }

    static getSubSector(columnName: string, columnTag: string, positionColumnType: string = SectorConstants.ALL, useNoneBuckets: boolean = true): ColumnSector {
        const subSector = new ColumnSector();
        subSector.columnName = columnName;
        subSector.columnTag = columnTag;
        subSector.positionColumnType = positionColumnType;
        subSector.useNoneBuckets = useNoneBuckets;
        return subSector;
    }

    /**
     * Checks if the user is working on Portfolio and Index tab
     */
    static isSectoringForPortfolioOrIndex(rule): boolean {
        return rule.customSectorType === CustomSectorType.PORTFOLIO || rule.customSectorType === CustomSectorType.INDEX;
    }

    /**
     * Checks whether the rule is a nested fund sector rule.
     */
    static isNestedFundSectorRule(currentRule: ColumnSectorRule | GroupRule | CustomSectorRule): boolean {
        return currentRule instanceof GroupRule &&
            (((currentRule.subRules[0] as ColumnSectorRule).customSectorType === CustomSectorType.INDEX &&
                (currentRule.subRules[1] as ColumnSectorRule).customSectorType === CustomSectorType.INDEX) ||
                ((currentRule.subRules[0] as ColumnSectorRule).customSectorType === CustomSectorType.PORTFOLIO &&
                    (currentRule.subRules[1] as ColumnSectorRule).customSectorType === CustomSectorType.PORTFOLIO));
    }

    static getSectorPath(node: IRowNode, sectorPath: string[]): string[] {
        if (node.level < 1) {
            return sectorPath;
        }

        sectorPath.unshift(node.key);
        return this.getSectorPath(node.parent, sectorPath);
    }
}
