import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {
    AcrmRequestLevelChangeEventDetailsKey,
    DataRequestLevel,
    EventType,
    ExploreSelectOption,
    ExploreSelectOptionGroup,
    SubscribableComponent,
    TelemetryActionConstants,
    TelemetryGenericEventParameters,
    TelemetryService
} from '@blk/explore-ui-core';
import {
    AuxPopover,
    AuxSelectOption,
    AuxSelectOptionGroup,
    AuxSelectSelectionChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {WorkspaceStore} from '@stores/workspace.store';
import {switchMap, takeUntil, tap} from 'rxjs/operators';
import {PortfolioSecurity} from '@interfaces/portfolio-security.interface';
import {BehaviorSubject} from 'rxjs';
import { CommonConstants } from '@constants/common.constants';
import {CommitmentRiskFundInfoService} from '@services/commitment-risk/commitment-risk-fund-info.service';


/**
 * Component to show the edit options for ACRM display
 * When edit is clicked a dropdown with fund type options 'Porfolio' and 'Private Fund' and their respective workflows
 * If 'Portfolio' is chosen, the portfolio name is displayed
 * If 'Private Fund' is selected a dropdown with security description and cusips is shown
 * Inputs : Feed Security Options, label, selectedSecurity, portfolio
 */

/**
 * To use : <app-portfolio-or-fund-selector
 *                                 [portfolio]="portfolio"
 *                                 [securityOptions]="securityOptions"
 *                                 [selectedSecurity]="fundCusip"
 * </app-portfolio-or-fund-selector>
 */
@Component({
    selector: 'app-portfolio-or-fund-selector',
    templateUrl: './portfolio-or-fund-selector-component.html',
    styleUrls: ['./portfolio-or-fund-selector-component.scss']
})
export class PortfolioOrFundSelectorComponent extends SubscribableComponent implements OnInit {
    readonly APPLY_TEXT: string = 'Apply';
    readonly CANCEL_TEXT: string = 'Cancel';
    readonly securityGroup = 'FUND';
    readonly securityType = 'PRIVATE';

    @Input() label: string;
    @Input() selectedSecurity: string;
    @Input() portfolio: Portfolio;
    @Input() stressScenario: string;

    @Output() securitySelected = new EventEmitter<string>();

    @ViewChild('excludedFundsPopover', { static: false }) excludedFundsPopover: AuxPopover;


    fundTypeOptions = [new ExploreSelectOptionGroup()];
    fundTypeSelected: string;
    showPrivateFundSelection: boolean;
    fundCusip: string;
    showPortfolioAndFundSelection = false;
    securityOptions: AuxSelectOptionGroup[];
    response: PortfolioSecurity[];
    loadingPrivateFunds$ = new BehaviorSubject<boolean>(false);
    hasExcludedFund: boolean;
    isFundInfoDialogOpen = false;

    constructor(private commitmentRiskFundInfoService: CommitmentRiskFundInfoService, private changeDetectorRef: ChangeDetectorRef) {
        super();
    }

    /**
     * initialize the portfolio or fund dropdown selectors
     */
    ngOnInit(): void {
        // initialize the private fund security list
        WorkspaceStore.getCurrentPortfolio$()
            .pipe(
                takeUntil(this.ngUnsubscribe),
                tap(() => this.loadingPrivateFunds$.next(true)),
                switchMap((portfolio: Portfolio) =>
                    this.commitmentRiskFundInfoService.fetchPrivateFunds(portfolio, this.stressScenario).pipe(
                        tap({
                            next: (response) => {
                                this.securityOptions = this.createSecuritySelections(response);
                                this.changeDetectorRef.markForCheck();
                            },
                            error: (error) => {
                                console.error('Failed to fetch private funds:', error);
                            },
                            complete: () => {
                                this.loadingPrivateFunds$.next(false);
                            }
                        })
                    )
                )
            ).subscribe();

        this.fundTypeOptions[0].values.push(new ExploreSelectOption('Portfolio', 'PORTFOLIO', !this.selectedSecurity));
        this.fundTypeOptions[0].values.push(new ExploreSelectOption('Private Fund', 'PRIVATE', !!this.selectedSecurity));
        this.fundTypeSelected = !this.selectedSecurity ? 'Portfolio' : 'Private Fund';
        this.showPrivateFundSelection = !!this.selectedSecurity;
        this.fundCusip = this.selectedSecurity;
    }

    /**
     * selection changed event handler
     * @param event
     */
    onSecuritySelection(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        if (event?.detail?.value) {
            this.fundCusip = event?.detail?.value['value'];
        }
    }

    /**
     * OnFundTypeSelected
     * Holds the logic of showing the specific workflows for when 'Portfolio' or 'Private Fund' is selected
     * When the user picks 'Portfolio' we display the portfolio name and when the user picks 'Private Fund' we display the private fund selector
     */
    onFundTypeSelection(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        this.fundTypeSelected = (event.detail.value as AuxSelectOption).displayValue;
        if (this.fundTypeSelected === 'Private Fund') {
            this.openPrivateFundSelection();
        }
        if (this.fundTypeSelected === 'Portfolio') {
            this.showPrivateFundSelection = false;
            this.fundCusip = undefined;
        }
    }

    /**
     * Open the Private Fund selector dropdown
     */
    openPrivateFundSelection() {
        this.showPrivateFundSelection = true;
    }

    getSelectedPortfolioOrFundDisplay(): string {
        return this.fundTypeSelected === 'Private Fund' ? this.getPrivateFundDisplayValue(this.fundCusip || this.selectedSecurity) : this.portfolio?.portName;
    }

    getPrivateFundDisplayValue(privateFundCusip: string): string {
       const security = this.securityOptions?.find(item => item.values[0].value === privateFundCusip);
       return security?.values[0].displayValue;
    }

    /**
     * Open the selector dropdown component
     */
    openPortfolioAndFundSelection() {
        this.showPortfolioAndFundSelection = true;
    }

    /**
     * Holds logic for when 'Apply' or 'Cancel' is selected
     */
    closeOptions(applyButtonSelected: boolean) {
        // If cancel is selected we have to reset the widget to what it was previously
        if (!applyButtonSelected) {
            this.fundCusip = this.selectedSecurity;
            this.showPortfolioAndFundSelection = false;
        }
        //If apply is selected we have to track the telemetry data event for portfolio and privatefund
        else {
            TelemetryService.track(TelemetryActionConstants.GENERIC_EVENT, this.generateCustomLegendParameters());
        }
        // If apply is clicked, we have to refresh the widget with the new private fund/portfolio selection
        this.securitySelected.emit(this.fundCusip);
    }

    private generateCustomLegendParameters(): TelemetryGenericEventParameters {
        const parameters = new TelemetryGenericEventParameters(EventType.ACRM_DATA_SCOPE_CHANGE);
        //create telemetry parameter for Portfolio or Private Fund Selection
        if (this.fundTypeSelected === CommonConstants.PORTFOLIO) {
            parameters.details.set(AcrmRequestLevelChangeEventDetailsKey.DATA_REQUEST_LEVEL,  DataRequestLevel.PORTFOLIO);
            parameters.details.set(AcrmRequestLevelChangeEventDetailsKey.PORTFOLIO_OR_FUND_NAME, this.portfolio.portName);
        }
        else {
            parameters.details.set(AcrmRequestLevelChangeEventDetailsKey.DATA_REQUEST_LEVEL, DataRequestLevel.FUND);
            parameters.details.set(AcrmRequestLevelChangeEventDetailsKey.PORTFOLIO_OR_FUND_NAME, this.fundCusip);
        }
        return parameters;
    }

    /**
     * Open the excluded funds info modal
     */
    openExcludedFundsInfoModal() {
        this.isFundInfoDialogOpen = true;
        this.excludedFundsPopover?.close();
    }

    /**
     * Create security selections for selector and add secDesc to the privateFundDescription map so it can be displayed
     * @param data
     */
    private createSecuritySelections(data: { secDesc: any; cusip: any; isDisabled?: boolean }[]): AuxSelectOptionGroup[] {
        const options = [];
        if (data) {
            data.forEach(node => {
                if (node.isDisabled) {
                    this.hasExcludedFund = true;
                }
                const isSelected = this.selectedSecurity && this.selectedSecurity === node.cusip;
                options.push({values: [new ExploreSelectOption(node.secDesc + ' | ' + node.cusip, node.cusip, isSelected, node.isDisabled)]});
            });
        }
        return options;
    }

}
