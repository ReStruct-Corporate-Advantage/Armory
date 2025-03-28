import {Injectable} from '@angular/core';
import {ColumnConfig, CommonUtils, CoreRequestConstants, WidgetConfigType, WidgetInput, WidgetInputType} from '@blk/explore-ui-core';
import {Observable, throwError} from 'rxjs';
import {HttpParams} from '@angular/common/http';
import {catchError, map} from 'rxjs/operators';
import {ExploreResponse, ExploreResponseConfig} from '@interfaces/response.interface';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {PortfolioSecurityHoldingChange} from '@models/portfolio/composition/portfolio-security-holding-change.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {RequestAdapterConfig, VizualizationColumnConfig} from '@interfaces/request.interface';
import {WidgetDataStoreMetaData} from '@models/dataStore/widget-data-store-meta-data.model';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {Widget} from '@models/widget/widget.model';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {Http2BmsService} from '@services/bms';
import {LookthroughConstants} from '@blk/explore-ui-look-through-settings';
import {ExpandedState} from '@models/widget/inputs/expanded-state.model';
import {TreeCube} from '@utils/qbstr/tree-cube';
import {getBreakdownLevels} from '@utils/qbstr';

@Injectable({
    providedIn: 'root'
})
export class LookthroughService {
    constructor(private httpService: Http2BmsService) {
    }

    /**
     * This service method takes portfolio information as argument and returns look-through securities information
     */
    getLookthroughInfo$(portfolio: Portfolio): Observable<ExploreResponse> {
        const requestParams = this.createLookThroughRequestParam(portfolio);
        const loadingKey = CoreRequestConstants.LOADING_PREFIX + CommonUtils.generateUniqueIdAsString(7);
        return this.httpService
            .post$('lookThroughInfo', requestParams, new HttpParams({
                fromObject: {
                    [CoreRequestConstants.LOADING_KEY]: loadingKey
                }
            }))
            .pipe(
                map((response: ExploreResponse) => {
                    return response;
                }), catchError((error) => {
                    return throwError(error);
                }));
    }

    /**
     * This method returns lookThrough request
     */
    createLookThroughRequestParam(portfolio: Portfolio): any {
        const requestParams: any = {};
        requestParams.isLookthroughEnabled = portfolio.lookthroughSettings.isLookThroughEnabled;
        requestParams.isBenchLookthroughEnabled = portfolio.lookthroughSettings.isBenchLookThroughEnabled;
        requestParams.ltSecurityTypes = portfolio.lookthroughSettings.ltSecurityTypes;
        requestParams.ltSecurityProxyTypes = portfolio.lookthroughSettings.ltProxies;
        requestParams.lookthroughRules = portfolio.lookthroughSettings.ltFilterRulesFav.serializeRulesForDataRequest();
        requestParams.isLookThroughInheritanceEnabled = portfolio.lookthroughSettings.isLookThroughInheritanceEnabled;
        requestParams.splitPositionTypes = portfolio.splitPositionSettings.selectedPositionTypes;
        if (portfolio.isModified()) {
            requestParams.additionalSecurities = (portfolio as WhatIfPortfolio).holdingChanges
                .filter(change => change instanceof PortfolioSecurityHoldingChange)
                .map(change => change.lineItem);
        } else {
            requestParams.additionalSecurities = [];
        }

        requestParams.columns = this.getColsConfig();
        requestParams.dataFormat = 'COMPACT_JSON';
        requestParams.forDate = portfolio.datePicker.date;
        requestParams.portfolio = portfolio.portName;
        requestParams.benchmark = portfolio.benchmark.name;

        return requestParams;
    }

    /**
     * Returns column config data with prefixed columns
     */
    getColsConfig(): ColumnConfig[] {
        return [
            ColumnConfig.createColumn(LookthroughConstants.PORT_NAME_COL_TAG, '', LookthroughConstants.PORT_NAME_COL_KEY, LookthroughConstants.PORT_NAME_COL_DESC),
            ColumnConfig.createColumn(LookthroughConstants.SEC_GROUP_COL_TAG, '', LookthroughConstants.SEC_GROUP_COL_KEY, LookthroughConstants.SEC_GROUP_COL_DESC),
            ColumnConfig.createColumn(LookthroughConstants.SEC_TYPE_COL_TAG, '', LookthroughConstants.SEC_TYPE_COL_KEY, LookthroughConstants.SEC_TYPE_COL_DESC),
            ColumnConfig.createColumn(LookthroughConstants.SEC_DESC_COL_TAG, '', LookthroughConstants.SEC_DESC_COL_KEY, LookthroughConstants.SEC_DESC_COL_DESC),
            ColumnConfig.createColumn(LookthroughConstants.ISSUER_NAME_COL_TAG, '', LookthroughConstants.ISSUER_NAME_COL_KEY, LookthroughConstants.ISSUER_NAME_COL_DESC),
            ColumnConfig.createColumn(LookthroughConstants.ADL_INFO_COL_TAG, '', LookthroughConstants.ADL_INFO_COL_KEY, LookthroughConstants.ADL_INFO_COL_DESC),
            ColumnConfig.createColumn(LookthroughConstants.TYPE_COL_TAG, '', LookthroughConstants.TYPE_COL_KEY, LookthroughConstants.TYPE_COL_DESC)
        ];
    }

    /**
     * Return Viz LT columns with prefixed columns
     */
    getVisColsConfig(): VizualizationColumnConfig[] {
        return [
            {
                columnKey: LookthroughConstants.PORT_NAME_COL_KEY,
                columnTitle: LookthroughConstants.PORT_NAME_COL_DESC,
                originalColumnTitle: LookthroughConstants.PORT_NAME_COL_DESC,
                formatter: {format: (val) => val},
                dataType: 'STRING',
                columnTag: LookthroughConstants.PORT_NAME_COL_TAG,
                isHidden: false,
                isSubtotalable: false
            },
            {
                columnKey: LookthroughConstants.SEC_GROUP_COL_KEY,
                columnTitle: LookthroughConstants.SEC_GROUP_COL_DESC,
                originalColumnTitle: LookthroughConstants.SEC_GROUP_COL_DESC,
                formatter: {format: (val) => val},
                dataType: 'STRING',
                columnTag: LookthroughConstants.SEC_GROUP_COL_TAG,
                isHidden: false,
                isSubtotalable: false
            },
            {
                columnKey: LookthroughConstants.SEC_TYPE_COL_KEY,
                columnTitle: LookthroughConstants.SEC_TYPE_COL_DESC,
                originalColumnTitle: LookthroughConstants.SEC_TYPE_COL_DESC,
                formatter: {format: (val) => val},
                dataType: 'STRING',
                columnTag: LookthroughConstants.SEC_TYPE_COL_TAG,
                isHidden: false,
                isSubtotalable: false
            },
            {
                columnKey: LookthroughConstants.SEC_DESC_COL_KEY,
                columnTitle: LookthroughConstants.SEC_DESC_COL_DESC,
                originalColumnTitle: LookthroughConstants.SEC_DESC_COL_DESC,
                formatter: {format: (val) => val},
                dataType: 'STRING',
                columnTag: LookthroughConstants.SEC_DESC_COL_TAG,
                isHidden: false,
                isSubtotalable: false
            },
            {
                columnKey: LookthroughConstants.ISSUER_NAME_COL_KEY,
                columnTitle: LookthroughConstants.ISSUER_NAME_COL_DESC,
                originalColumnTitle: LookthroughConstants.ISSUER_NAME_COL_DESC,
                formatter: {format: (val) => val},
                dataType: 'STRING',
                columnTag: LookthroughConstants.ISSUER_NAME_COL_TAG,
                isHidden: false,
                isSubtotalable: false
            },
            {
                columnKey: LookthroughConstants.ADL_INFO_COL_KEY,
                columnTitle: LookthroughConstants.ADL_INFO_COL_DESC,
                originalColumnTitle: LookthroughConstants.ADL_INFO_COL_DESC,
                formatter: {format: (val) => val},
                dataType: 'STRING',
                columnTag: LookthroughConstants.ADL_INFO_COL_TAG,
                isHidden: false,
                isSubtotalable: false
            },
            {
                columnKey: LookthroughConstants.TYPE_COL_KEY,
                columnTitle: LookthroughConstants.TYPE_COL_DESC,
                originalColumnTitle: LookthroughConstants.TYPE_COL_DESC,
                formatter: {format: (val) => val},
                dataType: 'STRING',
                columnTag: LookthroughConstants.TYPE_COL_TAG,
                isHidden: false,
                isSubtotalable: false
            }
        ];
    }

    /**
     * Return LT columns with static prefixed column keys
     */
    public getCols(): any [] {
        return [LookthroughConstants.PORT_NAME_COL_KEY, LookthroughConstants.SEC_GROUP_COL_KEY, LookthroughConstants.SEC_TYPE_COL_KEY, LookthroughConstants.SEC_DESC_COL_KEY, LookthroughConstants.ISSUER_NAME_COL_KEY, LookthroughConstants.ADL_INFO_COL_KEY, LookthroughConstants.TYPE_COL_KEY];
    }

    public getMetaData(): WidgetDataStoreMetaData {
        const metaData = new WidgetDataStoreMetaData();
        metaData.inputs.set('columns', new ColumnSet(this.getColsConfig()));
        return metaData;
    }

    /**
     * Return request config
     */
    requestConfig(portname: string): RequestAdapterConfig {
        return {
            columns: this.getVisColsConfig(),
            columnFilters: {},
            isCompareMode: false,
            portfolio: portname,
            splitColumns: this.getVisColsConfig()
        };
    }

    /**
     * Returns response config
     */
    responseConfig(): ExploreResponseConfig {
        return {
            columns: this.getCols(),
            columnHeaderDetails: {
                columnKeyToDisplayNameMap: {
                    [LookthroughConstants.PORT_NAME_COL_KEY] : LookthroughConstants.PORT_NAME_COL_DESC,
                    [LookthroughConstants.SEC_GROUP_COL_KEY] : LookthroughConstants.SEC_GROUP_COL_DESC,
                    [LookthroughConstants.SEC_TYPE_COL_KEY] : LookthroughConstants.SEC_TYPE_COL_DESC,
                    [LookthroughConstants.SEC_DESC_COL_KEY] : LookthroughConstants.SEC_DESC_COL_DESC,
                    [LookthroughConstants.ISSUER_NAME_COL_KEY] : LookthroughConstants.ISSUER_NAME_COL_DESC,
                    [LookthroughConstants.ADL_INFO_COL_KEY] : LookthroughConstants.ADL_INFO_COL_DESC,
                    [LookthroughConstants.TYPE_COL_KEY] : LookthroughConstants.TYPE_COL_DESC
                },
                possibleColumnGroups: [],
                columnKeyToTagMap: {
                    [LookthroughConstants.PORT_NAME_COL_KEY] : LookthroughConstants.PORT_NAME_COL_TAG,
                    [LookthroughConstants.SEC_GROUP_COL_KEY] : LookthroughConstants.SEC_GROUP_COL_TAG,
                    [LookthroughConstants.SEC_TYPE_COL_KEY] : LookthroughConstants.SEC_TYPE_COL_TAG,
                    [LookthroughConstants.SEC_DESC_COL_KEY] : LookthroughConstants.SEC_DESC_COL_TAG,
                    [LookthroughConstants.ISSUER_NAME_COL_KEY] : LookthroughConstants.ISSUER_NAME_COL_TAG,
                    [LookthroughConstants.ADL_INFO_COL_KEY] : LookthroughConstants.ADL_INFO_COL_TAG,
                    [LookthroughConstants.TYPE_COL_KEY] : LookthroughConstants.TYPE_COL_TAG
                }
            }
        };
    }

    /**
     * Create a new LookThrough Widget with static data
     */
    public createWidget(portfolio: Portfolio, widCongType: WidgetConfigType): Widget {
        const widget = new Widget((widCongType) ? widCongType : null);
        widget.displayInputs = new Map<string, WidgetInput>();
        widget.displayInputs.set(ExpandedState.CONFIG_TYPE, new ExpandedState({allExpanded: true}));
        widget.title = portfolio.portName;
        widget.dataStore.metaData = this.getMetaData();
        const widgetPayload: WidgetPayload = {
            requestConfig: this.requestConfig(portfolio.portName),
            responseConfig: this.responseConfig(),
            widgetConfigType: WidgetConfigType.LOOK_THROUGH_SUMMARY
        };
        widget.dataStore.data = widgetPayload;
        widget.dataStore.metaData = new WidgetDataStoreMetaData();
        widget.dataStore.metaData.inputs = new Map<string, WidgetInput>();
        const colSet: ColumnSet = new ColumnSet();
        colSet.columns = this.getColsConfig();
        widget.dataStore.metaData.inputs.set(WidgetInputType.COLUMNS, colSet);

        return widget;
    }

    /**
     * Populate response data
     */
    populateResponseData(payload: ExploreResponse, widgetPayload: WidgetPayload, portfolioName: string): void {
        widgetPayload.cube = new TreeCube(portfolioName, this.getVisColsConfig(), payload.data);
        widgetPayload.responseConfig.columns = payload.data.columns;
        widgetPayload.breakdownLevels = getBreakdownLevels(payload.data.data);
    }
}
