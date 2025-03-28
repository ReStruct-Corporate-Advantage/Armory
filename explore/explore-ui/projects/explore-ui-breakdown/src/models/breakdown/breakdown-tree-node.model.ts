import {AuxAdvancedTreeListInterface, AuxContextMenuInterface} from '@blk/aladdin-angular-components';
import {Sector} from '../../interfaces/sector.interface';
import {ColumnSector} from '../sector/column-sector/column-sector.model';
import {isNil, isUndefined, without} from 'lodash';
import {BreakdownConstants} from '../../constants/breakdown.constants';
import {LinkedFavoriteSector} from '../sector/linked-favorite-sector.model';
import {CustomSector} from '../sector/custom-sector/custom-sector.model';

export class BreakdownTreeNode implements AuxAdvancedTreeListInterface {
    static readonly TYPE_ROOT = 'root';
    static readonly TYPE_PLACEHOLDER = 'placeholder';

    label: string;
    uid?: string;
    children?: BreakdownTreeNode[];
    isDeletable?: boolean;
    isSelected?: boolean;
    isExpanded?: boolean;
    sectorModel: Sector;
    parent: BreakdownTreeNode;
    type: string;
    contextMenu?: AuxContextMenuInterface[];

    /**
     * Check if breakdown is an empty object or not.
     */
    isEmpty(): boolean {
        return !this.children || this.children.length < 1;
    }

    /**
     * get the breakdown tree node with label provided, it could be this node or it's child node
     * @param label
     */
    getCustomSectorNodeWithLabel(label: string): BreakdownTreeNode {
        if (this.isCustomSectorNode() && this.label === label) {
            return this;
        } else if (!isUndefined(this.children) && this.children.length > 0) {
            for (const childNode of this.children) {
                const nodeFound = childNode.getCustomSectorNodeWithLabel(label);
                if (!isUndefined(nodeFound)) {
                    return nodeFound;
                }
            }
        }
        return undefined;
    }

    /**
     * Returns true if any of the sector's children are column sectors
     */
    hasColumnSectorChild(): boolean {
        if (this.isEmpty()) {
            return false;
        }
        return this.children.some((child: BreakdownTreeNode) => {
            return child.sectorModel instanceof ColumnSector;
        });
    }

    /**
     * Removes the child nodes from the wrapper class as well as the sector model
     */
    removeChildren(): void {
        this.children = [];
        this.sectorModel.children = [];
    }

    /**
     * Method to enable context menus for breakdown tree nodes
     * @param enablePaste
     * @param enableRecursively
     */
    enableContextMenu(enablePaste: boolean = false, enableRecursively: boolean = false) {
        // placeholder breakdowns are only a single node so they should not have copy/paste
        if (this.type === BreakdownTreeNode.TYPE_PLACEHOLDER) {
            this.contextMenu = [
                {label: BreakdownConstants.BREAKDOWN_TREE_CONTEXT_MENU_LABELS.DELETE_NODE}
            ];
            return;
        }

        if (this.type !== BreakdownTreeNode.TYPE_ROOT) {
            this.contextMenu = [
                {label: BreakdownConstants.BREAKDOWN_TREE_CONTEXT_MENU_LABELS.DELETE_NODE},
                {label: BreakdownConstants.BREAKDOWN_TREE_CONTEXT_MENU_LABELS.DELETE_NODE_AND_CHILD},
                {label: BreakdownConstants.BREAKDOWN_TREE_CONTEXT_MENU_LABELS.COPY_NODE},
                {label: BreakdownConstants.BREAKDOWN_TREE_CONTEXT_MENU_LABELS.COPY_NODE_AND_CHILD},
                {label: BreakdownConstants.BREAKDOWN_TREE_CONTEXT_MENU_LABELS.PASTE, isDisabled: !enablePaste}
            ];
        } else {
            this.contextMenu = [
                {label: BreakdownConstants.BREAKDOWN_TREE_CONTEXT_MENU_LABELS.PASTE, isDisabled: !enablePaste}
            ];
        }
        if (enableRecursively) {
            if (!isNil(this.children) && this.children.length > 0) {
                this.children.forEach((childNode: BreakdownTreeNode) => childNode.enableContextMenu(enablePaste, enableRecursively));
            }
        }
    }

    isCustomSectorNode(): boolean {
        return this.sectorModel
            && this.sectorModel instanceof LinkedFavoriteSector
            && this.sectorModel.sector instanceof CustomSector;
    }

    getCustomSector(): CustomSector {
        if (this.isCustomSectorNode()) {
            return (this.sectorModel as LinkedFavoriteSector).sector as CustomSector;
        }
        return undefined;
    }

    /**
     * Remove the node from the wrapper class as well as update the sector model
     */
    removeChild(node: BreakdownTreeNode): void {
        // Simply remove the node from the children
        this.children = without(this.children, node);
        this.sectorModel.children = [];
        // We could also do a without, but using an each on the remaining children saves an iteration
        // Add back the child sector models to the parent sector model to maintain parity
        this.children.forEach((childNode: BreakdownTreeNode) => {
            this.sectorModel.children.push(childNode.sectorModel);
        });
        // For linkedFavoriteSector we have to update children of underlying sector as well.
        if (this.sectorModel instanceof LinkedFavoriteSector && this.sectorModel.sector) {
            const underlyingSector = this.sectorModel.sector;
            underlyingSector.children = [];
            this.sectorModel.children.forEach((sector: Sector) => {
                underlyingSector.children.push(sector);
            });
        }
    }

    /**
     * Checks if the breakdown has more than one level in it.
     */
    isMultiLevel(): boolean {
        // Can't be multi level if it is empty.
        if (this.isEmpty()) {
            return false;
        }

        // Go through the children and make sure that they all have no children.
        return !this.children.every((child: BreakdownTreeNode) => {
            return !child.children || child.children.length === 0;
        });
    }
}
