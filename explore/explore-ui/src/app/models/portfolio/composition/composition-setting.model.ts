import {Breakdown, CustomFilter, NormalizedFlag} from '@blk/explore-ui-breakdown';
import {cloneDeep, isObject, isUndefined} from 'lodash';
import {
    AbstractFavoriteConfig,
    ColumnConfig,
    CoreFavoriteUtils,
    FavoriteDisplayEnum,
    SerializeFavoriteType
} from '@blk/explore-ui-core';
import {FavoriteConstants} from '@constants/favorite.constants';
import compositionConfigJson from '@assets/composition-config/CompositionConfig.json';

/**
 * Model class for composition settings
 */
export class CompositionSetting extends AbstractFavoriteConfig {
    breakdownTree: Breakdown = new Breakdown();
    compositionFilter: CustomFilter = new CustomFilter();
    isNormalized = new NormalizedFlag(true);
    showActiveInComposition: boolean;
    // contains selected columns to show in composition table
    selectedColumns: ColumnConfig[];
    // default selected columns from json config
    defaultSelectedColumns: ColumnConfig[] = cloneDeep(compositionConfigJson['defaultSelectedColumns']).map(column => new ColumnConfig(column));
    tradingColumn: string;
    secDescType: string;
    isOptimizationCashSettingChecked: boolean;
    isApplyFilterToNewWidgetsChecked: boolean;
    /**
     * Constructor
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * copyFrom implementation
     */
    protected doCopyFrom(source: AbstractFavoriteConfig): void {
        if (!(source instanceof CompositionSetting)) {
            return;
        }

        this.breakdownTree.copyFrom(source.breakdownTree);
        this.showActiveInComposition = source.showActiveInComposition;
        this.tradingColumn = source.tradingColumn;
        this.selectedColumns = source.selectedColumns;
        this.secDescType = source.secDescType;
        this.isOptimizationCashSettingChecked = source.isOptimizationCashSettingChecked;
        this.compositionFilter = source.compositionFilter;
        this.isApplyFilterToNewWidgetsChecked = source.isApplyFilterToNewWidgetsChecked;
    }

    /**
     * deserialize implementation
     */
    protected doDeserialize(data: any): void {
        if (!data) {
            return;
        }

        this.tradingColumn = data.tradingColumn;
        this.secDescType = data.secDescType;
        this.showActiveInComposition = data.showActiveInComposition;
        this.isOptimizationCashSettingChecked = data.isOptimizationCashSettingChecked;
        this.isApplyFilterToNewWidgetsChecked = data.isApplyFilterToNewWidgetsChecked;
        if (data.breakdownTree) {
            this.breakdownTree.deserialize(data.breakdownTree);
        }
        if (data.selectedColumns) {
            this.selectedColumns = data.selectedColumns.map(col => new ColumnConfig(col));
        }
        if (data.compositionFilter) {
            this.compositionFilter.deserialize(data.compositionFilter);
        }
        if (data.isNormalized) {
            this.isNormalized = new NormalizedFlag(true);
        }
    }

    /**
     * serialize implementation
     */
    protected doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        const serializedObject = {
            'showActiveInComposition': this.showActiveInComposition,
            'isOptimizationCashSettingChecked': this.isOptimizationCashSettingChecked,
            'isApplyFilterToNewWidgetsChecked': this.isApplyFilterToNewWidgetsChecked,
            'tradingColumn': this.tradingColumn,
            'secDescType': this.secDescType,
            'breakdownTree': this.breakdownTree ? this.breakdownTree.serialize(true) : undefined,
            'selectedColumns': this.selectedColumns ? this.selectedColumns.map(col => col.serialize()) : undefined,
            ...(!this.compositionFilter?.isFilterEmpty() ? {'compositionFilter': this.compositionFilter.serialize(true)} : {}),
            ...(!!this.isNormalized?.data ? {isNormalized: true} : {})
        };

        if (CoreFavoriteUtils.isFavoriteChangeDetection(_isNested)) {
            this.removeFieldsForFavoriteChangeDetection(serializedObject);
        }
        return serializedObject;
    }

    /**
     * Remove fields during serialization if not needed for favorite change detection
     */
    removeFieldsForFavoriteChangeDetection(serializedObject: any): void {
        const isDefaultSelectedColumns: boolean = !!this.selectedColumns?.length && !!this.defaultSelectedColumns?.length &&
            this.selectedColumns.length === this.defaultSelectedColumns.length &&
            this.selectedColumns.every((col, i) => col.equals(this.defaultSelectedColumns[i]));

        if (isDefaultSelectedColumns) {
            serializedObject.selectedColumns = undefined;
        }
        // we do not save the isConfigured flag as part of favorite so if the breakdown is configured then we should make it true as we do in deserialize in breakdown model
        if (this.breakdownTree && this.breakdownTree.hasChildren() && isUndefined(this.breakdownTree.isConfigured)) {
            serializedObject.breakdownTree.breakdown.isConfigured = true;
        }
    }

    protected getConfigType(): string {
        return FavoriteConstants.COMPOSITION_SETTING;
    }

    /**
     * Gets the config type.
     */
    static get configType(): string {
        return FavoriteConstants.COMPOSITION_SETTING;
    }

    getDisplayType(parent?: any): FavoriteDisplayEnum {
        return FavoriteDisplayEnum.COMPOSITION_SETTING;
    }
}
