import {RiskAndExposureService} from '@services/widget/risk-and-exposure.service';
import {ExploreResponse} from '@interfaces/response.interface';
import {Injectable} from '@angular/core';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {NotificationService} from '@services/notification';
import {isEmpty} from 'lodash';
import {Widget} from '@models/widget/widget.model';
import {RequestAdapterConfig} from '@interfaces/request.interface';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {WidgetUtils} from '@utils/widget.utils';
import {
    ColumnConfig,
    ResponseData,
    TokenConstants,
    TokenUtils,
    WidgetConfigType,
    WidgetInput
} from '@blk/explore-ui-core';
import {CellValueChangedEvent, EditableCallback, GridApi, RowNode, ValueSetterFunc} from 'ag-grid-community';
import {
    PortSearchEditorComponent
} from '../../../modules/multi-manager-config/port-search-editor-comp/port-search-editor.component';
import {AppStore} from '../../../app.store';
import {ReactiveCubeCrud} from '@qbstr/data-cube-reactive';
import {DataRequestConstants} from '@constants/data-request.constants';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {DecisionLevelConfig} from '@models/portfolio/decisionLevels/decision-level-config.model';
import {CommonConstants} from '@constants/common.constants';
import {MultiManagerConstants} from '@constants/multi-manager.constants';


@Injectable()
export class DecisionBenchmarkService extends RiskAndExposureService {
    protected readonly DECISION_LEVEL_CAP: number = 3;


    private editableCallback: EditableCallback = (params) => params.colDef.field === 'level' + params.node.level + '_decision';

    private valueSetter: ValueSetterFunc<RowNode, string> = (params) => {
        const valueChange = !isEmpty(params.newValue) && params.oldValue !== params.newValue;
        if (valueChange) {
            params.node.data[params.column.getColId()] = params.newValue;
        }
        return valueChange;
    }

    private onCellValueChanged: (params: CellValueChangedEvent, cube: ReactiveCubeCrud, columns: string[]) => void = (params, cube, columns) => {
        if (isEmpty(params.newValue)) {
            return;
        }

        const targetRowKeys = this.copyDownCellValues(params, cube, columns);

        this.appStore.decisionLevelChangeInfo$.next(
            targetRowKeys
                .map(rowNodeKey => ({
                    decisionBench: params.newValue,
                    decisionPath: rowNodeKey,
                    level: params.node.level
                }))
        );
    };

    private copyDownCellValues(params: CellValueChangedEvent, cube: ReactiveCubeCrud, columns: string[]): string[] {
        const route = params.node.getRoute();
        const rawRow = cube['getRawRow'](route);
        const childRecords: ResponseData[] = rawRow?.children;
        const targetRowKeys: string[] = [params.node.key];

        // If the node is a leaf level node, update the value and return
        if (isEmpty(childRecords)) {
            rawRow.data[columns.indexOf(params.colDef.field)] = params.newValue;
            return targetRowKeys;
        }

        this.copyDownCellValuesToChildren(route, params.newValue, cube, columns.indexOf(params.colDef.field), params.api, targetRowKeys);

        return targetRowKeys;
    }

    private copyDownCellValuesToChildren(route: string[], newVal: string, cube: ReactiveCubeCrud, decisionColValIndex: number, api: GridApi, targetRowKeys: string[]): void {
        const childRecords: ResponseData[] = cube['getRawRow'](route)?.children;
        if (isEmpty(childRecords)) {
            return;
        }

        childRecords.forEach(record => {
            record.data[decisionColValIndex] = newVal;
            this.copyDownCellValuesToChildren([...route, record.rowId as string], newVal, cube, decisionColValIndex, api, targetRowKeys);
        });

        api.refreshServerSide({route});
    }

    constructor(
        protected exploreDataRequestService: ExploreDataRequestService,
        protected notificationService: NotificationService,
        protected appStore: AppStore
    ) {
        super(
            exploreDataRequestService,
            notificationService
        );
    }

    protected getUrlToBeUsed(_isCompareMode: boolean): string {
        return DataRequestConstants.DATA_REQUEST_URL.DECISION_BENCH;
    }

    protected determineIfDataPresent(response: ExploreResponse): boolean {
        return !isEmpty(response.data?.data?.children);
    }

    protected getInitialCombinedParams(): any {
        const initCombinedParams = super.getInitialCombinedParams();
        initCombinedParams.isDecisionLevelData = true;
        return initCombinedParams;
    }

    /**
     * Function to create request params for Decision Benchmark widget
     */
    protected createWidgetRequestParams(widget: Widget, requestParams: any, portfolio: Portfolio, widgetInputs: Map<string, WidgetInput>, isExportRequest?: boolean, omitData?: boolean, isRisklessCashBucketEnabled?: boolean): any {
        const widgetRequestParams = super.createWidgetRequestParams(widget, requestParams, portfolio, widgetInputs, isExportRequest, omitData, isRisklessCashBucketEnabled);
        const hasDecisionConfig = widgetRequestParams.portTreeDecisionLevel > 0 || DecisionLevelConfig.isArrangedByTopdown(portfolio.decisionLevelsConfig);
        const shouldEnableLookthrough = TokenUtils.isValueDelimitedFeatureEnabled(
            TokenConstants.EXPLORE_ENABLE_MULTI_MANAGER_UI,
            CommonConstants.COLUMN_KEY_SPLITTER,
            MultiManagerConstants.WIDGET_TYPE_TO_TOKEN_VAL_MAP.get(WidgetConfigType.RISK_EXPOSURE)
        );
        if (hasDecisionConfig) {
            if (shouldEnableLookthrough && !portfolio.lookthroughSettings.isLookThroughEnabled) {
                // in case of decision benchmark screen, if we have multi-manager enabled on Risk & Exposure (token controlled)
                // and look-through is not enabled, we need to enable look-through
                widgetRequestParams.isLookthroughEnabled = true;
                if (!isEmpty(portfolio.lookthroughSettings?.ltSecurityTypes)) {
                    requestParams.ltSecurityTypes = portfolio.lookthroughSettings.ltSecurityTypes.join(',');
                }
                if (!isEmpty(portfolio.lookthroughSettings?.ltProxies)) {
                    requestParams.ltSecurityProxyTypes = portfolio.lookthroughSettings.ltProxies.join(',');
                }
            } else if (!shouldEnableLookthrough && portfolio.lookthroughSettings.isLookThroughEnabled) {
                // if we have multi-manager disabled on Risk & Exposure (token controlled)
                // and look-through is enabled, we need to disable look-through (as it's not supported on PGS - applicable to release v2024.6)
                widgetRequestParams.isLookthroughEnabled = false;
            }
        }
        widgetRequestParams.isSectorView = 'Y';

        return widgetRequestParams;
    }

    protected processResponse(widget: Widget, requestAdapterConfig: RequestAdapterConfig, response: ExploreResponse, widgetPayload: WidgetPayload, request: any) {
        if (!request?.portTreeDecisionLevel && (isEmpty(request?.topDownCols) || !request.topDownCols.some((col: string) => col != null))) {
            throw new Error('Decision bench params are required in the request');
        }

        if (!!request.portTreeDecisionLevel) {
            response.data.data = response.data.data.children[0];
        }
        const rowIdToDataMap: Map<string, ResponseData> = new Map<string, ResponseData>();
        this.setRowIdBasedOnHierarchy(response.data.data, request.portfolio, rowIdToDataMap);

        //Setting allSectorPaths in decisionLevelsConfig at portfolio level
        let allPaths = Array.from(rowIdToDataMap.keys());
        allPaths.shift();
        widgetPayload.widgetSpecificData = {
            allSectorPaths:allPaths
        };

        if (!!request.portTreeDecisionLevel || !isEmpty(request.topDownCols)) {
            for (let level = 1; level <= (request.portTreeDecisionLevel || this.DECISION_LEVEL_CAP); level++) {
                this.generateColumns(level, requestAdapterConfig, response);
            }
        }

        if (!isEmpty(request.decisionBenchMap)) {
            // Convert decisionBenchMap from an object to a Map
            const decisionBenchMap: Map<string, string> = new Map(Object.entries(JSON.parse(request.decisionBenchMap)));

            // For each key in decisionBenchMap, call the function with the root of the tree and the path to the target node
            this.populateNodeAndChildren(rowIdToDataMap, decisionBenchMap);
        }


        super.processResponse(widget, requestAdapterConfig, response, widgetPayload);

        [...requestAdapterConfig.columns, ...requestAdapterConfig.splitColumns]
            .filter(col => col.columnTag === 'benchmark' && col.columnKey.includes('decision'))
            .forEach(decisionCol => decisionCol.onCellValueChanged = params => {
                this.onCellValueChanged(params, widgetPayload.cube, response.data.columns);
            });
    }


    private generateColumns(decisionLevel: number, requestAdapterConfig: RequestAdapterConfig, response: ExploreResponse): void {
        const columnKey = 'level' + decisionLevel + '_decision';
        const title = 'Level ' + decisionLevel + ' Decision Benchmark';
        const levelColConfig = ColumnConfig.createColumn(
            'benchmark',
            '',
            columnKey,
            title
        );

        if(requestAdapterConfig.columns.find(col => col.columnTag === 'security_description')) {
            requestAdapterConfig.columns.find(col => col.columnTag === 'security_description').flex = 1;
        }

        requestAdapterConfig.columns = [
            ...requestAdapterConfig.columns,
            WidgetUtils.createVizColumn({
                column: levelColConfig,
                editableCallback: this.editableCallback,
                flex: 1,
                cellEditor: PortSearchEditorComponent,
                valueSetter: this.valueSetter
            })
        ];

        requestAdapterConfig.splitColumns = [
            ...requestAdapterConfig.splitColumns,
            WidgetUtils.createVizColumn({
                column: levelColConfig,
                editableCallback: this.editableCallback,
                flex: 1,
                cellEditor: PortSearchEditorComponent,
                valueSetter: this.valueSetter
            })
        ];

        response.data.columns.push(columnKey);
        response.data.columnHeaderDetails.columnKeyToTagMap[columnKey] = columnKey;
        response.data.columnHeaderDetails.columnKeyToDisplayNameMap[columnKey] = title;
    }

    private setRowIdBasedOnHierarchy(data: ResponseData, portfolio: string, rowIdToDataMap: Map<string, ResponseData>): void {

        if (isEmpty(data?.children)) {
            return;
        }

        data.rowId = portfolio;
        rowIdToDataMap.set(data.rowId, data);
        data.children.forEach(child => {
            child.rowId = portfolio.concat('->').concat(child.title);
            rowIdToDataMap.set(child.rowId, child);
            if (!isEmpty(child.children)) {
                child.children.forEach(subChild => this.setRowIdOnNode(subChild, (child.rowId as string).concat('->').concat(subChild.title), rowIdToDataMap));
            }
        });
    }

    private setRowIdOnNode(node: any, path: string, rowIdToDataMap: Map<string, ResponseData>): void {
        node.rowId = path;
        rowIdToDataMap.set(node.rowId, node);
        if (!isEmpty(node.children)) {
            node.children.forEach(child => this.setRowIdOnNode(child, path.concat('->').concat(child.title), rowIdToDataMap));
        }
    }

    /**
     * Function to populate the decision benchmarks of all portfolios according to sector path
     * @param rowIdToDataMap
     * @param decisionBenchMap
     * @private
     */
    private populateNodeAndChildren(rowIdToDataMap: Map<string, ResponseData>, decisionBenchMap: Map<string, string>): void {
        decisionBenchMap.forEach((value, key) => {
            const rowData = rowIdToDataMap.get(key);
            if (!rowData) {
                return;
            }

            rowData.data.push(value);
            this.populateChildrenWithDecisionBench(rowData, value);
        });
    }

    private populateChildrenWithDecisionBench(rowData: ResponseData, value: string): void {
        if (!rowData.children) {
            return;
        }

        for (const child of rowData.children) {
            child.data.push(value);
            this.populateChildrenWithDecisionBench(child, value);
        }
    }
}


