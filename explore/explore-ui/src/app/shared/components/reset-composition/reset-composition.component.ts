import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-reset-composition',
  templateUrl: './reset-composition.component.html',
  styleUrls: ['./reset-composition.component.scss']
})
export class ResetCompositionComponent {
    @Input() disableResetButton: boolean;
    @Output() resetComposition: EventEmitter<void> = new EventEmitter();

    /**
     * Reset composition table
     */
    onResetComposition() {
        this.resetComposition.emit();
    }

}
