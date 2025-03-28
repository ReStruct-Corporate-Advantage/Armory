import {AppUtils} from '../../../utils/app.utils';
import {
    AbstractColumnOption,
    AbstractConfig,
    ColumnOptionFactory, OverrideDateConstants,
    RequestParamsCreator, SerializeFavoriteType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';
import {OverrideDateColumnOption} from '@blk/explore-ui-column-option';

/**
 * Model for widget's top bottom filter
 */
export class TopBottomFilterInput extends AbstractConfig implements WidgetInput, RequestParamsCreator {

    top: number;
    bottom: number;
    columnTag: string;
    columnKey: string;
    positionColumnType: string;
    sectorLevel: boolean;
    withinSectorLevel: boolean;
    title: string;

    // when a top/bottom filter is applied on a column with child columns (override date, climate scenarios),
    // we save the column options in this map to identify the child column to filter on
    childColumnOptions: Map<string, AbstractColumnOption> = new Map<string, AbstractColumnOption>();

    /**
     * Checks if the top bottom filter is valid or not
     */
    public static isValidTopBottomFilter(filter: any): boolean {
        return filter && (filter.top || filter.bottom) && filter.columnTag;
    }

    constructor(data?: any) {
        super();
        if (AppUtils.isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Gets the type of the config object.
     */
    public static get configType(): string {
        return 'topBottomFilter';
    }

    getConfigType() {
        return 'topBottomFilter';
    }

    /**
     * Adds topBottomFilter request attribute to the given request parameters
     */
    addRequestParams(requestParams: any, paramName?: string): void {
        const paramNameToUse = paramName ? paramName : WidgetInputType.TOP_BOTTOM_FILTER;
        if (TopBottomFilterInput.isValidTopBottomFilter(this)) {
            const params = this.serialize();

            // The server does not need this parameter and it was causing issues with the requests not matching.
            // So am just going to remove it from the request params.
            delete params.configType;

            // for child column options we want the request params, not serialized data
            params.childColumnOptions = {};
            for (const option of this.childColumnOptions.values()) {
                const optionRequestParams = {};
                option.addRequestParams(optionRequestParams);
                params.childColumnOptions[option.configType] = optionRequestParams;
            }

            requestParams[paramNameToUse] = params;
        }
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    public serialize(_isNested?: boolean | SerializeFavoriteType): any {
        const data: any = {
            columnTag: this.columnTag,
            columnKey: this.columnKey,
            top: this.top,
            bottom: this.bottom,
            positionColumnType: this.positionColumnType,
            sectorLevel: this.sectorLevel,
            withinSectorLevel: this.withinSectorLevel,
            title: this.title
        };

        // serialize each child column option
        data.childColumnOptions = {};
        for (const option of this.childColumnOptions.values()) {
            data.childColumnOptions[option.configType] = option.serialize();
        }

        data.configType = TopBottomFilterInput.configType;
        return data;
    }

    /**
     * Deserialize the data into this object.
     */
    public deserialize(data: any): void {
        // If TopBottomFilter data is not set inside 'data' then check data.data
        if (!data.columnTag) {
            if (data.data) {
                data = data.data;
            } else if (data.topBottomFilter) {
                data = data.topBottomFilter;
            }
        }
        if (data) {
            this.top = data.top;
            this.bottom = data.bottom;
            this.positionColumnType = data.positionColumnType;
            this.sectorLevel = data.sectorLevel;
            this.withinSectorLevel = data.withinSectorLevel;
            this.columnTag = data.columnTag;
            this.columnKey = data.columnKey;
            this.title = data.title;

            // support legacy top/bottom filter that had overrideDate as a hardcoded field
            if (data.overrideDate) {
                const overrideDateColOption = new OverrideDateColumnOption();
                // check first character in string to see if it's a number or start with "T-" - if then, this indicates it's a custom date
                if (isNaN(data.overrideDate.charAt(0)) && !data.overrideDate.startsWith('T-')) {
                    overrideDateColOption.overrideDateTypes = [data.overrideDate];
                } else {
                    // custom date
                    overrideDateColOption.customOverrideDateLabel = data.overrideDate;
                    overrideDateColOption.overrideDateTypes = [OverrideDateConstants.OVERRIDE_DATE_DEFINITIONS.CUSTOM];
                }
                this.childColumnOptions.set(overrideDateColOption.configType, overrideDateColOption);
            }

            if (data.childColumnOptions) {
                Object.keys(data.childColumnOptions).forEach(configType => {
                    // get the corresponding column option class based on config type
                    const columnOptionType = ColumnOptionFactory.getOptionType(configType);
                    if (!columnOptionType) {
                        return;
                    }
                    // instantiate the column option and deserialize the saved value
                    const columnOption = new columnOptionType(data.childColumnOptions[configType]);
                    // fixing broken favorite - USER STORY 1264177
                    if (columnOption instanceof OverrideDateColumnOption && columnOption.overrideDateTypes?.[0]?.startsWith('T-')) {
                        columnOption.customOverrideDateLabel = columnOption.overrideDateTypes[0];
                        columnOption.overrideDateTypes = [OverrideDateConstants.OVERRIDE_DATE_DEFINITIONS.CUSTOM];
                    }

                    this.childColumnOptions.set(columnOption.configType, columnOption);
                });
            }
        }
    }

    /**
     * Return true if the passed in topBottomFilter is equal to this topBottomFilter
     */
    equals(topBottomFilter: AbstractConfig): boolean {
        if (!(topBottomFilter instanceof TopBottomFilterInput)) {
            return false;
        }
        if (this.top !== topBottomFilter.top) {
            return false;
        }
        if (this.bottom !== topBottomFilter.bottom) {
            return false;
        }
        if (this.columnKey !== topBottomFilter.columnKey) {
            return false;
        }
        if (this.columnTag !== topBottomFilter.columnTag) {
            return false;
        }
        if (this.positionColumnType !== topBottomFilter.positionColumnType) {
            return false;
        }
        if (this.sectorLevel !== topBottomFilter.sectorLevel) {
            return false;
        }
        if (this.withinSectorLevel !== topBottomFilter.withinSectorLevel) {
            return false;
        }
        if (this.childColumnOptions.size !== topBottomFilter.childColumnOptions.size) {
            return false;
        }
        if (Object.keys(this.childColumnOptions).some(key => !this.childColumnOptions.get(key).equals(topBottomFilter.childColumnOptions.get(key)))) {
            return false;
        }

        return this.title === topBottomFilter.title;
    }

    isDataStoreInput(): boolean {
        return true;
    }

    /**
     * Clear the filter attributes
     */
    reset() {
        this.columnTag = undefined;
        this.top = undefined;
        this.bottom = undefined;
        this.columnKey = undefined;
        this.positionColumnType = undefined;
        this.sectorLevel = undefined;
        this.withinSectorLevel = undefined;
        this.title = undefined;
        this.childColumnOptions.clear();
    }
}

