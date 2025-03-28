/**
 * Interface defining the input in input category in a widget config json file
 */
export interface WidgetConfigInput {
    inputConfigType: string;
    inputName: string;
    isSharedInputName?: string;
    inputTitle: string;
    valueField?: string;
    columnFilters?: any[];
    default?: any;
    hiddenColumns?: any[];
    groupByColumnFilters?: any[];
    customColumnFilters?: any[];
    max?: number;
    isOpen?: boolean;
    otherNames?: string[];
    disableNormalized?: boolean;
    includeNoBreakdown?: boolean;
    hideTopColumnGroup?: boolean;
    showFavorite?: boolean;
    mandateSettingType?: string;
    oldProps?: string[];
    hideFundSectoringTabs?: boolean;
    hideTitle?: boolean;
    ignoreNestedDataObject?: boolean;
}
