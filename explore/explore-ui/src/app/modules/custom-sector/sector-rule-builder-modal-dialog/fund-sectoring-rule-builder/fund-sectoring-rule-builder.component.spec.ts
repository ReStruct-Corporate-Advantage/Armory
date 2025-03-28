import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ColumnConstants} from '@blk/explore-ui-core';
import {FundSectoringRuleBuilderComponent} from './fund-sectoring-rule-builder.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {Breakdown, BreakdownTreeNode, ColumnSector, ColumnSectorRule, CustomSector, CustomSectorType, FundSectoringRecordKey, GroupRule, LinkedFavoriteSector, SectorConstants, SectorRuleBuilderConfig, SectorUtils} from '@blk/explore-ui-breakdown';
import FundSectoringConfig from '../../../../../assets/fund-sectoring-config/fund-sectoring-config.json';
import {TestUtils} from '@utils/test.utils';

describe('FundSectoringRuleBuilderComponent', () => {
    let component: FundSectoringRuleBuilderComponent;
    let fixture: ComponentFixture<FundSectoringRuleBuilderComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [FundSectoringRuleBuilderComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(FundSectoringRuleBuilderComponent);
        component = fixture.componentInstance;
    });

    it('Test shouldDisplayWarningDialogForTabSwitch', () => {
        component.selectedRecords = [];
        component.assignedRecordsMapping = new Map<FundSectoringRecordKey, CustomSector[]>();
        expect(component.shouldDisplayWarningDialogForTabSwitch()).toBeFalsy();
        component.selectedRecords.push({nodeName: 'Core-HQ', cusip: 'BRS123'});
        expect(component.shouldDisplayWarningDialogForTabSwitch()).toBeTruthy();
        component.assignedRecordsMapping.set({nodeName: 'Test'}, [new CustomSector()]);
        expect(component.shouldDisplayWarningDialogForTabSwitch()).toBeTruthy();
        component.selectedRecords = [];
        expect(component.shouldDisplayWarningDialogForTabSwitch()).toBeTruthy();
    });

    it('Test validateRule', () => {
        component.selectedRecords = [];
        expect(component.validateRule()).toBeFalsy();
        component.selectedRecords.push({nodeName: 'Core-HQ', cusip: 'BRS123'});
        expect(component.validateRule()).toBeTruthy();
    });

    it('Test updateRule', () => {
        component.selectedRecords = [];
        expect(component.updateRule()).toBeFalsy();
        // Rule is of fund custom sector type i.e. ColumnSectorRule
        component.rule = new ColumnSectorRule();
        component.selectedRecords = [{nodeName: 'PEP'}];
        component.updateRule();
        expect(component.rule.comparisonValues).toEqual(['PEP']);
        expect(component.rule.columnTag).toEqual(FundSectoringConfig.cusipColumn.columnTag);
        expect(component.rule.columnName).toEqual(FundSectoringConfig.cusipColumn.title);
        expect(component.rule.positionColumnType).toEqual(FundSectoringConfig.cusipColumn.uses);
        expect(component.rule.dataType).toEqual(ColumnConstants.COLUMN_DATA_TYPE.STRING);
        expect(component.rule.comparisonType).toEqual(SectorConstants.CUSTOM_RULE_BUILDER_OPERATORS.EQUALS.displayValue);
        // Rule is nested fund sector rule i.e. GroupRule
        component.rule = TestUtils.createNestedFundSectorRule([], [], CustomSectorType.PORTFOLIO);
        component.portfolioRule = component.rule.subRules[0] as ColumnSectorRule;
        component.cusipRule = component.rule.subRules[1] as ColumnSectorRule;
        component.selectedRecords = [{nodeName: 'PEP', cusip: 'BRS123'}];
        component.updateRule();
        expect(component.portfolioRule.comparisonValues).toEqual(['PEP']);
        expect(component.portfolioRule.columnTag).toEqual(FundSectoringConfig.portfolioColumn.columnTag);
        expect(component.portfolioRule.columnName).toEqual(FundSectoringConfig.portfolioColumn.title);
        expect(component.portfolioRule.positionColumnType).toEqual(FundSectoringConfig.portfolioColumn.uses);
        expect(component.portfolioRule.dataType).toEqual(ColumnConstants.COLUMN_DATA_TYPE.STRING);
        expect(component.portfolioRule.comparisonType).toEqual(SectorConstants.CUSTOM_RULE_BUILDER_OPERATORS.EQUALS.displayValue);
        expect(component.cusipRule.comparisonValues).toEqual(['BRS123']);
        expect(component.cusipRule.columnTag).toEqual(FundSectoringConfig.cusipColumn.columnTag);
        expect(component.cusipRule.columnName).toEqual(FundSectoringConfig.cusipColumn.title);
        expect(component.cusipRule.positionColumnType).toEqual(FundSectoringConfig.cusipColumn.uses);
        expect(component.cusipRule.dataType).toEqual(ColumnConstants.COLUMN_DATA_TYPE.STRING);
        expect(component.cusipRule.comparisonType).toEqual(SectorConstants.CUSTOM_RULE_BUILDER_OPERATORS.EQUALS.displayValue);
    });

    it('Test initialize', () => {
        const customSector = new CustomSector();
        customSector.title = 'Custom Sector';
        component.rule = TestUtils.createNestedFundSectorRule(['TST1', 'TST2'], ['BRS098', 'BRS096'], CustomSectorType.PORTFOLIO);
        customSector.rule = component.rule;
        component.customSectorType = CustomSectorType.PORTFOLIO;
        const sectorNode = createCustomSectorBreakdownTreeNode(customSector);
        component.sectorRuleBuilderConfig = new SectorRuleBuilderConfig([], sectorNode, false, true, '', createBreakdownTree(sectorNode));
        component.ngOnInit();
        expect(component.assignedRecordsMapping.get(SectorUtils.getRecordKeyFromMap(component.assignedRecordsMapping, 'CORE-HQ'))[0].getTitle()).toEqual('Custom Sector 1');
        expect(component.assignedRecordsMapping.get(SectorUtils.getRecordKeyFromMap(component.assignedRecordsMapping, 'GALP'))[0].getTitle()).toEqual('Custom Sector 1');
        expect(component.assignedRecordsMapping.get(SectorUtils.getRecordKeyFromMap(component.assignedRecordsMapping, 'IP'))[0].getTitle()).toEqual('Custom Sector 1');
        expect(component.assignedRecordsMapping.get(SectorUtils.getRecordKeyFromMap(component.assignedRecordsMapping, 'HP'))[0].getTitle()).toEqual('Custom Sector 1');
        expect(component.assignedRecordsMapping.get(SectorUtils.getRecordKeyFromMap(component.assignedRecordsMapping, 'PEP'))[0].getTitle()).toEqual('Custom Sector 2');
        expect(component.assignedRecordsMapping.get(SectorUtils.getRecordKeyFromMap(component.assignedRecordsMapping, 'BELSH'))[0].getTitle()).toEqual('Custom Sector 2');
        expect(component.assignedRecordsMapping.get(SectorUtils.getRecordKeyFromMap(component.assignedRecordsMapping, 'TST1'))[0].getTitle()).toEqual('Custom Sector');
        expect(component.assignedRecordsMapping.get(SectorUtils.getRecordKeyFromMap(component.assignedRecordsMapping, 'TST2'))[0].getTitle()).toEqual('Custom Sector');
    });
});

function createBreakdownTree(currentNode: BreakdownTreeNode): BreakdownTreeNode {
    const breakdownTreeNodeTotal = new BreakdownTreeNode();
    breakdownTreeNodeTotal.label = 'Total';
    breakdownTreeNodeTotal.sectorModel = new Breakdown();
    const breakdownTreeNodeSecType = new BreakdownTreeNode();
    breakdownTreeNodeSecType.label = 'Security Type';
    const secTypeColumnSector = new ColumnSector();
    secTypeColumnSector.columnName = 'Security Type';
    breakdownTreeNodeSecType.sectorModel = secTypeColumnSector;
    const customSector1 = new CustomSector();
    customSector1.title = 'Custom Sector 1';
    const groupRule = new GroupRule();
    groupRule.addSubRule(TestUtils.createNestedFundSectorRule(['CORE-HQ', 'GALP'], ['BRS123', 'BRS321'], CustomSectorType.PORTFOLIO));
    groupRule.addSubRule(TestUtils.createNestedFundSectorRule(['IP', 'HP'], ['BRS876', 'BRS987'], CustomSectorType.PORTFOLIO));
    customSector1.rule = groupRule;
    const customSectorNode1 = createCustomSectorBreakdownTreeNode(customSector1);
    const customSector2 = new CustomSector();
    customSector2.title = 'Custom Sector 2';
    customSector2.rule = TestUtils.createNestedFundSectorRule(['PEP', 'BELSH'], ['BRS234', 'BRS235'], CustomSectorType.PORTFOLIO);
    const customSectorNode2 = createCustomSectorBreakdownTreeNode(customSector2);
    breakdownTreeNodeTotal.children = [breakdownTreeNodeSecType, customSectorNode1, customSectorNode2, currentNode];
    return breakdownTreeNodeTotal;
}

function createCustomSectorBreakdownTreeNode(customSector: CustomSector): BreakdownTreeNode {
    const treeNode = new BreakdownTreeNode();
    treeNode.sectorModel = new LinkedFavoriteSector();
    (treeNode.sectorModel as LinkedFavoriteSector).sector = customSector;
    return treeNode;
}
