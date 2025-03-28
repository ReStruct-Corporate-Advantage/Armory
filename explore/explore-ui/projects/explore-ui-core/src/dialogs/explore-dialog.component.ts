import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Observable} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {SubscribableComponent} from '../core/components/subscribable.component';
import {ExploreDialogParam} from '../ui/models/explore-dialog-param.model';

/**
 * Explore Dialog Component is controlled by dialogContent$ input
 *
 * @example
 * <ng-container *ngIf="dialogContent$ | async">
 *     <explore-core-dialog (emitDialogClosed)="closeDialog()"
 *                         [dialogContent$]="dialogContent$"
 *     ></explore-core-dialog>
 *  </ng-container>
 */
@Component({
    selector: 'explore-core-dialog',
    templateUrl: './explore-dialog.component.html',
    styleUrls: ['./explore-dialog.component.scss']
})
export class ExploreDialogComponent extends SubscribableComponent implements OnInit {
    // variable to control dialog open/close event
    @Output() emitDialogClosed = new EventEmitter();

    @Input() dialogContent$: Observable<ExploreDialogParam>;

    isOpen: boolean;
    type: string;
    header: string;
    message: string;
    primaryButtonLabel: string;
    secondaryButtonLabel: string;
    // success callback
    dialogCallBack1: Function;
    // cancel callback
    dialogCallBack2: Function;
    dialogCallBackArgs: any;

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        this.dialogContent$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((dialogContent: ExploreDialogParam) => {
                if (dialogContent) {
                    this.isOpen = true;
                    this.type = dialogContent.type;
                    this.header = dialogContent.header;
                    this.primaryButtonLabel = dialogContent.primaryButtonLabel;
                    this.secondaryButtonLabel = dialogContent.secondaryButtonLabel;
                    this.message = dialogContent.message;
                    this.dialogCallBack1 = dialogContent.dialogCallBack1;
                    this.dialogCallBack2 = dialogContent.dialogCallBack2;
                    this.dialogCallBackArgs = dialogContent.dialogCallBackArgs;
                }
            });
    }

    /**
     * Close Dialog
     */
    closeDialog(apply?: boolean): void {
        if (apply && this.dialogCallBack1) {
            this.dialogCallBack1(this.dialogCallBackArgs);
        } else if (this.dialogCallBack2) {
            this.dialogCallBack2();
        }

        this.isOpen = false;
        this.emitDialogClosed.emit();
    }
}
