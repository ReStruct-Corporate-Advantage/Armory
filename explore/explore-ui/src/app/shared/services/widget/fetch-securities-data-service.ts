import {AbstractWidgetService} from '@services/widget/abstract-widget.service';
import {Widget} from '@models/widget/widget.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Report} from '@models/workspace/report.model';
import {WorkspaceStore} from '@stores/workspace.store';
import {ColumnConstants, WidgetConfigType, WidgetInput, WidgetInputType} from '@blk/explore-ui-core';
import {WidgetConfigFactory} from '../../../factories';
import {ColumnSectorRule, CustomSector, GroupRule, CustomFilter} from '@blk/explore-ui-breakdown';
import {DataRequestConstants} from '@constants/data-request.constants';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {WidgetDataViewOption} from '@enums/widget-data-view-option.enum';
import {Injectable} from '@angular/core';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {PortfolioSecurity} from '@interfaces/portfolio-security.interface';

/**
 * This service will be used to fetch securities as per security type & security group
 */
@Injectable()
export class FetchSecuritiesDataService extends AbstractWidgetService {

    /**
     * Creates a new instance with the given parameter
     */
    constructor(protected exploreDataRequestService: ExploreDataRequestService) {
        super(DataRequestConstants.DATA_REQUEST_URL.BASE, exploreDataRequestService, [WidgetConfigType.RISK_EXPOSURE], WidgetDataViewOption.HOLDINGS_VIEW);
    }

    /**
     * Fetch Securities for given portfolio, security Type and security Group
     * @param portfolio
     * @param secType
     * @param secGroup
     */
    fetchPortfolioSecurities(portfolio: Portfolio, secType: string, secGroup: string) : Observable<PortfolioSecurity[]> {
        const widget: Widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        const report: Report = WorkspaceStore.getCurrentReport();

        widget.widgetConfigInputs = WidgetConfigFactory.getInputsForWidgetConfigType(WidgetConfigType.RISK_EXPOSURE);
        widget.initializeInputs();

        const widgetInputs: Map<string, WidgetInput> = new Map(widget.dataStore.metaData.inputs);

        this.modifyWidgetInputs(widgetInputs, widget, secType, secGroup);
        const request = this.createFinalDataRequest(widget, [portfolio], report, widgetInputs);
        request.widgetId = widget.id;

        return this.exploreDataRequestService.getData$(request, false, this.baseUrl).pipe(
            map(response => {
                if (response.message === DataRequestConstants.DUPLICATE_REQUEST || response.message === DataRequestConstants.CANCELLED_RESPONSE) {
                    return;
                }

                if (response.data && response.data.data && response.data.data.children) {
                    return response.data.data.children.map( node => (
                        {secDesc : node.data[0], cusip : node.data[1]}));
                }

                return [];
            })
        );
    }

    /**
     * modify column to have all the request column with no breakdown and custom filter to get specific cusips
     * @param widgetInputs
     * @param widget
     * @param secType
     * @param secGroup
     */
    protected modifyWidgetInputs(widgetInputs: Map<string, WidgetInput>, widget: Widget, secType: string, secGroup: string) {
        // Add columns to widgetInputs
        const columnSet: ColumnSet = new ColumnSet();

        columnSet.createColumnAndAdd(ColumnConstants.COLUMN_TAG.SEC_DESC);
        columnSet.createColumnAndAdd(ColumnConstants.COLUMN_TAG.CUSIP);

        // add custom Filter
        const customFilter: CustomFilter = new CustomFilter();
        customFilter.customSector = new CustomSector();
        customFilter.customSector.rule = new GroupRule();
        const secTypeRule: ColumnSectorRule = new ColumnSectorRule({colTitle: 'Security Type', colTag: 'sec_type', compType: 'EQUALS', colPositionColumnType:'ALL'});
        const secGroupRule: ColumnSectorRule = new ColumnSectorRule({colTitle: 'Security Group', colTag: 'sec_group', compType: 'EQUALS', colPositionColumnType:'ALL'});

        secTypeRule.comparisonValues = [secType];
        secGroupRule.comparisonValues = [secGroup];

        (customFilter.customSector.rule as GroupRule).groupType = 'AND';
        (customFilter.customSector.rule as GroupRule).subRules = [secTypeRule, secGroupRule];

        // lets add updated widgetInput in dataStore
        widget.dataStore.metaData.inputs.set(WidgetInputType.COLUMNS, columnSet);
        widget.dataStore.metaData.inputs.set(WidgetInputType.BREAKDOWN_TREE, null);
        widget.dataStore.metaData.inputs.set(WidgetInputType.FILTER, customFilter);
        widgetInputs.set(WidgetInputType.COLUMNS, columnSet);
        widgetInputs.set(WidgetInputType.BREAKDOWN_TREE, null);
        widgetInputs.set(WidgetInputType.FILTER, customFilter);
    }

    /**
     * @param widgetInputs
     * @param widget
     */
    protected modifyWidgetInputsForRequest(widgetInputs: Map<string, WidgetInput>, widget: Widget): void {
        // empty
    }
}
