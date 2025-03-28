import {AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {WorkspaceStore} from '@stores/workspace.store';
import {ExploreWidgetPasteService} from '@services/widget-data/explore-widget-paste.service';

@Component({
    selector: 'app-paste-widget-modal',
    templateUrl: './paste-widget-modal.component.html',
    styleUrls: ['./paste-widget-modal.component.scss']
})
/**
 * PasteWidgetModal Component
 *
 * @example
 *  <ng-container *ngIf="isPasteWidgetModalOpen">
 *      <app-paste-widget-modal [isOpen]="isPasteWidgetModalOpen"
 *          (modalClosed)="closePasteWidgetModal()">
 *      </app-paste-widget-modal>
 *  </ng-container>
 */
export class PasteWidgetModalComponent implements AfterViewInit {
    // variables to control modal open/close event
    @Input() isOpen: boolean;
    @Output() modalClosed = new EventEmitter();
    @ViewChild('pasteWidgetElement', {static: false}) pasteWidgetElement: ElementRef;

    /**
     * constructor
     */
    constructor(private widgetPasteService: ExploreWidgetPasteService) {
    }

    /**
     * AfterViewInit hook
     * This is required since @ViewChild elements can only be referenced in this hook. Elements would still be undefined in OnInit hook
     */
    ngAfterViewInit(): void {
        // setTimeout is used to wait for the element being rendered and then set textarea element to be focused
        setTimeout(() => this.pasteWidgetElement.nativeElement.focus(), 100);
    }

    /**
     * listen to paste event and create a new widget with copied data from clipboard
     */
    async pasteWidget(event: any) {
        // Only run this code if Ctrl+V are pressed and we have some widget config data.
        if (!event || !event.clipboardData || !event.clipboardData.getData('text/plain')) {
            return;
        }
        // Stop the event bubbling up.
        event.stopPropagation();
        event.preventDefault();
        await this.widgetPasteService.pasteWidget(event.clipboardData.getData('text/plain'), WorkspaceStore.getCurrentReport());
        this.closeModal();
    }

    /**
     * Close Compare modal
     */
    closeModal(): void {
        this.isOpen = false;
        this.modalClosed.emit();
    }
}
