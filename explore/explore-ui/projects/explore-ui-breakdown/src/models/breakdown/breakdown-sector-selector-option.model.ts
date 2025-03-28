import {AuxAdvancedTreeListInterface} from '@blk/aladdin-angular-components';
import {ColumnDefinition} from '@blk/explore-ui-core';
import {ColumnSelectorOption, SelectedColumnSelectorOption} from '@blk/explore-ui-column-option';

export class BreakdownSectorSelectorOption implements AuxAdvancedTreeListInterface {
    label: string;
    uid?: string;
    children?: BreakdownSectorSelectorOption[];
    sectorType?: BreakdownSectorSelectorOptionType;
    eventData?: ColumnDefinition | SelectedColumnSelectorOption;
    isSelected?: boolean;
    parent?: BreakdownSectorSelectorOption;

    static createBreakdownSectorSelectorOption(columnSelectorOption: ColumnSelectorOption, sectorType: BreakdownSectorSelectorOptionType): BreakdownSectorSelectorOption {
        const breakdownSectorSelectorOption = new BreakdownSectorSelectorOption(
            columnSelectorOption.label,
            columnSelectorOption.uid,
            undefined,
            columnSelectorOption.children?.length > 0 ? BreakdownSectorSelectorOptionType.GROUP : sectorType,
            columnSelectorOption.eventData,
            columnSelectorOption.isSelected
        );
        const children = columnSelectorOption.children?.map((option) => {
            const childNode = BreakdownSectorSelectorOption.createBreakdownSectorSelectorOption(option, sectorType);
            childNode.parent = breakdownSectorSelectorOption;
            return childNode;
        });
        breakdownSectorSelectorOption.children = children;
        return breakdownSectorSelectorOption;
    }

    constructor(label: string, uid?: string, children?: BreakdownSectorSelectorOption[], sectorType?: BreakdownSectorSelectorOptionType,
                data?: ColumnDefinition | SelectedColumnSelectorOption, isSelected?: boolean) {
        this.label = label;
        this.uid = uid;
        this.children = children;
        this.sectorType = sectorType;
        this.eventData = data;
        this.isSelected = isSelected;
    }

}

export enum BreakdownSectorSelectorOptionType {
    GROUP = 'group',
    CUSTOM = 'custom',
    INDIVIDUAL_MEASURES = 'Individual Measures',
    COMMON_HIERARCHIES = 'Common Hierarchies'
}
