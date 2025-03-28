import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {CustomSectorItemComponent} from './custom-sector-item.component';
import {Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, SimpleChange} from '@angular/core';
import {CustomSectorEventsService} from '../../services/custom-sector-events/custom-sector-events.service';
import {cloneDeep} from 'lodash';
import {BehaviorSubject, of} from 'rxjs';
import {CustomSectorColumnRuleComponent} from './custom-sector-column-rule/custom-sector-column-rule.component';
import {AuxAdvancedTreeListInterface} from '@blk/aladdin-angular-components';
import {BaseSectorRuleBuilderModalComponent} from '../sector-rule-builder-modal/base-sector-rule-builder-modal.component';
import {SectorRuleBuilderConfig} from '../../models/sector/sector-rule-builder-config.model';
import {BreakdownTreeNode} from '../../models/breakdown/breakdown-tree-node.model';
import {BreakdownSectorSelectorOption} from '../../models/breakdown/breakdown-sector-selector-option.model';
import {CustomSector} from '../../models/sector/custom-sector/custom-sector.model';
import {CustomSectorRule} from '../../models/sector/custom-sector/custom-sector-rule.model';
import {ColumnSectorRule} from '../../models/sector/column-sector/column-sector-rule.model';
import {GroupRule} from '../../models/sector/group-rule.model';
import {LinkedFavoriteSector} from '../../models/sector/linked-favorite-sector.model';
import {SectorRuleBuilderModalDirective} from '../sector-rule-builder-modal/sector-rule-builder-modal.directive';
import {SECTOR_RULE_BUILDER_DIALOG_TOKEN} from '../../token';
import {CustomSectorType} from '../../enums/custom-sector-type.enum';
import {FAVORITE_SERVICE_TOKEN} from '@blk/explore-ui-core';
import {EditableCustomSectorColumnRuleComponent} from './editable-custom-sector-column-rule/editable-custom-sector-column-rule.component';

describe('CustomSectorItemComponent', () => {
    let component: CustomSectorItemComponent;
    let fixture: ComponentFixture<CustomSectorItemComponent>;
    let sectorBuilderDialog: SectorRuleBuilderModalDialogStubComponent;
    let customSectorColumnRuleComponent: CustomSectorColumnRuleStubComponent;
    let editableCustomSectorColumnRule: EditableCustomSectorColumnRuleComponent;
    const removeRule = new EventEmitter();
    const favoriteServiceStub = {
        getFavorite$: jest.fn()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [CustomSectorItemComponent, SectorRuleBuilderModalDialogStubComponent, CustomSectorColumnRuleStubComponent, SectorRuleBuilderModalDirective, EditableCustomSectorColumnRuleComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: CustomSectorEventsService, useValue: new CustomSectorEventsService()},
                {provide: FAVORITE_SERVICE_TOKEN, useValue: favoriteServiceStub},
                {provide: SECTOR_RULE_BUILDER_DIALOG_TOKEN, useValue: {component: SectorRuleBuilderModalDialogStubComponent}}
            ]
        });

        fixture = TestBed.createComponent(CustomSectorItemComponent);
        component = fixture.componentInstance;
        sectorBuilderDialog = TestBed.createComponent(SectorRuleBuilderModalDialogStubComponent).componentInstance;
        customSectorColumnRuleComponent = TestBed.createComponent(CustomSectorColumnRuleStubComponent).componentInstance;
        editableCustomSectorColumnRule = TestBed.createComponent(EditableCustomSectorColumnRuleComponent).componentInstance;
        component.removeRule = removeRule;
        component.sectorRuleBuilderModalDialogComponent = sectorBuilderDialog;
        component.customSectorColumnRuleComponent = customSectorColumnRuleComponent;
        component.draggedSector$ = new BehaviorSubject<AuxAdvancedTreeListInterface>(null);
        component.sectorRuleBuilderConfig = new SectorRuleBuilderConfig([], new BreakdownTreeNode());
        component.sectorRuleBuilderConfig.updateLookThroughView = jest.fn();
        component.editableCustomSectorColumnRule = editableCustomSectorColumnRule;
        component.editableCustomSectorColumnRule.closeEditing = jest.fn();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('On Sector Selection', () => {
        jest.spyOn(component['customSectorEventsService'], 'setActiveCustomSector');
        const event = new MouseEvent('click');
        jest.spyOn(event, 'stopPropagation');
        component.onSectorSelection(event);
        expect(event.stopPropagation).toHaveBeenCalled();
        expect(component['customSectorEventsService'].setActiveCustomSector).toHaveBeenCalledWith(component);
        event.stopPropagation = undefined;
        component.onSectorSelection(event);
        expect(event.cancelBubble).toBeTruthy();
    });

    describe('Test onDragOver', () => {
        const preventDefaultMock = jest.fn();
        const stopPropagationMock = jest.fn();
        const event: any = {preventDefault: preventDefaultMock, stopPropagation: stopPropagationMock, cancelBubble: false};
        it('Column sector drop not allowed', () => {
            jest.resetAllMocks();
            component.draggedSector$.next(new BreakdownSectorSelectorOption('Test Label'));
            component.onDragOver(event as DragEvent);
            expect(preventDefaultMock).toHaveBeenCalledTimes(0);
            expect(stopPropagationMock).toHaveBeenCalledTimes(0);
            expect(event.cancelBubble).toBeFalsy();
        });
        it('Allow custom sector drop', () => {
            jest.resetAllMocks();
            component.draggedSector$.next(({eventData: {favoriteId: 324}} as any) as AuxAdvancedTreeListInterface);
            component.onDragOver(event as DragEvent);
            expect(preventDefaultMock).toHaveBeenCalled();
            expect(stopPropagationMock).toHaveBeenCalled();
            expect(event.cancelBubble).toBeTruthy();
        });
    });

    describe('Test onDrop', () => {
        const preventDefaultMock = jest.fn();
        const stopPropagationMock = jest.fn();
        const event = {preventDefault: preventDefaultMock, stopPropagation: stopPropagationMock, cancelBubble: false};
        const expectedCustomSectorRule: CustomSectorRule = new CustomSectorRule();
        expectedCustomSectorRule.customSector = new CustomSector();
        expectedCustomSectorRule.customSector.id = 324;
        expectedCustomSectorRule.customSector.title = 'Test Custom Sector';
        expectedCustomSectorRule.customSector.owner = 'simsingh';
        const customSectorFavorite = new CustomSector();
        customSectorFavorite.title = 'Test Custom Sector';
        customSectorFavorite.id = 324;
        customSectorFavorite.owner = 'simsingh';
        beforeEach(() => {
            jest.resetAllMocks();
            component.parent = new CustomSector();
            component.draggedSector$.next({eventData: {favoriteId: 324}, label: 'Test Custom Sector'});
            favoriteServiceStub.getFavorite$.mockReturnValue(
                of(customSectorFavorite)
            );
            jest.spyOn(component, 'addRule').mockReturnValue(null);
        });
        it('Has column rule and rule is empty', <any>fakeAsync(() => {
            component.rule = new ColumnSectorRule();
            component.isColumnRule = true;
            component.onDrop((event as any) as DragEvent);
            tick();
            expect((component.parent as CustomSector).rule).toEqual(expectedCustomSectorRule);
            expect(component.addRule).not.toHaveBeenCalled();
            expect(preventDefaultMock).toHaveBeenCalled();
            expect(stopPropagationMock).toHaveBeenCalled();
            expect(event.cancelBubble).toBeTruthy();
        }));
        it('Is not column rule', <any>fakeAsync(() => {
            component.isColumnRule = false;
            component.onDrop((event as any) as DragEvent);
            tick();
            expect(component.addRule).toHaveBeenCalledWith(expectedCustomSectorRule);
            expect(preventDefaultMock).toHaveBeenCalled();
            expect(stopPropagationMock).toHaveBeenCalled();
            expect(event.cancelBubble).toBeTruthy();
        }));
    });

    it('on Add Rule', () => {
        component.customSectorColumnRuleComponent = customSectorColumnRuleComponent;
        component.sectorRuleBuilderModalDialogComponent = sectorBuilderDialog;
        component.isColumnRule = true;
        component.rule = new ColumnSectorRule();
        jest.spyOn(customSectorColumnRuleComponent, 'editRule');
        component.onAddRule();
        expect(customSectorColumnRuleComponent.editRule).toHaveBeenCalled();
        component.rule.columnName = 'Test';
        sectorBuilderDialog.openDialog.mockReturnValue(of(component.rule));
        jest.spyOn(component, 'addRule');
        component.sectorRuleBuilderConfig.islookThroughRule = false;
        component.onAddRule();
        expect(sectorBuilderDialog.openDialog).toHaveBeenCalledTimes(1);
        expect(component.addRule).toHaveBeenCalled();
        component.isColumnRule = false;
        component.rule = new GroupRule();
        sectorBuilderDialog.openDialog.mockReturnValue(of(undefined));
        component.onAddRule();
        expect(sectorBuilderDialog.openDialog).toHaveBeenCalledTimes(2);
        expect(component.addRule).toHaveBeenCalledTimes(1);
    });

    it('on Add Rule LT', () => {
        component.customSectorColumnRuleComponent = customSectorColumnRuleComponent;
        component.sectorRuleBuilderModalDialogComponent = sectorBuilderDialog;
        component.sectorRuleBuilderConfig.islookThroughRule = true;
        component.editableCustomSectorColumnRule = editableCustomSectorColumnRule;
        component.rule = new ColumnSectorRule();
        component.rule.columnName = 'Test';
        jest.spyOn(component, 'addRule');
        component.onAddRule();
        expect(sectorBuilderDialog.openDialog).toHaveBeenCalledTimes(0);
        expect(component.addRule).toHaveBeenCalled();
        expect(component.editableCustomSectorColumnRule.closeEditing).toHaveBeenCalled();
    });

    /**
     * Tests addRule - Rule is appended on the sector provided - with the given condition i.e 'OR' , 'AND'
     */
    it('Test addRule - Custom Sector - Fund Sectoring', function () {
        const rule = new ColumnSectorRule();
        rule.columnTag = 'cusip';
        rule.columnName = 'cusip';
        rule.comparisonValues = ['abc'];
        rule.comparisonType = 'Equals';
        rule.customSectorType = 'Attributes';

        component.rule = rule;

        const ruleToAdd = new ColumnSectorRule();
        ruleToAdd.columnTag = 'Portfolio Name';
        ruleToAdd.columnName = 'portfolio_name';
        ruleToAdd.comparisonValues = ['xyz'];
        ruleToAdd.comparisonType = 'Equals';
        ruleToAdd.customSectorType = CustomSectorType.PORTFOLIO;

        const sector = new BreakdownTreeNode();
        sector.label = 'B';
        const customSector = new CustomSector();
        customSector.rule = rule;
        const sectorModel = new LinkedFavoriteSector();
        sectorModel.sector = customSector;
        sector.sectorModel = sectorModel;
        component.addRule(ruleToAdd, sector, 'OR');
        const groupRule = ((sector.sectorModel as LinkedFavoriteSector).sector as CustomSector).rule;
        expect(groupRule instanceof GroupRule).toBeTruthy();
        expect(((groupRule as GroupRule).subRules[0] as ColumnSectorRule).comparisonValues).toEqual(['abc']);
        expect(((groupRule as GroupRule).subRules[1] as ColumnSectorRule).comparisonValues).toEqual(['xyz']);
    });

    it('Test addRule - Attribute Rule - Current Rule = Group Rule ', () => {
        const groupRuleCurrent = new GroupRule();
        groupRuleCurrent.addSubRule(new ColumnSectorRule({colTag: 'sec_type'}));
        const groupRuleParent = new GroupRule();
        groupRuleParent.addSubRule(groupRuleCurrent);
        component.rule = groupRuleCurrent;
        component.parent = groupRuleParent;
        component.addRule(new ColumnSectorRule({colTag: 'currency'}));
        expect(component.rule.subRules.length === 2).toBeTruthy();
        expect((component.rule.subRules[1] as ColumnSectorRule).columnTag).toEqual('currency');
    });

    it('Test addRule - Attribute Rule - Current Rule = Column Rule ', () => {
        const colRuleCurrent = new ColumnSectorRule({colTag: 'sec_type'});
        const groupRuleParent = new GroupRule();
        groupRuleParent.addSubRule(colRuleCurrent);
        component.rule = colRuleCurrent;
        component.parent = groupRuleParent;
        component.addRule(new ColumnSectorRule({colTag: 'currency'}));
        expect((component.parent as GroupRule).subRules[0]).toBeInstanceOf(GroupRule);
        expect(((component.parent as GroupRule).subRules[0] as GroupRule).subRules.length === 2).toBeTruthy();
    });

    it('Test addRule - lookthrough security rule', () => {
        const groupRuleCurrent = new GroupRule();
        groupRuleCurrent.groupType = 'AND';
        groupRuleCurrent.addSubRule(new ColumnSectorRule({colTag: 'portfolio_name', comparisonType: 'Equals', comparisonValues: ['ABC']}));
        groupRuleCurrent.addSubRule(new ColumnSectorRule({colTag: 'portfolio_name', comparisonType: 'Equals', comparisonValues: ['XYZ']}));

        const newGroupRule = new GroupRule();
        newGroupRule.groupType = 'OR';
        newGroupRule.addSubRule(new ColumnSectorRule({colTag: 'portfolio_name', comparisonType: 'Equals', comparisonValues: ['SNP500']}));
        component.rule = groupRuleCurrent;
        component.sectorRuleBuilderConfig.islookThroughRule = true;
        component.addRule(newGroupRule);
        expect(groupRuleCurrent.subRules.includes(newGroupRule.subRules[0])).toBeTruthy();
    });


    it('Test onRemoveRule', () => {
        component.parent = new CustomSector();
        const columnSectorRule = new ColumnSectorRule();
        columnSectorRule.columnName = 'Security Group';
        component.parent.rule = columnSectorRule;
        jest.spyOn(removeRule, 'emit');
        component.onRemoveRule();
        expect((component.parent.rule as ColumnSectorRule).columnName).toBeUndefined();
        expect(removeRule.emit).toBeCalled();
        const groupRule = new GroupRule();
        const columnRule: ColumnSectorRule = new ColumnSectorRule();
        columnRule.columnName = 'Security Group';
        columnRule.columnTag = 'sec_group';
        columnRule.positionColumnType = 'ALL';
        columnRule.dataType = 'String';
        columnRule.comparisonType = 'EQUALS';
        columnRule.comparisonValues = ['EQUITY', 'BND'];
        columnRule.comparisonLabels = ['EQUITY', 'BOND'];
        groupRule.addSubRule(columnRule);
        groupRule.addSubRule(cloneDeep(columnRule));
        component.rule = columnRule;
        component.parent = groupRule;
        component.onRemoveRule();
        expect(groupRule.subRules.includes(component.rule)).toBeFalsy();
    });

    it(' Test replaceRule', () => {
        const groupRule = new GroupRule();
        const columnRule: ColumnSectorRule = new ColumnSectorRule();
        columnRule.columnName = 'Security Group';
        columnRule.columnTag = 'sec_group';
        columnRule.positionColumnType = 'ALL';
        columnRule.dataType = 'String';
        columnRule.comparisonType = 'EQUALS';
        columnRule.comparisonValues = ['EQUITY', 'BND'];
        columnRule.comparisonLabels = ['EQUITY', 'BOND'];
        groupRule.addSubRule(columnRule);
        groupRule.addSubRule(cloneDeep(columnRule));
        component.rule = columnRule;
        component.parent = groupRule;
        const newRule = new GroupRule();
        component.replaceRule(newRule);
        expect(groupRule.subRules.includes(columnRule)).toBeFalsy();
        expect(groupRule.subRules[0]).toBe(newRule);
        // When parent is custom sector
        component.parent = new CustomSector();
        component.parent.rule = columnRule;
        component.replaceRule(newRule);
        expect(component.parent.rule).toBe(newRule);
    });

    it(' Test onSubRuleRemove', () => {
        // Test when there are 3 or more rules in group and one of it is removed
        jest.spyOn(component, 'onRemoveRule');
        const groupRule = new GroupRule();
        const columnRule: ColumnSectorRule = new ColumnSectorRule();
        columnRule.columnName = 'Security Group';
        columnRule.columnTag = 'sec_group';
        columnRule.positionColumnType = 'ALL';
        columnRule.dataType = 'String';
        columnRule.comparisonType = 'EQUALS';
        columnRule.comparisonValues = ['EQUITY', 'BND'];
        columnRule.comparisonLabels = ['EQUITY', 'BOND'];
        groupRule.addSubRule(columnRule);
        groupRule.addSubRule(cloneDeep(columnRule));
        groupRule.addSubRule(cloneDeep(columnRule));
        component.rule = groupRule;
        component.onSubRuleRemove(columnRule);
        expect(groupRule.subRules.includes(columnRule)).toBeFalsy();
        expect(component.onRemoveRule).toHaveBeenCalledTimes(0);
        // Test when there are 2 rules in group and any one is removed
        groupRule.subRules = [];
        groupRule.addSubRule(columnRule);
        const subRule2 = cloneDeep(columnRule);
        groupRule.addSubRule(subRule2);
        // When parent is custom sector
        component.parent = new CustomSector();
        component.parent.rule = groupRule;
        component.onSubRuleRemove(columnRule);
        expect(groupRule.subRules.includes(columnRule)).toBeFalsy();
        expect(component.onRemoveRule).toHaveBeenCalledTimes(0);
        expect(component.parent.rule).toEqual(subRule2);
        // When parent is group rule
        jest.spyOn(component.addRuleToParent, 'emit');
        groupRule.subRules = [];
        groupRule.addSubRule(columnRule);
        groupRule.addSubRule(subRule2);
        component.parent = new GroupRule();
        (component.parent as GroupRule).addSubRule(groupRule);
        component.onSubRuleRemove(columnRule);
        expect(groupRule.subRules.includes(columnRule)).toBeFalsy();
        expect((component.parent as GroupRule).subRules.includes(groupRule)).toBeFalsy();
        expect(component.onRemoveRule).toHaveBeenCalled();
        expect(component.addRuleToParent.emit).toHaveBeenLastCalledWith(subRule2);
        // Test when there is 1 rule in group and that is removed
        groupRule.subRules = [];
        groupRule.addSubRule(columnRule);
        component.onSubRuleRemove(columnRule);
        expect(groupRule.subRules.includes(columnRule)).toBeFalsy();
        expect(component.onRemoveRule).toHaveBeenCalled();
    });

    it('Group Index Change', () => {
        jest.spyOn(component['customSectorEventsService'], 'setActiveCustomSector');
        component.groupIndex = 1;
        component.ngOnChanges({
            groupIndex: new SimpleChange(null, 1, true)
        });
        expect(component['customSectorEventsService'].setActiveCustomSector).toHaveBeenCalledTimes(0);
        component.groupIndex = 0;
        component.ngOnChanges({
            groupIndex: new SimpleChange(1, 0, false)
        });
        expect(component['customSectorEventsService'].setActiveCustomSector).toHaveBeenCalled();
        component.groupIndex = null;
        component.ngOnChanges({
            groupIndex: new SimpleChange(0, null, false)
        });
        expect(component['customSectorEventsService'].setActiveCustomSector).toHaveBeenCalledTimes(2);
        expect(component.groupIndex === 0).toBeTruthy();
    });

    it('Test OnChanges', () => {
        component.rule = new ColumnSectorRule();
        component.ngOnChanges({
            rule: new SimpleChange(null, component.rule, true)
        });
        expect(component.isColumnRule).toBeTruthy();
        component.rule = new CustomSectorRule();
        component.ngOnChanges({
            rule: new SimpleChange(null, component.rule, true)
        });
        expect(component.isCustomSectorRule).toBeTruthy();
        component.rule = new GroupRule();
        component.rule.addSubRule(new CustomSectorRule());
        component.ngOnChanges({
            rule: new SimpleChange(null, component.rule, true),
            sectorRuleBuilderConfig: new SimpleChange(null, component.sectorRuleBuilderConfig, true)
        });
        expect(component.isGroupRule).toBeTruthy();
        component.sectorRuleBuilderConfig = new SectorRuleBuilderConfig([], new BreakdownTreeNode());
        component.ngOnChanges({
            sectorRuleBuilderConfig: new SimpleChange(null, component.sectorRuleBuilderConfig, true)
        });
        expect(component.sectorRuleBuilderConfig.addRule).toBe(component.addRule);
    });
});


@Component({
    selector: 'explore-sector-rule-builder-modal',
    template: `
        <p>Dialog</p>>
    `
})
class SectorRuleBuilderModalDialogStubComponent extends BaseSectorRuleBuilderModalComponent {

    openDialog = jest.fn();
}

@Component({
    selector: 'explore-custom-sector-column-rule',
    template: `
        <p>Column Rule</p>>
    `
})
class CustomSectorColumnRuleStubComponent extends CustomSectorColumnRuleComponent {

    editRule(): void {
    }
}
