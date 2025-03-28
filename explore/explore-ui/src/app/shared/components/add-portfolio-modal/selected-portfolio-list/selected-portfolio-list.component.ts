import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AddPortfolioService} from '../add-portfolio.service';
import {PortfolioSearchItem} from '@blk/explore-ui-portfolio-search';
import {IndexSearchTreeItem} from '@models/portfolio/index-search-tree-item.model';
import {AdhocPortParams} from '@models/portfolio/adhocModelling/adhoc-port-params.model';

/**
 * Selected Portfolio List Component
 *
 * @example
 *  <app-selected-portfolio-list></app-selected-portfolio-list>
 */
@Component({
    selector: 'app-selected-portfolio-list',
    templateUrl: './selected-portfolio-list.component.html',
    styleUrls: ['./selected-portfolio-list.component.scss']
})
export class SelectedPortfolioListComponent implements OnInit {
    @Output() portfolioRemoved = new EventEmitter<PortfolioSearchItem | IndexSearchTreeItem | AdhocPortParams>();
    @Output() allPortfoliosRemoved = new EventEmitter<void>();

    @Input()
    titleText = '';

    selectedPortfolioTickers: Set<PortfolioSearchItem|IndexSearchTreeItem|AdhocPortParams>;

    /**
     * constructor
     */
    constructor(private addPortfolioService: AddPortfolioService) {
    }

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        this.selectedPortfolioTickers = this.addPortfolioService.selectedPortfolioTickers;
    }

    /**
     * Remove all elements from the list
     * @param event  Mouse click event
     */
    removeAllPortfolios(event: MouseEvent): void {
        // prevent changing URL
        event.preventDefault();

        this.selectedPortfolioTickers.clear();
        this.allPortfoliosRemoved.emit();
    }

    /**
     * Remove a specific element from the list
     * @param ticker Portfolio ticker to remove from selected
     */
    removePort(ticker: PortfolioSearchItem): void {
        this.selectedPortfolioTickers.delete(ticker);
        this.portfolioRemoved.emit(ticker);
    }

    /**
     * Determine whether a portfolio in selectedPortfolioList is a custom portfolio
     * @param portfolio
     */
    isCustomPortfolio(portfolio: any): boolean {
        return portfolio instanceof AdhocPortParams;
    }
}
