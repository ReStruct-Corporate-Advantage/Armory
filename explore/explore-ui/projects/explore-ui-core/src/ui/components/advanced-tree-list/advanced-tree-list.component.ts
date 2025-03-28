import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {AuxAdvancedTreeList, AuxAdvancedTreeListInterface} from '@blk/aladdin-angular-components';
import {cloneDeep} from 'lodash';

@Component({
    selector: 'explore-core-advanced-tree-list',
    templateUrl: './advanced-tree-list.component.html',
    styleUrls: ['./advanced-tree-list.component.scss']
})
/**
 * Component for Advanced Tree List
 */
export class AdvancedTreeListComponent {
    @ViewChild('sourceTreeList', {static: false}) sourceTreeList: AuxAdvancedTreeList;
    @ViewChild('targetTreeList', {static: false}) targetTreeList: AuxAdvancedTreeList;
    // emit events
    @Output() columnsUpdated: EventEmitter<AuxAdvancedTreeListInterface[]> = new EventEmitter<AuxAdvancedTreeListInterface[]>();
    @Output() targetDataOrderUpdated: EventEmitter<AuxAdvancedTreeListInterface[]> = new EventEmitter<AuxAdvancedTreeListInterface[]>();
    @Input() sourceData: AuxAdvancedTreeListInterface[];
    @Input() hasSearch: boolean;
    @Input() allowMultipleSelection: boolean;
    @Input() sourceLabel: string;
    @Input() targetData: AuxAdvancedTreeListInterface[];
    @Input() targetLabel: string;
    @Input() hasReorder = false;
    @Input() isDisabled = false;

    moveToSourceButtonDisabled = true;
    moveToTargetButtonDisabled = true;

    constructor() {
    }

    /**
     * Moves the selected items from source to target of the data tree list
     */
    moveToTarget(): void {
        this.sourceTreeList.getSourceSelection().then(sourceSelectedItems => {
            if (!sourceSelectedItems.length) {
                return;
            }

            this.uncheckAll(sourceSelectedItems);
            const result = this.moveTo(this.sourceData, this.targetData, sourceSelectedItems);
            this.sourceData = result.from;
            this.targetData = result.to;
            this.updateColumnsList();
        });
    }

    /**
     * Moves the selected items from target to source of the data tree list
     */
    moveToSource(): void {
        this.targetTreeList.getSourceSelection().then(targetSelectedItems => {
            if (!targetSelectedItems.length) {
                return;
            }

            this.uncheckAll(targetSelectedItems);
            const result = this.moveTo(this.targetData, this.sourceData, targetSelectedItems);
            this.targetData = result.from;
            this.sourceData = result.to;
            this.updateColumnsList();
        });
    }

    uncheckAll(selectedItems): void {
        selectedItems.forEach(item => item.isSelected = false);
        this.moveToSourceButtonDisabled = true;
        this.moveToTargetButtonDisabled = true;
    }

    /**
     * Moves the selected node from advanced tree list from source to target
     */
    moveTo(from: AuxAdvancedTreeListInterface[], to: AuxAdvancedTreeListInterface[], selectedItems): { from: AuxAdvancedTreeListInterface[], to: AuxAdvancedTreeListInterface[] } {
        const parentGroup = selectedItems[0].parent;
        let fromCopy = cloneDeep(from);
        let toCopy = cloneDeep(to);

        if (!parentGroup) {
            const isAGroup = !!selectedItems[0].children;
            if (!isAGroup) {
                toCopy = [...toCopy, ...selectedItems];
            } else {
                selectedItems.forEach(group => {
                    const groupToBeMergeWith = toCopy.find(item => item.uid === group.uid);
                    if (!groupToBeMergeWith) {
                        toCopy.push(group);
                    } else {
                        groupToBeMergeWith.children = groupToBeMergeWith.children.concat(group.children);
                    }
                });
            }

            return {
                from: fromCopy.filter(item => item.uid ? !selectedItems.some(selectedItem => selectedItem.uid === item.uid) : true),
                to: toCopy,
            };
        } else {
            const parentGroup1 = fromCopy.find(fromItem => {
                if (fromItem.uid) {
                    return fromItem.uid === parentGroup.uid;
                }
                return true;
            });
            const parentGroup2 = toCopy.find(toItem => {
                if (toItem.uid) {
                    return toItem.uid === parentGroup.uid;
                }
                return true;
            });

            if (parentGroup2) {
                parentGroup2.children = parentGroup2.children.concat(selectedItems);
            } else {
                const newParentGroup2 = {...parentGroup1, children: selectedItems};
                toCopy.push(newParentGroup2);
            }

            if (parentGroup1.children.length === selectedItems.length) {
                fromCopy = fromCopy.filter(item => item.uid ? item.uid !== parentGroup1.uid : true);
            } else {
                parentGroup1.children = parentGroup1.children.filter(item =>
                    !selectedItems.some(seletedItem => seletedItem.uid === item.uid));
            }

            return {from: fromCopy, to: toCopy};
        }
    }

    /**
     * Disables target button
     */
    sourceSelectionChanged(): void {
        this.moveToTargetButtonDisabled = false;
    }

    /**
     * Disables source button
     */
    targetSelectionChanged(): void {
        this.moveToSourceButtonDisabled = false;
    }

    /**
     * Emit event to update the column list
     * this function is used as callback so need arrow to get the right scope
     */
    updateColumnsList = (): void => {
        this.columnsUpdated.emit(this.sourceData);
    }

    onReorder(event: any): void {
        this.targetData = event.detail.value;
        this.targetDataOrderUpdated.emit(this.targetData);
    }

}
