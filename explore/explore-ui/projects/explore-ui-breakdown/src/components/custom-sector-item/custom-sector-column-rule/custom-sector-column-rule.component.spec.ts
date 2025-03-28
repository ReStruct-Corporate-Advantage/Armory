import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CustomSectorColumnRuleComponent} from './custom-sector-column-rule.component';
import {Component, CUSTOM_ELEMENTS_SCHEMA, SimpleChange} from '@angular/core';
import {of} from 'rxjs';
import {SectorRuleBuilderConfig} from '../../../models/sector/sector-rule-builder-config.model';
import {ColumnSectorRule} from '../../../models/sector/column-sector/column-sector-rule.model';
import {BreakdownTreeNode} from '../../../models/breakdown/breakdown-tree-node.model';
import {GroupRule} from '../../../models/sector/group-rule.model';
import {CustomSectorType} from '../../../enums/custom-sector-type.enum';
import {SECTOR_RULE_BUILDER_DIALOG_TOKEN} from '../../../token';
import {SectorRuleBuilderModalDirective} from '../../sector-rule-builder-modal/sector-rule-builder-modal.directive';
import {BaseSectorRuleBuilderModalComponent} from '../../sector-rule-builder-modal/base-sector-rule-builder-modal.component';

describe('CustomSectorColumnRuleComponent', () => {
    let component: CustomSectorColumnRuleComponent;
    let fixture: ComponentFixture<CustomSectorColumnRuleComponent>;
    let sectorBuilderDialog: SectorRuleBuilderModalDialogStubComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [CustomSectorColumnRuleComponent, SectorRuleBuilderModalDialogStubComponent, SectorRuleBuilderModalDirective],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: SECTOR_RULE_BUILDER_DIALOG_TOKEN, useValue: {component: SectorRuleBuilderModalDialogStubComponent}}
            ]
        });

        fixture = TestBed.createComponent(CustomSectorColumnRuleComponent);
        component = fixture.componentInstance;
        sectorBuilderDialog = TestBed.createComponent(SectorRuleBuilderModalDialogStubComponent).componentInstance;
        component.sectorRuleBuilderConfig = new SectorRuleBuilderConfig([], new BreakdownTreeNode());
        component.sectorRuleBuilderConfig.updateLookThroughView = jest.fn();
        component.rule = new ColumnSectorRule();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Test Edit Rule', () => {
        component.sectorRuleBuilderModalDialogComponent = sectorBuilderDialog;
        sectorBuilderDialog.openDialog.mockReturnValue(of(undefined));
        jest.spyOn(component, 'updateRuleText');
        component.sectorRuleBuilderConfig.islookThroughRule = true;
        component.editRule();
        expect(component.updateRuleText).toHaveBeenCalledTimes(0);
        expect(component.sectorRuleBuilderConfig.updateLookThroughView).toHaveBeenCalledTimes(0);
        sectorBuilderDialog.openDialog.mockReturnValue(of(new ColumnSectorRule()));
        component.editRule();
        expect(component.updateRuleText).toHaveBeenCalled();
        expect(component.sectorRuleBuilderConfig.updateLookThroughView).toHaveBeenCalled();
        // If rule is updated to nested fund sector rule
        const nestedFundSectorRule = new GroupRule();
        const portfolioRule = new ColumnSectorRule();
        portfolioRule.customSectorType = CustomSectorType.INDEX;
        portfolioRule.columnName = 'portfolio';
        const cusipRule = new ColumnSectorRule();
        cusipRule.customSectorType = CustomSectorType.INDEX;
        cusipRule.columnName = 'cusip';
        nestedFundSectorRule.subRules = [portfolioRule, cusipRule];
        jest.spyOn(component.replaceRule, 'emit');
        sectorBuilderDialog.openDialog.mockReturnValue(of(nestedFundSectorRule));
        component.editRule();
        expect(component.replaceRule.emit).toHaveBeenCalled();
    });

    it('Test Rule Text Value', () => {
        component.ngOnChanges({
            ruleCaption: new SimpleChange(null, component.ruleCaption, true)
        });
        expect(component.ruleText).toEqual('Double click to define custom sector');
        component.ruleCaption = 'Test Rule Caption';
        component.ngOnChanges({
            ruleCaption: new SimpleChange(null, component.ruleCaption, true)
        });
        expect(component.ruleText).toEqual('Test Rule Caption');

        const columnRule: ColumnSectorRule = new ColumnSectorRule();
        columnRule.columnName = 'Security Group';
        columnRule.columnTag = 'sec_group';
        columnRule.positionColumnType = 'ALL';
        columnRule.dataType = 'String';
        columnRule.comparisonType = 'EQUALS';
        columnRule.comparisonValues = ['EQUITY', 'BND'];
        columnRule.comparisonLabels = ['EQUITY', 'BOND'];
        component.rule = columnRule;
        component.ngOnChanges({
            rule: new SimpleChange(null, component.rule, true)
        });
        expect(component.ruleText).toEqual('Security Group EQUALS EQUITY,BOND');
    });
});


@Component({
    selector: 'explore-sector-rule-builder-modal',
    template: `
        <p>Dialog</p>>
    `
})
class SectorRuleBuilderModalDialogStubComponent extends BaseSectorRuleBuilderModalComponent {

    sectorRuleBuilderConfig: SectorRuleBuilderConfig;

    openDialog = jest.fn();
}
