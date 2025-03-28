import {AfterViewInit, Component, ViewChild, ViewContainerRef} from '@angular/core';
import {ICellEditorAngularComp} from 'ag-grid-angular';
import {KeyboardEventKey} from '@blk/aladdin-angular-components';

@Component({
  selector: 'explore-extended-column-option-restrict-implied-shocks-cell-editor',
  templateUrl: './restrict-implied-shocks-cell-editor.component.html',
  styleUrls: ['./restrict-implied-shocks-cell-editor.component.scss']
})
export class RestrictImpliedShocksCellEditorComponent implements ICellEditorAngularComp, AfterViewInit {
    params: any;
    targetEl;

    @ViewChild('popover', { read: ViewContainerRef })
    popover!: ViewContainerRef;

    restrictImpliedShocks: string[];
    updatedRestrictImpliedShocks: string[];

    agInit(params: any): void {
        this.params = params;
        this.restrictImpliedShocks = this.params.value ? this.params.value.split(',') : [];
        this.updatedRestrictImpliedShocks = [...this.restrictImpliedShocks];
        this.targetEl = this.params.eGridCell;
    }

    ngAfterViewInit() {
        window.setTimeout(() => {
            this.popover.element.nativeElement.focus();
        });
    }

    getValue(): any {
        return this.restrictImpliedShocks.join(',');
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === KeyboardEventKey.Tab) {
            event.stopPropagation();
        }
    }

    onRestrictImpliedShocksChanged(value: string[]): void {
        this.updatedRestrictImpliedShocks = value;
    }

    handleButtonClick() {
        this.restrictImpliedShocks = this.updatedRestrictImpliedShocks;
        this.params.stopEditing();
    }

    handleCloseIconClick() {
        this.params.stopEditing();
    }
}
