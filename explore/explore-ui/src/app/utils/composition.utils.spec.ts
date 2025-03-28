import {CompositionUtils} from '@utils/composition.utils';
import {BaseRule} from '@models/portfolio/tradeRules/base-rule.model';
import {SectorRule} from '@models/portfolio/tradeRules/sector-rule.model';
import {RulesBasedPortfolio} from '@models/portfolio/rule-based-portfolio.model';
import {PortfolioSecurityHoldingChange} from '@models/portfolio/composition/portfolio-security-holding-change.model';
import {CompositionRule} from '@models/portfolio/composition/composition-rule.model';
import {ColumnConfig, ColumnConstants, ColumnDefinition, CoreColumnUtils, DateValue, ResponseData} from '@blk/explore-ui-core';
import {CompositionConstants} from '@constants/composition.constants';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {NewPortfolioHoldingChange} from '@models/portfolio/composition/new-portfolio-holding-change.model';
import {NewSecurityHoldingChange} from '@models/portfolio/composition/new-security-holding-change.model';
import {CompositionSetting} from '@models/portfolio/composition/composition-setting.model';
import * as compositionDataPortSummary from '@mocks/compositionData/compositionDataPortSummaryMock.json';
import {cloneDeep} from 'lodash';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {ModellingType} from '@enums/modelling-type.enum';
import {ROOT_LEVEL} from '@utils/qbstr';
import {SimpleCube} from '@qbstr/data-cube-reactive';
import {ColDef, ColGroupDef} from 'ag-grid-community';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {PortfolioHoldingChange} from '@models/portfolio/composition/portfolio-holding-change.model';
import {FormatAndScaleFactory, LibColumnUtils} from '@blk/explore-ui-column-option';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {AdhocPortGroup} from '@models/portfolio/adhoc-portgroup.model';
import {AdhocPortParams} from '@models/portfolio/adhocModelling/adhoc-port-params.model';
import {PortfolioRule} from '@models/portfolio/tradeRules/portfolio-rule.model';
import {
    PortfolioNavSecurityHoldingChange
} from '@models/portfolio/composition/portfolio-nav-securities-holding-change.model';
import {Constraint} from '@models/portfolio/constraints/constraint.model';
import {AdhocPortfolio} from '@models/portfolio/adhoc-portfolio.model';

describe('CompositionUtils', () => {
    describe('Test Passed rule', () => {
        const allRules: BaseRule[] = [new SectorRule('ABS', 10, null), new SectorRule('BND', 60, null)];

        it('Test calculatePassedRules function', () => {
            // getting all rules data from the JSON file.
            const skippedRules = [new SectorRule('ABS', 10, null)];
            const passedRules = CompositionUtils.calculatePassedRules(allRules, skippedRules);

            // validate the passed rule.
            expect(passedRules.length).toBe(1);
            expect(passedRules[0].ruleType).toBe('Sector');
            expect(passedRules[0].lineItem).toBe('BND');
            expect(passedRules[0].newWeight).toBe(60);
        });

        it('Test calculatePassedRules function for allRules skipped', () => {
            // getting all rules data from the JSON file.
            const skippedRules = [new SectorRule('ABS', 10, null), new SectorRule('BND', 60, null)];
            const passedRules = CompositionUtils.calculatePassedRules(allRules, skippedRules);

            // validate the passed rule.
            expect(passedRules.length).toBe(0);
        });

        it('Test calculatePassedRules function for no rules skipped', () => {
            // getting all rules data from the JSON file.
            const passedRules = CompositionUtils.calculatePassedRules(allRules, undefined);

            // validate the passed rule.
            expect(passedRules.length).toBe(2);
        });
    });

    it('Test resetComposition function', () => {
        const port: RulesBasedPortfolio = new RulesBasedPortfolio('PEP');
        port.composition = {data: {data: []}};
        port.skippedRulesForEachDate = [new SectorRule('BND', 15, null)];
        port.passedRulesForEachDate = [new SectorRule('ABS', 10, null)];
        port.holdingChanges = [new PortfolioSecurityHoldingChange()];

        jest.spyOn(port, 'resetCompositeIndexWeights').mockImplementation(() => {});
        CompositionUtils.resetComposition(port);

        expect(port.composition).toBe(undefined);
        expect(port.compositionRules.equals(new CompositionRule(port.portName))).toBeTruthy();
        expect(port.passedRulesForEachDate.length).toBe(0);
        expect(port.skippedRulesForEachDate.length).toBe(0);
        expect(port.holdingChanges.length).toBe(0);
        expect(port.resetCompositeIndexWeights).toHaveBeenCalledTimes(1);
    });

    it('Test addCashOffSetRow function', () => {
        const compositionSetting: CompositionSetting = new CompositionSetting({
            tradingColumn: ColumnConstants.PCT_NAV_GROUP,
            showActiveInComposition: true
        });
        const columns: string[] = ['portfolio', 'portfolio_name', 'nav_group_before', 'nav_group_after', 'nav_group_change', 'pct_nav_group_before', 'pct_nav_group_after', 'pct_nav_group_change'];
        const data: ResponseData = {data: ['CORE-HQ', 'CORE-HQ', 288936663.1538421, 288936663.1538421, 0, 1, 1, 0]};

        data.children = [];
        CompositionUtils.addCashOffSetRow(data, columns, compositionSetting);
        expect(data.children.length).toBe(0);

        data.children = [{data: [CompositionConstants.CASH_OFFSET, CompositionConstants.CASH_OFFSET, 81593938.3732301, 81593938.3732301, 0, 0.2823938557419625, 0.2823938557419625, 0]}];
        CompositionUtils.addCashOffSetRow(data, columns, compositionSetting);
        expect(data.children.length).toBe(1);
        expect(data.children[0].data).toEqual(['CASH OFFSET', 'CASH OFFSET', 81593938.3732301, 81593938.3732301, 0, 0.2823938557419625, 0.2823938557419625, 0]);

        data.children = [{data: ['GALIC-106', 'GALIC-106', 81593938.3732301, 81593938.3732301, 0, 0.2823938557419625, 0.2823938557419625, 0]}];
        CompositionUtils.addCashOffSetRow(data, columns, compositionSetting);
        expect(data.children.length).toBe(2);
        expect(data.children[1].data).toEqual(['CASH OFFSET', 'CASH OFFSET', 0, 0, 0, 0, 0, 0]);

        data.children = [{data: ['GALIC-106', 'GALIC-106', 81593938.3732301, 81593938.3732301, 0, 0.2823938557419625, 0.2823938557419625, 0], rowId: 5,
            children: [{data: ['IP', 'IP', 81593938.3732301, 81593938.3732301, 0, 0.2823938557419625, 0.2823938557419625, 0], rowId: 6}]}];
        CompositionUtils.addCashOffSetRow(data, columns, compositionSetting);
        expect(data.children.length).toBe(2);
        expect(data.children[1].data).toEqual(['CASH OFFSET', 'CASH OFFSET', 0, 0, 0, 0, 0, 0]);
        expect(data.children[1].rowId).toEqual(7);
    });

    it('markAsAddedDuringWhatIfInitialization', () => {
        const portfolio = new PortfolioWithPositions();
        portfolio.holdingChanges = [];
        portfolio.holdingChanges.push(new NewSecurityHoldingChange());
        CompositionUtils.markAsAddedDuringWhatIfInitialization(portfolio);
        expect(portfolio.holdingChanges[0].addedDuringWhatIfInitialization).toEqual(true);
    });

    it('resetCompositionOnBreakdownChange', () => {
        const port = new PortfolioWithPositions('IP');
        jest.spyOn(CompositionUtils, 'resetComposition').mockImplementation(() => {});

        // No holding changes
        CompositionUtils.resetCompositionOnBreakdownChange(port, true);
        expect(CompositionUtils.resetComposition).not.toHaveBeenCalled();

        // No portfolio holding change and breakdown specified
        port.holdingChanges = [new NewSecurityHoldingChange()];
        CompositionUtils.resetCompositionOnBreakdownChange(port, true);
        expect(CompositionUtils.resetComposition).not.toHaveBeenCalled();

        // Portfolio holding change and no breakdown specified
        port.holdingChanges = [new NewPortfolioHoldingChange()];
        CompositionUtils.resetCompositionOnBreakdownChange(port, false);
        expect(CompositionUtils.resetComposition).not.toHaveBeenCalled();

        // No portfolio holding change and breakdown not specified
        port.holdingChanges = [new NewSecurityHoldingChange()];
        CompositionUtils.resetCompositionOnBreakdownChange(port, false);
        expect(CompositionUtils.resetComposition).toHaveBeenCalledWith(port);

        // Portfolio holding change and breakdown specified
        port.holdingChanges = [new NewPortfolioHoldingChange()];
        CompositionUtils.resetCompositionOnBreakdownChange(port, true);
        expect(CompositionUtils.resetComposition).toHaveBeenCalledWith(port);
    });

    it('tests refreshCompositionData', () => {
        const ruleBase: RulesBasedPortfolio = new RulesBasedPortfolio('CORE-HQ');
        ruleBase.composition = cloneDeep(compositionDataPortSummary);
        ruleBase.modellingType = ModellingType.PORTFOLIO;
        ruleBase.isCompositePortfolio = true;
        ruleBase.holdingChanges = [new PortfolioHoldingChange({
            lineItem: 'HIC',
            changeInWeight: 21
        })];
        jest.spyOn(CoreColumnUtils, 'getColumnDefByTagAndUse').mockReturnValue(new ColumnDefinition());
        jest.spyOn(FormatAndScaleFactory, 'getFormatterToUse').mockReturnValue({
            format: () => '',
            convertToRaw: () => ''
        });
        const eventHandlerMap: Map<string, Function> = new Map<string, Function>([['tradeAction', () => {
        }]]);
        jest.spyOn(eventHandlerMap, 'get').mockImplementation(() => jest.fn());
        const compositionPayload: WidgetPayload = CompositionUtils.refreshCompositionData(ruleBase, eventHandlerMap);

        // verify breakdown levels
        expect(compositionPayload.breakdownLevels.length).toBe(1);
        expect(compositionPayload.breakdownLevels[0]).toBe(ROOT_LEVEL);

        // verify cube
        expect(compositionPayload.cube instanceof SimpleCube && compositionPayload.cube['underlyingCube'].cube.size === 3).toBeTruthy();
        const mapKeys = compositionPayload.cube['underlyingCube'].cube.mapKeys;
        const mapValues = compositionPayload.cube['underlyingCube'].cube.mapValues;
        expect(mapKeys.length === mapValues.length).toBeTruthy();
        Object.keys(mapKeys).forEach(mapKey => expect(mapValues.get(mapKey)).toBeDefined());

        // verify default column definitions
        expect(compositionPayload.defaultColumnDefs.length).toBe(4);
        expect((compositionPayload.defaultColumnDefs[2] as ColGroupDef).children.length).toBe(2);
        expect((compositionPayload.defaultColumnDefs[0] as ColDef).field === 'portfolio_name').toBeTruthy();
        expect((compositionPayload.defaultColumnDefs[1] as ColDef).field === 'port_full_name').toBeTruthy();
        expect(((compositionPayload.defaultColumnDefs[2] as ColGroupDef).children[0] as ColDef).field === 'pct_nav_group_before').toBeTruthy();
        expect(((compositionPayload.defaultColumnDefs[2] as ColGroupDef).children[1] as ColDef).field === 'pct_nav_group_after').toBeTruthy();
        expect(((compositionPayload.defaultColumnDefs[2] as ColGroupDef).children[1] as ColDef).onCellValueChanged).toBeDefined();
        ((compositionPayload.defaultColumnDefs[2] as ColGroupDef).children[1] as ColDef).onCellValueChanged();
        expect(eventHandlerMap.get).toHaveBeenCalledWith('tradeAction');

        // verify notification
        expect(compositionPayload.notification.buttons.length === 1 && compositionPayload.notification.buttons[0].label === 'Reload Now').toBeTruthy();
        expect(compositionPayload.notification.message).toBe('Reload to see your changes.');

        // verify request config
        expect(compositionPayload.requestConfig.portfolio).toBe('CORE-HQ');
        expect(compositionPayload.requestConfig.columns.length === 4).toBeTruthy();
        expect(compositionPayload.requestConfig.columns[0].columnTag === 'portfolio_name').toBeTruthy();
        expect(compositionPayload.requestConfig.columns[1].columnTag === 'port_full_name').toBeTruthy();
        expect(compositionPayload.requestConfig.columns[2].columnTag === 'nav_group').toBeTruthy();
        expect(compositionPayload.requestConfig.columns[3].columnTag === 'pct_nav_group').toBeTruthy();
        expect(compositionPayload.responseConfig.columns.length === 5).toBeTruthy();

        // verify response config
        expect(compositionPayload.responseConfig.columns[0]).toBe('portfolio_name');
        expect(compositionPayload.responseConfig.columns[1]).toBe('nav_group_before');
        expect(compositionPayload.responseConfig.columns[2]).toBe('nav_group_after');
        expect(compositionPayload.responseConfig.columns[3]).toBe('pct_nav_group_before');
        expect(compositionPayload.responseConfig.columns[4]).toBe('pct_nav_group_after');
    });

    it('should replace instances of PortfolioHoldingChange with NewPortfolioHoldingChange', () => {
        // Arrange
        const portfolio = new AdhocPortGroup();
        const portfolioHoldingChange = new PortfolioHoldingChange();
        portfolio.holdingChanges = [portfolioHoldingChange];

        // Act
        CompositionUtils.replacePortfolioHoldingChangesForAdhocPortGroup(portfolio);

        // Assert
        expect(portfolio.holdingChanges.length).toBe(1);
        expect(portfolio.holdingChanges[0]).toBeInstanceOf(NewPortfolioHoldingChange);
    });

    it('should not replace instances of other types', () => {
        // Arrange
        const portfolio = new AdhocPortGroup();
        const newPortfolioHoldingChange = new NewPortfolioHoldingChange();  // Assuming this is some other type of holding change
        portfolio.holdingChanges = [newPortfolioHoldingChange];

        // Act
        CompositionUtils.replacePortfolioHoldingChangesForAdhocPortGroup(portfolio);

        // Assert
        expect(portfolio.holdingChanges.length).toBe(1);
        expect(portfolio.holdingChanges[0]).toBe(newPortfolioHoldingChange);
    });

    it('should not replace instances if portfolio is not an instance of AdhocPortGroup', () => {
        // Arrange
        const portfolio = new AdhocPortfolio();  // Assuming this is some other type of portfolio
        const portfolioHoldingChange = new PortfolioHoldingChange();
        portfolio.holdingChanges = [portfolioHoldingChange];

        // Act
        CompositionUtils.replacePortfolioHoldingChangesForAdhocPortGroup(portfolio);

        // Assert
        expect(portfolio.holdingChanges.length).toBe(1);
        expect(portfolio.holdingChanges[0]).toBe(portfolioHoldingChange);
    });

    it('Portfolio compositionConfig for different use case', () => {
        const portfolio: WhatIfPortfolio = new WhatIfPortfolio();
        jest.spyOn(portfolio, 'isCompositionAtPortfolioLevel').mockReturnValue(true);
        const portfolioSummaryCompositionConfig = CompositionUtils.createCompositionConfig(portfolio);
        expect(portfolioSummaryCompositionConfig.columnDefinitions.length).toBe(4);
        expect(portfolioSummaryCompositionConfig.requestColumns.length).toBe(4);
    });

    it('tests refreshCompositeCompositionTableCashOffset', () => {
        const responseData = {data: [0, 'PEP', '', 1, 100, 50], children: [{data: [CompositionConstants.CASH_OFFSET, CompositionConstants.CASH_OFFSET, 1, 2]}]};
        CompositionUtils.refreshCompositeCompositionTableCashOffset(
            responseData as any,
            ['', 'portfolio_name', '', CompositionConstants.PCT_NAV_GROUP_AFTER, CompositionConstants.NAV_GROUP_AFTER, CompositionConstants.NAV_GROUP_BEFORE],
            [new PortfolioHoldingChange({lineItem: 'PEP', changeInWeight: 21}), new PortfolioNavSecurityHoldingChange({lineItem: 'USD_CCASH', changeInWeight: 100})]
        );
        expect(responseData.children[0].data).toEqual(['CASH OFFSET', 'CASH OFFSET', 1, 0.395, 39.5]);
    });

    it('test disableResetButton', () => {

        const ruleBase: RulesBasedPortfolio = new RulesBasedPortfolio('CORE-HQ');
        ruleBase.composition = cloneDeep(compositionDataPortSummary);
        ruleBase.modellingType = ModellingType.SECTOR;
        ruleBase.isCompositePortfolio = true;
        ruleBase.holdingChanges = [new PortfolioSecurityHoldingChange({
            lineItem: 'HIC',
            changeInWeight: 21,
            isNavNeutral: true
        }
        )];
        expect(CompositionUtils.disableResetButton(ruleBase)).toBeFalsy();

        const ruleBase1: RulesBasedPortfolio = new RulesBasedPortfolio('CORE-HQ');
        ruleBase1.composition = cloneDeep(compositionDataPortSummary);
        ruleBase1.modellingType = ModellingType.SECTOR;
        ruleBase1.isCompositePortfolio = true;
        ruleBase1.holdingChanges = [new PortfolioSecurityHoldingChange({
                lineItem: 'HIC',
                changeInWeight: 21,
                isNavNeutral: false
            }
        )];
        expect(CompositionUtils.disableResetButton(ruleBase1)).toBeTruthy();

        const ruleBase2: RulesBasedPortfolio = new RulesBasedPortfolio('CORE-HQ');
        ruleBase2.composition = cloneDeep(compositionDataPortSummary);
        ruleBase2.modellingType = ModellingType.SECTOR;
        ruleBase2.isCompositePortfolio = true;
        ruleBase2.holdingChanges = [];
        expect(CompositionUtils.disableResetButton(ruleBase2)).toBeTruthy();

        const ruleBase3: RulesBasedPortfolio =  new RulesBasedPortfolio('CORE-HQ');
        ruleBase3.composition = cloneDeep(compositionDataPortSummary);
        ruleBase3.modellingType = ModellingType.PORTFOLIO;
        ruleBase3.isCompositePortfolio = true;
        ruleBase3.holdingChanges = [undefined];
        expect(CompositionUtils.disableResetButton(ruleBase3)).toBeTruthy();
    });

    it('tests getModellingCategories', () => {
        // Port has security and sector modelling enabled, port has portfolio modelling disabled
        let expectedModellingCategory: Record<string, number[]> = {};
        expectedModellingCategory[CompositionConstants.POINT_IN_TIME_ANALYSIS_CATEGORY] = [ModellingType.POSITION];
        expectedModellingCategory[CompositionConstants.THROUGH_TIME_ANALYSIS_CATEGORY] = [ModellingType.SECTOR];

        validateModellingAllowedFlags(true, true, false, expectedModellingCategory);

        // Port has security and sector modelling disabled, port has portfolio modelling enabled
        expectedModellingCategory = {};
        expectedModellingCategory[CompositionConstants.THROUGH_TIME_ANALYSIS_CATEGORY] = [ModellingType.PORTFOLIO];

        validateModellingAllowedFlags(false, false, true, expectedModellingCategory);

        // Port has security and sector modelling enabled, and also port has portfolio modelling enabled
        expectedModellingCategory = {};
        expectedModellingCategory[CompositionConstants.POINT_IN_TIME_ANALYSIS_CATEGORY] = [ModellingType.POSITION];
        expectedModellingCategory[CompositionConstants.THROUGH_TIME_ANALYSIS_CATEGORY] = [ModellingType.SECTOR, ModellingType.PORTFOLIO];

        validateModellingAllowedFlags(true, true, true, expectedModellingCategory);
    });

    it('test disableProRataOption', () => {

        const ruleBase: RulesBasedPortfolio = new RulesBasedPortfolio('CORE-HQ');
        ruleBase.composition = cloneDeep(compositionDataPortSummary);
        ruleBase.modellingType = ModellingType.SECTOR;
        ruleBase.isCompositePortfolio = true;
        ruleBase.holdingChanges = [new PortfolioSecurityHoldingChange({
                lineItem: 'HIC',
                changeInWeight: 21,
                isNavNeutral: true
            }
        )];
        expect(CompositionUtils.disableProRataOption(ruleBase)).toBeTruthy();

        const ruleBase1: RulesBasedPortfolio = new RulesBasedPortfolio('CORE-HQ');
        ruleBase1.composition = cloneDeep(compositionDataPortSummary);
        ruleBase1.modellingType = ModellingType.SECTOR;
        ruleBase1.isCompositePortfolio = true;
        ruleBase1.holdingChanges = [];
        expect(CompositionUtils.disableProRataOption(ruleBase1)).toBeFalsy();
    });

    it('test getAdhocParams', () => {
        const portfolio: AdhocPortGroup = new AdhocPortGroup();
        const adhocParamsObj = {
            'currency': 'USD',
            'date': {
                'calCode': 'INDEX_ALL_Calendar',
                'date': '09/04/2018',
                'dateString': true,
                'dateStringValue': 'T-1'
            },
            'fullName': 'adhocpg',
            'name': 'adhocpg',
            'portMktNotional': 100000
        };
        portfolio.adhocParams = new AdhocPortParams(adhocParamsObj);
        expect(CompositionUtils.getAdhocParams('adhocParams', portfolio)).toEqual({'adhocParams': adhocParamsObj});
    });

    it('tests checkForChildAdhocPortsWithRiskColumns', () => {
        expect(CompositionUtils.checkForChildAdhocPortsWithRiskColumns(null, null)).toBeFalsy();
        expect(CompositionUtils.checkForChildAdhocPortsWithRiskColumns(new Portfolio(), null)).toBeFalsy();
        expect(CompositionUtils.checkForChildAdhocPortsWithRiskColumns(null, [])).toBeFalsy();
        expect(CompositionUtils.checkForChildAdhocPortsWithRiskColumns(new Portfolio(), [])).toBeFalsy();

        const ruleBased: Portfolio = new RulesBasedPortfolio('adhoc', 'adhoc', new DateValue({date: '20180904'}));
        expect(CompositionUtils.checkForChildAdhocPortsWithRiskColumns(ruleBased, [])).toBeFalsy();

        const mockedColumnDef: ColumnDefinition = new ColumnDefinition();
        const spy = jest.spyOn(LibColumnUtils, 'getColumnDefinition');
        spy.mockImplementationOnce(() => mockedColumnDef);
        expect(CompositionUtils.checkForChildAdhocPortsWithRiskColumns(ruleBased, [new ColumnConfig()])).toBeFalsy();

        (ruleBased as RulesBasedPortfolio).compositionRules.tradeRules = [new PortfolioRule(undefined, undefined, undefined, undefined, CompositionConstants.ADHOC_PORT)];
        expect(CompositionUtils.checkForChildAdhocPortsWithRiskColumns(ruleBased, [])).toBeFalsy();

        mockedColumnDef.groups = ['Portfolio Risk'];
        spy.mockImplementationOnce(() => mockedColumnDef);
        expect(CompositionUtils.checkForChildAdhocPortsWithRiskColumns(ruleBased, [new ColumnConfig()])).toEqual('Portfolio Risk data is not supported for child create-from-scratch portfolios');
    });

    it('test checkIfBothBoundsAreFilled', () => {
        expect(CompositionUtils.checkIfBothBoundsInEfficientFormat('1:3', [1, 4, 6])).toBeTruthy();
        expect(CompositionUtils.checkIfBothBoundsInEfficientFormat('1', [1, 4, 6])).toBeFalsy();
        expect(CompositionUtils.checkIfBothBoundsInEfficientFormat('1:3', '1')).toBeFalsy();
        expect(CompositionUtils.checkIfBothBoundsInEfficientFormat('3', '1')).toBeFalsy();
    });

    it('test possibleEfficientFrontierColonFormat', () => {
        // false
        expect(CompositionConstants.EFF_FRONT_COLON_REGEX.test('1:3:4')).toBeFalsy();
        expect(CompositionConstants.EFF_FRONT_COLON_REGEX.test('.6:4:.8')).toBeFalsy();
        expect(CompositionConstants.EFF_FRONT_COLON_REGEX.test(':3')).toBeFalsy();
        expect(CompositionConstants.EFF_FRONT_COLON_REGEX.test('3:')).toBeFalsy();
        expect(CompositionConstants.EFF_FRONT_COLON_REGEX.test('3:4:')).toBeFalsy();
        expect(CompositionConstants.EFF_FRONT_COLON_REGEX.test('.6:4:8.')).toBeFalsy();
        expect(CompositionConstants.EFF_FRONT_COLON_REGEX.test('-:4')).toBeFalsy();
        expect(CompositionConstants.EFF_FRONT_COLON_REGEX.test('.456:-')).toBeFalsy();
        expect(CompositionConstants.EFF_FRONT_COLON_REGEX.test('.456:45:-')).toBeFalsy();
        expect(CompositionConstants.EFF_FRONT_COLON_REGEX.test('6:4.')).toBeFalsy();
        expect(CompositionConstants.EFF_FRONT_COLON_REGEX.test(':6:.4')).toBeFalsy();
        expect(CompositionConstants.EFF_FRONT_COLON_REGEX.test('1')).toBeFalsy();
        expect(CompositionConstants.EFF_FRONT_COLON_REGEX.test('1.')).toBeFalsy();
        expect(CompositionConstants.EFF_FRONT_COLON_REGEX.test('1.2')).toBeFalsy();
        expect(CompositionConstants.EFF_FRONT_COLON_REGEX.test('11.23')).toBeFalsy();

        // true
        expect(CompositionConstants.EFF_FRONT_COLON_REGEX.test('134534:3785675')).toBeTruthy();
        expect(CompositionConstants.EFF_FRONT_COLON_REGEX.test('1:3')).toBeTruthy();
        expect(CompositionConstants.EFF_FRONT_COLON_REGEX.test('.6:4')).toBeTruthy();
        expect(CompositionConstants.EFF_FRONT_COLON_REGEX.test('.6:.4')).toBeTruthy();
        expect(CompositionConstants.EFF_FRONT_COLON_REGEX.test('.1:.323')).toBeTruthy();
        expect(CompositionConstants.EFF_FRONT_COLON_REGEX.test('.1332:.3')).toBeTruthy();
        expect(CompositionConstants.EFF_FRONT_COLON_REGEX.test('.1332:.34534')).toBeTruthy();
        expect(CompositionConstants.EFF_FRONT_COLON_REGEX.test('23.1332:.34534')).toBeTruthy();
        expect(CompositionConstants.EFF_FRONT_COLON_REGEX.test('.1332:43.34534')).toBeTruthy();
        expect(CompositionConstants.EFF_FRONT_COLON_REGEX.test('367.1332:43.34534')).toBeTruthy();
        expect(CompositionConstants.EFF_FRONT_COLON_REGEX.test('-.1332:43.34534')).toBeTruthy();
        expect(CompositionConstants.EFF_FRONT_COLON_REGEX.test('-367.1332:-.34534')).toBeTruthy();
        expect(CompositionConstants.EFF_FRONT_COLON_REGEX.test('-367:43.34534')).toBeTruthy();
        expect(CompositionConstants.EFF_FRONT_COLON_REGEX.test('.4:-43')).toBeTruthy();
    });

    it('test possibleEfficientFrontierCommaFormat', () => {
        // false
        expect(CompositionConstants.EFF_FRONT_COMMA_REGEX.test('1')).toBeFalsy();
        expect(CompositionConstants.EFF_FRONT_COMMA_REGEX.test('1.')).toBeFalsy();
        expect(CompositionConstants.EFF_FRONT_COMMA_REGEX.test('1.2')).toBeFalsy();
        expect(CompositionConstants.EFF_FRONT_COMMA_REGEX.test('11.23')).toBeFalsy();
        expect(CompositionConstants.EFF_FRONT_COMMA_REGEX.test(',3,5')).toBeFalsy();
        expect(CompositionConstants.EFF_FRONT_COMMA_REGEX.test('3,5,')).toBeFalsy();
        expect(CompositionConstants.EFF_FRONT_COMMA_REGEX.test(',3,5,')).toBeFalsy();
        expect(CompositionConstants.EFF_FRONT_COMMA_REGEX.test(',1.2,4')).toBeFalsy();
        expect(CompositionConstants.EFF_FRONT_COMMA_REGEX.test('4,1.2,')).toBeFalsy();
        expect(CompositionConstants.EFF_FRONT_COMMA_REGEX.test('1.2.3,1')).toBeFalsy();
        expect(CompositionConstants.EFF_FRONT_COMMA_REGEX.test('.2.3,1')).toBeFalsy();
        expect(CompositionConstants.EFF_FRONT_COMMA_REGEX.test('1.2,,')).toBeFalsy();
        expect(CompositionConstants.EFF_FRONT_COMMA_REGEX.test(',,23.456')).toBeFalsy();
        expect(CompositionConstants.EFF_FRONT_COMMA_REGEX.test('1')).toBeFalsy();
        expect(CompositionConstants.EFF_FRONT_COMMA_REGEX.test('134')).toBeFalsy();
        expect(CompositionConstants.EFF_FRONT_COMMA_REGEX.test('1.')).toBeFalsy();
        expect(CompositionConstants.EFF_FRONT_COMMA_REGEX.test('145.')).toBeFalsy();
        expect(CompositionConstants.EFF_FRONT_COMMA_REGEX.test('1.2')).toBeFalsy();
        expect(CompositionConstants.EFF_FRONT_COMMA_REGEX.test('11.23')).toBeFalsy();
        expect(CompositionConstants.EFF_FRONT_COMMA_REGEX.test('1.234,,,1')).toBeFalsy();
        expect(CompositionConstants.EFF_FRONT_COMMA_REGEX.test('-,-.3446,.565,1,345')).toBeFalsy();
        expect(CompositionConstants.EFF_FRONT_COMMA_REGEX.test('1.234,-,.565,1.')).toBeFalsy();
        expect(CompositionConstants.EFF_FRONT_COMMA_REGEX.test('1.234,-.3446,.565,1,345,-')).toBeFalsy();

        // true
        expect(CompositionConstants.EFF_FRONT_COMMA_REGEX.test('1,2')).toBeTruthy();
        expect(CompositionConstants.EFF_FRONT_COMMA_REGEX.test('-1,2')).toBeTruthy();
        expect(CompositionConstants.EFF_FRONT_COMMA_REGEX.test('1,-234')).toBeTruthy();
        expect(CompositionConstants.EFF_FRONT_COMMA_REGEX.test('-14.3443,-.234')).toBeTruthy();
        expect(CompositionConstants.EFF_FRONT_COMMA_REGEX.test('14.3443,-.234')).toBeTruthy();
        expect(CompositionConstants.EFF_FRONT_COMMA_REGEX.test('-14.3443,.234')).toBeTruthy();
        expect(CompositionConstants.EFF_FRONT_COMMA_REGEX.test('1,2,3')).toBeTruthy();
        expect(CompositionConstants.EFF_FRONT_COMMA_REGEX.test('1.234,245.3446,.565,1,345')).toBeTruthy();
        expect(CompositionConstants.EFF_FRONT_COMMA_REGEX.test('-1.234,245.3446,.565,1,345')).toBeTruthy();
        expect(CompositionConstants.EFF_FRONT_COMMA_REGEX.test('1.234,-.3446,.565,1,345,-.33')).toBeTruthy();
    });

    it('checks if any one bound is in efficient frontier format', () => {
        expect(CompositionUtils.checkIfConstraintInEfficientFormat({
            optionValues: {
                ConstraintUpperBound: 1,
                ConstraintLowerBound: 2
            }
        } as Constraint)).toBeFalsy();

        expect(CompositionUtils.checkIfConstraintInEfficientFormat({
            optionValues: {
                ConstraintUpperBound: '1:5',
                ConstraintLowerBound: 2
            }
        } as Constraint)).toBeTruthy();


        expect(CompositionUtils.checkIfConstraintInEfficientFormat({
            optionValues: {
                ConstraintUpperBound: [1, 2, 3],
                ConstraintLowerBound: 2
            }
        } as Constraint)).toBeTruthy();

        expect(CompositionUtils.checkIfConstraintInEfficientFormat({
            optionValues: {
                ConstraintValue: [1, 2, 3]
            }
        } as Constraint)).toBeTruthy();
    });

    it('find row based data on cusip', () => {
        const columns =['cusip','sec_desc','pct_mv_before','pct_mv_after','pct_mv_change','notional_mv_before','notional_mv_after','notional_mv_change','pct_notional_val_before','pct_notional_val_after','pct_notional_val_change','market_val_before','market_val_after','market_val_change','quantity_before','quantity_after','quantity_change','cur_face_before','cur_face_after','cur_face_change'];
        let compData: ResponseData = {'data':[null,null,0.9999999999999998,0.9999999999999998,0,269009813.4244452,269009813.4244452,0,0.9999999999999998,0.9999999999999998,0,269009813.4244452,269009813.4244452,0,292811714.51692986,292811714.51692986,0,264810119.02542865,264810119.02542865,0],'children':[{'title':'FFH-FIT','data':[null,null,0.689603413404046,0.689603413404046,0,185510085.57668307,185510085.57668307,0,0.689603413404046,0.689603413404046,0,185510085.57668307,185510085.57668307,0,185803632.1654584,185803632.1654584,0,183425484.7252984,183425484.7252984,0],'children':[{'title':'BND','data':[null,null,0.6358474935245491,0.6358474935245491,0,171049215.59944016,171049215.59944016,0,0.6358474935245491,0.6358474935245491,0,171049215.59944016,171049215.59944016,0,169363400,169363400,0,169363400,169363400,0],'children':[{'data':['91159HHM5','US BANCORP MTN',0.00005671289387472452,0.00005671289387472452,0,15256.325,15256.325,0,0.00005671289387472452,0.00005671289387472452,0,15256.325,15256.325,0,15000,15000,0,15000,15000,0],'rowId':198},{'data':['91159HHN3','US BANCORP MTN',0.0015441916328495413,0.0015441916328495413,0,415402.70304444444,415402.70304444444,0,0.0015441916328495413,0.0015441916328495413,0,415402.70304444444,415402.70304444444,0,430000,430000,0,430000,430000,0],'rowId':199},{'data':['91159HHR4','US BANCORP MTN',0.00072601902366976,0.00072601902366976,0,195306.24209999997,195306.24209999997,0,0.00072601902366976,0.00072601902366976,0,195306.24209999997,195306.24209999997,0,190000,190000,0,190000,190000,0],'rowId':200}],'rowId':3,'sectorOrder':0},{'title':'CASH','data':[null,null,0.026832597939724357,0.026832597939724357,0,7218232.165458401,7218232.165458401,0,0.026832597939724357,0.026832597939724357,0,7218232.165458401,7218232.165458401,0,7218232.1654584,7218232.1654584,0,7218232.1654584,7218232.1654584,0],'children':[{'data':['USD_CCASH','USD CASH(Committed)',0.02679784877819972,0.02679784877819972,0,7208884.300000002,7208884.300000002,0,0.02679784877819972,0.02679784877819972,0,7208884.300000002,7208884.300000002,0,7208884.300000001,7208884.300000001,0,7208884.300000001,7208884.300000001,0],'rowId':256},{'data':['USD_ICASH','CASH',0.000034749161524639044,0.000034749161524639044,0,9347.865458399057,9347.865458399057,0,0.000034749161524639044,0.000034749161524639044,0,9347.865458399057,9347.865458399057,0,9347.865458399057,9347.865458399057,0,9347.865458399057,9347.865458399057,0],'rowId':257}],'rowId':255,'sectorOrder':1}],'rowId':2,'sectorOrder':0},{'title':'GALIC-106','data':[null,null,0.3103965865959538,0.3103965865959538,0,83499727.84776214,83499727.84776214,0,0.3103965865959538,0.3103965865959538,0,83499727.84776214,83499727.84776214,0,107008082.35147147,107008082.35147147,0,81384634.30013025,81384634.30013025,0],'children':[{'title':'BND','data':[null,null,0.17997915716575574,0.17997915716575574,0,48416159.48944882,48416159.48944882,0,0.17997915716575574,0.17997915716575574,0,48416159.48944882,48416159.48944882,0,47581900,47581900,0,47581900,47581900,0],'children':[{'data':['904764AV9','UNILEVER CAPITAL CORP',0.00043114880354569435,0.00043114880354569435,0,115983.2592,115983.2592,0,0.00043114880354569435,0.00043114880354569435,0,115983.2592,115983.2592,0,115000,115000,0,115000,115000,0],'rowId':364},{'data':['91159HHN3','US BANCORP MTN',0.0007182286664416472,0.0007182286664416472,0,193210.55955555558,193210.55955555558,0,0.0007182286664416472,0.0007182286664416472,0,193210.55955555558,193210.55955555558,0,200000,200000,0,200000,200000,0],'rowId':365},{'data':['912810FT0','TREASURY BOND',0.0014479368760643126,0.0014479368760643126,0,389509.2288804347,389509.2288804347,0,0.0014479368760643126,0.0014479368760643126,0,389509.2288804347,389509.2288804347,0,295000,295000,0,295000,295000,0],'rowId':366}],'rowId':290,'sectorOrder':1},{'title':'CASH','data':[null,null,0.00038970634616243896,0.00038970634616243896,0,104834.83147147993,104834.83147147993,0,0.00038970634616243896,0.00038970634616243896,0,104834.83147147993,104834.83147147993,0,104834.83147147993,104834.83147147993,0,104834.83147147993,104834.83147147993,0],'children':[{'data':['USD_CCASH','USD CASH(Committed)',0.00037165770544679534,0.00037165770544679534,0,99979.5699999998,99979.5699999998,0,0.00037165770544679534,0.00037165770544679534,0,99979.5699999998,99979.5699999998,0,99979.5699999998,99979.5699999998,0,99979.5699999998,99979.5699999998,0],'rowId':406},{'data':['USD_ICASH','CASH',0.000018048640715643607,0.000018048640715643607,0,4855.261471480131,4855.261471480131,0,0.000018048640715643607,0.000018048640715643607,0,4855.261471480131,4855.261471480131,0,4855.261471480131,4855.261471480131,0,4855.261471480131,4855.261471480131,0],'rowId':407}],'rowId':405,'sectorOrder':2},],'rowId':270,'sectorOrder':1}],'rowId':1};

        // breakdown is portfolio name and addToPortfolio is GALIC-106 - picks weight for only GALIC-106
        let outRowData = [];
        CompositionUtils.findRowDataListBasedOnCusip(compData, '91159HHN3', 'GALIC-106', false, 0, outRowData);
        expect(outRowData.length).toBe(1);
        expect(outRowData[0].data[columns.indexOf('pct_notional_val_after')]).toBe(0.0007182286664416472);

        // breakdown is portfolio name and addToPortfolio is FFH-FIT - picks weight for only FFH-FIT
        outRowData = [];
        CompositionUtils.findRowDataListBasedOnCusip(compData, '91159HHN3', 'FFH-FIT', false, 0, outRowData);
        expect(outRowData.length).toBe(1);
        expect(outRowData[0].data[columns.indexOf('pct_notional_val_after')]).toBe(0.0015441916328495413);

        // breakdown is portfolio name and addToPortfolio is root level i.e. CORE-HQ - picks weight for all underlying leaf portfolio for CORE-HQ
        outRowData = [];
        CompositionUtils.findRowDataListBasedOnCusip(compData, '91159HHN3', 'CORE-HQ', true, 0, outRowData);
        expect(outRowData.length).toBe(2);
        expect(outRowData[1].data[columns.indexOf('pct_notional_val_after')]).toBe(0.0007182286664416472);
        expect(outRowData[0].data[columns.indexOf('pct_notional_val_after')]).toBe(0.0015441916328495413);

        compData = {'data':[null,null,0.9999999999999994,0.9999999999999994,0,439955198.1748969,439955198.1748969,0,0.3932897588800314,0.3932897588800314,0,1118654092.1577866,1118654092.1577866,0,248161838.38,248161838.38,0,223082098.65352523,223082098.65352523,0],'children':[{'title':'UK - Relative Value','data':[null,null,-0.0007462767099414842,-0.0007462767099414842,0,-383919604.1243007,-383919604.1243007,0,-0.34319778277818935,-0.34319778277818935,0,-834825.4954580916,-834825.4954580916,0,-422205022,-422205022,0,-425211991.4,-425211991.4,0],'children':[{'title':'UK - Basis','data':[null,null,-0.00007768155922353468,-0.00007768155922353468,0,-15430379.063088981,-15430379.063088981,0,-0.013793700100202661,-0.013793700100202661,0,-86898.79411060455,-86898.79411060455,0,-14700022,-14700022,0,-14700022,-14700022,0],'children':[{'data':['BRTN4WDX8','SCDS: (GE)',-0.00007768155922353468,-0.00007768155922353468,0,-11996483.173921028,-11996483.173921028,0,-0.010724032798003583,-0.010724032798003583,0,-86898.79411060455,-86898.79411060455,0,-14700000,-14700000,0,-14700000,-14700000,0],'rowId':141},{'data':['RXZ920190','EURO-BUND DEC 19',0,0,0,-3433895.889167953,-3433895.889167953,0,-0.0030696673021990786,-0.0030696673021990786,0,0,0,0,-22,-22,0,-22,-22,0],'rowId':142}],'rowId':140,'sectorOrder':0},{'title':'UK - Index RV','data':[null,null,-0.0006685951507179495,-0.0006685951507179495,0,-368489225.06121176,-368489225.06121176,0,-0.3294040826779867,-0.3294040826779867,0,-747926.701347487,-747926.701347487,0,-407505000,-407505000,0,-410511969.4,-410511969.4,0],'children':[{'data':['Z92DT7Y59','ICEE: (ITRAXX.EUR.30.V2)',-0.01118982342687212,-0.01118982342687212,0,-478527585.5164877,-478527585.5164877,0,-0.4277708264522141,-0.4277708264522141,0,-12517541.766993567,-12517541.766993567,0,-520210000,-520210000,0,-520210000,-520210000,0],'rowId':144},{'data':['Z92DT7Y75','ICEE: (ITRAXX.XO.30.V3)',0.010521228276154171,0.010521228276154171,0,110038360.45527594,110038360.45527594,0,0.09836674377422736,0.09836674377422736,0,11769615.06564608,11769615.06564608,0,112705000,112705000,0,109698030.6,109698030.6,0],'rowId':145}],'rowId':143,'sectorOrder':1}],'rowId':139,'sectorOrder':4},{'title':'Unassigned','data':[null,null,0.1590197046742059,0.1590197046742059,0,143727642.6124392,143727642.6124392,0,0.1284826503742556,0.1284826503742556,0,177888043.36752322,177888043.36752322,0,13588570.380000012,13588570.380000012,0,9301055.228340017,9301055.228340017,0],'children':[{'title':'None','data':[null,null,0.1590197046742059,0.1590197046742059,0,143727642.6124392,143727642.6124392,0,0.1284826503742556,0.1284826503742556,0,177888043.36752322,177888043.36752322,0,13588570.380000012,13588570.380000012,0,9301055.228340017,9301055.228340017,0],'children':[{'data':['RON_CCASH','RON CASH(Alpha Committed)',2.0572880256153136e-8,2.0572880256153136e-8,0,23.013936686017843,23.013936686017843,0,2.0572880256153136e-8,2.0572880256153136e-8,0,23.013936686017843,23.013936686017843,0,121.5,121.5,0,121.5,121.5,0],'rowId':204},{'data':['RXZ920190','EURO-BUND DEC 19',0,0,0,-88032603.70412388,-88032603.70412388,0,-0.07869510720183093,-0.07869510720183093,0,0,0,0,-564,-564,0,-564,-564,0],'rowId':205},{'data':['SEK_CCASH','SEK CASH(Alpha Committed)',5.689435565329672e-8,5.689435565329672e-8,0,63.645103772240894,63.645103772240894,0,5.689435565329672e-8,5.689435565329672e-8,0,63.645103772240894,63.645103772240894,0,758.54,758.54,0,758.54,758.54,0],'rowId':206}],'rowId':147,'sectorOrder':0}],'rowId':146,'sectorOrder':5}],'rowId':1};

        // breakdown is [strat_level_1 --> strat_leve_2] and addToPortfolio is ROOT level i.e. H2 - picks weight for all split up records for the given cusip under this breakdown setup
        outRowData = [];
        CompositionUtils.findRowDataListBasedOnCusip(compData, 'RXZ920190', 'H2', true, -1, outRowData);
        expect(outRowData.length).toBe(2);
        expect(outRowData[1].data[columns.indexOf('pct_notional_val_after')]).toBe(-0.07869510720183093);
        expect(outRowData[0].data[columns.indexOf('pct_notional_val_after')]).toBe(-0.0030696673021990786);

        compData = {'data':[null,null,0.9999999999999992,0.9999999999999992,0,439955198.1748966,439955198.1748966,0,0.3932897588800313,0.3932897588800313,0,1118654092.1577866,1118654092.1577866,0,248161838.37999997,248161838.37999997,0,223082098.65352497,223082098.65352497,0],'children':[{'data':['RON_CCASH','RON CASH(Alpha Committed)',2.0572880256153136e-8,2.0572880256153136e-8,0,23.013936686017843,23.013936686017843,0,2.0572880256153136e-8,2.0572880256153136e-8,0,23.013936686017843,23.013936686017843,0,121.5,121.5,0,121.5,121.5,0],'rowId':181},{'data':['RXZ920190','EURO-BUND DEC 19',0,0,0,-91466499.59329183,-91466499.59329183,0,-0.08176477450403001,-0.08176477450403001,0,0,0,0,-586,-586,0,-586,-586,0],'rowId':182},{'data':['SEK_CCASH','SEK CASH(Alpha Committed)',5.689435565329672e-8,5.689435565329672e-8,0,63.645103772240894,63.645103772240894,0,5.689435565329672e-8,5.689435565329672e-8,0,63.645103772240894,63.645103772240894,0,758.54,758.54,0,758.54,758.54,0],'rowId':183}],'rowId':1};

        // breakdown is "no breakdown" and addToPortfolio is ROOT level i.e. H2 - picks weight for all split up records for the given cusip under this breakdown setup
        outRowData = [];
        CompositionUtils.findRowDataListBasedOnCusip(compData, 'RXZ920190', 'H2', true, -1, outRowData);
        expect(outRowData.length).toBe(1);
        expect(outRowData[0].data[columns.indexOf('pct_notional_val_after')]).toBe(-0.08176477450403001);

        compData = {"data":[null,null,0.9999999999999998,0.9999999999999998,0,16022222928.585876,16022222928.585876,0,0.9541004717703898,0.9541004717703898,0,16793014365.516127,16793014365.516127,0,318150931310.51544,318150931310.51544,0,315108651031.28534,315108651031.28534,0],"children":[{"title":"Asia","data":[null,null,0.02840562551347359,0.02840562551347359,0,410082563.0557338,410082563.0557338,0,0.024419830420548183,0.024419830420548183,0,477016077.30923367,477016077.30923367,0,29726058143,29726058143,0,29726058143,29726058143,0],"children":[{"title":"BR-INC-EC","data":[null,null,0.02840562551347359,0.02840562551347359,0,410082563.0557338,410082563.0557338,0,0.024419830420548183,0.024419830420548183,0,477016077.30923367,477016077.30923367,0,29726058143,29726058143,0,29726058143,29726058143,0],"children":[{"data":["00652MAC6","ADANI PORT AND SPECIAL ECONOMIC ZO 144A",0.00011746962565350501,0.00011746962565350501,0,1972669.111111111,1972669.111111111,0,0.00011746962565350501,0.00011746962565350501,0,1972669.111111111,1972669.111111111,0,2000000,2000000,0,2000000,2000000,0],"rowId":4},{"data":["302154CQ0","EXPORT-IMPORT BANK OF KOREA",0.0002168593710496363,0.0002168593710496363,0,3641722.5333333337,3641722.5333333337,0,0.0002168593710496363,0.0002168593710496363,0,3641722.5333333337,3641722.5333333337,0,3700000,3700000,0,3700000,3700000,0],"rowId":5}],"rowId":3,"sectorOrder":0}],"rowId":2,"sectorOrder":0},{"title":"Unassigned","data":[null,null,0.8326356093651892,0.8326356093651892,0,13273765873.684895,13273765873.684895,0,0.7904337830462477,0.7904337830462477,0,13982461749.309895,13982461749.309895,0,-3804688626.0545416,-3804688626.0545416,0,-6844802921.6149435,-6844802921.6149435,0],"children":[{"title":"BR-INC-EEY","data":[null,null,0.02525299929650264,0.02525299929650264,0,424073979.95853776,424073979.95853776,0,0.02525299929650264,0.02525299929650264,0,424073979.95853776,424073979.95853776,0,61061645.61000001,61061645.61000001,0,61061645.61000001,61061645.61000001,0],"children":[{"data":["009158106","AIR PRODUCTS AND CHEMICALS INC",0.000010270484872219613,0.000010270484872219613,0,172472.4,172472.4,0,0.000010270484872219613,0.000010270484872219613,0,172472.4,172472.4,0,1035,1035,0,1035,1035,0],"rowId":2700},{"data":["02209S103","ALTRIA GROUP INC",0.000568358904021378,0.000568358904021378,0,9544459.24,9544459.24,0,0.000568358904021378,0.000568358904021378,0,9544459.24,9544459.24,0,160492,160492,0,160492,160492,0],"rowId":2701},{"data":["023135106","AMAZON COM INC",0.00037972720151389054,0.00037972720151389054,0,6376764.350000001,6376764.350000001,0,0.00037972720151389054,0.00037972720151389054,0,6376764.350000001,6376764.350000001,0,3209,3209,0,3209,3209,0],"rowId":2702}],"rowId":2695,"sectorOrder":6},{"title":"BR-INC-EHF","data":[null,null,0.00018662570725039556,0.00018662570725039556,0,3134008.1828305,3134008.1828305,0,0.00018662570725039556,0.00018662570725039556,0,3134008.1828305,3134008.1828305,0,3703819.54,3703819.54,0,3703819.54,3703819.54,0],"children":[{"data":["09248U718","BLACKROCK LIQ FUND T-FD-IN",0.0002034711765039917,0.0002034711765039917,0,3416894.3899999997,3416894.3899999997,0,0.0002034711765039917,0.0002034711765039917,0,3416894.3899999997,3416894.3899999997,0,3416894.39,3416894.39,0,3416894.39,3416894.39,0],"rowId":2908},{"data":["BRTKTYF45","EUR/USD",5.647919899048338e-7,5.647919899048338e-7,0,9484.560000000312,9484.560000000312,0,5.647919899048338e-7,5.647919899048338e-7,0,9484.560000000312,9484.560000000312,0,540000,540000,0,540000,540000,0],"rowId":2909}],"rowId":2907,"sectorOrder":7},{"title":"BR-INC-EQ","data":[null,null,0.03213359175899633,0.03213359175899633,0,539619868.0244559,539619868.0244559,0,0.03213359175899633,0.03213359175899633,0,539619868.0244559,539619868.0244559,0,20362651.060000002,20362651.060000002,0,20362651.060000002,20362651.060000002,0],"children":[{"data":["00287Y109","ABBVIE INC",0.0004081095180906412,0.0004081095180906412,0,6853389.000000001,6853389.000000001,0,0.0004081095180906412,0.0004081095180906412,0,6853389.000000001,6853389.000000001,0,73550,73550,0,73550,73550,0],"rowId":2934},{"data":["02209S103","ALTRIA GROUP INC",0.0010954079196033983,0.0010954079196033983,0,18395200.93,18395200.93,0,0.0010954079196033983,0.0010954079196033983,0,18395200.93,18395200.93,0,309319,309319,0,309319,309319,0],"rowId":2935},{"data":["09248U718","BLACKROCK LIQ FUND T-FD-IN",0.00011419184300453993,0.00011419184300453993,0,1917625.2600000012,1917625.2600000012,0,0.00011419184300453993,0.00011419184300453993,0,1917625.2600000012,1917625.2600000012,0,1917625.2600000012,1917625.2600000012,0,1917625.260000001,1917625.260000001,0],"rowId":2936}],"rowId":2933,"sectorOrder":10},{"title":"ISHIYLD","data":[null,null,0.01876547628918286,0.01876547628918286,0,315128912.9,315128912.9,0,0.01876547628918286,0.01876547628918286,0,315128912.9,315128912.9,0,5921802.99,5921802.99,0,5921802.99,5921802.99,0],"children":[{"data":["066922477","BLK CSH FND TREASURY SL AGENCY",0.000002600749278800345,0.000002600749278800345,0,43674.4199999999,43674.4199999999,0,0.000002600749278800345,0.000002600749278800345,0,43674.4199999999,43674.4199999999,0,43674.42,43674.42,0,43674.4199999999,43674.4199999999,0],"rowId":4900},{"data":["464286517","ISHARES JP MORGAN EM LOCAL CURRENC",0.00091221292297925,0.00091221292297925,0,15318804.72,15318804.72,0,0.00091221292297925,0.00091221292297925,0,15318804.72,15318804.72,0,368152,368152,0,368152,368152,0],"rowId":4901}],"rowId":4899,"sectorOrder":21}],"rowId":1969,"sectorOrder":13}],"rowId":1};

        // breakdown is [strat_level_1 --> portfolio name] and addToPortfolio is MULTI-BII - picks weight for all split up records for the given cusip under this breakdown setup
        outRowData = [];
        CompositionUtils.findRowDataListBasedOnCusip(compData, '02209S103', 'MULTI-BII', true, 1, outRowData);
        expect(outRowData.length).toBe(2);
        expect(outRowData[1].data[columns.indexOf('pct_notional_val_after')]).toBe(0.0010954079196033983);
        expect(outRowData[0].data[columns.indexOf('pct_notional_val_after')]).toBe(0.000568358904021378);

        // breakdown is [strat_level_1 --> portfolio name] and addToPortfolio is BR-INC-EQ - picks weight only for split up records for BR-INC-EQ
        outRowData = [];
        CompositionUtils.findRowDataListBasedOnCusip(compData, '02209S103', 'BR-INC-EQ', false, 1, outRowData);
        expect(outRowData.length).toBe(1);
        expect(outRowData[0].data[columns.indexOf('pct_notional_val_after')]).toBe(0.0010954079196033983);

        // breakdown is [strat_level_1 --> portfolio name] and addToPortfolio is BR-INC-QWERTY - picks weight only for split up records for BR-INC-EQ
        outRowData = [];
        CompositionUtils.findRowDataListBasedOnCusip(compData, '02209S103', 'BR-INC-QWERTY', false, 1, outRowData);
        expect(outRowData.length).toBe(0);
    });



    /**
     * Sets "modelling allowed" flags on the portfolios, gets modelling category and validates the result
     */
    function validateModellingAllowedFlags(isSecurityModellingAllowed: boolean, isSectorModellingAllowed: boolean, isPortfolioModellingAllowed: boolean, expectedModellingCategory: any) {
        const portfolio: Portfolio = new WhatIfPortfolio();

        // Port has security and sector modelling enabled, port modelling disabled
        portfolio.isSecurityModellingAllowed = isSecurityModellingAllowed;
        portfolio.isSectorModellingAllowed = isSectorModellingAllowed;
        portfolio.isPortfolioModellingAllowed = isPortfolioModellingAllowed;

        // Expect two categories with one option in each
        expect(expectedModellingCategory).toEqual(CompositionUtils.getModellingCategories(portfolio));
    }
});
