import {ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {AuxAdvancedTreeListDragStartDetailInterface, AuxAdvancedTreeListInterface, AuxAdvancedTreeListItemDoubleClickedDetailInterface, AuxAdvancedTreeListSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {isUndefined} from 'lodash';
import {debounceTime, takeUntil, map} from 'rxjs/operators';
import {BaseBreakdownSectorTree} from '../base-breakdown-sector-tree';
import {CommonConstants} from '@constants/common.constants';
import {TooltipUtils} from '@utils/tooltip.utils';

@Component({
    selector: 'app-breakdown-sector-tree',
    templateUrl: './breakdown-sector-tree.component.html'
})
export class BreakdownSectorTreeComponent extends BaseBreakdownSectorTree implements OnInit, OnChanges {

    @Input()
    sectorTreeData: AuxAdvancedTreeListInterface[];

    @Input()
    showStatusBadge: boolean;

    selectedNode: AuxAdvancedTreeListInterface;

    protected readonly TooltipUtils = TooltipUtils;
    searchString = '';

    readonly advanceTreeCustomStyle = {
        'aux-advanced-tree-list__hyperlist': {
            marginBottom: '0',
            marginTop: '0',
            width: 'auto',
            overflow: 'visible'
        }
    };

    constructor(protected changeDetectorRef: ChangeDetectorRef) {
        super(changeDetectorRef);
    }

    ngOnInit(): void {
        this.selectedNodeSubject$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((selectedNode: AuxAdvancedTreeListInterface) => {
                if (selectedNode !== this.selectedNode) {
                    this.unSelectSelection();
                }
            });
        this.searchTermSubject$
            .pipe(
                takeUntil(this.ngUnsubscribe),
                debounceTime(300),
                map((str: string) => {
                    // we are not allowing search if search string is less than 3 characters and all are just alphabets.
                    if ((typeof str === 'string') &&  !(str?.length < 3 && /^[a-zA-Z]+$/.test(str))) {
                        return str;
                    } else {
                        return CommonConstants.EMPTY_STRING;
                    }
                })
            ).subscribe((searchString: string) => {
                this.searchString = searchString;
                this.changeDetectorRef.markForCheck();
            });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.sectorTreeData) {
            this.changeDetectorRef.markForCheck();
        }
    }

    ngAfterViewInit(): void {
        // Trigger change detection after view initialization
        this.changeDetectorRef.detectChanges();
    }

    /**
     * Method called when any sector selection is double clicked
     */
    onNodeDoubleClick(event: CustomEvent<AuxAdvancedTreeListItemDoubleClickedDetailInterface>) {
        if (event.detail) {
            // If a group node is double clicked, all the selections under that group are provided, and for group click we don't want to do anything
            if (isUndefined(event.detail.value.children)) {
                this.addSectorSubject$.next(event.detail.value);
            }
            if (this.selectedNode) {
                this.selectedNode.isSelected = false;
            }
            event.detail.value.isSelected = true;
            this.sectorTreeData = [...this.sectorTreeData];
            this.setSelectedSector(event.detail.value);
        }
    }

    /**
     * Method called when any sector selection is changed
     */
    onSelectionChanged(event: CustomEvent<AuxAdvancedTreeListSelectionChangedDetailInterface>) {
        this.setSelectedSector(event.detail.value[0]);
    }

    /**
     * Sets selected sector node
     */
    setSelectedSector(sectorNode: AuxAdvancedTreeListInterface) {
        this.selectedNode = sectorNode;
        if (this.selectedNode) {
            this.selectedNodeSubject$.next(sectorNode);
        }
    }

    /**
     * called on sector node drag
     */
    onDragNode(event: CustomEvent<AuxAdvancedTreeListDragStartDetailInterface>) {
        if (event.detail && event.detail.value && event.detail.value.length === 1) {
            this.draggedNodeSubject$.next(event.detail.value[0]);
        }
    }

    /**
     * Unselect selected sector selection
     */
    private unSelectSelection() {
        if (this.selectedNode) {
            this.selectedNode.isSelected = false;
            this.selectedNode = undefined;
            this.sectorTreeData = [...this.sectorTreeData];
        }
    }

    /**
     * @inheritDoc
     */
    getSourceData(): AuxAdvancedTreeListInterface[] {
        return this.sectorTreeData;
    }
}
