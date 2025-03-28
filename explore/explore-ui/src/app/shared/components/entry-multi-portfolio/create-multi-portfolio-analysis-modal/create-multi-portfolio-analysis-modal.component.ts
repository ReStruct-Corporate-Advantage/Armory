import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
    selector: 'app-create-multi-portfolio-analysis-modal',
    templateUrl: './create-multi-portfolio-analysis-modal.component.html',
    styleUrls: ['./create-multi-portfolio-analysis-modal.component.scss']
})
export class CreateMultiPortfolioAnalysisModalComponent {
    @Input() title: string = '';
    @Input() description: string = '';
    @Input() applyText: string = 'Apply';
    @Input() cancelText: string = 'Cancel';
    @Output() applyClick = new EventEmitter<void>();
    @Output() cancelClick = new EventEmitter<void>();

    onApplyClick(): void {
        this.applyClick.emit();
    }

    onCancelClick(): void {
        this.cancelClick.emit();
    }
}
