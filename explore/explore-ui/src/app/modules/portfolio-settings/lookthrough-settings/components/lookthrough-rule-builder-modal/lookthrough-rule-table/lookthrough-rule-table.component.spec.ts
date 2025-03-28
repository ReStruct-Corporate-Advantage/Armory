import {ComponentFixture, TestBed} from '@angular/core/testing';
import {LookthroughRuleTableComponent} from './lookthrough-rule-table.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {LookthroughFilterRule} from '@models/lookthrough/look-through-filter-rule.model';
import {ColumnSectorRule} from '@blk/explore-ui-breakdown';
import {CommonConstants} from '@constants/common.constants';

describe('LookthroughRuleTableComponent', () => {
    let component: LookthroughRuleTableComponent;
    let fixture: ComponentFixture<LookthroughRuleTableComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [LookthroughRuleTableComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(LookthroughRuleTableComponent);
        component = fixture.componentInstance;
        component.lookthroughFilterRules = new Array<LookthroughFilterRule>();
    });

    it('test ltFilterSelected', () => {
        const ltFilterRule = new LookthroughFilterRule();
        jest.spyOn(component.itemSelected, 'emit');
        component.ltFilterSelected(ltFilterRule);
        expect(component.itemSelected.emit).toBeCalledWith(ltFilterRule);
    });

    it('test deleteLtRule', () => {
        const ltFilterRule = new LookthroughFilterRule();
        jest.spyOn(component.itemDeleted, 'emit');
        component.deleteLtRule(ltFilterRule);
        expect(component.itemDeleted.emit).toBeCalledWith(ltFilterRule);
    });

    it('test drag and drop', () => {
        const dragEvent = {
            cancellable: false,
            preventDefault: jest.fn(),
            dataTransfer: {
                types: [],
                setData: jest.fn(),
                getData: jest.fn()
            }
        } as any;
        // Drag start
        component.onTableRowDragStart(dragEvent as DragEvent, 1);
        expect(dragEvent.dataTransfer.setData).toHaveBeenCalledWith(CommonConstants.DRAG_DROP_PARAMS.LOOK_THROUGH_RULE_TABLE_ROW_ID, '1');
        // allow drop
        component.allowDropOnTableRow(dragEvent as DragEvent);
        expect(dragEvent.preventDefault).not.toHaveBeenCalled();
        dragEvent.dataTransfer.types = [CommonConstants.DRAG_DROP_PARAMS.LOOK_THROUGH_RULE_TABLE_ROW_ID];
        component.allowDropOnTableRow(dragEvent as DragEvent);
        expect(dragEvent.preventDefault).toHaveBeenCalled();
        expect(dragEvent.cancelBubble).toBeTruthy();
        // on drop
        component.lookthroughFilterRules = [new LookthroughFilterRule(), new LookthroughFilterRule()];
        component.lookthroughFilterRules[0].displayName = 'rule1';
        component.lookthroughFilterRules[1].displayName = 'rule2';
        jest.spyOn(dragEvent.dataTransfer, 'getData').mockImplementation((field: string) => {
            return field === CommonConstants.DRAG_DROP_PARAMS.LOOK_THROUGH_RULE_TABLE_ROW_ID ? '1' : '';
        });
        component.onDropOnTableRow(dragEvent, 0);
        expect(component.lookthroughFilterRules[0].displayName).toEqual('rule2');
        expect(component.lookthroughFilterRules[1].displayName).toEqual('rule1');
        expect(dragEvent.preventDefault).toHaveBeenCalledTimes(2);
    });

    it('test enableDisableRule', () => {
        jest.spyOn(component.itemEnabledDisabled, 'emit');
        const ltFilterRule = new LookthroughFilterRule();

        // test when rule is empty and ltType is Full
        ltFilterRule.enabled = false;
        ltFilterRule.ltType = 'Full';

        component.enableDisableRule(ltFilterRule);
        expect(ltFilterRule.enabled).toBe(true);
        expect(component.itemEnabledDisabled.emit).toBeCalledTimes(0);

        // test when rule is empty and ltType is not Full
        ltFilterRule.enabled = true;
        ltFilterRule.ltType = 'Sector';

        component.enableDisableRule(ltFilterRule);
        expect(ltFilterRule.enabled).toBe(false);
        expect(component.itemEnabledDisabled.emit).toBeCalledTimes(1);

        // test when rule is empty and ltType is Full
        const columnRule = ltFilterRule.customSector.rule as ColumnSectorRule;
        columnRule.columnName = 'Security Group';
        columnRule.columnTag = 'sec_group';
        columnRule.positionColumnType = 'ALL';
        columnRule.dataType = 'String';
        columnRule.comparisonType = 'EQUALS';
        columnRule.comparisonValues = ['EQUITY', 'BND'];
        columnRule.comparisonLabels = ['EQUITY', 'BOND'];

        ltFilterRule.enabled = true;
        ltFilterRule.ltType = 'Full';
        component.enableDisableRule(ltFilterRule);
        expect(ltFilterRule.enabled).toBe(false);
        expect(component.itemEnabledDisabled.emit).toBeCalledTimes(2);
    });

});
