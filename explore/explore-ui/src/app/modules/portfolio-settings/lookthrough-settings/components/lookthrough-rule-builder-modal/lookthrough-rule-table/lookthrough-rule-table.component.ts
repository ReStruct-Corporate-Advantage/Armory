import {Component, EventEmitter, Input, Output} from '@angular/core';
import {LookthroughFilterRule} from '@models/lookthrough/look-through-filter-rule.model';
import {LookthroughConstants} from '@blk/explore-ui-look-through-settings';
import {CommonConstants} from '@constants/common.constants';
import {ArrayUtils} from '@utils/array.utils';

/**
 * Component class for look-through Rule Table
 */
@Component({
    selector: 'app-lookthrough-rule-table',
    templateUrl: './lookthrough-rule-table.component.html',
    styleUrls: ['./lookthrough-rule-table.component.scss']
})
export class LookthroughRuleTableComponent {

    @Input() lookthroughFilterRules: Array<LookthroughFilterRule>;
    @Input() selectedRule: LookthroughFilterRule;

    @Output() itemSelected = new EventEmitter<LookthroughFilterRule>();
    @Output() itemEnabledDisabled = new EventEmitter<void>();
    @Output() itemDeleted = new EventEmitter<LookthroughFilterRule>();

    /**
     * selecting a row. calls the parent to do so.
     */
    ltFilterSelected(lookthroughFilterRule: LookthroughFilterRule) {
        this.itemSelected.emit(lookthroughFilterRule);
    }

    /**
     * toggle the ltFilterRule enabled property
     */
    enableDisableRule(ltFilterRule: LookthroughFilterRule): void {
        if (!ltFilterRule) {
            return;
        }

        ltFilterRule.enabled = !ltFilterRule.enabled;
        if (!ltFilterRule.isEmpty() || ltFilterRule.ltType !== LookthroughConstants.LT_TYPE_FULL) {
            this.itemEnabledDisabled.emit();
        }
    }

    /**
     * Deleting the specific selected lookthroughFilterRule
     */
    deleteLtRule(lookthroughFilterRule: LookthroughFilterRule) {
        this.itemDeleted.emit(lookthroughFilterRule);
    }

    /**
     * Method called when rule table row is dragged
     * @param event
     * @param rowId
     */
    onTableRowDragStart(event: DragEvent, rowIndex: number) {
        event.dataTransfer.setData(CommonConstants.DRAG_DROP_PARAMS.LOOK_THROUGH_RULE_TABLE_ROW_ID, rowIndex.toString());
    }

    /**
     * Method to check if drop should be allowed on rule table row
     * @param event
     */
    allowDropOnTableRow(event: DragEvent): void {
        if (event.dataTransfer.types.includes(CommonConstants.DRAG_DROP_PARAMS.LOOK_THROUGH_RULE_TABLE_ROW_ID)) {
            event.preventDefault();
            event.cancelBubble = true;
        }
    }

    /**
     * Method called when a rule table row is dropped on another rule table row
     * @param event
     * @param rowNo
     */
    onDropOnTableRow(event: DragEvent, rowIndex: number): void {
        event.preventDefault();
        const droppedRowIndex = Number(event.dataTransfer.getData(CommonConstants.DRAG_DROP_PARAMS.LOOK_THROUGH_RULE_TABLE_ROW_ID));
        ArrayUtils.moveItemInArray(rowIndex, this.lookthroughFilterRules[droppedRowIndex], this.lookthroughFilterRules);
    }

}
