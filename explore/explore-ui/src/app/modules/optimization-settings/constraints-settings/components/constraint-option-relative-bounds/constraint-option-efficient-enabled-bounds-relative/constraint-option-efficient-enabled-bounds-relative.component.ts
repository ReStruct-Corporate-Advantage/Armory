import {Component} from '@angular/core';
import {BaseRelativeUpperLowerBoundConstraintOptionDirective} from '@optimization-settings/constraints-settings/components/constraint-option-relative-bounds/base-relative-upper-lower-bound-constraint-option.component';

/**
 * Component to create constraint option efficient enabled Relative bounds
 */
@Component({
  selector: 'app-constraint-option-efficient-enabled-bounds-relative',
  templateUrl: './constraint-option-efficient-enabled-bounds-relative.component.html',
  styleUrls: ['./constraint-option-efficient-enabled-bounds-relative.component.scss']
})
export class ConstraintOptionEfficientEnabledBoundsRelativeComponent extends BaseRelativeUpperLowerBoundConstraintOptionDirective { }
