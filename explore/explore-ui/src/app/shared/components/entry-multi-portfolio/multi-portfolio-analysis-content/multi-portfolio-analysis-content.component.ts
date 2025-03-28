import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonConstants } from '@constants/common.constants';

@Component({
  selector: 'app-multi-portfolio-analysis-content',
  templateUrl: './multi-portfolio-analysis-content.component.html',
  styleUrls: ['./multi-portfolio-analysis-content.component.scss']
})
export class MultiPortfolioAnalysisContentComponent {
  @Input() label: string;
  @Input() comparisonStackedData: any[] = [];
  @Input() isStacked: boolean;
  @Input() hasSelectAll: boolean;
  @Input() anchorOptions: any[] = [];
  @Input() isDisabled: boolean = false; 
  @Input() isComparisonListEmpty$: any;
  @Input() isComparisonEnabled: boolean;
  @Output() checkboxGroupChanged = new EventEmitter<void>();
  @Output() selectionChanged = new EventEmitter<any>();

  readonly basePortfolioText: string = CommonConstants.BASE_PORTFOLIO_TEXT;


  onCheckboxGroupChanged(): void {
    this.checkboxGroupChanged.emit();
  }

  setSelectedAnchorValue(event: any): void {
    this.selectionChanged.emit(event);
  }
}