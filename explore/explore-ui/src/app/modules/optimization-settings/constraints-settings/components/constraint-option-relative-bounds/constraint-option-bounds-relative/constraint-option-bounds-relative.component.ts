import {Component} from '@angular/core';
import {BaseRelativeUpperLowerBoundConstraintOptionDirective} from '@optimization-settings/constraints-settings/components/constraint-option-relative-bounds/base-relative-upper-lower-bound-constraint-option.component';

/**
 * Component to create constraint option Relative bounds
 */
@Component({
    selector: 'app-constraint-option-bounds-relative',
    templateUrl: './constraint-option-bounds-relative.component.html',
    styleUrls: ['./constraint-option-bounds-relative.component.scss']
})
export class ConstraintOptionBoundsRelativeComponent extends BaseRelativeUpperLowerBoundConstraintOptionDirective { }
