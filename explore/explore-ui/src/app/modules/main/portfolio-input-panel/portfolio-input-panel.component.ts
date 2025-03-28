import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {cloneDeep, isEqual, isNil} from 'lodash';
import {takeUntil} from 'rxjs/operators';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {NotificationService, WorkpadService} from '../../../shared/services';
import {DefinitionsStore, WorkspaceStore} from '../../../stores';
import {AppStore} from '../../../app.store';
import {BehaviorSubject} from 'rxjs';
import {
    CoreCommonConstants,
    DateValue,
    ExploreSelectOption,
    ExploreSelectOptionGroup,
    SubscribableComponent,
    TokenConstants,
    TokenUtils
} from '@blk/explore-ui-core';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';

/**
 * Portfolio Input Panel Component
 *
 * @example
 *  <app-portfolio-input-panel></app-portfolio-input-panel>
 */
@Component({
    selector: 'app-portfolio-input-panel',
    templateUrl: './portfolio-input-panel.component.html',
    styleUrls: ['./portfolio-input-panel.component.scss']
})
export class PortfolioInputPanelComponent extends SubscribableComponent implements OnInit {
    isPortfolioSettingsModalOpen = false;

    portfolio: Portfolio;
    currencyOptions: ExploreSelectOptionGroup[];
    datePicker: DateValue;
    isPublishStateEnabled: boolean;
    isPortfolioSettingsDisabled$: BehaviorSubject<boolean>;
    isDateDisabled: boolean;

    @ViewChild('currencyDropdown', {static: false}) currencyDropdown;

    constructor(private workpadService: WorkpadService, private changeDetectorRef: ChangeDetectorRef, private notificationService: NotificationService) {
        super();
    }

    ngOnInit(): void {
        // Subscribe to the portfolio change
        WorkspaceStore.getCurrentPortfolio$()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((portfolio: Portfolio) => {
                    if (!isNil(portfolio) && portfolio !== this.portfolio) {
                        this.portfolio = portfolio;
                        this.currencyOptions = this.getCurrencyOptions(DefinitionsStore.currency);
                        this.datePicker = cloneDeep(this.portfolio.datePicker);
                        // disable date picker for portfolio with positions
                        this.isDateDisabled = this.portfolio instanceof PortfolioWithPositions;

                        // mark the component to rerender
                        this.changeDetectorRef.markForCheck();
                    }
                },
                // replace the console.log with a notification box
                (error: string) => {
                    console.error(error);
                });

        // Enable/Disable publish state based on token
        this.isPublishStateEnabled = TokenUtils.isFeatureEnabled(TokenConstants.ENABLE_PUBLISH_STATE);
        this.isPortfolioSettingsDisabled$ = AppStore.reportLoadingStatus$;
    }


    /**
     * Gets all the currencies and formats them into an object that can be used by the select box component
     * @param currencies List of all the currencies to put in the select, unordered
     * @returns List of currency options in the object form the select requires
     */
    private getCurrencyOptions(currencies: string[]): ExploreSelectOptionGroup[] {
        return [new ExploreSelectOptionGroup(currencies.map(currency => new ExploreSelectOption(currency, currency, currency === this.portfolio.currency)))];
    }

    /**
     * Action taken when the currency is changed
     */
    onCurrencyChange(currency: string): void {
        if (currency && currency !== this.portfolio.currency) {
            this.portfolio.currency = currency;
            this.notificationService.invokeWidgetReloadPrompt();
        }
    }

    /**
     * Action taken when the dropdown is closed without a currency input
     */
    onDropdownClosed(): void {
        this.currencyDropdown.el.inputValueRaw = CoreCommonConstants.EMPTY_STRING;
    }

    /**
     * Action taken when the date is changed
     * @param dateObject has the new date
     */
    onDateChange(dateObject: DateValue): void {
        // Only update the portfolio info if it was a true date change
        // This dateChange function is called during ng-change of the input
        // which could lead to it being called when changing portfolios
        if (!isEqual(this.portfolio.datePicker, dateObject)) {
            // We have asked for the updated portfolio info, but did not refreshed
            this.workpadService.updatePortInfoOnDateChange([this.portfolio], dateObject);
            // Provide a notification in report presenter with a reload button.
            this.notificationService.invokeWidgetReloadPrompt();
        }
    }

    /**
     * Open portfolio settings modal
     */
    openPortfolioSettingsModal(): void {
        this.isPortfolioSettingsModalOpen = true;
    }

    /**
     * Close portfolio settings modal, bound with emit event
     */
    closePortfolioSettingsModal(): void {
        this.isPortfolioSettingsModalOpen = false;
    }
}
