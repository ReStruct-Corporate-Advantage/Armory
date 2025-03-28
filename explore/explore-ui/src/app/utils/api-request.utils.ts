import {Portfolio} from '@models/portfolio/portfolio.model';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {Breakdown, CustomFilter} from '@blk/explore-ui-breakdown';
import {WidgetDataStoreMetaData} from '@models/dataStore/widget-data-store-meta-data.model';
import {CoreConfigUtils, WidgetInput, WidgetInputType} from '@blk/explore-ui-core';

export class ApiRequestUtils {

    /**
     * Post process Generate API request
     */
    public static postProcessRequestParams(widgetMetaData: WidgetDataStoreMetaData, portfolio: Portfolio, params: any): void {
        if (portfolio?.filter?.customSector?.id) {
            params.compositeFilterFavId = portfolio.filter.customSector.id;
        }

        const breakdown = widgetMetaData.inputs.get(WidgetInputType.BREAKDOWN_TREE) as Breakdown;
        if (breakdown?.id) {
            params.breakdownFavId = breakdown.id;
        }

        const riskFactorbreakdown = widgetMetaData.inputs.get(WidgetInputType.RISK_FACTOR_BREAKDOWN) as Breakdown;
        if (riskFactorbreakdown?.id) {
            params.riskFactorBreakdownFavId = riskFactorbreakdown.id;
        }

        const widgetFilter = widgetMetaData.inputs.get('filter') as CustomFilter;
        if (widgetFilter?.customSector?.id) {
            params.filterFavId = widgetFilter.customSector.id;
        }

        const ltFilterRules = portfolio.lookthroughSettings.ltFilterRulesFav;
        if (ltFilterRules) {
            params.ltFilterRuleFavId = ltFilterRules.id;
        }

        const columnSet = widgetMetaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet;
        if (columnSet?.id) {
            params.columnSetFavId = columnSet.id;
            return;
        }
        // apply post processing to retain the FavId
        widgetMetaData.inputs.forEach((widgetInput: WidgetInput, key: string) => {
            if (widgetInput && CoreConfigUtils.isRequestParamsWithFavCreator(widgetInput)) {
                widgetInput.addRequestParamsWithFavId(params.prismWebRequest, key);
            }
        });
    }

}


