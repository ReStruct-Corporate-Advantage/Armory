import {ComponentFixture, TestBed} from '@angular/core/testing';
import {LookthroughRuleBuilderModalComponent} from './lookthrough-rule-builder-modal.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {AppStore} from '../../../../../app.store';
import {FavoriteService} from '@services/favorite';
import {NotificationService} from '@services/notification';
import {LookthroughService} from '../../services/lookthrough.service';
import {LtSecurityProxyTypes, LtSecurityTypes} from '@blk/explore-ui-look-through-settings';
import {cloneDeep, isEmpty} from 'lodash';
import {DefinitionsStore} from '../../../../../stores';
import {LookthroughfilterRulesFav} from '@models/lookthrough/look-through-filter-rules-fav.model';
import {LookthroughFilterRule} from '@models/lookthrough/look-through-filter-rule.model';
import {ColumnSectorRule} from '@blk/explore-ui-breakdown';
import {BehaviorSubject, of} from 'rxjs';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Benchmark} from '@models/portfolio/benchmark.model';
import {BenchmarkConstants} from '@constants/benchmark.constants';
import {
    CoreFavoriteConstants,
    CoreFavoriteUtils,
    CoreUserMetaDataStore,
    DateValue,
    TokenUtils,
    UserMetaData
} from '@blk/explore-ui-core';
import {ExportService} from '@services/export/export.service';
import {RowNode} from 'ag-grid-community';
import {LookThroughSettingsWithRules} from '@models/lookthrough/look-through-settings-with-rules.model';

describe('LookthroughRuleBuilderModalComponent', () => {
    let component: LookthroughRuleBuilderModalComponent;
    let fixture: ComponentFixture<LookthroughRuleBuilderModalComponent>;

    const lookthroughServiceStub = {
        getLookthroughInfo$: jest.fn()
    };

    const favoriteServiceMock = {
        getFavorite$: jest.fn(),
        quickSaveFavorite$: jest.fn()
    };

    const notificationServiceMock = {
        openDialog: jest.fn(),
        error: jest.fn()
    };

    const exportServiceMock = {
        exportFile: jest.fn()
    };

    const ltFilterRule = new LookthroughFilterRule();
    ltFilterRule.enabled = false;
    ltFilterRule.ltType = 'Full';
    const columnRule = ltFilterRule.customSector.rule as ColumnSectorRule;
    columnRule.columnName = 'Security Group';
    columnRule.columnTag = 'sec_group';
    columnRule.positionColumnType = 'ALL';
    columnRule.dataType = 'String';
    columnRule.comparisonType = 'EQUALS';
    columnRule.comparisonValues = ['EQUITY', 'BND'];
    columnRule.comparisonLabels = ['EQUITY', 'BOND'];

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [LookthroughRuleBuilderModalComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                AppStore,
                {provide: FavoriteService, useValue: favoriteServiceMock},
                {provide: NotificationService, useValue: notificationServiceMock},
                {provide: LookthroughService, useValue: lookthroughServiceStub},
                {provide: ExportService, useValue : exportServiceMock}
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
        expect(component.extractLookthroughInfo).toHaveBeenCalled();
        expect(component.selectedFilterRule).toBeDefined();
        expect(component.sectorRuleBuilderConfig).toBeDefined();
        expect(component.displayDataForLtTypes).toBeDefined();
        expect(component.displayDataForLtTypes[0].values.length).toBe(3);
        expect(component.displayDataForLtTypes[0].values[0].isSelected).toBe(true);

        addRule();
        component.ngOnInit();
        expect(component.ltFilterRulesInit).toBeDefined();
        expect(component.ltFilterRulesInit).toEqual(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules);
        expect(component.selectedFilterRule).toBeDefined();
        expect(component.selectedFilterRule).toEqual(ltFilterRule);
    });

    it('test onNewLogicRuleClick', () => {
        testComponentCreation({
            'isLookThroughEnabled': true,
            'ltSecurityTypes': 'FUND,ETF,FUTURE_INDEX'
        });
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav).toBeDefined();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules).toBeDefined();
        expect(component.selectedFilterRule).toBeDefined();

        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules).toBeDefined();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.length).toBe(1);
        expect(component.selectedFilterRule).toBeDefined();
        expect(component.selectedFilterRule).toEqual(new LookthroughFilterRule());

        // test when rule is defined
        component.portfolio.lookthroughSettings.ltFilterRulesFav = new LookthroughfilterRulesFav();
        component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules = new Array<LookthroughFilterRule>(new LookthroughFilterRule());
        component.addNewLogicRule(event);
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.length).toBe(2);

        // test when lookthrough fav is undefined
        component.portfolio.lookthroughSettings.ltFilterRulesFav = undefined;
        component.selectedFilterRule = undefined;
        component.addNewLogicRule(event);
        expect(component.selectedFilterRule).toBeUndefined();
    });

    it('tests clearFilter method - when ltFilterRules is undefined', function () {
        testComponentCreation({
            'isLookThroughEnabled': true,
            'ltSecurityTypes': 'FUND,ETF,FUTURE_INDEX'
        });
        component.clearFilter();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules).toBeDefined();
    });

    it('tests clearFilter method_2 - when ltFilterRules is defined but empty', function () {
        testComponentCreation({
            'isLookThroughEnabled': true,
            'ltSecurityTypes': 'FUND,ETF,FUTURE_INDEX'
        });
        component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules = new Array<LookthroughFilterRule>();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules).toBeDefined();
        component.clearFilter();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules).toBeDefined();
    });

    it('tests clearFilter method_3 - when ltFilterRules is defined, non-empty and un-customized', function () {
        testComponentCreation({
            'isLookThroughEnabled': true,
            'ltSecurityTypes': 'FUND,ETF,FUTURE_INDEX'
        });
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules).toBeDefined();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.length).toBe(1);
        component.clearFilter();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules).toBeDefined();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.length).toBe(1);
        expect(component.setLookthroughViewFlags).not.toHaveBeenCalled();
    });

    it('tests clearFilter method_4 - when ltFilterRules is defined, non-empty and customized with ltType', function () {
        testComponentCreation({
            'isLookThroughEnabled': true,
            'ltSecurityTypes': 'FUND,ETF,FUTURE_INDEX'
        });
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules).toBeDefined();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.length).toBe(1);
        component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules[0].ltType = 'Sector';
        component.clearFilter();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules).toBeDefined();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.length).toBe(1);
        expect(component.setLookthroughViewFlags).toHaveBeenCalled();
    });

    it('tests clearFilter method_4_1 - when ltFilterRules is defined, non-empty, enabled and customized with ltType', function () {
        testComponentCreation({
            'isLookThroughEnabled': true,
            'ltSecurityTypes': 'FUND,ETF,FUTURE_INDEX'
        });
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules).toBeDefined();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.length).toBe(1);
        component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules[0].enabled = true;
        component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules[0].ltType = 'Sector';
        component.clearFilter();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules).toBeDefined();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.length).toBe(1);
        expect(component.setLookthroughViewFlags).toHaveBeenCalled();
    });

    it('tests clearFilter method_5 - when ltFilterRules is defined, non-empty and customized with rule', function () {
        testComponentCreation({
            'isLookThroughEnabled': true,
            'ltSecurityTypes': 'FUND,ETF,FUTURE_INDEX'
        });
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules).toBeDefined();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.length).toBe(1);
        const rule: ColumnSectorRule = component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules[0].customSector.rule as ColumnSectorRule;
        rule.columnTag = 'suresing';
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules[0].isEmpty()).toBeFalsy();
        component.clearFilter();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules).toBeDefined();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.length).toBe(1);
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules[0].isEmpty()).toBeTruthy();
        expect(component.setLookthroughViewFlags).toHaveBeenCalled();
    });

    it('tests clearFilter method_6 - when ltFilterRules is defined, non-empty, enabled and customized with rule', function () {
        testComponentCreation({
            'isLookThroughEnabled': true,
            'ltSecurityTypes': 'FUND,ETF,FUTURE_INDEX'
        });
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules).toBeDefined();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.length).toBe(1);
        component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules[0].enabled = true;
        const rule: ColumnSectorRule = component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules[0].customSector.rule as ColumnSectorRule;
        rule.columnTag = 'suresing';
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules[0].isEmpty()).toBeFalsy();
        component.clearFilter();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules).toBeDefined();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.length).toBe(1);
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules[0].isEmpty()).toBeTruthy();
        expect(component.setLookthroughViewFlags).toHaveBeenCalled();
    });

    it('tests clearFilterList method_1_1 - ltFilterRules defined, not empty, enabled, contains valid rule', function () {
        testComponentCreation({
            'isLookThroughEnabled': true,
            'ltSecurityTypes': 'FUND,ETF,FUTURE_INDEX'
        });
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav).toBeDefined();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules).toBeDefined();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.length).toBe(1);
        component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules[0].enabled = true;
        const colSecRule: ColumnSectorRule = component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules[0].customSector.rule as ColumnSectorRule;
        colSecRule.columnTag = 'suresing';
        expect(component.setLookthroughViewFlags).not.toHaveBeenCalled();
        component.clearFilterList();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav).toBeDefined();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules).toBeDefined();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.length).toBe(0);
        expect(component.setLookthroughViewFlags).toHaveBeenCalled();
    });

    it('tests clearFilterList method_1_2 - ltFilterRules defined, not empty, not enabled, contains valid rule', function () {
        testComponentCreation({
            'isLookThroughEnabled': true,
            'ltSecurityTypes': 'FUND,ETF,FUTURE_INDEX'
        });
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav).toBeDefined();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules).toBeDefined();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.length).toBe(1);
        const colSecRule: ColumnSectorRule = component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules[0].customSector.rule as ColumnSectorRule;
        colSecRule.columnTag = 'suresing';
        expect(component.setLookthroughViewFlags).not.toHaveBeenCalled();
        component.clearFilterList();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav).toBeDefined();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules).toBeDefined();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.length).toBe(0);
        expect(component.setLookthroughViewFlags).toHaveBeenCalled();
    });

    it('tests clearFilterList method_1_3 - ltFilterRules defined, not empty, enabled, contains invalid rule', function () {
        testComponentCreation({
            'isLookThroughEnabled': true,
            'ltSecurityTypes': 'FUND,ETF,FUTURE_INDEX'
        });
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav).toBeDefined();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules).toBeDefined();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.length).toBe(1);
        component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules[0].enabled = true;
        const colSecRule: ColumnSectorRule = component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules[0].customSector.rule as ColumnSectorRule;
        colSecRule.columnTag = 'test';
        expect(component.setLookthroughViewFlags).not.toHaveBeenCalled();
        component.clearFilterList();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav).toBeDefined();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules).toBeDefined();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.length).toBe(0);
        expect(component.setLookthroughViewFlags).toHaveBeenCalled();
    });

    it('tests clearFilterList method_2 - ltFilterRulesFav is undefined', function () {
        testComponentCreation({
            'isLookThroughEnabled': true,
            'ltSecurityTypes': 'FUND,ETF,FUTURE_INDEX'
        });
        addRule();
        component.ngOnInit();
        component.portfolio.lookthroughSettings.ltFilterRulesFav = undefined;
        expect(component.setLookthroughViewFlags).not.toHaveBeenCalled();
        component.clearFilterList();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav).toBeUndefined();
        expect(component.setLookthroughViewFlags).not.toHaveBeenCalled();
    });

    it('tests clearFilterList method_3 - ltFilterRules are not defined', function () {
        testComponentCreation({
            'isLookThroughEnabled': true,
            'ltSecurityTypes': 'FUND,ETF,FUTURE_INDEX'
        });
        addRule();
        component.ngOnInit();
        component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules = undefined;
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav).toBeDefined();
        expect(component.setLookthroughViewFlags).not.toHaveBeenCalled();
        component.clearFilterList();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav).toBeDefined();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules).toBeUndefined();
        expect(component.setLookthroughViewFlags).not.toHaveBeenCalled();
    });

    it('tests removeFilterFromList method_1  - ltFilterRulesFav & rule-to-be-deleted undefined', function () {
        testComponentCreation({
            'isLookThroughEnabled': true,
            'ltSecurityTypes': 'FUND,ETF,FUTURE_INDEX'
        });
        component.ngOnInit();
        component.portfolio.lookthroughSettings.ltFilterRulesFav = undefined;
        expect(component.setLookthroughViewFlags).not.toHaveBeenCalled();
        component.removeFilterFromList(undefined);
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav).toBeUndefined();
        expect(component.setLookthroughViewFlags).not.toHaveBeenCalled();
    });

    it('tests removeFilterFromList method_2  - ltFilterRules & rule-to-be-deleted undefined', function () {
        testComponentCreation({
            'isLookThroughEnabled': true,
            'ltSecurityTypes': 'FUND,ETF,FUTURE_INDEX'
        });
        component.ngOnInit();
        component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules = undefined;
        expect(component.setLookthroughViewFlags).not.toHaveBeenCalled();
        component.removeFilterFromList(undefined);
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav).toBeDefined();
        expect(component.setLookthroughViewFlags).not.toHaveBeenCalled();
    });

    it('tests removeFilterFromList method_3  - ltFilterRules are defined and empty', function () {
        testComponentCreation({
            'isLookThroughEnabled': true,
            'ltSecurityTypes': 'FUND,ETF,FUTURE_INDEX'
        });
        component.ngOnInit();
        component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules = [];
        expect(component.setLookthroughViewFlags).not.toHaveBeenCalled();
        component.removeFilterFromList(undefined);
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav).toBeDefined();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules).toBeDefined();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.length).toBe(0);
        expect(component.setLookthroughViewFlags).not.toHaveBeenCalled();
    });

    it('tests removeFilterFromList method_4  - ltFilterRules are defined and not empty | rule is not enabled', function () {
        testComponentCreation({
            'isLookThroughEnabled': true,
            'ltSecurityTypes': 'FUND,ETF,FUTURE_INDEX'
        });
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules).toBeDefined();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.length).toBe(1);
        expect(component.setLookthroughViewFlags).not.toHaveBeenCalled();
        component.removeFilterFromList(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules[0]);
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.length).toBe(0);
        expect(component.setLookthroughViewFlags).toHaveBeenCalled();
    });

    it('tests removeFilterFromList method_5  - ltFilterRules are defined and not empty | rule is enabled', function () {
        testComponentCreation({
            'isLookThroughEnabled': true,
            'ltSecurityTypes': 'FUND,ETF,FUTURE_INDEX'
        });
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules).toBeDefined();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.length).toBe(1);
        component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules[0].enabled = true;
        expect(component.setLookthroughViewFlags).not.toHaveBeenCalled();
        component.removeFilterFromList(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules[0]);
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.length).toBe(0);
        expect(component.setLookthroughViewFlags).toHaveBeenCalled();
    });

    it('tests updateSelectedFilterRule', function () {
        testComponentCreation({
            'isLookThroughEnabled': true,
            'ltSecurityTypes': 'FUND,ETF,FUTURE_INDEX'
        });
        expect(component.selectedFilterRule).toBeDefined();
        expect(component.displayDataForLtTypes[0].values.length).toBe(3);
        expect(component.displayDataForLtTypes[0].values[0].isSelected).toBe(true);
        const newLtFilterRule = cloneDeep(ltFilterRule);
        newLtFilterRule.ltType = 'Sector';
        component.updateSelectedFilterRule(newLtFilterRule);
        expect(component.selectedFilterRule).toBeDefined();
        expect(component.selectedFilterRule).toEqual(newLtFilterRule);
        expect(component.displayDataForLtTypes[0].values.length).toBe(3);
        expect(component.displayDataForLtTypes[0].values[0].isSelected).toBeFalsy();
        expect(component.displayDataForLtTypes[0].values[1].isSelected).toBe(true);
    });

    it('tests onRuleChange', function () {
        testComponentCreation({
            'isLookThroughEnabled': true,
            'ltSecurityTypes': 'FUND,ETF,FUTURE_INDEX'
        });
        expect(component.selectedFilterRule).toBeDefined();
        component.onRuleChange();
        expect(component.setLookthroughViewFlags).toHaveBeenCalled();

    });

    it('tests onRuleNameChange', function () {
        testComponentCreation({
            'isLookThroughEnabled': true,
            'ltSecurityTypes': 'FUND,ETF,FUTURE_INDEX'
        });
        addRule();
        component.ngOnInit();
        expect(component.selectedFilterRule.displayName).toBe('New Look-through Rule');
        component.onRuleNameChange('testRule');
        expect(component.selectedFilterRule.displayName).toBe('testRule');
    });

    it('tests changeLtType', function () {
        testComponentCreation({
            'isLookThroughEnabled': true,
            'ltSecurityTypes': 'FUND,ETF,FUTURE_INDEX'
        });
        addRule();
        component.ngOnInit();
        jest.spyOn(component, 'onRuleChange');
        expect(component.selectedFilterRule.ltType).toBe('Full');
        component.changeLtType('Sector');
        expect(component.selectedFilterRule.ltType).toBe('Sector');
        expect(component.onRuleChange).toHaveBeenCalled();
    });

    it('tests onCancel', function () {
        testComponentCreation({
            'isLookThroughEnabled': true,
            'ltSecurityTypes': 'FUND,ETF,FUTURE_INDEX'
        });
        addRule();
        component.ngOnInit();
        jest.spyOn(component.rulebuilderClosed, 'emit');
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav !== component.ltFilterRulesFav);
        component.onCancel();
        expect(component.portfolio.lookthroughSettings.ltFilterRulesFav === component.ltFilterRulesFav);
        expect(component.rulebuilderClosed.emit).toHaveBeenCalledWith(false);
    });

    it('tests onDoneClick method_1 - for Save Changes | Rules got changed', function () {
        testComponentCreation({
            'isLookThroughEnabled': true,
            'ltSecurityTypes': 'FUND,ETF,FUTURE_INDEX'
        });
        addRule();
        component.portfolio.lookthroughSettings.ltFilterRulesFav.id = 126;
        component.ngOnInit();
        component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules = new Array<LookthroughFilterRule>(new LookthroughFilterRule());
        jest.spyOn(component.rulebuilderClosed, 'emit');
        jest.spyOn(favoriteServiceMock, 'quickSaveFavorite$').mockReturnValue(
            of(true)
        );
        component.onDoneClick();
        expect(favoriteServiceMock.quickSaveFavorite$).toHaveBeenCalledTimes(1);
        expect(component.rulebuilderClosed.emit).toHaveBeenCalledWith(true);
    });

    it('tests onDoneClick method_2 - for Save Changes | Rules are same but order changed', function () {
        testComponentCreation({
            'isLookThroughEnabled': true,
            'ltSecurityTypes': 'FUND,ETF,FUTURE_INDEX'
        });

        // Init Rules
        component.ltFilterRulesInit = new Array<LookthroughFilterRule>();
        let ltFilterRuleInit: LookthroughFilterRule = new LookthroughFilterRule();
        ltFilterRuleInit.ltType = 'None';
        component.ltFilterRulesInit.push(ltFilterRuleInit);
        ltFilterRuleInit = new LookthroughFilterRule();
        ltFilterRuleInit.ltType = 'Sector';
        component.ltFilterRulesInit.push(ltFilterRuleInit);

        // LT Rules
        component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules = new Array<LookthroughFilterRule>();
        let lookthroughFilterRule: LookthroughFilterRule = new LookthroughFilterRule();
        lookthroughFilterRule.ltType = 'Sector';
        component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.push(lookthroughFilterRule);
        lookthroughFilterRule = new LookthroughFilterRule();
        lookthroughFilterRule.ltType = 'None';
        component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.push(lookthroughFilterRule);
        component.portfolio.lookthroughSettings.ltFilterRulesFav.id = 126;

        jest.spyOn(component.rulebuilderClosed, 'emit');
        jest.spyOn(favoriteServiceMock, 'quickSaveFavorite$').mockReturnValue(
            of(true)
        );
        component.onDoneClick();
        expect(favoriteServiceMock.quickSaveFavorite$).toHaveBeenCalledTimes(1);
        expect(component.rulebuilderClosed.emit).toHaveBeenCalledWith(true);
    });
    it('should open save summary dialog if rules are changed and summary is not entered when version is undefined', () => {
        testComponentCreation({
            'isLookThroughEnabled': true,
            'ltSecurityTypes': 'FUND,ETF,FUTURE_INDEX'
        });

        // Initialize component
        component.ngOnInit();

        // Mock the initial and current rules to be different
        component.ltFilterRulesInit = [new LookthroughFilterRule()];
        component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules = [new LookthroughFilterRule(), new LookthroughFilterRule()];

        // Mock the conditions for opening the save summary dialog
        jest.spyOn(CoreFavoriteUtils, 'isAdminOrGlobalFavorite').mockReturnValue(true);
        jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);
        component.portfolio.lookthroughSettings.ltFilterRulesFav.id = 126;
        component.portfolio.lookthroughSettings.ltFilterRulesFav.versionNumber = undefined;
        component.isSaveSummaryOpen = false;
        // Call the method
        component.onDoneClick();

        // Check if the save summary dialog is opened
        expect(component.isSaveSummaryOpen).toBe(false);
    });

    it('should open save summary dialog if rules are changed and summary is not entered when version is 2', () => {
        testComponentCreation({
            'isLookThroughEnabled': true,
            'ltSecurityTypes': 'FUND,ETF,FUTURE_INDEX'
        });

        // Initialize component
        component.ngOnInit();

        // Mock the initial and current rules to be different
        component.ltFilterRulesInit = [new LookthroughFilterRule()];
        component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules = [new LookthroughFilterRule(), new LookthroughFilterRule()];

        // Mock the conditions for opening the save summary dialog
        component.portfolio.lookthroughSettings.ltFilterRulesFav.owner = CoreFavoriteConstants.ADMIN;
        jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);
        component.portfolio.lookthroughSettings.ltFilterRulesFav.id = 126;
        component.portfolio.lookthroughSettings.ltFilterRulesFav.versionNumber = 2;
        component.isSaveSummaryOpen = false;
        // Call the method
        component.onDoneClick();

        // Check if the save summary dialog is opened
        expect(component.isSaveSummaryOpen).toBe(true);
    });

    it('should close save summary dialog and save if summary is entered', () => {
        testComponentCreation({});
        component.saveSummary = {
            changeSummary: 'Summary',
            changeSummaryDetails: 'Details'
        };

        component.closeSaveSummaryDialog(true);
        expect(favoriteServiceMock.quickSaveFavorite$).toHaveBeenCalled();
        // Get the first argument from the mock call
        const [actualFavToSave] = favoriteServiceMock.quickSaveFavorite$.mock.calls[0];

        // Assert specific properties
        expect(actualFavToSave.changeSummary).toBe('Summary');
        expect(actualFavToSave.changeSummaryDetail).toBe('Details');
    });

    it('should close save summary dialog and do nothing if summary is not entered', () => {
        testComponentCreation({});
        component.saveSummary = {
            changeSummary: undefined,
            changeSummaryDetails: undefined
        };
        component.closeSaveSummaryDialog(false);
        expect(favoriteServiceMock.quickSaveFavorite$).not.toHaveBeenCalled();
    });

    it('tests onDoneClick method_3 - for Save Changes | Rules and order are same', function () {
        testComponentCreation({
            'isLookThroughEnabled': true,
            'ltSecurityTypes': 'FUND,ETF,FUTURE_INDEX'
        });

        // Init Rules
        component.ltFilterRulesInit = new Array<LookthroughFilterRule>();
        const ltFilterRuleInit: LookthroughFilterRule = new LookthroughFilterRule();
        ltFilterRuleInit.ltType = 'Sector';
        component.ltFilterRulesInit.push(ltFilterRuleInit);

        // LT Rules
        component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules = new Array<LookthroughFilterRule>();
        const lookthroughFilterRule: LookthroughFilterRule = new LookthroughFilterRule();
        lookthroughFilterRule.ltType = 'Sector';
        component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.push(lookthroughFilterRule);
        component.portfolio.lookthroughSettings.ltFilterRulesFav.id = 126;

        jest.spyOn(component.rulebuilderClosed, 'emit');
        jest.spyOn(favoriteServiceMock, 'quickSaveFavorite$').mockReturnValue(
            of(true)
        );
        component.onDoneClick();
        expect(favoriteServiceMock.quickSaveFavorite$).toHaveBeenCalledTimes(0);
        expect(component.rulebuilderClosed.emit).toHaveBeenCalledWith(false);
    });

    it('tests onDoneClick method_4 - for Use Once', function () {
        testComponentCreation({
            'isLookThroughEnabled': true,
            'ltSecurityTypes': 'FUND,ETF,FUTURE_INDEX'
        });

        // Init Rules
        component.ltFilterRulesInit = new Array<LookthroughFilterRule>();
        const ltFilterRuleInit: LookthroughFilterRule = new LookthroughFilterRule();
        ltFilterRuleInit.ltType = 'Sector';
        component.ltFilterRulesInit.push(ltFilterRuleInit);

        // LT Rules
        component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules = new Array<LookthroughFilterRule>();
        const lookthroughFilterRule: LookthroughFilterRule = new LookthroughFilterRule();
        lookthroughFilterRule.ltType = 'Sector';
        component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.push(lookthroughFilterRule);

        jest.spyOn(component.rulebuilderClosed, 'emit');
        jest.spyOn(favoriteServiceMock, 'quickSaveFavorite$').mockReturnValue(
            of(true)
        );

        // test when rules are same
        component.onDoneClick();
        expect(favoriteServiceMock.quickSaveFavorite$).toHaveBeenCalledTimes(0);
        expect(component.rulebuilderClosed.emit).toHaveBeenCalledWith(false);

        // test when rules are different
        component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules[0].ltType = 'None';
        component.onDoneClick();
        expect(favoriteServiceMock.quickSaveFavorite$).toHaveBeenCalledTimes(0);
        expect(component.rulebuilderClosed.emit).toHaveBeenCalledWith(true);
    });

    it('Test updateExportingStatus', () => {
        testComponentCreation({});
        component.updateExportingStatus(true, null);
        expect(component.downloadInProgress).toBeFalsy();
    });

    it('Test toggleTableSearch', () => {
        testComponentCreation({});
        component.isTableSearchActive$ = new BehaviorSubject<boolean>(true);
        component.toggleTableSearch();
        expect(component.isTableSearchActive$.isStopped).toBeFalsy();
    });

    it('add rule from summary', () => {
        testComponentCreation({'isLookThroughEnabled': true,
            'ltSecurityTypes': 'FUND,ETF,FUTURE_INDEX'});

        component.ngOnInit();

        const getColIdMock = () => 'issuer_name_1';
        const getColIdMock2 = () => 'market_val';
        const getCellRangesMock = () => [{startRow: {rowIndex: 2}, startColumn: {colId: 'issuer_name_1', getColId: getColIdMock}}, {startRow: {rowIndex: 4}, startColumn: {colId: 'market_val', getColId: getColIdMock2}}];
        const getDisplayedRowAtIndexMock = () => new RowNode();
        const getValueMock = () => 'L_ILIF';
        component.exploreTableWrapper = { exploreTable: { gridApiHandle: { getCellRanges: getCellRangesMock, getDisplayedRowAtIndex: getDisplayedRowAtIndexMock, getValue: getValueMock } } };

        component.customSectorItem = {customSectorEventsServiceSubscribe: {}};

        const getActiveCustomSectorItemMock = () => of(component.customSectorItem);
        const addRuleMock = jest.fn();
        component.customSectorItem = { customSectorEventsService: { getActiveCustomSectorItem$: getActiveCustomSectorItemMock }, rule: new ColumnSectorRule(), parent: new ColumnSectorRule(), addRule: addRuleMock};
        component.showLookthroughView = true;
        component.selectedFilterRule = new LookthroughFilterRule();
        component.addConditionClicked();
        expect(component.customSectorItem.addRule).toHaveBeenCalled();
    });

    it('add rule from summary as first rule', () => {
        testComponentCreation({'isLookThroughEnabled': true,
            'ltSecurityTypes': 'FUND,ETF,FUTURE_INDEX'});

        component.ngOnInit();

        const getColIdMock = () => 'issuer_name_1';
        const getColIdMock2 = () => 'underl_sec_type_1';
        const getCellRangesMock = () => [{startRow: {rowIndex: 2}, startColumn: {colId: 'issuer_name_1', getColId: getColIdMock}}, {startRow: {rowIndex: 3}, startColumn: {colId: 'underl_sec_type_1', getColId: getColIdMock2}}];
        const getDisplayedRowAtIndexMock = () => new RowNode();
        const getValueMock = () => 'L_ILIF';
        component.exploreTableWrapper = { exploreTable: { gridApiHandle: { getCellRanges: getCellRangesMock, getDisplayedRowAtIndex: getDisplayedRowAtIndexMock, getValue: getValueMock } } };

        component.customSectorItem = {customSectorEventsServiceSubscribe: {}};

        const getActiveCustomSectorItemMock = () => of(component.customSectorItem);
        const addRuleMock = jest.fn();
        const addFirstRuleFromLTMock = jest.fn();
        component.customSectorItem = { customSectorEventsService: { getActiveCustomSectorItem$: getActiveCustomSectorItemMock }, rule: new ColumnSectorRule(), parent: new ColumnSectorRule(), addRule: addRuleMock, addFirstRuleFromLT: addFirstRuleFromLTMock, isColumnRule: true};
        component.showLookthroughView = true;
        component.selectedFilterRule = new LookthroughFilterRule();
        component.addConditionClicked();
        expect(component.customSectorItem.addFirstRuleFromLT).toHaveBeenCalled();
    });

    const testComponentCreation = (lookthroughSettingsJson: any) => {
        fixture = TestBed.createComponent(LookthroughRuleBuilderModalComponent);
        component = fixture.componentInstance;
        component.showRuleBuilder = true;

        component.portfolio = new Portfolio('PEP');
        component.portfolio.datePicker = new DateValue({date: '05/09/2017', calCode: 'GP_HK_STD'});
        component.portfolio.lookthroughSettings = new LookThroughSettingsWithRules(lookthroughSettingsJson);
        component.portfolio.splitPositionSettings.selectedPositionTypes = ['XC', 'XF', 'XH', 'XS', 'SW', 'O'];
        component.portfolio.portName = 'OBSID';
        component.portfolio.benchmark = Benchmark.create(BenchmarkConstants.BENCH_AGGREGATE, null, 'NO_BENCH');

        component.setLookthroughViewFlags = jest.fn();
        component.extractLookthroughInfo = jest.fn();
        component.ltFilterRulesFav = new LookthroughfilterRulesFav();


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

    const addRule = () => {
        component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules = new Array<LookthroughFilterRule>();
        component.portfolio.lookthroughSettings.ltFilterRulesFav.ltFilterRules.push(cloneDeep(ltFilterRule));
    };
});
