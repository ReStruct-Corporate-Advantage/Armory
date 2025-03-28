import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {OptionValueComponent} from '../../interfaces/option-value-component.interface';
import {ConstraintOption} from '../../models/constraint-option';
import {ConstraintOptionValueUpdate} from '../../models/constraint-option-value-update';

@Component({
  selector: 'app-constraint-option-bounds-long-short',
  templateUrl: './constraint-option-bounds-long-short.component.html',
  styleUrls: ['./constraint-option-bounds-long-short.component.scss']
})
export class ConstraintOptionBoundsLongShortComponent implements OptionValueComponent<number, any>, OnInit {
    @Input() options: Array<ConstraintOption<number>>;

    @Output() updated: EventEmitter<ConstraintOptionValueUpdate<number>> = new EventEmitter();

    longLowerBoundOption: Array<ConstraintOption<number>>;
    longUpperBoundOption: Array<ConstraintOption<number>>;
    shortLowerBoundOption: Array<ConstraintOption<number>>;
    shortUpperBoundOption: Array<ConstraintOption<number>>;

    ngOnInit() {
        this.longLowerBoundOption = [this.options[1]];
        this.longUpperBoundOption = [this.options[0]];
        this.shortLowerBoundOption = [this.options[3]];
        this.shortUpperBoundOption = [this.options[2]];
    }

    onUpdated(update: ConstraintOptionValueUpdate<number>): void {
        this.updated.emit(update);
    }
}
