import {cloneDeep, each, isEmpty, isNil} from 'lodash';
import {Observable} from 'rxjs';
import widgetsJson from '../../assets/widget-configs/widgets.json';
import {map} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {MetadataModule} from '../modules/metadata/metadata.module';
import {StatusConstants} from '../constants';
import {
    ConfigTypeFactory,
    CoreWidgetConfigStore,
    CoreWidgetConstants,
    TokenConstants,
    TokenUtils,
    WidgetConfig,
    WidgetConfigInput,
    WidgetConfigInputCategory,
    WidgetConfigResolverService,
    WidgetConfigType,
    WidgetInputType,
    WidgetSize
} from '@blk/explore-ui-core';
import {ColumnSet} from '@blk/explore-ui-column-option';

@Injectable({
    providedIn: MetadataModule
})
/**
 * Factory to load and get the widget config based on the widget config type
 */
export class WidgetConfigFactory {

    static tableWidgets: WidgetConfig[] = new Array<WidgetConfig>();
    static chartWidgets: WidgetConfig[] = new Array<WidgetConfig>();

    /**
     * Get widget size for the passed in configType
     */
    static getWidgetSizeFromConfig(configType: string): WidgetSize {
        return CoreWidgetConfigStore.chartConfig.get(configType).size;
    }

    /**
     * Get inputs for the passed in chart/widget type
     */
    static getInputsForWidgetConfigType(configType: string): WidgetConfigInput[] {
        // We should always use a copy here so that original config is untouched
        const widgetConfig = CoreWidgetConfigStore.chartConfig.get(configType);
        const inputs = [];
        each(widgetConfig.inputCategories, function (cat: WidgetConfigInputCategory) {
            each(cat.inputs, function (input: WidgetConfigInput) {
                // Do a copy here
                inputs.push(cloneDeep(input));
            });
        });

        return inputs;
    }

    /**
     * Get inputs for the passed in chart/widget config type by name
     */
    static getInputsForWidgetConfigByName(configType: string, propertyName: string): WidgetConfigInput {
        const types = WidgetConfigFactory.getInputsForWidgetConfigType(configType);

        return types.find((type: any) => {
            return type.otherNames && type.otherNames.includes(propertyName) || type.inputName === propertyName;
        });
    }

    /**
     * Return true if widget config for the passed in config type has createNestedNoneBuckets set to true
     */
    static isCreateNestedNoneBuckets(configType: string): boolean {
        const createNestedNoneBuckets: boolean = CoreWidgetConfigStore.chartConfig.get(configType).createNestedNoneBuckets;
        return !(!createNestedNoneBuckets && typeof createNestedNoneBuckets === 'boolean');
    }

    /**
     * Return true if widget config for the passed in configType has createNestedOtherBuckets set to true
     */
    static isCreateNestedOtherBuckets(configType: string): boolean {
        const createNestedOtherBuckets: boolean = CoreWidgetConfigStore.chartConfig.get(configType).createNestedOtherBuckets;
        return !(!createNestedOtherBuckets && typeof createNestedOtherBuckets === 'boolean');
    }

    /**
     * Returns the column category for the input widget config type. If column category does not exist, return null;
     */
    static getColumnCategoryForType(configType: string): WidgetConfigInputCategory {
        const inputCategories = CoreWidgetConfigStore.getChartConfigForType(configType).inputCategories;
        const categoryCount = inputCategories.length;
        for (let categoryIndex = 0; categoryIndex < categoryCount; categoryIndex++) {
            if (inputCategories[categoryIndex].categoryType === WidgetInputType.COLUMNS) {
                return inputCategories[categoryIndex];
            }
        }
        return null;
    }

    /**
     * Return ShowWidgetInfoIcon for the passed in configType
     */
    static getShowWidgetInfoIcon(configType: string): boolean {
        return CoreWidgetConfigStore.chartConfig.get(configType).showWidgetInfoIcon;
    }

    /**
     * Return getHideSorting for the passed in configType
     */
    static getHideSorting(configType: string): boolean {
        return CoreWidgetConfigStore.chartConfig.get(configType).hideSorting;
    }

    /**
     * Return getHGideBreakdownInSorting for the passed in configType
     */
    static getHideBreakdownInSorting(configType: string): boolean {
        return CoreWidgetConfigStore.chartConfig.get(configType).hideBreakdownInSorting;
    }

    /**
     * Return getHideTopBottomSectorToggle for the passed in configType
     */
    static getHideTopBottomSectorToggle(configType: string): boolean {
        return CoreWidgetConfigStore.chartConfig.get(configType).hideTopBottomSectorToggle;
    }

    /**
     * Return showGridTransitionControl for the passed in configType
     */
    static getShowGridTransitionControl(configType: string): boolean {
        return CoreWidgetConfigStore.chartConfig.get(configType).showGridTransitionControl;
    }

    /**
     * Return getHideTotal for the passed in configType
     */
    static getHideTotal(configType: string): boolean {
        return CoreWidgetConfigStore.chartConfig.get(configType).hideTotal;
    }

    /**
     * Return showOnlySingleColumn for the passed in configType
     */
    static getShowOnlySingleColumn(configType: string): boolean {
        return CoreWidgetConfigStore.chartConfig.get(configType).showOnlySingleColumn;
    }

    /**
     * Return the charting lib for the passed in configType
     */
    static getWidgetChartingLib(configType: string): string {
        return CoreWidgetConfigStore.chartConfig.get(configType).chartingLib;
    }

    /**
     * Return the settings that can modify widget title for the passed in configType
     */
    static getSettingsThatCanModifyWidgetTitle(configType: string): string[] {
        return CoreWidgetConfigStore.chartConfig.get(configType).settingsThatCanUpdateWidgetTitle;
    }

    /**
     * If the widget supports showing the compare tabs.
     */
    static getShowCompareTabs(configType: string): boolean {
        return CoreWidgetConfigStore.chartConfig.get(configType).showCompareTabs;
    }

    /**
     * If the widget supports table search
     */
    static getShowTableSearch(configType: string): boolean {
        return !!CoreWidgetConfigStore.chartConfig.get(configType).showTableSearch;
    }

    /**
     * Converts legacy widget types into their new widget types
     */
    static convertLegacyWidgetTypes(widget: any): void {
        // If ACRM 1.0 is disabled, convert ACRM 1.0 widgets to ACRM 2.0 widgets
        const isCommitmentRiskLegacyEnabled = TokenUtils.isFeatureEnabled(TokenConstants.ENABLE_COMMITMENT_RISK_LEGACY);
        if (widget.configType === WidgetConfigType.COMMITMENT_RISK_LEGACY && !isCommitmentRiskLegacyEnabled) {
            widget.configType = WidgetConfigType.COMMITMENT_RISK;
        } else if (widget.configType === WidgetConfigType.COMMITMENT_RISK_CHART_LEGACY && !isCommitmentRiskLegacyEnabled) {
            widget.configType = WidgetConfigType.COMMITMENT_RISK_CHART;
        }
    }

    /**
     * This function reads hidden columns from widget config, create column object of hidden columns and set on column input.
     */
    private static setHiddenColumns(widgetConfig: WidgetConfig) {

        if (isNil(widgetConfig.inputCategories)) {
            return;
        }

        // Get column Input category
        const columnCategory: WidgetConfigInputCategory = widgetConfig.inputCategories.filter(inputCategory => inputCategory.categoryType === WidgetInputType.COLUMNS).pop();

        if (isNil(columnCategory)) {
            return;
        }
        // Get column input.
        const columnInput: WidgetConfigInput = columnCategory.inputs.filter(input => input.inputConfigType === WidgetInputType.COLUMNS).pop();

        // Check if hidden columns are defined for widget.
        if (isNil(columnInput.hiddenColumns) || isEmpty(columnInput.hiddenColumns)) {
            return;
        }

        // Create columnset config of hidden column.
        const hiddenColumnSet: ColumnSet = ConfigTypeFactory.createConfig(columnInput.hiddenColumns, columnInput.inputConfigType, false);
        columnInput.hiddenColumns = hiddenColumnSet.columns;
    }


    constructor(private widgetConfigResolverService: WidgetConfigResolverService) {
    }

    /**
     * Converts the widget payload and substitutes in the linked objects.
     */
    loadChartConfig$(): Observable<void> {
        return this.widgetConfigResolverService.resolveConfig$(widgetsJson, {requestLoadingMessage: StatusConstants.LOADING_WIDGET_CONFIGS})
            .pipe(map((data) => {
                // remove any widgets that are not allowed based on permissions
                each(Object.keys(data), (key: string) => {

                    const widgetConfig: WidgetConfig = data[key];

                    const isEnabled = TokenUtils.isOptionEnabledBasedOnTokenOrUserPerm(widgetConfig.tokenToCheck, widgetConfig.userPermToCheck);

                    if (!isEnabled) {
                        return;
                    }

                    WidgetConfigFactory.setHiddenColumns(widgetConfig);

                    CoreWidgetConfigStore.chartConfig.set(key, new WidgetConfig(widgetConfig));

                    // construct table and chart widgets
                    if (widgetConfig.showInSelector) {
                        if (widgetConfig.chartingLib === CoreWidgetConstants.CHARTING_LIB.AG_GRID) {
                            WidgetConfigFactory.tableWidgets.push(widgetConfig);
                        } else if (widgetConfig.chartingLib === CoreWidgetConstants.CHARTING_LIB.HIGHCHART) {
                            WidgetConfigFactory.chartWidgets.push(widgetConfig);
                        }
                    }
                });
            }));
    }
}
