import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FavoriteConstants} from '@constants/favorite.constants';

import {LookthroughSettingsComponent} from './lookthrough-settings.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {LookthroughService} from '../../services/lookthrough.service';
import {
    LookthroughConstants,
    LtSecurityTypes,
    LtSecurityProxyTypes
} from '@blk/explore-ui-look-through-settings';
import {DefinitionsStore} from '../../../../../stores';
import {isEmpty} from 'lodash';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Benchmark} from '@models/portfolio/benchmark.model';
import {AppStore} from '../../../../../app.store';
import {FavoriteService} from '@services/favorite';
import {NotificationService} from '@services/notification';
import {LookthroughFilterRule} from '@models/lookthrough/look-through-filter-rule.model';
import {LookthroughfilterRulesFav} from '@models/lookthrough/look-through-filter-rules-fav.model';
import {ColumnSectorRule} from '@blk/explore-ui-breakdown';
import {LoadFavoriteAction} from '@models/favorite/load-favorite-action.model';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {ColumnConfig, CoreUserMetaDataStore, DateValue, ExploreCheckbox, UserMetaData, WidgetInput, WidgetInputType} from '@blk/explore-ui-core';
import {By} from '@angular/platform-browser';
import {ExportService} from '@services/export/export.service';
import {Widget} from '@models/widget/widget.model';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {WidgetDataStoreMetaData} from '@models/dataStore/widget-data-store-meta-data.model';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {RequestAdapterConfig, VizualizationColumnConfig} from '@interfaces/request.interface';
import {ExploreResponse, ExploreResponseConfig} from '@interfaces/response.interface';
import {WidgetDataStore} from '@models/dataStore/widget-data-store.model';
import {ExportComposite} from '@models/export/export-composite/export-composite.model';
import {ExportUtils} from '@utils/export/export.utils';
import {BenchmarkConstants} from '@constants/benchmark.constants';
import {WorkspaceMenuItemsConstants} from '@constants/workspace-menu-items.constants';
import {LookThroughSettingsWithRules} from '@models/lookthrough/look-through-settings-with-rules.model';

describe('LookthroughSettingsComponent', () => {

    let component: LookthroughSettingsComponent;
    let fixture: ComponentFixture<LookthroughSettingsComponent>;

    const lookthroughServiceStub = {
        getLookthroughInfo$: jest.fn(),
        createWidget: jest.fn(),
        createLookThroughRequestParam: jest.fn(),
        getVisColsConfig: jest.fn(),
        populateResponseData: jest.fn()
    };

    const favoriteServiceMock = {
        getFavorite$: jest.fn()
    };

    const notificationServiceMock = {
        openDialog: jest.fn(),
        error: jest.fn()
    };

    const exportSereviceMock = {
        exportFile: jest.fn()
    };

    const ltSpyOnCreate = jest.spyOn(lookthroughServiceStub, 'createWidget');
    ltSpyOnCreate.mockReturnValue(of({}));

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [LookthroughSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                AppStore,
                {provide: FavoriteService, useValue: favoriteServiceMock},
                {provide: NotificationService, useValue: notificationServiceMock},
                {provide: LookthroughService, useValue: lookthroughServiceStub},
                {provide: ExportService, useValue : exportSereviceMock}
            ]
        });

        jest.clearAllMocks();
    });

    it('should create', () => {
        testComponentCreation({
            'isLookThroughEnabled': true,
            'isBenchLookThroughEnabled': true,
            'ltSecurityTypes': 'ETF',
            'ltProxies': 'RISK_PROXY'
        });

        expect(component).toBeTruthy();
        // create new
        expect(fixture.debugElement.query(By.css('explore-core-load-new-favorite-buttons')).properties.isDisabled).toEqual(false);
        // edit copy
        expect(fixture.debugElement.queryAll(By.css('aux-button'))[0].properties.isDisabled).toEqual(true);
        // edit original
        expect(fixture.debugElement.queryAll(By.css('aux-button'))[1].properties.isDisabled).toEqual(true);
        expect(component.showRuleBuilder).toBeFalsy();
        expect(component.ltFilterRulesFav).toBeUndefined();
        expect(component.copyLtFilterRulesFav).toBeUndefined();
    });

    it('should create - security and proxy types not present', () => {
        testComponentCreation({
            'isLookThroughEnabled': true,
            'isBenchLookThroughEnabled': false
        });

        expect(component).toBeTruthy();
    });

    it('tests extractLookthroughInfo - no look-through enabled', async () => {
        testComponentCreation({});
        await expect(component.extractLookthroughInfo());
        expect(!component.refreshInProgress && !component.showLookthroughView && !component.refreshLookthroughData
            && !component.enabledElements).toBeTruthy();
    });

    it('tests extractLookthroughInfo - port look-through enabled | no security types', async () => {
        testComponentCreation({
            'isLookThroughEnabled': true
        });
        await expect(component.extractLookthroughInfo());
        expect(!component.refreshInProgress && !component.showLookthroughView && component.refreshLookthroughData
            && component.enabledElements).toBeTruthy();
    });

    it('tests onCustomLookthroughMenuClick method - editcopy', function () {
        testComponentCreation({
            'isLookThroughEnabled': true,
            'ltSecurityTypes': 'FUND,ETF,FUTURE_INDEX'
        });
        component.portfolio.lookthroughSettings.ltFilterRulesFav.id = 126;
        component.portfolio.lookthroughSettings.ltFilterRulesFav.title = 'Rule_126';
        component.portfolio.lookthroughSettings.ltFilterRulesFav.owner = 'suresing';
        component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules = new Array<LookthroughFilterRule>();
        component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.push(new LookthroughFilterRule());

        component.onEditCopy();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.id).toBeUndefined();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.title).toBeUndefined();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.owner).toBeUndefined();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules).toBeDefined();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.length).toBe(1);
        expect(component.copyLtFilterRulesFav).toBeDefined();
        expect(component.showRuleBuilder).toBeTruthy();
    });

    it('tests onCustomLookthroughMenuClick method - createnew', function () {
        testComponentCreation({
            'isLookThroughEnabled': true,
            'ltSecurityTypes': 'FUND,ETF,FUTURE_INDEX'
        });
        component.portfolio.lookthroughSettings.ltFilterRulesFav.id = 126;
        component.portfolio.lookthroughSettings.ltFilterRulesFav.title = 'Rule_126';
        component.portfolio.lookthroughSettings.ltFilterRulesFav.owner = 'suresing';
        component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules = new Array<LookthroughFilterRule>();
        component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.push(new LookthroughFilterRule());

        component.onCreateNew();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.id).toBeUndefined();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.title).toBeUndefined();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.owner).toBeUndefined();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules).toBeDefined();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.length).toBe(0);
        expect(component.copyLtFilterRulesFav).toBeDefined();
        expect(component.showRuleBuilder).toBeTruthy();
    });

    it('tests onCustomLookthroughMenuClick method - editOriginal', function () {
        testComponentCreation({
            'isLookThroughEnabled': true,
            'ltSecurityTypes': 'FUND,ETF,FUTURE_INDEX'
        });
        component.portfolio.lookthroughSettings.ltFilterRulesFav.id = 126;
        component.portfolio.lookthroughSettings.ltFilterRulesFav.title = 'Rule_126';
        component.portfolio.lookthroughSettings.ltFilterRulesFav.owner = 'suresing';
        component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules = new Array<LookthroughFilterRule>();
        component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.push(new LookthroughFilterRule());

        component.onEditOriginal();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.id).toBe(126);
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.title).toBe('Rule_126');
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.owner).toBe('suresing');
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules).toBeDefined();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.length).toBe(1);
        expect(component.copyLtFilterRulesFav).toBeDefined();
        expect(component.showRuleBuilder).toBeTruthy();
    });

    it('Test initializeCustomLTMenuOptions', () => {
        testComponentCreation({
            'isLookThroughEnabled': true,
            'ltSecurityTypes': 'FUND,ETF,FUTURE_INDEX'
        });

        // create new
        expect(fixture.debugElement.query(By.css('explore-core-load-new-favorite-buttons')).properties.isDisabled).toEqual(false);
        // edit copy
        expect(fixture.debugElement.queryAll(By.css('aux-button'))[0].properties.isDisabled).toEqual(true);
        // edit original
        expect(fixture.debugElement.queryAll(By.css('aux-button'))[1].properties.isDisabled).toEqual(true);

        // mock ltFilter rule
        const ltFilterRule = new LookthroughFilterRule();
        ltFilterRule.enabled = true;
        ltFilterRule.ltType = 'Sector';
        ltFilterRule.displayName = 'new Rule_126';

        const columnRule: ColumnSectorRule = ltFilterRule.customSector.rule as ColumnSectorRule;
        columnRule.columnName = 'Security Group';
        columnRule.columnTag = 'sec_group';
        columnRule.positionColumnType = 'ALL';
        columnRule.dataType = 'String';
        columnRule.comparisonType = 'EQUALS';
        columnRule.comparisonValues = ['EQUITY', 'BND'];
        columnRule.comparisonLabels = ['EQUITY', 'BOND'];

        // add rule to lt settings
        component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules = new Array<LookthroughFilterRule>();
        component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.push(ltFilterRule);

        // test when lt fav contains rules
        fixture.detectChanges();
        // create new
        expect(fixture.debugElement.query(By.css('explore-core-load-new-favorite-buttons')).properties.isDisabled).toEqual(false);
        // edit copy
        expect(fixture.debugElement.queryAll(By.css('aux-button'))[0].properties.isDisabled).toEqual(false);
        // edit original
        expect(fixture.debugElement.queryAll(By.css('aux-button'))[1].properties.isDisabled).toEqual(true);
        // expect(component.customLookthroughMenuOptions[0][0].isDisabled).toBeFalsy();
        // expect(component.customLookthroughMenuOptions[0][1].isDisabled).toBeFalsy();
        // expect(component.customLookthroughMenuOptions[0][2].isDisabled).toBeTruthy();

        // test when fav owner is diff
        component.portfolio.lookthroughSettings.ltFilterRulesFav.id = 126;
        component.portfolio.lookthroughSettings.ltFilterRulesFav.title = 'Rule_126';
        component.portfolio.lookthroughSettings.ltFilterRulesFav.owner = 'tsharma';

        fixture.detectChanges();
        // create new
        expect(fixture.debugElement.query(By.css('explore-core-load-new-favorite-buttons')).properties.isDisabled).toEqual(false);
        // edit copy
        expect(fixture.debugElement.queryAll(By.css('aux-button'))[0].properties.isDisabled).toEqual(false);
        // edit original
        expect(fixture.debugElement.queryAll(By.css('aux-button'))[1].properties.isDisabled).toEqual(true);
        // expect(component.customLookthroughMenuOptions[0][0].isDisabled).toBeFalsy();
        // expect(component.customLookthroughMenuOptions[0][1].isDisabled).toBeFalsy();
        // expect(component.customLookthroughMenuOptions[0][2].isDisabled).toBeTruthy();

        // test when owner is same as logged in owner
        component.portfolio.lookthroughSettings.ltFilterRulesFav.owner = 'suresing';
        fixture.detectChanges();
        // create new
        expect(fixture.debugElement.query(By.css('explore-core-load-new-favorite-buttons')).properties.isDisabled).toEqual(false);
        // edit copy
        expect(fixture.debugElement.queryAll(By.css('aux-button'))[0].properties.isDisabled).toEqual(false);
        // edit original
        expect(fixture.debugElement.queryAll(By.css('aux-button'))[1].properties.isDisabled).toEqual(false);
        // expect(component.customLookthroughMenuOptions[0][0].isDisabled).toBeFalsy();
        // expect(component.customLookthroughMenuOptions[0][1].isDisabled).toBeFalsy();
        // expect(component.customLookthroughMenuOptions[0][2].isDisabled).toBeFalsy();
    });

    it('tests onCustomLookthroughMenuClick method - editOriginal', function () {
        testComponentCreation({
            'isLookThroughEnabled': true,
            'ltSecurityTypes': 'FUND,ETF,FUTURE_INDEX'
        });

        // test when rule is not changed
        component.onCloseRulebuilderModal(false);
        expect(!component.refreshInProgress && !component.showLookthroughView && component.refreshLookthroughData
            && component.enabledElements).toBeTruthy();
        expect(component.showRuleBuilder).toBeFalsy();

        // test for rule change
        component.onCloseRulebuilderModal(true);
        expect(!component.refreshInProgress && !component.showLookthroughView && component.refreshLookthroughData
            && !component.enabledElements).toBeTruthy();
        expect(component.showRuleBuilder).toBeFalsy();
    });

    it('Test loadRuleList', () => {
        testComponentCreation({
            'isLookThroughEnabled': true,
            'ltSecurityTypes': 'FUND,ETF,FUTURE_INDEX'
        });

        const lookthroughfilterRulesFav = new LookthroughfilterRulesFav();
        lookthroughfilterRulesFav.id = 126;
        lookthroughfilterRulesFav.title = 'Rule_126';
        lookthroughfilterRulesFav.owner = 'suresing';
        jest.spyOn(favoriteServiceMock, 'getFavorite$').mockReturnValue(
            of(lookthroughfilterRulesFav)
        );
        component.enabledElements = false;
        component.loadRuleList(126, 'loading favorite');
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav).toEqual(lookthroughfilterRulesFav);
    });

    it('Test onLoadRuleList', () => {
        testComponentCreation({});
        jest.spyOn(component['appStore'].openLoadFavoriteModal$, 'next').mockImplementation(() => {
        });
        component.onLoadRuleList();
        expect(component['appStore'].openLoadFavoriteModal$.next).toHaveBeenCalledWith(new LoadFavoriteAction({
            type: FavoriteConstants.LT_FILTER_RULES,
            treeType: 'LT_RULES_FOLDER',
            displayName: FavoriteConstants.LT_LOGIC_RULES,
            callback: expect.anything(),
            headerDisplayName: 'Look-Through Rule List',
            ignoreEnterpriseTree: false
        }));
    });

    it('Test toggleTableSearch', () => {
        testComponentCreation({});
        component.isTableSearchActive$ = new BehaviorSubject<boolean>(true);
        component.toggleTableSearch();
        expect(component.isTableSearchActive$.isStopped).toBeFalsy();
    });

    it('Test updateExportingStatus', () => {
        testComponentCreation({});
        component.updateExportingStatus(true, null);
        expect(component.downloadInProgress).toBeFalsy();
    });

    it('Test onExportItemClicked', () => {
        testComponentCreation({
            'isLookThroughEnabled': true,
            'ltSecurityTypes': 'FUND,ETF,FUTURE_INDEX'});

        component.widget = createWidget();
        const exportComposite = new ExportComposite();
        jest.spyOn(component['appStore'].openExportOptionsModal$, 'next').mockImplementation((_a) => {});
        jest.spyOn(ExportUtils, 'getExportComposite').mockReturnValue(exportComposite);
        jest.spyOn(component['exportService'], 'exportFile').mockReturnValue(new Observable());
        component.onExportItemClicked(WorkspaceMenuItemsConstants.LABELS.EXPORT_TO_EXCEL);
        expect(component['exportService'].exportFile).toHaveBeenCalledWith(exportComposite);
    });

    it('tests extractLookthroughInfo - port look-through enabled | security types provided', async () => {
        testComponentCreation({
            'isLookThroughEnabled': true,
            'ltSecurityTypes': 'FUND,ETF,FUTURE_INDEX'
        });
        component.widget = createWidget();
        component.widgetPayload = component.widget.dataStore.data;
        jest.spyOn(lookthroughServiceStub, 'getLookthroughInfo$').mockReturnValue(of({ message: 'SUCCESS'}));
        await component.extractLookthroughInfo();
        expect(!component.refreshInProgress && component.showLookthroughView && !component.refreshLookthroughData).toBeTruthy();
    });

    const testComponentCreation = (lookthroughSettingsJson: any, isWhaIf?: boolean) => {
        fixture = TestBed.createComponent(LookthroughSettingsComponent);
        component = fixture.componentInstance;

        component.portfolio = isWhaIf ? new WhatIfPortfolio() : new Portfolio('PEP');
        component.portfolio.datePicker = new DateValue({date: '05/09/2017', calCode: 'GP_HK_STD'});
        component.portfolio.lookthroughSettings = new LookThroughSettingsWithRules(lookthroughSettingsJson);
        component.portfolio.splitPositionSettings.selectedPositionTypes = ['XC', 'XF', 'XH', 'XS', 'SW', 'O'];
        component.portfolio.portName = 'OBSID';
        component.portfolio.benchmark = Benchmark.create(BenchmarkConstants.BENCH_AGGREGATE, null, 'NO_BENCH');

        if (isEmpty(DefinitionsStore.ltSecurityType)) {
            DefinitionsStore.ltSecurityType.push(new LtSecurityTypes({
                'description': 'Funds',
                'name': 'FUND',
                'selected': true,
                'varEquivalent': 'FUND.OPEN_END FUND.CLOSED_END FUND.STIF FUND.PRIVATE'
            }));
            DefinitionsStore.ltSecurityType.push(new LtSecurityTypes({
                'description': 'ETFs',
                'name': 'ETF',
                'selected': true,
                'varEquivalent': 'ETF'
            }));
        }

        if (isEmpty(DefinitionsStore.ltSecurityProxyType)) {
            DefinitionsStore.ltSecurityProxyType.push(new LtSecurityProxyTypes({
                'description': 'Lookthrough Proxy',
                'name': 'LOOKTHROUGH_PROXY',
                'selected': true
            }));
            DefinitionsStore.ltSecurityProxyType.push(new LtSecurityProxyTypes({
                'description': 'Risk Proxy',
                'name': 'RISK_PROXY',
                'selected': true
            }));
        }
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.login = 'suresing';
        fixture.detectChanges();
    };

    function createWidget(): Widget {
        const portfolio = new Portfolio('PEP');
        portfolio.benchmark = new Benchmark();
        portfolio.benchmark.name = 'NO_BENCH';
        portfolio.datePicker = new DateValue('01/02/2020');
        portfolio.lookthroughSettings = {
            isBenchLookThroughEnabled: true,
            isLookThroughEnabled: true,
            ltFilterRulesFav: new LookthroughfilterRulesFav()
        } as LookThroughSettingsWithRules;

        const widget = new Widget();
        widget.title = portfolio.portName;
        widget.dataStore = new WidgetDataStore();
        widget.dataStore.metaData = getMetaData();
        const widgetPayload: WidgetPayload = {
            requestConfig: requestConfig(portfolio.portName),
            responseConfig: responseConfig()
        };
        widgetPayload.breakdownLevels = getBreakdownLevels();
        widget.dataStore.data = widgetPayload;
        widget.dataStore.metaData = new WidgetDataStoreMetaData();
        widget.dataStore.metaData.inputs = new Map<string, WidgetInput>();
        const colSet: ColumnSet = new ColumnSet();
        colSet.columns = getColsConfig();
        widget.dataStore.metaData.inputs.set(WidgetInputType.COLUMNS, colSet);

        return widget as Widget;
    }


    /**
     * Returns column config data with prefixed columns
     */
    function getColsConfig(): ColumnConfig[] {
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
    function getVisColsConfig(): VizualizationColumnConfig[] {
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
     * Return static max level possible with level title
     */
    function  getBreakdownLevels(): any [] {
        return ['_ROOT_', 'level-1', 'level-2', 'level-3', 'level-4', 'level-5'];
    }

    /**
     * Return LT columns with static prefixed column keys
     */
    function getCols(): any [] {
        return [LookthroughConstants.PORT_NAME_COL_KEY, LookthroughConstants.SEC_GROUP_COL_KEY, LookthroughConstants.SEC_TYPE_COL_KEY, LookthroughConstants.SEC_DESC_COL_KEY, LookthroughConstants.ISSUER_NAME_COL_KEY, LookthroughConstants.ADL_INFO_COL_KEY, LookthroughConstants.TYPE_COL_KEY];
    }

    function getMetaData(): WidgetDataStoreMetaData {
        const metaData = new WidgetDataStoreMetaData();
        metaData.inputs.set('columns', new ColumnSet(getColsConfig()));
        return metaData;
    }

    /**
     * Return request config
     */
    function  requestConfig(portname: string): RequestAdapterConfig {
        return {
            columns: getVisColsConfig(),
            columnFilters: {},
            isCompareMode: false,
            portfolio: portname,
            splitColumns: getVisColsConfig()
        };
    }

    /**
     * Returns response config
     */
    function responseConfig(): ExploreResponseConfig {
        return {
            columns: getCols(),
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
});
