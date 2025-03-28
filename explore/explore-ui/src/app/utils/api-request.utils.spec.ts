import {Portfolio} from '@models/portfolio/portfolio.model';
import {WidgetDataStoreMetaData} from '@models/dataStore/widget-data-store-meta-data.model';
import {Breakdown, CustomFilter, CustomSector, ColumnBreakdown} from '@blk/explore-ui-breakdown';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {DateValue, WidgetInputType} from '@blk/explore-ui-core';
import {Benchmark} from '@models/portfolio/benchmark.model';
import {BenchmarkConstants} from '@constants/benchmark.constants';
import {ApiRequestUtils} from '@utils/api-request.utils';
import {LookthroughfilterRulesFav} from '@models/lookthrough/look-through-filter-rules-fav.model';



describe('ApiRequestUtils', () => {

    describe('postProcessRequestParams', () => {
        it('ApiRequestUtils Test', () => {
            const portfolio = new Portfolio('PEP', DateValue.newDate('12/31/2021'));
            const widgetMetaData = new WidgetDataStoreMetaData();
            const widgetColumns = new ColumnSet();
            const widgetBreakdown = new Breakdown();
            const filter = new CustomFilter();
            filter.customSector = new CustomSector();
            filter.customSector.id = 91011;
            portfolio.benchmark = Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 1, 'BENCH_TEST');
            widgetColumns.id = 1234;
            widgetBreakdown.id = 5678;
            widgetMetaData.inputs.set(WidgetInputType.COLUMNS, widgetColumns);
            widgetMetaData.inputs.set(WidgetInputType.BREAKDOWN_TREE, widgetBreakdown);
            widgetMetaData.inputs.set(WidgetInputType.FILTER, filter);

            const customSector = new CustomSector();
            customSector.id = 121314;
            portfolio.filter.customSector = customSector;

            portfolio.lookthroughSettings.ltFilterRulesFav = new LookthroughfilterRulesFav();
            portfolio.lookthroughSettings.ltFilterRulesFav.id = 151617;

            const requestParams = {'prismWebRequest': {}};
            ApiRequestUtils.postProcessRequestParams(widgetMetaData, portfolio, requestParams);
            expect(requestParams['columnSetFavId']).toBe(1234);
            expect(requestParams['breakdownFavId']).toBe(5678);
            expect(requestParams['filterFavId']).toBe(91011);
            expect(requestParams['compositeFilterFavId']).toBe(121314);
            expect(requestParams['ltFilterRuleFavId']).toBe(151617);

            const widgetColumnsWithoptions = new ColumnSet();
            const column = widgetColumnsWithoptions
                .createColumnAndAdd('market_val', 'market_val_0', 'PORT', 'Portfolio Market Value');
            const breakdownOption = new ColumnBreakdown();
            breakdownOption.breakdown = new Breakdown();
            breakdownOption.breakdown.id = 171819;
            column.optionValues.push(breakdownOption);

            // new input dataset
            widgetMetaData.inputs.set(WidgetInputType.COLUMNS, widgetColumnsWithoptions);

            ApiRequestUtils.postProcessRequestParams(widgetMetaData, portfolio, requestParams);
            const enrichedColumn = requestParams.prismWebRequest['columns'][0];
            expect(enrichedColumn
                .optionValues['columnBreakdown'].id).toBe(171819);

        });
    });
});
