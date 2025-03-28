import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {OptionValueComponent} from '../../interfaces/option-value-component.interface';
import {ConstraintOption} from '../../models/constraint-option';
import {ConstraintOptionValueUpdate} from '../../models/constraint-option-value-update';

@Component({
    selector: 'app-constraint-missing-data',
    templateUrl: './constraint-option-missing-data.component.html',
    styleUrls: ['./constraint-option-missing-data.component.scss']
})
export class ConstraintOptionMissingDataComponent implements OptionValueComponent<string, any>, OnInit {
    @Input() options: Array<ConstraintOption<any>>;

    @Output() updated: EventEmitter<ConstraintOptionValueUpdate<string>> = new EventEmitter();

    missingDataOption: Array<ConstraintOption<boolean>>;

    ngOnInit() {
        this.missingDataOption = [this.options[0]];
    }

    onUpdated(update: ConstraintOptionValueUpdate<string>): void {
        this.updated.emit(update);
    }
}
