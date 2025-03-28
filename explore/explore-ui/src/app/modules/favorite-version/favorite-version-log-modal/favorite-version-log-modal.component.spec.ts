import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FavoriteVersionLogModalComponent} from './favorite-version-log-modal.component';
import {WorkspaceStore} from '@stores/workspace.store';
import {CommonUtils, CoreFavoriteVersioningStore} from '@blk/explore-ui-core';
import {FavoriteService} from '@services/favorite';
import {WorkspaceService} from '@services/workspace';
import {of} from 'rxjs';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('FavoriteVersionLogModalComponent', () => {
    let component: FavoriteVersionLogModalComponent;
    let fixture: ComponentFixture<FavoriteVersionLogModalComponent>;


    const saveFavoriteVersionResponse = {
        'message': 'Successfully loaded the favorite versions',
        'data': [
            {
                'owner': '_ADMIN',
                'data': '{"breakdown":{"isConfigured":true,"breakdownTitle":"SecurityGroup","subSectors":[{"breakdownRuleType":"String","useNoneBuckets":true,"groupByColumn":{"columnName":"Security Group","columnTag":"sec_group","dataType":"STRING","positionColumnType":"ALL"}}]},"title":"SecurityGroup"}',
                'listOrder': 14,
                'list_order': 14,
                'description': ' ',
                'id': '1429948',
                'title': 'SecurityGroup',
                'type': 'BREAKDOWN',
                'tool': 'Explore_BETA',
                'CLASS_TYPE': 'com.bfm.transx.allocation.AladdinFavorite',
                'isSlim': false
            }
        ],
        'status': 'SUCCESS'
    };

    const data = [
        {
            'owner': '_ADMIN',
            'data': '{"configType":"workspace","workpads":[{"configType":"flat-workpad","reports":[{"configType":"WIDGETS_REPORT","widgets":[{"configType":"returnsWidget","title":"Return Analysis","id":27939727790,"sizeX":8,"sizeY":6,"col":0,"row":0,"displayInputs":{"expandedState":{"expandedPaths":[["_ROOT_"]]}},"dataStore":"7ebbf87d-9fa4-40de-926a-a926651d2b5d"}],"availableDataStores":{"7ebbf87d-9fa4-40de-926a-a926651d2b5d":{"name":"7ebbf87d-9fa4-40de-926a-a926651d2b5d","metaData":{"inputs":{"breakdownTree":{"isGlobalFav":false,"favId":1429948,"configType":"breakdown"},"columns":{"configType":"columnSet","columns":[{"columnTag":"pnl_sec_desc","columnKey":"pnl_sec_desc","positionColumnType":"ALL","dateLastUpdated":"08/22/2024 13:03 CDT","lastUpdatedBy":"rarudra"},{"columnTag":"pnl_cusip","columnKey":"pnl_cusip_0","positionColumnType":"ALL","title":"CUSIP","dateLastUpdated":"08/22/2024 13:03 CDT","lastUpdatedBy":"rarudra"},{"columnTag":"wt_contr","columnKey":"wt_contr_1","positionColumnType":"PORT","title":"Market Value Weight","dateLastUpdated":"08/22/2024 13:03 CDT","lastUpdatedBy":"rarudra"},{"columnTag":"bench_wt_contr","columnKey":"bench_wt_contr_2","positionColumnType":"BENCH","title":"Benchmark Market Value Weight","dateLastUpdated":"08/22/2024 13:03 CDT","lastUpdatedBy":"rarudra"},{"columnTag":"active_wt_contr","columnKey":"active_wt_contr_3","positionColumnType":"ACTIVE","title":"Active Market Value Weight","dateLastUpdated":"08/22/2024 13:03 CDT","lastUpdatedBy":"rarudra"},{"columnTag":"pnl_contr","columnKey":"pnl_contr_4","positionColumnType":"PORT","title":"Total Return Contribution","dateLastUpdated":"08/22/2024 13:03 CDT","lastUpdatedBy":"rarudra"},{"columnTag":"active_pnl_contr","columnKey":"active_pnl_contr_5","positionColumnType":"ACTIVE","title":"Active Total Return Contribution","dateLastUpdated":"08/22/2024 13:03 CDT","lastUpdatedBy":"rarudra"},{"columnTag":"active_excess_contr","columnKey":"active_excess_contr_6","positionColumnType":"ACTIVE","title":"Active Excess Contribution","dateLastUpdated":"08/22/2024 13:03 CDT","lastUpdatedBy":"rarudra"},{"columnTag":"sector_alloc","columnKey":"sector_alloc_7","positionColumnType":"ACTIVE","title":"Sector Allocation","dateLastUpdated":"08/22/2024 13:03 CDT","lastUpdatedBy":"rarudra"}],"columnState":{"columns":[{"columnKey":"pnl_sec_desc","width":127,"pinned":"left"},{"columnKey":"pnl_cusip_0","width":57,"pinned":null},{"columnKey":"wt_contr_1","width":69,"pinned":null},{"columnKey":"bench_wt_contr_2","width":82,"pinned":null},{"columnKey":"active_wt_contr_3","width":66,"pinned":null},{"columnKey":"pnl_contr_4","width":92,"pinned":null},{"columnKey":"active_pnl_contr_5","width":79,"pinned":null},{"columnKey":"active_excess_contr_6","width":181,"pinned":null},{"columnKey":"sector_alloc_7","width":125,"pinned":null}]},"dateLastUpdated":"08/22/2024 13:03 CDT","lastUpdatedBy":"rarudra"},"sortedColumns":{"sortedColumns":[],"configType":"sortedColumns"},"topBottomFilter":{"childColumnOptions":{},"configType":"topBottomFilter"},"performanceSettings":{"additionalSettings":{"asReported":false,"showSummary":false,"aggregateBMOnlyReturnSecurities":true,"removeBMOnlyReturnBucket":false,"collapseClosedPositions":false,"customPivotPoint":""},"configType":"performanceSettings"},"normalizedWidgetFilter":true}}}},"comparisonConfigId":37943492,"title":"Report 1","dateLastUpdated":"08/22/2024 13:03 CDT","lastUpdatedBy":"rarudra"}],"portfolio":{"configType":"portfolio","ticker":"E_ADRAG","portId":"E_ADRAG_0547444a09304","cusip":"BRS2KXWE6","currency":"USD","isIndexResearchPortfolio":false,"benchmark":{"type":"RISK","order":1,"name":"MSACAXJPU"},"datePicker":{"calCode":"GP_HK_STD","dateString":true,"dateStringValue":"T-1"},"expostSettings":{"samplingPeriod":{"numberOfPeriods":1,"shortName":"Months","timePeriodName":"1 Month"},"statisticPeriods":[{"numberOfPeriods":1,"shortName":"Years","timePeriodName":"1 Year"}],"isNetReturns":false,"isLogNormal":false,"categoryBreakdown":true},"portfolioRiskSettings":{"advancedRiskSettings":{"riskMatrix":1},"configType":"riskSettings"},"lookthroughSettings":{"isLookThroughEnabled":false,"isBenchLookThroughEnabled":false,"ltSecurityTypes":"FUND,ETF,FUTURE_INDEX","ltProxies":"RISK_PROXY,FUND","ltFilterRulesFav":[],"dateLastUpdated":"08/22/2024 13:03 CDT","lastUpdatedBy":"rarudra"},"splitPositionTypes":"XC,XF,XH,XS,SW,O","positionModeSettings":{"positionMode":"AS_OF_W"},"factorAttributionSettings":{"factorAttributionType":"EQ_MANDATE"},"title":"E_ADRAG","dateLastUpdated":"08/22/2024 13:03 CDT","lastUpdatedBy":"rarudra"}}],"title":"ABC Copy test","dateLastUpdated":"08/22/2024 13:03 CDT","lastUpdatedBy":"rarudra","changeSummaryDetails":"save workspaceABC CopyTest","changeSummary":"save workspaceABC CopyTest detailed description for Governannce testing","userPermGrps":[],"parentId":"3357413"}',
            'listOrder': 894,
            'list_order': 894,
            'description': ' ',
            'active_flag': 'C',
            'id': '3358088',
            'title': 'ABC Copy test',
            'type': 'WORKSPACE',
            'tool': 'Explore_BETA',
            'CLASS_TYPE': 'com.bfm.transx.allocation.AladdinFavorite',
            'isSlim': false,
            'activeFlag': 'C',
            'changeSummaryDetail': 'save workspaceABC CopyTest',
        }
    ];

    const versionData = {
        modifiedBy: 'rarudra',
        id: '123456',
        owner: '_GLOBAL',
        modifiedOn: '26-07-2024 at 15:53 CDT',
        changeSummaryDetails: 'Test for the common comopnents',
        changeSummary: 'Test for the common comopnents testing',
        version: 7,
        versionId: '2337338'
    };

    const favoriteServiceMock = {
        getFavoriteVersion$: jest.fn(() => of(saveFavoriteVersionResponse))
    };

    const workspaceServiceStub = {
        initializeWorkspaceFromIntro: jest.fn(),
        loadFavoriteWorkspace: jest.fn(),
        loadPortfolioAndCreateWorkspace: jest.fn()
    };

    const workspace = {
        'id': 12345
    };
    jest.spyOn(WorkspaceStore, 'getWorkspace').mockReturnValue(workspace);
    jest.spyOn(CommonUtils, 'getInSentenceCase').mockReturnValue('Workspace');

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [FavoriteVersionLogModalComponent],
            providers: [
                {provide: FavoriteService, useValue: favoriteServiceMock},
                {provide: WorkspaceService, useValue: workspaceServiceStub}],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();

        fixture = TestBed.createComponent(FavoriteVersionLogModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('test to hide save summary', () => {
        component.showDetailedSummary = true;
        component.hideSummary();
        expect(component.showDetailedSummary).toEqual(false);
    });

    it('test to show save summary', () => {
        component.showDetailedSummary = false;
        component.showSaveSummary(versionData);
        expect(component.showDetailedSummary).toEqual(true);
    });

    it('test to create Favorite Version Data', () => {
        component.favoriteVersions = [];
        component.createFavoriteVersionData(data);
        expect(component.favoriteVersions.length).toEqual(1);
        expect(component.favoriteVersions[0].saveSummaryOnChanges.changeSummaryDetails).toEqual('save workspaceABC CopyTest');
    });

    it('test to close Favorite modal', () => {
        jest.spyOn(CoreFavoriteVersioningStore.favoriteVersionLogAction$, 'next' as any);
        component.closeModal();
        expect(CoreFavoriteVersioningStore.favoriteVersionLogAction$['next']).toHaveBeenCalled();
    });

    it('test the selectedRow Data', () => {
        component.selectRow(versionData);
        expect(component.selectedRow.version).toEqual(7);
    });

    it('should call callback function when loading selected FavoriteVersion', () => {
        component.selectedRow = versionData;
        component.favDisplayName = 'Workspace';
        component['loadFavoriteCallBack'] = jest.fn();
        component.loadSelectedFavoriteVersion();
        expect(component['loadFavoriteCallBack']).toHaveBeenCalledWith('123456', 'Loading Favorite Workspace', false, true, '2337338');
    });

});
