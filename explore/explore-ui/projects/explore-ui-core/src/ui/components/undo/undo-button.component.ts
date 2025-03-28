import {Component, Input} from '@angular/core';

/**
 * Generic undo button component that takes tooltip and callback.
 *
 * "Reset Comparison date" in factor-data-risk-matrix-settings component and revert-risk-setting component can be refactored with this component.
 */
@Component({
    selector: 'explore-core-undo-button',
    templateUrl: './undo-button.component.html'
})
export class UndoButtonComponent {
    @Input() callback: Function;
    @Input() tooltip: string;

    onUndoClick(): void {
        this.callback();
    }
}
