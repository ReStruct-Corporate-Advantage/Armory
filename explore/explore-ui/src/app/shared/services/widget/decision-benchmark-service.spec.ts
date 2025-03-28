import {TestBed} from '@angular/core/testing';
import {DecisionBenchmarkService} from './decision-benchmark-service';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {NotificationService} from '@services/notification';
import {AppStore} from '../../../app.store';
import {ExploreResponse} from '@interfaces/response.interface';
import {Widget} from '@models/widget/widget.model';
import {RequestAdapterConfig} from '@interfaces/request.interface';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import * as riskExposureConfig from '@blk/explore-ui-core';
import {
    ColumnDefinition,
    CoreColumnUtils,
    CoreWidgetConfigStore,
    ResponseData, TokenUtils,
    WidgetConfig,
    WidgetConfigType
} from '@blk/explore-ui-core';
import {CellValueChangedEvent, GridApi, RefreshServerSideParams, RowNode} from 'ag-grid-community';
import {TreeCube} from '@utils/qbstr/tree-cube';
import {BehaviorSubject} from 'rxjs';
import {WorkspaceStore} from '@stores/workspace.store';
import {Portfolio} from '../../../models/portfolio/portfolio.model';

jest.mock('@services/widget-data/explore-data-request.service');
jest.mock('@services/notification');
jest.mock('../../../app.store');
jest.mock('@blk/explore-ui-core', () => ({
    ...jest.requireActual('@blk/explore-ui-core'),
    CoreColumnUtils: {
        getColumnDefByTagAndUse: jest.fn(),
        getOriginalColumnTitle: jest.fn(),
        getColumnDefByTagAndOptionallyByUse: jest.fn()
    }
}));

// Mock the AppStore
const mockAppStore = {
    decisionLevelChangeInfo$: new BehaviorSubject(null),
    // Add other necessary properties and methods if required
} as unknown as jest.Mocked<AppStore>;

describe('DecisionBenchmarkService', () => {
    let service: DecisionBenchmarkService;
    let exploreDataRequestService: jest.Mocked<ExploreDataRequestService>;
    let notificationService: jest.Mocked<NotificationService>;
    let appStore: jest.Mocked<AppStore>;
    let cube: jest.Mocked<TreeCube>;

    beforeEach(() => {

        TestBed.configureTestingModule({
            providers: [
                DecisionBenchmarkService,
                { provide: ExploreDataRequestService, useValue: exploreDataRequestService },
                { provide: NotificationService, useValue: notificationService },
                { provide: AppStore, useValue: mockAppStore }
            ]
        });
        exploreDataRequestService = TestBed.inject(ExploreDataRequestService) as jest.Mocked<ExploreDataRequestService>;
        notificationService = TestBed.inject(NotificationService) as jest.Mocked<NotificationService>;
        appStore = new AppStore() as jest.Mocked<AppStore>;
        service = TestBed.inject(DecisionBenchmarkService);
        cube = {
            getRawRow: jest.fn().mockReturnValue({
                data:["route"],
                children: []
            })
        } as unknown as jest.Mocked<TreeCube>;

    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return the correct URL', () => {
        expect(service['getUrlToBeUsed'](false)).toBe('getDecisionBenchData');
    });

    it('should determine if data is present', () => {
        const responseWithData: ExploreResponse = {data: { columns: ['column1', 'column2'], data: { children: [{data:[]}], data: ['abc']}}};
        const responseWithoutData: ExploreResponse = {data: {data: {data: []}}};

        expect(service['determineIfDataPresent'](responseWithData)).toBe(true);
        expect(service['determineIfDataPresent'](responseWithoutData)).toBe(false);
    });

    it('should get initial combined params', () => {
        const params = service['getInitialCombinedParams']();
        expect(params.isDecisionLevelData).toBe(true);
    });

    it('should process response correctly', () => {
        const widget = new Widget();
        const requestAdapterConfig: RequestAdapterConfig = { columns: [], splitColumns: [], portfolio: '' };
        const response: ExploreResponse = {data: { columns: ['column1', 'column2'], columnHeaderDetails: {
                    columnKeyToTagMap: {
                        column1: 'tag1',
                        column2: 'tag2'
                    },
                    possibleColumnGroups: [
                        {
                            groupName: 'group1',
                            columnKeys: ['column1'],
                            columnKeyToChildHeaderMap: {
                                column1: 'childHeader1'
                            }
                        }
                    ],
                    columnKeyToDisplayNameMap: {
                        column1: 'Column 1',
                        column2: 'Column 2'
                    },
                    orderedColumnKeys: ['column1', 'column2']
                }, data: { children: [{data:[]}], data: ['abc']}}};
        const widgetPayload: WidgetPayload = { cube: {} as TreeCube };
        const request = { portTreeDecisionLevel: 2, topDownCols: ['col1'], decisionBenchMap: '{}' };
        // Mock the getColumnDefByTagAndUse method
        (CoreColumnUtils.getColumnDefByTagAndUse as jest.Mock).mockReturnValue({
            columnTag: 'security_description',
            uses:'ALL'
        } as ColumnDefinition);
        (CoreColumnUtils.getOriginalColumnTitle as jest.Mock).mockReturnValue('Security Description');
        (CoreColumnUtils.getColumnDefByTagAndOptionallyByUse as jest.Mock).mockReturnValue({
            columnTag: 'security_description',
            uses:'ALL'
        } as ColumnDefinition);
        let mockPortfolio = {
            decisionLevelsConfig :{
                allSectorPaths: ['abc']
            }
        }

        jest.spyOn(WorkspaceStore, 'getCurrentPortfolio').mockReturnValue(mockPortfolio);
        service['processResponse'](widget, requestAdapterConfig, response, widgetPayload, request);

        expect(requestAdapterConfig.columns.length).toBeGreaterThan(0);
    });

    it('should throw error if decision bench params are missing', () => {
        const widget = new Widget();
        const requestAdapterConfig: RequestAdapterConfig = { columns: [], splitColumns: [], portfolio: '' };
        const response: ExploreResponse = {data: {data: {data: []}}};
        const widgetPayload: WidgetPayload = { cube: {} as TreeCube };
        const request = {};

        expect(() => service['processResponse'](widget, requestAdapterConfig, response, widgetPayload, request))
            .toThrow('Decision bench params are required in the request');
    });

    it('should handle cell value change', () => {
        const params: CellValueChangedEvent = {
            type: '',
            newValue: 'newVal',
            oldValue: 'oldVal',
            node: { level: 1, data: {}, getRoute: () => ["route"], key: 'key' } as RowNode,
            colDef: { field: 'level1_decision' },
            api: {} as GridApi,
            source: 'edit',
            column: {} as any,
            value: 'newVal',
            data: {},
            rowIndex: 0,
            rowPinned: null,
            columnApi: {} as any,
            context: {}
        };

        const columns = ['level1_decision'];

        service['onCellValueChanged'](params, cube, columns);

        expect(cube['getRawRow']).toHaveBeenCalledWith(['route'])
    });

    it('should copy down cell values to children', () => {
        const params: CellValueChangedEvent = {
            type: '',
            newValue: 'newVal',
            oldValue: 'oldVal',
            node: { level: 1, data: {}, getRoute: () => ['route'], key: 'key' } as RowNode,
            colDef: { field: 'level1_decision' },
            api: {
                refreshServerSide(params?: RefreshServerSideParams) {
                    return;
                }
            } as GridApi,
            source: 'edit',
            column: {} as any,
            value: 'newVal',
            data: {},
            rowIndex: 0,
            rowPinned: null,
            columnApi: {} as any,
            context: {}
        };

        cube = {
            getRawRow: jest.fn().mockImplementationOnce(() => ({
                data: ['route'],
                children: [
                    {
                        data: ['something']
                    }
                ]
            }))
                .mockImplementationOnce(() => ({
                    data: ['route'],
                    children: [
                        {
                            data: ['something']
                        }
                    ]
                }))
        } as unknown as jest.Mocked<TreeCube>;

        const columns = ['level1_decision'];

        const result = service['copyDownCellValues'](params, cube, columns);

        expect(result).toEqual(['key']);
        expect(cube['getRawRow']).toHaveBeenCalledWith(['route']);
    });

    it('should set row IDs based on hierarchy', () => {
        const data: ResponseData = {data: [], children: [{ title: 'child1', data: [] }, { title: 'child2', data: [] }] };
        const rowIdToDataMap = new Map<string, ResponseData>();

        service['setRowIdBasedOnHierarchy'](data, 'portfolio', rowIdToDataMap);

        expect(rowIdToDataMap.size).toBeGreaterThan(0);
    });

    it('should populate node and children with decision benchmarks', () => {
        const rowIdToDataMap = new Map<string, ResponseData>();
        const decisionBenchMap = new Map<string, string>([['key', 'value']]);
        const data: ResponseData = {data: [], children: [{ title: 'child1', data: [] }] };

        rowIdToDataMap.set('key', data);

        service['populateNodeAndChildren'](rowIdToDataMap, decisionBenchMap);

        expect(data.data.length).toBeGreaterThan(0);
    });

    it('should set/reset look-through params based on token value and decision config', () => {
        CoreWidgetConfigStore.chartConfig.set('riskExposure', new WidgetConfig(riskExposureConfig));
        const widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        let requestParams: any = {portTreeDecisionLevel: 1};
        const portfolio = new Portfolio();
        jest.spyOn(TokenUtils, 'isValueDelimitedFeatureEnabled').mockReturnValue(true);
        requestParams = service['createWidgetRequestParams'](widget, requestParams, portfolio, widget.dataStore.metaData.inputs);
        expect(requestParams.isLookthroughEnabled).toBe(true);
        expect(requestParams.isSectorView).toBe('Y');

        jest.spyOn(TokenUtils, 'isValueDelimitedFeatureEnabled').mockReturnValue(false);
        portfolio.lookthroughSettings.isLookThroughEnabled = true;
        requestParams = {portTreeDecisionLevel: 1};
        requestParams = service['createWidgetRequestParams'](widget, requestParams, portfolio, widget.dataStore.metaData.inputs);
        expect(requestParams.isLookthroughEnabled).toBe(false);
        expect(requestParams.isSectorView).toBe('Y');
    });
});
