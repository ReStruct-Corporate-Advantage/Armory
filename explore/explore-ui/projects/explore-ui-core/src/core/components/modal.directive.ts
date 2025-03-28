import {Directive, EventEmitter, Input, Output} from '@angular/core';
import {SubscribableComponent} from './subscribable.component';

/**
 * Base class that any modal/dialog components can extend from
 * If emitting an object on modal close, then should add optional type
 * Example: export class FolderStructureModalComponent extends ModalDirective<string> {}
 */
@Directive()
export class ModalDirective<T = void> extends SubscribableComponent {
    // variables for open/close modal
    @Input() isOpen: boolean;
    @Output() modalClosed = new EventEmitter<T>();

    /**
     * Close modal
     */
    closeModal(object?: T): void {
        this.isOpen = false;
        this.modalClosed.emit(object);
    }
}
