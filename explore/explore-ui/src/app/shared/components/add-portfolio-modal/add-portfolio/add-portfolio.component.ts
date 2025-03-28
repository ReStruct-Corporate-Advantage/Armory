import {ChangeDetectorRef, Component, EventEmitter, Input, Output} from '@angular/core';
import {ExplorePortfolioSearchService} from '@services/explore-portfolio-search/explore-portfolio-search.service';
import {AddPortfolioService} from '../add-portfolio.service';
import {PortfolioSearchItem} from '@blk/explore-ui-portfolio-search';
import {
    AddPortfolioTrackingParameters,
    AddPortSource,
    CalendarDateUtils,
    DateValue,
    TelemetryActionConstants,
    TelemetryService
} from '@blk/explore-ui-core';
import {isEmpty} from 'lodash';
import {FileParsingLogicParams} from '@services/upload/file-parsing-logic-params.interface';
import {AuxButtonTypeEnum} from '@blk/aladdin-angular-components';
import {QuickImportConfig} from '../../quick-import/quick-import.component';

@Component({
    selector: 'app-add-portfolio',
    templateUrl: './add-portfolio.component.html',
    styleUrls: ['./add-portfolio.component.scss']
})
export class AddPortfolioComponent {

    // Flag to track when portfolio search bar is empty.  Used to disable add button
    isSearchFieldEmpty = true;

    @Input() allowPortUpload = false;
    @Input() uploadFileParsingLogic: FileParsingLogicParams;

    @Output() searchInputChanged = new EventEmitter<string>();
    @Output() portfolioRemoved = new EventEmitter<PortfolioSearchItem>();
    @Output() allPortfoliosRemoved = new EventEmitter<void>();

    showUploadScreen = false;
    //This is specific to when we want to add portfolios while scheduling a job
    importConfig: QuickImportConfig = {
        title: 'Bulk Upload Portfolios',
        caption : 'Add portfolios by pasting from a spreadsheet or uploading a CSV file',
        tooltip: 'Please import a list of portfolio tickers in a single column without any header rows.',
        dataFormat: [['Portfolio Ticker 1'], ['Portfolio Ticker 2'], ['Portfolio Ticker 3']]
    };

    /**
     * constructor
     */
    constructor(public portfolioSearchService: ExplorePortfolioSearchService, private addPortfolioService: AddPortfolioService,
            private cdRef: ChangeDetectorRef) {
    }

    /**
     * Add the portfolio search item to the selectedPortTickerList
     * @param portfolioSearchItem The searched item/portfolio to add
     */
    onAddPortfolioToSelectedListOfPortfolios = (portfolioSearchItem: PortfolioSearchItem): void => {
        this.addPortfolioService.selectedPortfolioTickers.add(portfolioSearchItem);
        this.isSearchFieldEmpty = true;
        this.searchInputChanged.emit(portfolioSearchItem.ticker);
    };

    /**
     * Track portfolio with Telemetry
     */
    trackPortfolioTelemetry(portfolioSearchItem: PortfolioSearchItem): void {
        const dateObjectToUse: DateValue = CalendarDateUtils.getDefaultDateObject();
        const portfolioTrackingParams = new AddPortfolioTrackingParameters(
            portfolioSearchItem.ticker,
            dateObjectToUse.date,
            1,
            AddPortSource.ADD_PORT_MODAL);
        TelemetryService.track(
            TelemetryActionConstants.PORTFOLIO.ADD_PORTFOLIO,
            portfolioTrackingParams
        );
    }

    /**
     * Called when the value typed in the portfolio search bar changes
     * @param searchTerm Value entered in portfolio search bar
     */
    onSearchValueChanged(searchTerm: string): void {
        this.isSearchFieldEmpty = isEmpty(searchTerm);
    }

    /**
     * Called when a portfolio is removed from the selected list
     * @param portfolio The removed portfolio
     */
    onPortfolioRemoved(portfolio: PortfolioSearchItem): void {
        this.portfolioRemoved.emit(portfolio);
    }

    /**
     * Called when all portfolios are removed from the selected list
     */
    onAllPortfoliosRemoved(): void {
        this.allPortfoliosRemoved.emit();
    }

    /**
     * callback for when data has been parsed
     */
    protected doWhenParsed(parsedData: string[][]): void {
        if (isEmpty(parsedData)) {
            return;
        }

        parsedData
            .map((element: string[]) => new PortfolioSearchItem(element[0]))
            .forEach((portfolioSearchItem: PortfolioSearchItem) => this.addPortfolioService.selectedPortfolioTickers.add(portfolioSearchItem));

        this.cdRef.markForCheck();
    }

    uploadPortfolios() {
       this.showUploadScreen = true;
    }

    hideUploadScreen() {
        this.showUploadScreen = false;
    }

    protected readonly AuxButtonTypeEnum = AuxButtonTypeEnum;
}
