import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges
} from '@angular/core';
import {
    Breakdown,
    BreakdownBuilderSettings,
    BreakdownConstants,
    BreakdownFavoriteConstants,
    BreakdownSectorSelectorOption,
    BreakdownSectorSelectorOptionType,
    BreakdownTreeNode,
    ColumnSector,
    ColumnSectorRule,
    ColumnSectorUtils,
    CustomSector,
    GroupRule,
    LinkedFavoriteSector,
    SchemaSector,
    SectorConstants
} from '@blk/explore-ui-breakdown';
import {BreakdownUtils} from '@utils/breakdown.utils';
import {filter, takeUntil} from 'rxjs/operators';
import {FavoriteService, NotificationService} from '../../../../shared/services';
import {cloneDeep, isEmpty, isNull, isUndefined} from 'lodash';
import {AppStore} from '../../../../app.store';
import {CommonConstants} from '../../../../constants';
import {
    AlertConstants,
    ColumnConstants,
    ColumnDefinition,
    CoreColumnUtils,
    CoreDefinitionStore,
    CoreFavoriteConstants,
    CoreFavoriteUtils,
    ErrorTypeConstants,
    ExploreDialogParam,
    SubscribableComponent,
    UIErrorParameters,
    UseType
} from '@blk/explore-ui-core';
import {FavoriteCallback, LoadFavoriteAction} from '@models/favorite/load-favorite-action.model';
import {GpBreakdownColumnDefinition} from '@models/definitions/column-definitions/gp-breakdown-column-definition.model';
import {BehaviorSubject} from 'rxjs';
import {
    AuxAdvancedTreeListConfig,
    AuxAdvancedTreeListContextMenuClickedDetailInterface,
    AuxAdvancedTreeListDragEnterDetailInterface,
    AuxAdvancedTreeListDropDetailInterface,
    AuxAdvancedTreeListInterface,
    AuxAdvancedTreeListItemDoubleClickedDetailInterface,
    AuxAdvancedTreeListRemoveItemClickedDetailInterface,
    AuxAdvancedTreeListSelectionChangedDetailInterface,
    AuxCheckboxChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {NotificationConstants} from '@constants/notification.constants';
import {FavoriteConstants} from '@constants/favorite.constants';

/**
 * Component to view/edit Breakdown Tree
 */
@Component({
    selector: 'app-breakdown-tree',
    templateUrl: './breakdown-tree.component.html',
    styleUrls: ['./breakdown-tree.component.scss']
})
export class BreakdownTreeComponent extends SubscribableComponent implements OnChanges, OnInit {
    readonly CoreFavoriteConstants = CoreFavoriteConstants;
    coreFavoriteUtils = CoreFavoriteUtils;
    breakdownFavoriteConstants = BreakdownFavoriteConstants;
    @Input()
    breakdown: Breakdown;

    @Input()
    breakdownBuilderSettings: BreakdownBuilderSettings;

    @Output()
    nodeSelectionChanged = new EventEmitter<BreakdownTreeNode>();

    @Input()
    draggedNodeSubject$: BehaviorSubject<AuxAdvancedTreeListInterface>;

    @Input()
    addSectorSubject$: BehaviorSubject<AuxAdvancedTreeListInterface>;

    @Output()
    breakdownUpdated = new EventEmitter();

    @Input()
    topDownEligibleCols: string[];

    breakdownTreeData: BreakdownTreeNode[];

    original: boolean;

    singleLevelNodeInserted: boolean;

    // flag to indicate when a breakdown is a placeholder
    // placeholder breakdowns include portfolio-specific breakdowns (ex. IAA Breakdowns) and mandate default breakdowns
    // disables breakdown selector as no additional breakdown levels can be added with placeholder breakdowns
    placeholderBreakdownNodeInserted = false;

    selectedSectorNode: BreakdownTreeNode;

    dropPosition: string;
    breakdownChanged: Breakdown;

    breakdownTreeNodeCopyAction: { breakdownTreeNode: BreakdownTreeNode, copyChildren: boolean };

    advanceTreeListConfig: AuxAdvancedTreeListConfig = {
        highlightOnDragEnter: true,
        shouldExpandOnClick: false,
        indentation: 8
    };

    topDownSelectCols: Set<string> = new Set();

    constructor(private appStore: AppStore,
                private favoriteService: FavoriteService,
                private notificationService: NotificationService,
                private changeDetectorRef: ChangeDetectorRef) {
        super();
    }

    ngOnInit(): void {
        this.addSectorSubject$
            .pipe(
                takeUntil(this.ngUnsubscribe),
                filter((sectorSelection: AuxAdvancedTreeListInterface) => !(isNull(sectorSelection) || isUndefined(sectorSelection))))
            .subscribe((sectorSelection: AuxAdvancedTreeListInterface) => {
                if (sectorSelection.label === BreakdownConstants.MANDATE_DEFAULT_BREAKDOWN_TITLE) {
                    this.addMandateDefaultBreakdownNode();
                    return;
                }
                const breakdownTreeNode = this.getBreakdownTreeNode(sectorSelection);

                // breakdown tree node will be undefined when we try to insert performance column into non empty breakdown tree
                if (!isUndefined(breakdownTreeNode)) {
                    if (!this.captureTopDownColAndUpdateFlag(breakdownTreeNode)) {
                        return;
                    }

                    if (breakdownTreeNode.isEmpty()) {
                        this.addBreakdownNode(breakdownTreeNode);
                    } else {
                        // This is to handle GpBreakdownColumnDefinition sector add where we have level columns
                        this.addGPBreakdownTree(breakdownTreeNode);
                    }
                }
            });

        if (this.breakdown.isTopBottomSectoring) {
            // adds up the top-down column tags for a given breakdown node
            this.initTopDownSelectedCols(this.breakdownTreeData[0].children, this.topDownSelectCols);
        }
        this.breakdownChanged = this.breakdown;
        this.checkAndSetSingleLevelNodeIfPresent();

    }

    /**
     * NOTE: For initial stage, we will exclude checks refrain addition of a node in case of topd-wn
     * We are maintaining top-down colt tags being added to the breakdown
     * & then setting the flag if it's not already
     */
    private captureTopDownColAndUpdateFlag(breakdownTreeNode: BreakdownTreeNode): boolean {
        const columnTag: string = breakdownTreeNode.sectorModel?.[ColumnConstants.COLUMN_TAG_STR];
        if (isEmpty(columnTag)) {
            // return to proceed as it is if no column tag found
            return true;
        }

        const isTopDownCol: boolean = this.topDownEligibleCols.indexOf(columnTag) !== -1;
        if (isTopDownCol) {
            if (this.breakdown.isTopBottomSectoring) {
                if (this.topDownSelectCols.has(columnTag)) {
                    // if it is a top-down column and already exists in the breakdown structure, then do not add
                    return false;
                }
            } else {
                // if it is the first top-down colum to be added to the breakdown structure, then set flat to true
                this.breakdown.isTopBottomSectoring = true;
            }
            // add te column tag to the list of top-down columns
            this.topDownSelectCols.add(columnTag);
        }

        return true;
    }

    /**
     * adds up the top-down column tags for a given breakdown node
     */
    private initTopDownSelectedCols(children: BreakdownTreeNode[], topDownSelectedCols: Set<string>): void {
        if (!children?.length) {
            return;
        }

        for (const child of children) {
            const columnTag: string = child.sectorModel?.[ColumnConstants.COLUMN_TAG_STR];
            if (isEmpty(columnTag) || this.topDownEligibleCols.indexOf(columnTag) === -1) {
                // return if there is no column tag OR column is not a top-down/port attribute column
                continue;
            }

            topDownSelectedCols.add(columnTag);
            // repeat it for the children
            this.initTopDownSelectedCols(child.children, topDownSelectedCols);
        }
    }

    private getBreakdownTreeNode(sectorSelection: AuxAdvancedTreeListInterface): BreakdownTreeNode {
        if (sectorSelection.label === BreakdownConstants.FACTOR_SPACE_USER_SPECIFIED_SCHEMA_TITLE) {
            return this.getSchemaNode();
        }
        return this.getSectorBreakdownTreeNode(sectorSelection);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.breakdown) {
            this.setBreakdownTreeData();
            this.original = this.breakdown && !isUndefined(this.breakdown.id);
        }
    }

    /**
     * Method is called when any of breakdown tree node is selected
     */
    onBreakdownNodeSelection(event: CustomEvent<AuxAdvancedTreeListSelectionChangedDetailInterface>): void {
        this.setSelectedNode(BreakdownUtils.getNodeWithUID(this.breakdownTreeData[0], event.detail.value[0]?.uid));
    }

    /**
     * Method called when context menu is clicked
     */
    onContextMenuClick(event: CustomEvent<AuxAdvancedTreeListContextMenuClickedDetailInterface>): void {
        const targetNode = BreakdownUtils.getNodeWithUID(this.breakdownTreeData[0], event.detail.value.uid);
        if (event.detail.label === BreakdownConstants.BREAKDOWN_TREE_CONTEXT_MENU_LABELS.DELETE_NODE) {
            this.deleteNode(targetNode, false);
        } else if (event.detail.label === BreakdownConstants.BREAKDOWN_TREE_CONTEXT_MENU_LABELS.DELETE_NODE_AND_CHILD) {
            this.deleteNode(targetNode, true);
        } else if (event.detail.label === BreakdownConstants.BREAKDOWN_TREE_CONTEXT_MENU_LABELS.COPY_NODE) {
            this.breakdownTreeData[0].enableContextMenu(true, true);
            const copiedNode = cloneDeep(targetNode);
            copiedNode.parent = undefined;
            this.breakdownTreeNodeCopyAction = {breakdownTreeNode: copiedNode, copyChildren: false};
        } else if (event.detail.label === BreakdownConstants.BREAKDOWN_TREE_CONTEXT_MENU_LABELS.COPY_NODE_AND_CHILD) {
            this.breakdownTreeData[0].enableContextMenu(true, true);
            const copiedNode = cloneDeep(targetNode);
            copiedNode.parent = undefined;
            this.breakdownTreeNodeCopyAction = {breakdownTreeNode: copiedNode, copyChildren: true};
        } else if (event.detail.label === BreakdownConstants.BREAKDOWN_TREE_CONTEXT_MENU_LABELS.PASTE) {
            const nodeToPaste = BreakdownUtils.refreshBreakdownNodeData(cloneDeep(this.breakdownTreeNodeCopyAction.breakdownTreeNode), true);
            if (!this.breakdownTreeNodeCopyAction.copyChildren) {
                nodeToPaste.children = [];
            }
            this.handleBreakdownTreeNodeDrop(nodeToPaste, targetNode, CommonConstants.DROP_POSITION.MIDDLE);
            this.setSelectedNode(nodeToPaste);
            this.refreshTree();
        }
    }

    /**
     * On Remove All Button Click, clears the breakdown tree
     */
    onRemoveAllClick(event: MouseEvent): void {
        if (this.placeholderBreakdownNodeInserted || this.singleLevelNodeInserted) {
            this.breakdown.copyFrom(new Breakdown());
            this.placeholderBreakdownNodeInserted = false;
            this.singleLevelNodeInserted = false;
        }
        // clear top-down sectoring flag
        this.breakdown.isTopBottomSectoring = false;
        this.breakdown.displayAtGroupNode = false;
        this.topDownSelectCols.clear();
        // Clear out the breakdown tree data
        this.breakdownTreeData[0].children = undefined;
        this.breakdownTreeData = [BreakdownUtils.refreshBreakdownNodeData(this.breakdownTreeData[0])];
        this.setSelectedNode(this.breakdownTreeData[0]);
        event.preventDefault();
    }

    /**
     * Method called when breakdown tree node is double clicked
     */
    onNodeDoubleClick(event: CustomEvent<AuxAdvancedTreeListItemDoubleClickedDetailInterface>): void {
        if (event.detail) {
            this.deleteNode(BreakdownUtils.getNodeWithUID(this.breakdownTreeData[0], event.detail.value.uid), true);
        }
    }

    /**
     * Method called when remove item button is clicked
     */
    onRemoveItemClick(event: CustomEvent<AuxAdvancedTreeListRemoveItemClickedDetailInterface>): void {
        if (event.detail) {
            this.deleteNode(event.detail.value as BreakdownTreeNode, true);
        }
    }

    /**
     * Method called on click of load breakdown link
     */
    onLoadBreakdownClick(event: MouseEvent): void {
        this.appStore.openLoadFavoriteModal$.next(
            new LoadFavoriteAction({
                type: this.breakdownBuilderSettings.favoriteType,
                treeType: this.breakdownBuilderSettings.favoriteFolderType,
                displayName: this.breakdownBuilderSettings.getBreakdownDisplayName().toLowerCase() + 's',
                callback: this.loadBreakdown,
                headerDisplayName: this.breakdownBuilderSettings.getBreakdownDisplayName().toLowerCase()
            })
        );
        event.preventDefault();
    }

    /**
     * Validates the breakdown and warns the user if it's not valid
     * If valid, update the breakdown model
     */
    validateAndUpdateBreakdown(): boolean {
        if (!this.validateBreakdown(this.breakdownTreeData[0])) {
            this.notificationService.openDialog(new ExploreDialogParam(
                AlertConstants.TYPE.ALERT,
                AlertConstants.HEADER.INVALID_BREAKDOWN,
                AlertConstants.BODY.INVALID_BREAKDOWN,
                AlertConstants.BTN.OK
            ));
            return false;
        }
        // Update the original breakdown model
        // no updating needed if a placeholder breakdown
        this.breakdownTreeData[0].sectorModel = this.placeholderBreakdownNodeInserted ? this.breakdown : BreakdownUtils.convertBreakdownTreeNodeToModel(this.breakdownTreeData[0], this.breakdown);
        return true;
    }

    /**
     * Callback function to update the label of selected breakdown tree node when sectorModel title is updated
     */
    onSectorTitleChange = () => {
        this.selectedSectorNode = BreakdownUtils.getNodeWithUID(this.breakdownTreeData[0], this.selectedSectorNode.uid);
        this.selectedSectorNode.label = this.selectedSectorNode.sectorModel.getTitle();
        this.breakdownTreeData = [...this.breakdownTreeData];
    };

    /**
     * Called when Breakdown Tree Node or sector node is dropped over any breakdown tree node
     */
    onDropNode(event: CustomEvent<AuxAdvancedTreeListDropDetailInterface>): void {
        event.preventDefault();
        if (event.detail.value.uid) {
            const dropTargetNode = BreakdownUtils.getNodeWithUID(this.breakdownTreeData[0], event.detail.value.uid);
            const droppedNode = this.draggedNodeSubject$.getValue();
            if (!this.canDropNode(droppedNode, dropTargetNode, this.dropPosition)) {
                return;
            }
            // Node is dropped for reordering within breakdown tree
            if (droppedNode instanceof BreakdownTreeNode) {
                this.handleBreakdownTreeNodeDrop(droppedNode, dropTargetNode, this.dropPosition);
            } else {
                if (droppedNode.label === BreakdownConstants.MANDATE_DEFAULT_BREAKDOWN_TITLE) {
                    this.addMandateDefaultBreakdownNode();
                    return;
                }
                // Sector node is dropped to add new sector
                const sectorBreakdownTreeNode = this.getBreakdownTreeNode(droppedNode);
                if (!isUndefined(sectorBreakdownTreeNode)) {
                    this.handleBreakdownTreeNodeDrop(sectorBreakdownTreeNode, dropTargetNode, this.dropPosition);
                }
            }
            this.refreshTree();
        }
    }

    /**
     * Called when Breakdown Tree Node or sector node is dragged over any breakdown tree node
     */
    onDragEnter(event: CustomEvent<AuxAdvancedTreeListDragEnterDetailInterface>): void {
        this.dropPosition = event.detail.value.position;
    }

    /**
     * Called when Breakdown Tree Node is dragged for reordering
     */
    onDragStart(event: CustomEvent): void {
        if (event.detail && event.detail.groupNode && event.detail.groupNode.length === 1) {
            this.draggedNodeSubject$.next(BreakdownUtils.getNodeWithUID(this.breakdownTreeData[0], event.detail.groupNode[0].uid));
        }
    }

    /**
     * Create a new custom sector and add it to the tree
     * The sectorName, rule and breakdownTree will be provided in case of FundSectoring. When the user uploads a (cusip, sector) records which is not present in the breakdown tree, the given sector should append the tree at the root level.
     */
    createNewCustomSector = (sectorName?: string, rule?: ColumnSectorRule | GroupRule, breakdownTree?: BreakdownTreeNode, refreshTree: boolean = true): BreakdownTreeNode => {
        // Create a new blank custom sector rule.
        const customSector: CustomSector = new CustomSector();
        customSector.title = sectorName ? sectorName : SectorConstants.DEFAULT_CUSTOM_SECTOR_TITLE;
        customSector.rule = rule ? rule : new ColumnSectorRule();
        customSector.includeOtherBucket = true;

        // Create a LinkedFavoriteSector wrapper for the custom sector
        const linkedFavoriteSector: LinkedFavoriteSector = new LinkedFavoriteSector();
        linkedFavoriteSector.sector = customSector;
        return this.addBreakdownNode(BreakdownUtils.convertBreakdown(linkedFavoriteSector, undefined), breakdownTree, !breakdownTree, refreshTree);
    };

    /**
     * Method to handle node drop on breakdown tree node
     */
    private handleBreakdownTreeNodeDrop(droppedNode: BreakdownTreeNode, dropTargetNode: BreakdownTreeNode, dropPosition: string): void {
        // If node is dropped in middle of target node, then target node is it's parent otherwise it's sibling
        const newParent = dropPosition === CommonConstants.DROP_POSITION.MIDDLE ? dropTargetNode : dropTargetNode.parent;
        const currentParent = droppedNode.parent;
        if (currentParent !== newParent) {
            if (isUndefined(newParent.children)) {
                newParent.children = [];
            }
            newParent.children.push(droppedNode);
            droppedNode.parent = newParent;
            if (!isUndefined(currentParent)) {
                currentParent.children.splice(currentParent.children.indexOf(droppedNode), 1);
            }
        }
        this.positionDroppedNode(droppedNode, dropTargetNode, newParent, dropPosition);
    }

    /**
     *  Method to position the dropped node with respect to drop target if the position is top or bottom
     */
    private positionDroppedNode(node: BreakdownTreeNode, siblingNode: BreakdownTreeNode, parentNode: BreakdownTreeNode, dropPosition: string): void {
        if (this.dropPosition !== CommonConstants.DROP_POSITION.MIDDLE) {
            // Change the order of node with its siblings
            parentNode.children.splice(parentNode.children.indexOf(node), 1);
            const siblingIndex = parentNode.children.indexOf(siblingNode);
            const newIndex = dropPosition === 'top' ? siblingIndex : siblingIndex + 1;
            parentNode.children.splice(newIndex, 0, node);
        }
    }


    /**
     *  Method to check if sector node insertion is valid.
     *  For now, we are checking if performance node or factor mappings can be inserted.
     */
    private doSectorNodeInsertionValidation(breakdownType: string): boolean {
        // Do some special handling for the performance breakdowns.
        // Basically we can only have 1 of them in the breakdown tree, so if there is already a field then we should get out.
        // If we can add it then also let the user know they can't add anything else.
        if (breakdownType === BreakdownConstants.BREAKDOWN_TYPE.PERFORMANCE || breakdownType === BreakdownConstants.BREAKDOWN_TYPE.FACTOR_MAPPINGS || breakdownType === BreakdownConstants.BREAKDOWN_TYPE.EXPLORE_SECTORS) {
            if (this.breakdownTreeData[0] && !this.breakdownTreeData[0].isEmpty()) {
                if (breakdownType === BreakdownConstants.BREAKDOWN_TYPE.FACTOR_MAPPINGS) {
                    this.notificationService.error(NotificationConstants.FACTOR_MAPPING_SECTOR_INSERT_ERROR_MSG, ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_SECTOR_NODE_INSERTION_ERROR);
                    return false;
                } else if (breakdownType === BreakdownConstants.BREAKDOWN_TYPE.EXPLORE_SECTORS) {
                    this.notificationService.error('Please remove existing nodes to add market value to the breakdown.', ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_SECTOR_NODE_INSERTION_ERROR);
                    return false;
                }
                this.notificationService.error('Please remove existing nodes to add performance breakdown.', ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_SECTOR_NODE_INSERTION_ERROR);
                return false;
            }
            this.singleLevelNodeInserted = true;
        }
        return true;
    }

    /**
     * Method to add new node to breakdown tree
     */
    private addBreakdownNode(nodeToAdd: BreakdownTreeNode, parentNode?: BreakdownTreeNode, setNodeAsSelected: boolean = true, refreshTree: boolean = true): BreakdownTreeNode {
        if (isUndefined(nodeToAdd)) {
            return;
        }
        if (isUndefined(parentNode)) {
            this.selectedSectorNode = BreakdownUtils.getNodeWithUID(this.breakdownTreeData[0], this.selectedSectorNode.uid);
            nodeToAdd.parent = this.selectedSectorNode;
        } else {
            parentNode = BreakdownUtils.getNodeWithUID(this.breakdownTreeData[0], parentNode.uid);
            nodeToAdd.parent = parentNode;
        }
        if (this.breakdownTreeNodeCopyAction) {
            nodeToAdd.enableContextMenu(true, true);
        }
        // Add 'nodeToAdd' to the breakdownTreeData (aux-advanced-tree-list sourceData)
        this.updateBreakdownTreeData(nodeToAdd);

        if (setNodeAsSelected) {
            this.setSelectedNode(nodeToAdd);
        }
        if (refreshTree) {
            this.refreshTree();
        }
        return nodeToAdd;
    }

    /**
     * This is to specially handle GP Breakdown sector node scenario, where we have multi level breakdown tree node.
     */
    private addGPBreakdownTree(breakdownTreeNode: BreakdownTreeNode): void {
        let nextLevel: BreakdownTreeNode;
        if (!breakdownTreeNode.isEmpty()) {
            // GP Breakdown Tree will have only one children at each level
            // Saving the reference as breakdownTreeNode children might change after adding to breakdown Tree
            nextLevel = breakdownTreeNode.children[0];
            breakdownTreeNode.children = undefined;
        }
        this.addBreakdownNode(breakdownTreeNode);
        if (!isUndefined(nextLevel)) {
            this.addGPBreakdownTree(nextLevel);
        }
    }

    /**
     * Method to refresh breakdown tree node view
     */
    refreshTree = (): void => {
        this.breakdownTreeData = [BreakdownUtils.refreshBreakdownNodeData(this.breakdownTreeData[0])];
        this.restrictBreakdownToSingleLevelAlert();
        this.changeDetectorRef.markForCheck();
    };

    /**
     * Updates a warning if the breakdown is restricted to single level but the user has created a multilevel breakdown
     */
    private restrictBreakdownToSingleLevelAlert() {
        if (this.breakdownBuilderSettings.restrictBreakdownToSingleLevel && this.breakdownTreeData[0].isMultiLevel()) {
            this.notificationService.warning(CommonConstants.NOTIFICATION_MESSAGE.BREAKDOWN_RESTRICTED_TO_SINGLE_LEVEL, ErrorTypeConstants.UI_VALIDATION_WARNING, UIErrorParameters.TELEMETRY_FUNCTION_NAME_RESTRICT_BREAKDOWN_TO_SINGLE_WARNING);
        }
    }

    /**
     * Handles the drag and drop scenarios for the breakdown tree
     */
    private updateBreakdownTreeData(sector: BreakdownTreeNode): void {
        // If the children is null, then assign empty array.
        sector.parent.children ??= [];

        if (sector.parent.children.length > 0 && sector.parent.children[sector.parent.children.length - 1].sectorModel instanceof ColumnSector) {
            if (sector.sectorModel instanceof ColumnSector) {
                // If the parent has a column sector as a child and we are adding in a new column sector, the new column sector should
                // take on the existing child nodes.  We also need to then remap the child nodes to have this new sector as the parent.
                sector.children = [];
                sector.parent.children.forEach((node: BreakdownTreeNode) => {
                    node.parent = sector;
                    sector.children.push(node);
                });
                sector.parent.children.splice(0, sector.parent.children.length, sector);
            } else if (sector.sectorModel instanceof LinkedFavoriteSector && sector.sectorModel.sector instanceof CustomSector) {
                // TODO: Support for nested breakdown
                // If the parent has a column sector as a child and we are adding in a new custom sector, the new custom sector should be placed before the last column sector node.
                sector.parent.children.splice(sector.parent.children.length - 1, 0, sector);
            }
        } else {
            sector.parent.children.push(sector);
        }
    }

    /**
     * Method to add new sector in breakdown tree. Will be called on click of move right button
     */
    private getSectorBreakdownTreeNode(sectorNode: AuxAdvancedTreeListInterface | BreakdownSectorSelectorOption): BreakdownTreeNode {
        let breakdownTreeNode: BreakdownTreeNode;
        if (sectorNode instanceof BreakdownSectorSelectorOption) {
            const breakdownType = this.getBreakdownTypeForValidation(sectorNode);
            if (sectorNode.sectorType === BreakdownSectorSelectorOptionType.COMMON_HIERARCHIES) {
                if (this.doSectorNodeInsertionValidation(breakdownType)) {
                    breakdownTreeNode = this.getGPBreakdownNode(sectorNode.eventData as ColumnDefinition, breakdownType);
                }
            } else if (sectorNode.sectorType === BreakdownSectorSelectorOptionType.INDIVIDUAL_MEASURES) {
                if (this.doSectorNodeInsertionValidation(breakdownType)) {
                    breakdownTreeNode = this.getColumnSectorNode(sectorNode.eventData as ColumnDefinition);
                }
            }
        } else if (sectorNode.eventData && sectorNode.eventData.favoriteId) {
            breakdownTreeNode = this.getFavoriteCustomSectorNode(sectorNode.eventData.favoriteId, sectorNode.label);
        }
        return breakdownTreeNode;
    }

    /**
     * Returns the breakdownType of the sectorNode getting added so we can validate if it can be added
     */
    private getBreakdownTypeForValidation(sectorNode: BreakdownSectorSelectorOption): string {
        if (sectorNode.sectorType === BreakdownSectorSelectorOptionType.COMMON_HIERARCHIES) {
            return sectorNode.parent && BreakdownConstants.BREAKDOWN_TYPE.PERFORMANCE_BREAKDOWN === sectorNode.parent.label ? BreakdownConstants.BREAKDOWN_TYPE.PERFORMANCE : BreakdownConstants.BREAKDOWN_TYPE.GP_BREAKDOWN_COLUMN;
        } else if (sectorNode.sectorType === BreakdownSectorSelectorOptionType.INDIVIDUAL_MEASURES) {
            if ((sectorNode.eventData instanceof ColumnDefinition) && !isEmpty(sectorNode.eventData.columnReports) && sectorNode.eventData.columnReports.includes(BreakdownConstants.BREAKDOWN_TYPE.EXPLORE_SECTORS)) {
                return BreakdownConstants.BREAKDOWN_TYPE.EXPLORE_SECTORS;
            }
            return sectorNode.parent && BreakdownConstants.BREAKDOWN_TYPE.FACTOR_MAPPINGS === sectorNode.parent.label ? BreakdownConstants.BREAKDOWN_TYPE.FACTOR_MAPPINGS : null;
        }
        return null;
    }

    /**
     * Method to add a GP Breakdown to the breakdown tree
     */
    private getGPBreakdownNode(column: ColumnDefinition, breakdownType: string): BreakdownTreeNode {
        if (column instanceof GpBreakdownColumnDefinition && column.levelColumns) {
            let gpNodesTree: BreakdownTreeNode;
            let lastLevelNode: BreakdownTreeNode;
            column.levelColumns.forEach((levelColumn: string) => {
                const levelColumnDef = CoreColumnUtils.getColumnDefByTagAndUse(levelColumn, UseType.ALL);
                const columnSectorNode = this.getColumnSectorNode(levelColumnDef, breakdownType);
                if (isUndefined(lastLevelNode)) {
                    gpNodesTree = columnSectorNode;
                } else {
                    columnSectorNode.parent = lastLevelNode;
                    lastLevelNode.children = [];
                    lastLevelNode.children.push(columnSectorNode);
                }
                lastLevelNode = columnSectorNode;
            });
            return gpNodesTree;
        } else {
            return this.getColumnSectorNode(column, breakdownType);
        }
    }

    /**
     * Method to add breakdown tree node of custom sector saved as favorite
     */
    private getFavoriteCustomSectorNode(favoriteId: number, favoriteTitle: string): BreakdownTreeNode {
        // Create a LinkedFavoriteSector wrapper for the custom sector
        const linkedFavoriteSector: LinkedFavoriteSector = new LinkedFavoriteSector();
        linkedFavoriteSector.sector = new CustomSector();
        linkedFavoriteSector.sector.title = favoriteTitle;
        linkedFavoriteSector.sector.id = favoriteId;
        this.favoriteService.getFavorite$(favoriteId)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((customSector: CustomSector) => {
                    linkedFavoriteSector.sector.copyFrom(customSector);
                    this.changeDetectorRef.markForCheck();
                },
                error => {
                    linkedFavoriteSector.sector.title = 'Failed to load: ' + favoriteTitle;
                    this.changeDetectorRef.markForCheck();
                }
            );
        return BreakdownUtils.convertBreakdown(linkedFavoriteSector, undefined);
    }

    /**
     * Method to add column sector node.
     */
    private getColumnSectorNode(columnDefinition: ColumnDefinition, breakdownType?: string): BreakdownTreeNode {
        const sectorModel: ColumnSector = ColumnSectorUtils.createColumnSectorFromColumnDefinition(columnDefinition);
        sectorModel.columnTag = columnDefinition[this.breakdownBuilderSettings.fieldToUse];
        sectorModel.useNoneBuckets = !(breakdownType && breakdownType === BreakdownConstants.BREAKDOWN_TYPE.GP_BREAKDOWN_COLUMN);
        return BreakdownUtils.convertBreakdown(sectorModel, undefined);
    }

    /**
     * Method to check if node can be dropped onto specfic breakdown Tree Node
     */
    private canDropNode(droppedNode: AuxAdvancedTreeListInterface, targetNode: BreakdownTreeNode, position: string): boolean {
        if (isUndefined(droppedNode) || isUndefined(targetNode)) {
            return false;
        }

        // This happens while reordering with breakdown tree, node drop event on itself is emitted
        if (droppedNode === targetNode) {
            return false;
        }

        // If the parent node is the same as the current parent then do not allow it.
        if (droppedNode instanceof BreakdownTreeNode && droppedNode.parent === targetNode && position === CommonConstants.DROP_POSITION.MIDDLE) {
            return false;
        }
        // Prevent the user from dropping it above or below the the root node.
        if (targetNode.type === 'root' && position !== CommonConstants.DROP_POSITION.MIDDLE) {
            return false;
        }

        // This happens if parent node is being dropped onto descendent node
        if (droppedNode instanceof BreakdownTreeNode && BreakdownUtils.getNodeWithUID(droppedNode, targetNode.uid)) {
            return false;
        }
        // Got to here then it must be ok.
        return true;
    }

    /**
     * Method to delete the selected node from the tree
     */
    private deleteNode(breakdownTreeNode: BreakdownTreeNode, deleteChildren: boolean): void {
        if (breakdownTreeNode && breakdownTreeNode.parent) {
            // placeholder breakdowns will only contain one node so clear entire breakdown
            if (this.placeholderBreakdownNodeInserted) {
                this.breakdown.copyFrom(new Breakdown());
                this.placeholderBreakdownNodeInserted = false;
            }
            // If the user decides to delete the selected node only (do not delete children)
            if (!deleteChildren) {
                // If any child of the deleted sector is a column sector AND any child of the parent is a column sector (excluding the deleted sector itself)
                // Warn the user and don't continue with the deletion
                if (breakdownTreeNode.hasColumnSectorChild() && breakdownTreeNode.parent.hasColumnSectorChild() && !(breakdownTreeNode.sectorModel instanceof ColumnSector)) {
                    this.notificationService.error('Unable to delete selected item as it will cause two group-by items to be on the same level.', ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_DELETE_NODE_ERROR);
                    return;
                }

                // Grab the index of the node
                const insertIndex = breakdownTreeNode.parent.children.indexOf(breakdownTreeNode);

                // Insert each of the children into the selected node's parent at the index where the selected node was
                if (!breakdownTreeNode.isEmpty()) {
                    breakdownTreeNode.children.reverse();
                    breakdownTreeNode.children.forEach((child: BreakdownTreeNode) => {
                        breakdownTreeNode.parent.children.splice(insertIndex, 0, child);
                        // Reassign the parent
                        child.parent = breakdownTreeNode.parent;
                        child.sectorModel.parent = breakdownTreeNode.parent.sectorModel;
                    });
                }
            }
            // Remove the deleted node from the parent
            breakdownTreeNode.parent.removeChild(breakdownTreeNode);
            this.setSelectedNode(breakdownTreeNode.parent);
        } else if (breakdownTreeNode && breakdownTreeNode.type === 'root') {
            // If the node selected was the root node, just delete all children off the root
            breakdownTreeNode.removeChildren();
            this.setSelectedNode(breakdownTreeNode);
        }

        // update the top-down related props when a node is being deleted
        this.updateTopDownPropsAfterDelete(breakdownTreeNode);

        this.refreshTree();
        if (!(this.breakdownTreeData[0] && !this.breakdownTreeData[0].isEmpty())) {
            this.singleLevelNodeInserted = false;
        }
    }

    /**
     * update the top-down related props when a node is being deleted
     */
    private updateTopDownPropsAfterDelete(breakdownTreeNode: BreakdownTreeNode): void {
        const colTag: string = breakdownTreeNode.sectorModel?.[ColumnConstants.COLUMN_TAG_STR];
        if (isEmpty(colTag)) {
            return;
        }

        const isTopDownCol: boolean = this.topDownEligibleCols.indexOf(colTag) !== -1;
        if (!isTopDownCol) {
            return;
        }

        const deletedTopDownCols: Set<string> = new Set<string>();
        this.initTopDownSelectedCols([breakdownTreeNode], deletedTopDownCols);
        deletedTopDownCols.forEach(deletedTopDownCol => this.topDownSelectCols.delete(deletedTopDownCol));
        this.topDownSelectCols.delete(colTag);
        if (!this.topDownSelectCols.size) {
            this.breakdown.isTopBottomSectoring = false;
            this.breakdown.displayAtGroupNode = false;
        }
    }

    /**
     * This method is used to validate the breakdown.
     */
    private validateBreakdown(breakdown: BreakdownTreeNode): boolean {
        if (this.placeholderBreakdownNodeInserted) {
            return true;
        }
        if (isUndefined(breakdown) || (breakdown.sectorModel && !breakdown.sectorModel.isValid())) {
            return false;
        }
        if (!isEmpty(breakdown.children)) {
            return breakdown.children.every((child: BreakdownTreeNode) => {
                return this.validateBreakdown(child);
            });
        }
        return true;
    }

    /**
     * Load a favorite breakdown
     */
    private loadBreakdown: FavoriteCallback = (favId: number, loadingMessage: string, forceRefresh: boolean, isGlobal: boolean, title?: string, presetId?: string): void => {
        if (!favId && presetId) {
            // indicates this is a preset breakdown (which is just a placeholder)
            const presetBreakdown = new Breakdown();
            presetBreakdown.presetBreakdownId = presetId;
            presetBreakdown.title = title;
            presetBreakdown.owner = FavoriteConstants.PORTFOLIO_SPECIFIC_USER;
            presetBreakdown.tool = 'EXPLORE';

            this.breakdown.copyFrom(presetBreakdown);
            this.placeholderBreakdownNodeInserted = true;
            this.setBreakdownTreeData();
            this.breakdownUpdated.emit();
        } else {
            this.loadBreakdownVersion(favId, loadingMessage, forceRefresh, isGlobal);
        }
    }

    /**
     * Load a favorite breakdown
     */
    public loadBreakdownVersion = (favId: number, loadingMessage: string, forceRefresh: boolean, isGlobal: boolean, versionId?: string): void => {
            this.favoriteService.getFavorite$(favId, loadingMessage, false, forceRefresh, versionId)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe((breakdown: Breakdown) => {
                    // For a Risk & Exposure widget, block the loading of a breakdown with quantiles that was configured in a Return Analysis widget
                    // Currently, Risk & Exposure doesn't support a quantile breakdown based on PORT or BENCH
                    // Similarly, for Return Analysis widget, block the loading of a breakdown with quantiles that was NOT configured in RA widget (basedOn NumberOfSecurities)
                    if (BreakdownUtils.isInvalidQuantileBreakdownForWidgetType(breakdown, this.breakdownBuilderSettings.widgetType)) {
                        this.notificationService.error(NotificationConstants.SAVED_BREAKDOWN_NOT_SUPPORTED);
                        return;
                    }
                    //Any changes to breakdown set to the favoriteConfig breakdownChanged
                    this.breakdownChanged = breakdown;
                    this.breakdown.copyFrom(breakdown);
                    this.setBreakdownTreeData();
                    this.breakdownUpdated.emit();
                }, error => {
                    this.notificationService.error('failed to load breakdown with id: ' + favId, ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_GET_FAVORITE_ERROR);
                });
    }

    /**
     * Method to set breakdown tree data to show nodes
     */
    private setBreakdownTreeData(): void {
        if (isUndefined(this.breakdown)) {
            this.breakdownTreeData = [];
        } else {
            this.breakdownTreeData = [BreakdownUtils.createRootAndConvertBreakdown(this.breakdown)];
        }
        this.setSelectedNode(this.breakdownTreeData[0]);
        this.changeDetectorRef.markForCheck();
    }

    /**
     *  Method to set selected node of breakdown tree
     */
    private setSelectedNode(node: BreakdownTreeNode): void {
        if (this.selectedSectorNode) {
            this.selectedSectorNode = BreakdownUtils.getNodeWithUID(this.breakdownTreeData[0], this.selectedSectorNode.uid);
            if (this.selectedSectorNode) {
                this.selectedSectorNode.isSelected = false;
            }
        }
        this.selectedSectorNode = node;
        this.nodeSelectionChanged.emit(this.selectedSectorNode);
        if (node) {
            node.isSelected = true;
        }
    }

    /**
     * Populates breakdown tree with "Default Mandate" which is a breakdown placeholder that gets resolved to the breakdown set in the portfolio mandate
     * @private
     */
    private addMandateDefaultBreakdownNode(): void {
        // default mandate breakdown can only be added if tree is empty
        if (this.breakdownTreeData[0] && !this.breakdownTreeData[0].isEmpty()) {
            this.notificationService.error(NotificationConstants.MANDATE_DEFAULT_BREAKDOWN_INSERT_ERROR_MSG, ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_ADD_MANDATE_DEFAULT_BREAKDOWN_NODE_ERROR);
            return;
        }

        // create placeholder for default breakdown
        const mandateDefaultBreakdown = new Breakdown();
        mandateDefaultBreakdown.isMandateDefaultBreakdown = true;
        mandateDefaultBreakdown.title = BreakdownConstants.MANDATE_DEFAULT_BREAKDOWN_TITLE;
        mandateDefaultBreakdown.owner = FavoriteConstants.ADMIN_USER;

        this.breakdown.copyFrom(mandateDefaultBreakdown);
        this.placeholderBreakdownNodeInserted = true;
        this.setBreakdownTreeData();
        this.breakdownUpdated.emit();
    }

    /**
     * Populates breakdown tree with "Schema" when user selects the Schema placeholder
     * @private
     */
    private getSchemaNode(): BreakdownTreeNode {
        // schema mandate breakdown can only be added if tree is empty
        if (this.breakdownTreeData[0] && !this.breakdownTreeData[0].isEmpty()) {
            this.notificationService.error(NotificationConstants.MANDATE_SCHEMA_TEXT_INSERT_ERROR_MSG, UIErrorParameters.TELEMETRY_FUNCTION_NAME_GET_SCHEMA_NODE_ERROR);
            return;
        }
        const schemaSector = new SchemaSector();
        schemaSector.title = BreakdownConstants.FACTOR_SPACE_USER_SPECIFIED_SCHEMA_TITLE;
        // Add the sector to the breakdown.
        this.breakdown.children.push(schemaSector);
        this.singleLevelNodeInserted = true;
        return BreakdownUtils.convertBreakdown(schemaSector, undefined);
    }

    /**
     *   If we already have a single level node type in breakdown, we want to disable the view so that user doesn't add a new node
     * @private
     */
    private checkAndSetSingleLevelNodeIfPresent(): void {
        if (this.breakdown.isSchemaBreakdown()) {
            this.singleLevelNodeInserted = true;
            return;
        }
        if (this.breakdown?.isSingleLevel()) {
            const columnTag = (this.breakdown.children[0] as ColumnSector).columnTag;
            const columnDefinition = CoreDefinitionStore.columnTagColumnsPairs.get(columnTag)?.[0];
            if (columnDefinition?.columnReports?.includes(BreakdownConstants.BREAKDOWN_TYPE.EXPLORE_SECTORS)
                || columnDefinition?.groups?.includes(BreakdownConstants.BREAKDOWN_TYPE.FACTOR_MAPPINGS)
                || columnDefinition?.praadaBreakdown) {
                this.singleLevelNodeInserted = true;
            }
        }
    }

    /**
     * display at group node check toggle
     */
    updateDisplayAtGroupNode(eventData: CustomEvent<AuxCheckboxChangedDetailInterface>) {
        this.breakdown.displayAtGroupNode = eventData.detail.value.checked;
    }
}
