import {AuxAdvancedTreeListInterface, AuxContextMenuInterface} from '@blk/aladdin-angular-components';
import {ColumnDefinition} from '@blk/explore-ui-core';
import {SelectedColumnSelectorOption} from './selected-column-selector-option.model';
/**
 * Column selector option data model
 */
export class ColumnSelectorOption implements AuxAdvancedTreeListInterface {
    label: string;
    uid?: string;
    children?: AuxAdvancedTreeListInterface[];
    parent?: ColumnSelectorOption;
    type?: 'column' | 'group';
    eventData?: ColumnDefinition | SelectedColumnSelectorOption;
    isSelected?: boolean;
    match?: boolean;
    matchStart?: number;
    matchEnd?: number;
    isExpanded?: boolean;
    key?: number;
    contextMenu?: AuxContextMenuInterface[];
    isLearnLink?: boolean;

    constructor(label: string, uid?: string, children?: ColumnSelectorOption[], type?: 'column' | 'group', data?: ColumnDefinition | SelectedColumnSelectorOption, isSelected?: boolean, isLearnLink?: boolean) {
        this.label = label;
        this.uid = uid;
        this.children = children;
        this.type = type;
        this.eventData = data;
        this.isSelected = isSelected;
        this.isLearnLink = isLearnLink;
    }
}
