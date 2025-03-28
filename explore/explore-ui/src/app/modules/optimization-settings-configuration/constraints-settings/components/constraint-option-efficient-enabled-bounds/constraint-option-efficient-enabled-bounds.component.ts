import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ConstraintOption} from '@optimization-settings-configuration/constraints-settings/models/constraint-option';
import {
    ConstraintOptionValueUpdate
} from '@optimization-settings-configuration/constraints-settings/models/constraint-option-value-update';
import {OptimizationSettings} from '@models/portfolio/optimization/optimization-settings.model';

/**
 * Component to create constraint option efficient enabled bounds
 */
@Component({
  selector: 'app-constraint-option-efficient-enabled-bounds',
  templateUrl: './constraint-option-efficient-enabled-bounds.component.html',
  styleUrls: ['./constraint-option-efficient-enabled-bounds.component.scss']
})
export class ConstraintOptionEfficientEnabledBoundsComponent implements OnInit {

    @Input() options: ConstraintOption<number>[];
    @Input() parentConfig: OptimizationSettings;

    @Output() updated: EventEmitter<ConstraintOptionValueUpdate<number>> = new EventEmitter();

    lowerBoundOption: ConstraintOption<number>[];
    upperBoundOption: ConstraintOption<number>[];

    /**
     * onInit hook
     */
    ngOnInit() {
        this.lowerBoundOption = [this.options[1]];
        this.upperBoundOption = [this.options[0]];
    }

    /**
     * On constraint option value update
     */
    onUpdated(update: ConstraintOptionValueUpdate<any>): void {
        this.updated.emit(update);
    }

}
