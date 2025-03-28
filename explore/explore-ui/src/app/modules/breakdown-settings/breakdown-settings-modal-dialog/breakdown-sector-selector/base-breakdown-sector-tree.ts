import {ChangeDetectorRef, Directive, Input} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {AuxAdvancedTreeListInterface} from '@blk/aladdin-angular-components';
import {BaseCustomSearchTreeListComponent, CoreCommonConstants} from '@blk/explore-ui-core';

/**
 * Base class for breakdown sector selector tree to provide common inputs
 */
@Directive()
export abstract class BaseBreakdownSectorTree extends BaseCustomSearchTreeListComponent {
    @Input()
    selectedNodeSubject$: BehaviorSubject<AuxAdvancedTreeListInterface>;

    @Input()
    draggedNodeSubject$: BehaviorSubject<AuxAdvancedTreeListInterface>;

    @Input()
    searchTermSubject$: BehaviorSubject<string>;

    @Input()
    isDisabled: boolean;

    @Input()
    addSectorSubject$: BehaviorSubject<AuxAdvancedTreeListInterface>;

    constructor(protected changeDetectorRef: ChangeDetectorRef) {
        super(changeDetectorRef);
    }

    /**
     * @inheritDoc
     */
    getColumnCount(filteredData: AuxAdvancedTreeListInterface[]): string {
        // Returning empty string as we are not displaying column counter for sector selectors
        return CoreCommonConstants.EMPTY_STRING;
    }

    /**
     * @inheritDoc
     */
    abstract getSourceData(): AuxAdvancedTreeListInterface[];

}
