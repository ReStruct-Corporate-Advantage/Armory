import {Component, EventEmitter, HostListener, Input, Output, ViewChild, ViewEncapsulation} from '@angular/core';
import {Widget} from "@models/widget/widget.model";
import {WidgetPayload} from "@models/widget/widget-payload.model";
import {BehaviorSubject} from "rxjs";
import {ExploreTableComponent} from "../../../../../vizualizations/table";

/**
 * This component is a wrapper to be able to detect outside clicks in the lookthrough settings modal
 */

@Component({
    selector: 'lookthrough-table-wrapper',
    templateUrl: './lookthrough-table-wrapper.component.html',
    encapsulation: ViewEncapsulation.None
})

export class LookthroughTableWrapperComponent{

    @Input() widget: Widget;
    @Input() widgetPayload: WidgetPayload;
    @Input() isTableSearchActive$: BehaviorSubject<boolean>;

    @Output() changeAddConditionState = new EventEmitter();

    @ViewChild('exploreTable', {static: false}) exploreTable: ExploreTableComponent;

    /**
     * listener for clicking outside the table
     */
    @HostListener("document:click")
    clickedOut() {
        this.changeAddConditionState.emit(true);
    }

    /**
     * Setting isAddConditionEnabled state in lookthrough-rule-builder-modal to false
     */
    cellClicked(): void{
        this.changeAddConditionState.emit(false);
    }
}
