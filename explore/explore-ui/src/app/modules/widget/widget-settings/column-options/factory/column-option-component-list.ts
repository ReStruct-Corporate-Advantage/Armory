import {CollapsedLookthroughColumnOptionComponent} from '../collapsed-lookthrough/collapsed-lookthrough-column-option.component';
import {ColumnBreakdownColumnOptionComponent} from '../column-breakdown/column-breakdown-column-option.component';

// TODO: This file will be eventually removed. Remove component as we move the components into the lib.

// We need the list of the column options components in a few places, so this allows us to get them where needed.
export const columnOptionComponentList = [
    ColumnBreakdownColumnOptionComponent,
    CollapsedLookthroughColumnOptionComponent
];
