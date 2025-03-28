import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ExploreSelectOptionGroup } from '@blk/explore-ui-core';
import { CommonConstants } from '@constants/common.constants';

@Component({
  selector: 'app-base-portfolio-selector',
  templateUrl: './base-portfolio-selector.component.html',
  styleUrls: ['./base-portfolio-selector.component.scss']
})
export class BasePortfolioSelectorComponent {
  @Input() anchorOptions: ExploreSelectOptionGroup[];
  @Output() selectionChanged = new EventEmitter<CustomEvent>();
  readonly basePortfolioText: string = CommonConstants.BASE_PORTFOLIO_TEXT;

  setSelectedAnchorValue(event: CustomEvent): void {
    this.selectionChanged.emit(event);
  }
}