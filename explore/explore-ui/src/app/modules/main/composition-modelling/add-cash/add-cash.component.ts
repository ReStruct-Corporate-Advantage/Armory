import {AuxTextInputValueChangedDetailInterface} from '@blk/aladdin-angular-components';
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NumberUtils} from '@utils/number.utils';
import {NotificationService} from '@services/notification';
import {CompositionConstants} from '@constants/composition.constants';
import {NAVSecurityRule} from '@models/portfolio/tradeRules/nav-security-rule.model';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {DefinitionsStore, WorkspaceStore} from '../../../../stores';
import {
    ErrorTypeConstants,
    ExplorePortfolioTypeEnum,
    ExploreSelectOption,
    ExploreSelectOptionGroup,
    TelemetryActionConstants,
    TelemetryService,
    UIErrorParameters,
    TelemetryWhatIfPortfolioTrackingParameters
} from '@blk/explore-ui-core';
import {isEmpty} from 'lodash';
import {AddCashTradeRules} from '@interfaces/add-cash-trade-rules.interface';
import {ProRateCashRule} from '@models/portfolio/tradeRules/prorate-cash-rule.model';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {PortfolioNavSecurityRule} from '@models/portfolio/tradeRules/portfolio-nav-security-rule.model';
import {ModellingType} from '@enums/modelling-type.enum';

@Component({
    selector: 'app-add-cash',
    templateUrl: './add-cash.component.html',
    styleUrls: ['./add-cash.component.scss']
})

/**
 * Composition Add Cash Component
 */
export class AddCashComponent implements OnInit {
    @Input() portfolio: WhatIfPortfolio;
    @Input()  disableProRataOption: boolean;

    @Output() showCompositionTable = new EventEmitter<AddCashTradeRules>();

    newCashValue: string;
    cusip: string;
    currencyOptions: ExploreSelectOptionGroup[];
    selectedCurrency: string;
    addToPortfolio: string;
    helpText: string = CompositionConstants.DISABLED_PRO_RATA_CASH;

    constructor(private notificationService: NotificationService) {
    }

    ngOnInit(): void {
        // Set available currency types- static data
        this.selectedCurrency = this.portfolio.currency;
        this.addToPortfolio = this.portfolio.portName;
        this.currencyOptions = [new ExploreSelectOptionGroup(DefinitionsStore.currency.map(currency => new ExploreSelectOption(currency, currency, currency === this.selectedCurrency)))];
    }

    /**
     * Action taken when the currency is changed
     */
    onCurrencyChange(currency: string): void {
        if (currency && currency !== this.selectedCurrency) {
            this.selectedCurrency = currency;
        }
    }

    /**
     * Method called when addToPortfolio is changed
     */
    onAddToPortfolioChanged(changedPortfolio: string): void {
        this.addToPortfolio = changedPortfolio;
    }

    /**
     * Parses and displays the inputted cash value in a readable format
     */
    parseCashValue(): void {
        try {
            const parsedValue = NumberUtils.parseNumberString(this.newCashValue);
            // Display the comma separated value for readability
            this.newCashValue = parsedValue.toLocaleString();
        } catch (err) {
            this.newCashValue = '';
            // Display error notification in case of invalid input
            this.notificationService.error('Invalid value inserted.', ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_PARSE_CASH_VALUE_ERROR);
        }
    }

    /**
     * Creates a cash rule (keep as cash or pro rata) and applies it to the portfolio composition
     * Utilizes portfolio base currency
     */
    injectCash(): void {
        this.cusip = this.selectedCurrency + CompositionConstants.ModelCash.COMMITED_CASH_TICKER;
        this.trackViaTelemetry();
        const tradeRule = this.portfolio.modellingType === ModellingType.PORTFOLIO ? [new PortfolioNavSecurityRule(this.cusip,  NumberUtils.parseNumberString(this.newCashValue), this.portfolio.holdingChanges.length, this.selectedCurrency)] :
            [new NAVSecurityRule(this.cusip,  NumberUtils.parseNumberString(this.newCashValue), this.selectedCurrency, this.addToPortfolio)];
        this.showCompositionTable.emit({callbackFunction: this.checkForSkippedRules,
            tradeRule});
        // Reset new cash value
        this.newCashValue = '';
    }

    /**
     * Track click on Add cash via telemetry
     */
    trackViaTelemetry(): void {
        const telemetryWhatIfPortfolioTrackingParameters = new TelemetryWhatIfPortfolioTrackingParameters();
        telemetryWhatIfPortfolioTrackingParameters.typeOfPortfolio = WorkspaceStore.getCurrentPortfolio() instanceof PortfolioWithPositions ? ExplorePortfolioTypeEnum.POINT_IN_TIME_ANALYSIS : ExplorePortfolioTypeEnum.THROUGH_TIME_ANALYSIS_PORTFOLIO;
        TelemetryService.track(TelemetryActionConstants.USER_BEHAVIOUR.CLICK_ON_ADD_CASH, telemetryWhatIfPortfolioTrackingParameters);
    }

    injectProRataCash(): void {
        const portfolioName = WorkspaceStore.getCurrentPortfolio().portName;
        this.showCompositionTable.emit({callbackFunction: this.checkForSkippedRules, tradeRule: [new ProRateCashRule(NumberUtils.parseNumberString(this.newCashValue), this.selectedCurrency)]});
        // Reset new cash value
        this.newCashValue = '';
    }

    /**
     * checks the skipped rules and show error message if given rule is skipped
     */
    checkForSkippedRules = (): void => {
        if (!isEmpty(this.portfolio.skippedRulesForEachDate) && this.portfolio.skippedRulesForEachDate.find(rule => rule.lineItem === this.cusip)) {
            this.notificationService.error('Analytics not found for cash security - ' + this.cusip + '. Please try for a different date/currency.', ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_CHECK_FOR_SKIPPED_RULES_ERROR);
        }
    }

    /**
     * Updates the variable newCashValue to input entered
     */
    updateNewCashValue(event: CustomEvent<AuxTextInputValueChangedDetailInterface>): void {
        this.newCashValue = event.detail.value;
    }
}


