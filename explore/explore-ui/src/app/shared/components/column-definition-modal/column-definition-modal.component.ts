import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {isNil} from 'lodash';
import {CommonConstants} from '@constants/common.constants';
import {ColumnConfig, ColumnDefinition} from '@blk/explore-ui-core';
import {CustomTitleColumnOption, LibColumnUtils} from '@blk/explore-ui-column-option';
import {BehaviorSubject} from 'rxjs';

/**
 * Portfolio Settings Modal Component
 *
 * @example
 *
 *  <ng-container *ngIf="showColumnDefinition">
 *      <app-column-definition-modal [isOpen]="showColumnDefinition"
 *                                    (modalClosed)="closeColumnDefinitionModal()"
 *                                    [column]="column">
 *      </app-column-definition-modal>
 *  </ng-container>
 */
@Component({
    selector: 'app-column-definition-modal',
    templateUrl: './column-definition-modal.component.html',
    styleUrls: ['./column-definition-modal.component.scss']
})
export class ColumnDefinitionModalComponent implements OnInit {
    // variables to control modal open/close event
    @Input() isOpen: boolean;
    @Input() column: ColumnConfig;
    @Output() modalClosed = new EventEmitter();

    title: string;
    description: string;
    readonly OK_TEXT = CommonConstants.BUTTON_TEXT.OK;
    customColumnTitle: CustomTitleColumnOption;
    colDef: ColumnDefinition;

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        this.colDef = LibColumnUtils.getColumnDefinition(this.column);
        this.customColumnTitle = this.column.getOptionValueByConfigType(CustomTitleColumnOption.CONFIG_TYPE) as CustomTitleColumnOption;
    }

    /**
     * Close column definition modal
     */
    closeModal(): void {
        this.isOpen = false;
        this.modalClosed.emit();
    }
}
