import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {OptionValueComponent} from '../../interfaces/option-value-component.interface';
import {ConstraintOption} from '../../models/constraint-option';
import {ConstraintOptionValueUpdate} from '../../models/constraint-option-value-update';

@Component({
    selector: 'app-constraint-option-bounds',
    templateUrl: './constraint-option-bounds.component.html',
    styleUrls: ['./constraint-option-bounds.component.scss']
})
export class ConstraintOptionBoundsComponent implements OptionValueComponent<number, any>, OnInit {
    @Input() options: Array<ConstraintOption<number>>;

    @Output() updated: EventEmitter<ConstraintOptionValueUpdate<number>> = new EventEmitter();

    lowerBoundOption: Array<ConstraintOption<number>>;
    upperBoundOption: Array<ConstraintOption<number>>;

    ngOnInit() {
        this.lowerBoundOption = [this.options[1]];
        this.upperBoundOption = [this.options[0]];
    }

    onUpdated(update: ConstraintOptionValueUpdate<number>): void {
        this.updated.emit(update);
    }
}
