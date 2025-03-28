import {Component, Input, OnInit} from '@angular/core';
import {
    ExplorePortfolioSearchService,
    PortSearchItemCallback
} from '@services/explore-portfolio-search/explore-portfolio-search.service';
import {LoadFavoriteAction} from '@models/favorite/load-favorite-action.model';
import {PortfolioSearchItem} from '@blk/explore-ui-portfolio-search';
import {AddPortfolioService} from '../add-portfolio.service';

@Component({
    selector: 'app-add-what-if-portfolio',
    templateUrl: './add-what-if-portfolio.component.html',
    styleUrls: ['./add-what-if-portfolio.component.scss']
})
export class AddWhatIfPortfolioComponent implements OnInit {

    @Input()
    loadFavActionCallback: PortSearchItemCallback;

    loadFavAction: LoadFavoriteAction;

    /**
     * constructor
     */
    constructor(public portfolioSearchService: ExplorePortfolioSearchService, private addPortfolioService: AddPortfolioService) {
    }

    ngOnInit(): void {
        this.loadFavAction = this.portfolioSearchService.enableWhatIfSearch(
            this.loadFavActionCallback
                ? [this.loadFavActionCallback, this.onAddPortfolioToSelectedListOfPortfolios]
                : this.onAddPortfolioToSelectedListOfPortfolios
        );
    }

    /**
     * Add the portfolio search item to the selectedPortTickerList
     * @param portfolioSearchItem The searched item/portfolio to add
     */
    onAddPortfolioToSelectedListOfPortfolios: PortSearchItemCallback = (portfolioSearchItem: PortfolioSearchItem): void => {
        this.addPortfolioService.selectedPortfolioTickers.add(portfolioSearchItem);
    };
}
