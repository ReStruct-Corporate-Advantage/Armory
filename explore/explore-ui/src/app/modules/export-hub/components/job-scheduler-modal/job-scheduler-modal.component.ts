import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-job-scheduler-modal',
  templateUrl: './job-scheduler-modal.component.html',
  styleUrls: ['./job-scheduler-modal.component.scss']
})
export class JobSchedulerModalComponent {
    @Input() isOpen: boolean;
    @Output() modalClosed = new EventEmitter<void>();

    /**
     * Close the export-hub modal
     */
    closeModal(): void {
        this.isOpen = false;
        this.modalClosed.emit();
    }
}
