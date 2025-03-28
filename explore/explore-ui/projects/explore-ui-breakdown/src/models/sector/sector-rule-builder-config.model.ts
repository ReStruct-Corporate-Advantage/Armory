import {SectorConstants} from '../../constants/sector.constants';
import {BreakdownTreeNode} from '../breakdown/breakdown-tree-node.model';
import {ColumnSelectorOption} from '@blk/explore-ui-column-option';

/**
 * Model class to set configuration for creating custom sector
 */
export class SectorRuleBuilderConfig {
    columns: Array<ColumnSelectorOption>;
    sectorNode: BreakdownTreeNode;
    islookThroughRule: boolean;
    showFundSectoringTabs: boolean;
    breakdownTree: BreakdownTreeNode;
    header: string;
    addRule: Function;
    refreshBreakdownTreeCallback: Function;
    createNewCustomSector: Function;
    updateLookThroughView: Function; // callback function to update the lookthrough view on rule change

    constructor(columns: Array<ColumnSelectorOption>,
                sectorNode: BreakdownTreeNode, islookThroughRule: boolean = false,
                showFundSectoringTabs: boolean = false, header?: string, breakdownTree?: BreakdownTreeNode, updateLookThroughView?: Function) {
        this.columns = columns;
        this.sectorNode = sectorNode;
        this.islookThroughRule = islookThroughRule;
        this.showFundSectoringTabs = showFundSectoringTabs;
        this.breakdownTree = breakdownTree;
        this.header = header ? header : islookThroughRule ?
            SectorConstants.CUSTOM_RULE_BUILDER_HEADERS.LOOK_THROUGH_RULE : SectorConstants.CUSTOM_RULE_BUILDER_HEADERS.SECTOR_RULE;
        this.updateLookThroughView = updateLookThroughView;
    }

}
