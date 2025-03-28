import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {PriceChartService} from '@services/price-chart/price-chart.service';
import {WorkspaceStore} from '@stores/workspace.store';
import {InvestmentOpinion, MarketData, Portfolio, ResearchNoteData, StockPriceChartData, StockPriceChartOptions, Trade} from '@blk/ar-common';
import {forkJoin, Observable, of, Subject} from 'rxjs';
import {UserMetaDataStore} from '@stores/user-meta-data.store';
import {UserPreference} from '@constants/user-preference.constants';
import {takeUntil} from 'rxjs/operators';
import {CalendarConstants} from '@constants/calendar.constants';
import {ExploreConstants} from '@constants/explore.constants';
import {PriceChartInputs} from '@models/price-chart-inputs/price-chart-inputs.model';
import {CalendarDateUtils, DateFormatConstants, SubscribableComponent} from '@blk/explore-ui-core';

/**
 * This component wraps the stock-price-chart component from the aladdin research.
 *
 * @example
 *  <ng-container *ngIf="showPriceChart">
 *          <app-price-popup-chart [isOpen]="showPriceChart"
                           [priceData]="showPriceChart"
                           (modalClosed)="setShowPriceChart(null)">
 *          </app-price-popup-chart>
 *  </ng-container>
 */
@Component({
    selector: 'app-price-popup-chart',
    templateUrl: './price-popup-chart.component.html',
    styleUrls: ['./price-popup-chart.component.scss']
})
export class PricePopupChartComponent extends SubscribableComponent implements OnInit {
    stockPriceChartOptions: StockPriceChartOptions;
    stockPriceChartData$ = new Subject<StockPriceChartData>();
    stockPriceChartDarkMode = false;
    startDate: string;
    endDate: string;

    @Input() isOpen: boolean;
    @Input() priceChartInputs: PriceChartInputs;
    @Output() modalClosed = new EventEmitter();

    /**
     * Constructor.
     */
    constructor(private priceChartService: PriceChartService) {
        super();
    }

    /**
     * OnInit initialize stockPriceChartData and stockPriceChartOptions
     */
    ngOnInit() {
        const portfolio = WorkspaceStore.getCurrentPortfolio();
        this.endDate = portfolio.datePicker.date;
        this.startDate = CalendarDateUtils.getDateInFormat(
            CalendarDateUtils.getDateInAladdinFormat(this.endDate, 1, CalendarConstants.YEAR_LOWER),
            DateFormatConstants.MMDDYYYY_SLASH
        );

        const portObj: Portfolio = {
            id: 0,
            ticker: portfolio.portName,
            name: portfolio.getPortfolioHeaderTitle(),
            portGroup: portfolio.isPortfolioGroup
        };
        this.stockPriceChartOptions = {
            assetId: this.priceChartInputs.cusip,
            chartHeight: 250,
            chartWidth: window.innerWidth / 3,
            portfolio: portObj
        };
        // Subscribe to changes in the theme.
        UserMetaDataStore.getPreferenceSubject(UserPreference.THEME)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((value) => {
                this.stockPriceChartDarkMode = value === ExploreConstants.THEME_DARK_MODE;
            });
        this.onStockPriceChartOptionsChanged(this.stockPriceChartOptions);
    }

    /**
     * Loads the stock price chart data
     * @param stockPriceChartOptions
     * @param startDate
     * @param endDate
     */
    loadStockPriceChart(stockPriceChartOptions: StockPriceChartOptions, startDate: string, endDate: string): void {
        const basicChartData = new Array<Observable<any>>();
        basicChartData.push(this.priceChartService.getEquityPriceDataURL(stockPriceChartOptions.assetId, startDate, endDate));
        basicChartData.push(
            this.priceChartService.getTradesData(
                stockPriceChartOptions.portfolio.ticker,
                stockPriceChartOptions.assetId,
                startDate,
                endDate
            )
        );
        basicChartData.push(this.priceChartService.getNotesByDateRange(stockPriceChartOptions.assetId, startDate, endDate));
        forkJoin(basicChartData).subscribe(
            ([marketDataResponse, tradeDataResponse, noteDataResponse]) => {
                const stockPriceChartData: StockPriceChartData = {
                    marketData: marketDataResponse as Array<MarketData>,
                    researchNotes: noteDataResponse as Array<ResearchNoteData>,
                    trades: tradeDataResponse as Array<Trade>
                };
                this.stockPriceChartData$.next(stockPriceChartData);

                // after communicating the result of market data we keep fetching the portfolio, list and trade data
                forkJoin(
                    this.fetchAdditionalData(
                        stockPriceChartOptions.assetId,
                        stockPriceChartOptions.portfolio ? stockPriceChartOptions.portfolio.ticker : null,
                        stockPriceChartOptions.investmentOpinionLists
                            ? stockPriceChartOptions.investmentOpinionLists.map((ioList) => ioList.listId)
                            : null,
                        stockPriceChartOptions.targetPriceLists
                            ? stockPriceChartOptions.targetPriceLists.map((targetPriceList) => targetPriceList.listId)
                            : null,
                        startDate,
                        endDate
                    )
                ).subscribe(([listHistoryResponse, listHistoryTargetPriceResponse, tradesByDateRangeResponse]) => {
                    const newStockPriceChartData: StockPriceChartData = {
                        marketData: marketDataResponse as Array<MarketData>,
                        researchNotes: noteDataResponse as Array<ResearchNoteData>,
                        investmentOpinion: listHistoryResponse as Array<InvestmentOpinion>,
                        targetPrice: listHistoryTargetPriceResponse as Array<InvestmentOpinion>,
                        trades: tradesByDateRangeResponse as Array<Trade>
                    };
                    this.stockPriceChartData$.next(newStockPriceChartData);
                });
            },
            (error) => {
                console.error(error);
            }
        );
    }

    /**
     * Fetches additional data for price chart including trades, investment opinions, target price lists
     *
     * @param cusip
     * @param portfolio
     * @param investmentOpinionList
     * @param targetPriceList
     * @param startDate
     * @param endDate
     */
    private fetchAdditionalData(
        cusip: string,
        portfolio: string,
        investmentOpinionList: Array<string>,
        targetPriceList: Array<string>,
        startDate: string,
        endDate: string
    ): Array<Observable<any>> {
        const observables = new Array<Observable<any>>();
        if (investmentOpinionList && investmentOpinionList.length > 0) {
            observables.push(this.priceChartService.getListHistoryByDate(cusip, investmentOpinionList.join(','), startDate, endDate));
        } else {
            observables.push(of({}));
        }

        if (targetPriceList && targetPriceList.length > 0) {
            observables.push(this.priceChartService.getListHistoryByDate(cusip, targetPriceList.join(','), startDate, endDate));
        } else {
            observables.push(of({}));
        }
        observables.push(this.priceChartService.getTradesData(portfolio, cusip, startDate, endDate));
        return observables;
    }

    /**
     * Update price chart wrt new stockPriceChartOptions
     * @param event
     */
    onStockPriceChartOptionsChanged($event: StockPriceChartOptions) {
        this.loadStockPriceChart($event, this.startDate, this.endDate);
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 5000);
    }

    /**
     * Close price chart modal
     */
    closeModal(): void {
        this.isOpen = false;
        this.modalClosed.emit();
    }
}
