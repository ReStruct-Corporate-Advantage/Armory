import {Component, EventEmitter, Output} from '@angular/core';

@Component({
    selector: 'app-add-group-button',
    templateUrl: './add-group-button.component.html',
    styleUrls: ['./add-group-button.component.scss']
})
export class AddGroupButtonComponent {

    isAddReportGroupModalOpen: boolean;
    @Output() addReportGroupDoneClicked = new EventEmitter();

    openAddReportGroupModal() {
        this.isAddReportGroupModalOpen = true;
    }

    addReportGroupButtonClickedCallback(isDoneClicked: boolean) {
        this.isAddReportGroupModalOpen = false;
        if (isDoneClicked) {
            this.addReportGroupDoneClicked.emit();
        }
    }
}
