import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {takeUntil} from 'rxjs/operators';
import {UntypedFormGroup} from '@angular/forms';
import {ExplorePortfolioSearchService} from '../../../../shared/services';
import {InvestmentUniverseItemBase} from '@models/portfolio/investmentUniverse/investment-universe-item-base.model';
import {AuxCheckboxChangedDetailInterface, AuxSelectOption, AuxSelectOptionGroup, AuxSelectSelectionChangedDetailInterface, AuxTextInputValueChangedDetailInterface} from '@blk/aladdin-angular-components';
import {InvestmentUniverseConstants} from '@constants/investment-universe.constants';
import {InvestmentUniversePortfolio} from '@models/portfolio/investmentUniverse/investment-universe-portfolio.model';
import {PortfolioSearchComponent, PortfolioSearchItem} from '@blk/explore-ui-portfolio-search';
import {UNIVERSE_CHECK, UNIVERSE_SEARCH} from '../constants/investment-universe-settings.constants';
import {AddPortfolioTrackingParameters, AddPortSource, CalendarDateUtils, DateValue, SubscribableComponent, TelemetryActionConstants, TelemetryService} from '@blk/explore-ui-core';
import {CustomFilter} from '@blk/explore-ui-breakdown';

@Component({
    selector: 'app-investment-universe-form',
    templateUrl: './investment-universe-form.component.html',
    styleUrls: ['./investment-universe-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvestmentUniverseFormComponent extends SubscribableComponent implements OnInit, AfterViewInit {
    @Input() parent: UntypedFormGroup;

    @Input() investmentUniverseSetting: InvestmentUniverseItemBase;

    @Input() index: number;

    @Output() removeItem = new EventEmitter<number>();

    @Output() universeTypeChanged = new EventEmitter<number>();

    @ViewChild('portSearchComp', {static: false}) portSearchComp: PortfolioSearchComponent;

    universeCheckData = [{label: '', checked: true, disabled: false}];

    selectData: AuxSelectOptionGroup[] = [
        {
            values: [
                {displayValue: InvestmentUniverseConstants.PORTFOLIO, isSelected: true},
                {displayValue: InvestmentUniverseConstants.SECURITY}
            ]
        }
    ];

    isSecuritySearchModalOpened: boolean;

    /* copy enum to allow usage in template */
    readonly addPortSourceEnum = AddPortSource.INVESTMENT_UNIVERSE_FORM;
    readonly PORTFOLIO: string = 'Portfolio';

    constructor(public portfolioSearchService: ExplorePortfolioSearchService, private cdRef: ChangeDetectorRef) {
        super();
    }

    ngOnInit() {
        this.parent
            .get(UNIVERSE_SEARCH)
            .valueChanges.pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((value: string) => {
                this.investmentUniverseSetting.label = value;
            });

        this.parent
            .get(UNIVERSE_CHECK)
            .valueChanges.pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((value: boolean) => {
                this.investmentUniverseSetting.enabled = value;
                this.cdRef.detectChanges();
            });
    }

    ngAfterViewInit(): void {
        if (this.investmentUniverseSetting instanceof InvestmentUniversePortfolio) {
            this.portSearchComp.searchString = this.investmentUniverseSetting.portfolio;
        }
        if (this.investmentUniverseSetting.type === InvestmentUniverseConstants.SECURITY) {
            this.selectData[0].values[0].isSelected = false;
            this.selectData[0].values[1].isSelected = true;
        }

        this.cdRef.detectChanges();
    }

    onEnableUniverseItem(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        this.parent.get(UNIVERSE_CHECK).setValue(event.detail.value.checked);
    }

    onUniverseItemTextChange(event: CustomEvent<AuxTextInputValueChangedDetailInterface>): void {
        this.investmentUniverseSetting.label = event.detail.value;
    }

    onUniverseTypeChange(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        if (!event.detail || (event.detail.value as AuxSelectOption).displayValue === this.investmentUniverseSetting.type) {
            return;
        }

        this.universeTypeChanged.emit(this.index);
    }

    onPortfolioSelected(searchItem: PortfolioSearchItem): void {
        this.parent.get(UNIVERSE_SEARCH).setValue(searchItem.ticker);
        if (this.investmentUniverseSetting instanceof InvestmentUniversePortfolio) {
            this.investmentUniverseSetting.portfolio = searchItem.ticker;
        }
    }

    /**
     * Track portfolio with Telemetry
     */
    trackPortfolioTelemetry(portfolioSearchItem: PortfolioSearchItem): void {
        const dateObjectToUse: DateValue = CalendarDateUtils.getDefaultDateObject();
        const portfolioTrackingParams = new AddPortfolioTrackingParameters(
            portfolioSearchItem.ticker,
            dateObjectToUse.date,
            portfolioSearchItem.type === this.PORTFOLIO ? 1 : 0,
            this.addPortSourceEnum);
        TelemetryService.track(
            TelemetryActionConstants.PORTFOLIO.ADD_PORTFOLIO,
            portfolioTrackingParams
        );
    }

    onPortfolioSelectedTypeahead(ticker: string) {
        // this has to be done as there is neither any specific event which gets fired from the onSearchSelectionChanged
        // nor the field portfolioSearchItem is visible.
        // Only set portfolio in case of a valid portfolio
        if (!!(this.portSearchComp as any).isTypeaheadOptionSelected) {
            this.parent.get(UNIVERSE_SEARCH).setValue(ticker);
            (this.investmentUniverseSetting as InvestmentUniversePortfolio).portfolio = ticker;
        }
    }

    launchSecuritySearchModal() {
        this.isSecuritySearchModalOpened = true;
    }

    onSecuritySearchModalClosed() {
        this.isSecuritySearchModalOpened = false;
    }

    onFilterUpdate(customFilter: CustomFilter): void {
        (this.investmentUniverseSetting as InvestmentUniversePortfolio).filter = customFilter;
    }
}
