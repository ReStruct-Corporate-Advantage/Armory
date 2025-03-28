import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NestedFundSectorRuleComponent} from './nested-fund-sector-rule.component';
import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange} from '@angular/core';
import {cloneDeep} from 'lodash';
import {ColumnSectorRule} from '../../../models/sector/column-sector/column-sector-rule.model';
import {GroupRule} from '../../../models/sector/group-rule.model';
import {CustomSectorType} from '../../../enums/custom-sector-type.enum';
import {SECTOR_RULE_BUILDER_DIALOG_TOKEN} from '../../../token';
import {SectorRuleBuilderModalDirective} from '../../sector-rule-builder-modal/sector-rule-builder-modal.directive';
import {BaseSectorRuleBuilderModalComponent} from '../../sector-rule-builder-modal/base-sector-rule-builder-modal.component';
import {SectorConstants} from '../../../constants/sector.constants';

describe('NestedFundSectorRuleComponent', () => {
    let component: NestedFundSectorRuleComponent;
    let fixture: ComponentFixture<NestedFundSectorRuleComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [NestedFundSectorRuleComponent, SectorRuleBuilderModalDirective],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: SECTOR_RULE_BUILDER_DIALOG_TOKEN, useValue: {component: BaseSectorRuleBuilderModalComponent}}
            ]
        });

        fixture = TestBed.createComponent(NestedFundSectorRuleComponent);
        component = fixture.componentInstance;
    });

    it('Test OnChanges', () => {
        component.rule = new GroupRule();
        const portfolioRule = new ColumnSectorRule();
        portfolioRule.customSectorType = CustomSectorType.PORTFOLIO;
        portfolioRule.columnName = 'Portfolio Name';
        portfolioRule.columnTag = 'portfolio_name';
        portfolioRule.comparisonValues = ['Core-HQ', 'PEP'];
        const cusipRule = new ColumnSectorRule();
        cusipRule.customSectorType = CustomSectorType.PORTFOLIO;
        cusipRule.columnName = 'Cusip';
        cusipRule.columnTag = 'cusip';
        cusipRule.comparisonValues = ['BRS123', 'BRS1234'];
        component.rule.subRules = [portfolioRule, cusipRule];
        component.ngOnChanges({rule: new SimpleChange(null, component.rule, true)});
        expect(component.portfolioRule).toBe(portfolioRule);
        expect(component.cusipRule).toBe(cusipRule);
        expect(component.ruleText).toEqual(SectorConstants.CUSTOM_SECTOR_RULE_TEXT.PORTFOLIO_ASSIGNMENT_EQUALS + portfolioRule.comparisonValues.toString());
    });

    it('Test updateRule', () => {
        component.rule = new GroupRule();
        const portfolioRule = new ColumnSectorRule();
        portfolioRule.customSectorType = CustomSectorType.PORTFOLIO;
        portfolioRule.columnName = 'Portfolio Name';
        portfolioRule.columnTag = 'portfolio_name';
        portfolioRule.comparisonValues = ['Core-HQ', 'PEP'];
        const cusipRule = new ColumnSectorRule();
        cusipRule.customSectorType = CustomSectorType.PORTFOLIO;
        cusipRule.columnName = 'Cusip';
        cusipRule.columnTag = 'cusip';
        cusipRule.comparisonValues = ['BRS123', 'BRS1234'];
        component.rule.subRules = [portfolioRule, cusipRule];
        component.ngOnChanges({rule: new SimpleChange(null, component.rule, true)});
        const newRule = cloneDeep(component.rule);
        (newRule.subRules[0] as ColumnSectorRule).comparisonValues = ['BELSH'];
        (newRule.subRules[1] as ColumnSectorRule).comparisonValues = ['BRS231'];
        component.updateRule(newRule);
        expect(component.portfolioRule).toBe(portfolioRule);
        expect(component.cusipRule).toBe(cusipRule);
        expect(portfolioRule.comparisonValues).toEqual(['BELSH']);
        expect(cusipRule.comparisonValues).toEqual(['BRS231']);
    });
});
