import {ColumnSelectorOption} from '../models/ui/column-selector-option.model';

/**
 * Interface of the column selector config options that components will pass in.
 */
export interface ColumnSelectorConfig {
    hasDoubleClick?: boolean;
    allowDuplicates?: boolean;
    hasSelectedOnly?: boolean;
    selectedOnlyLabel?: string;
    sourceLabel?: string;
    hasSearch?: boolean;
    isDisabled?: boolean;
    hasAggregator?: boolean;
    targetLabel?: string;
    hasReorder?: boolean;
    isShowSelectedOnly?: boolean;
    customSearch?: (option: ColumnSelectorOption[], searchValue: string) => ColumnSelectorOption[];
    customSort?: (searchValue: string) => (itemA: ColumnSelectorOption, itemB: ColumnSelectorOption) => number;
    hasRemoveAll?: boolean;
    removeAllLabel?: string;
    sourceControlLabel?: string;
    hasSourceControl?: boolean;
    isSourceControlDisabled?: boolean;
    multiSelection?: boolean;
}
