import {
    AuxSelectOption,
    AuxSelectSelectionChangedDetailInterface,
    AuxTextInputValueChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {AddPortfolioService} from '../add-portfolio.service';
import {NumberUtils} from '@utils/number.utils';
import {cloneDeep, isEmpty, isNil, isUndefined} from 'lodash';
import {AdhocPortParams} from '@models/portfolio/adhocModelling/adhoc-port-params.model';
import {DefinitionsStore} from '@stores/index';
import {AdhocPortfolio} from '@models/portfolio/adhoc-portfolio.model';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {AdhocPortGroup} from '@models/portfolio/adhoc-portgroup.model';
import {SecurityRule} from '@models/portfolio/tradeRules/security-rule.model';
import {catchError, map, takeUntil} from 'rxjs/operators';
import {PortfolioService} from '@services/portfolio';
import {CompositionUtils} from '@utils/composition.utils';
import {NotificationService} from '@services/notification';
import {AllRules} from '@interfaces/all-rules.interface';
import {RuleUnit} from '@enums/rule-unit.enum';
import {
    CalendarDateUtils,
    ColumnConfig,
    ColumnConstants,
    DateValue,
    ErrorTypeConstants,
    ExploreSelectOption,
    ExploreSelectOptionGroup,
    ModellingColumn,
    SubscribableComponent,
    TelemetryActionConstants,
    TelemetryCustomPortfolioTrackingParameters,
    TelemetryService,
    TelemetryUtil,
    UIErrorParameters
} from '@blk/explore-ui-core';
import {PortfolioRule} from '@models/portfolio/tradeRules/portfolio-rule.model';
import {ModellingType} from '@enums/modelling-type.enum';
import {SecuritySearchComponent} from '../../index';
import {NewPortfolioHoldingChange} from '@models/portfolio/composition/new-portfolio-holding-change.model';
import {CommonConstants} from '@constants/common.constants';
import {Benchmark} from '@models/portfolio/benchmark.model';
import {Observable} from 'rxjs';
import {BenchmarkConstants} from '@constants/benchmark.constants';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';

/**
 * Modal component that allows a user to create a custom portfolio and add their own securities
 * @example
 * <ng-container *ngIf="isCustomPortfolioModalOpen">
 *     <app-custom-portfolio-modal [isOpen]="isCustomPortfolioModalOpen"
 *                             (modalClosed)="closeCustomPortfolioModal()">
 *     </app-custom-portfolio-modal>
 * </ng-container>
 */
@Component({
    selector: 'app-add-custom-portfolio',
    templateUrl: './add-custom-portfolio.component.html',
    styleUrls: ['./add-custom-portfolio.component.scss']
})
export class AddCustomPortfolioComponent extends SubscribableComponent implements OnInit {

    @ViewChild('securitySearch', {static: false}) securitySearch: SecuritySearchComponent;

    // variables to control modal open/close event
    @Output() modalClosed = new EventEmitter();
    @Input() isOpen: boolean;

    telemetryStats: TelemetryCustomPortfolioTrackingParameters[] = [];

    // contains processed and skipped rules of a custom portfolio
    rules: AllRules;

    // List of currencies displayed in select
    currencyOptions: ExploreSelectOptionGroup[];

    // sets text in notional market value input
    portNMV: string;

    adhocPortParams = new AdhocPortParams({date: CalendarDateUtils.getDefaultDateObject()});

    customPortfolio: AdhocPortfolio|AdhocPortGroup;

    modelingColumn: ColumnConfig;
    readonly ModellingType = ModellingType;
    modellingType: number;
    showModellingTypes = true;
    modelingCategories: Record<string, number[]>; // Categories and options holder
    isAddButtonEnabled = false;
    showCalculateNAVOption = false;
    isCalculateNAVDisabled = true;
    addedPortfoliosTypeToCountMap: Map<string, number> = new Map();
    benchmark: Benchmark;

    constructor(public addPortfolioService: AddPortfolioService, private portfolioService: PortfolioService, private notificationService: NotificationService, private cdRef: ChangeDetectorRef) {
        super();
    }

    /**
     * Initialize custom portfolio creation
     */
    ngOnInit(): void {
        this.currencyOptions = this.formatCurrencyOptions(DefinitionsStore.currency);
        this.modelingCategories = CompositionUtils.getModellingCategories(null, true);
    }

    /**
     * Enable add button if there is a custom portfolio to add
     */
    updateAddCustomPortfolioButtonEnabled(): void {
        this.isAddButtonEnabled =  this.adhocPortParams.isValid()
            && ((!isEmpty(this.addPortfolioService.selectedSecurities) && this.isValidSecurityExist()) || !isEmpty(this.addPortfolioService.selectedPortfolioTickers) || this.isValidFactorToExposureMap());
    }

    private isValidFactorToExposureMap(): boolean {
        if (isEmpty(this.addPortfolioService.factorToExposureMap)) {
            return false;
        }
        return Array.from(this.addPortfolioService.factorToExposureMap.values()).findIndex(exposureObj => isUndefined(exposureObj.exposureValue)) === -1;
    }

    /**
     * validate the selected Securities for errors
     */
    isValidSecurityExist(): boolean {
        return Array.from(this.addPortfolioService.selectedSecurities.values()).filter(security => !security.error).length > 0;
    }

    /**
     * Function to add custom portfolio to selectedPortfolioList
     */
    addCustomPortfolioToSelectedPortfolioList(): Observable<WhatIfPortfolio> {
        if (isNil(this.adhocPortParams.fullName)) {
            this.adhocPortParams.fullName = this.adhocPortParams.name;
        }
        if (this.modellingType === ModellingType.PORTFOLIO) {
            this.customPortfolio = new AdhocPortGroup(this.adhocPortParams.name, this.adhocPortParams.date, this.adhocPortParams);
        } else {
            // Setting the benchmark before initializing it again
            this.benchmark = this.customPortfolio.benchmark;
            this.customPortfolio = new AdhocPortfolio(this.adhocPortParams.name, this.adhocPortParams.date, this.adhocPortParams);
        }
        this.customPortfolio.modellingType = this.modellingType;  // update the modelling type
        this.customPortfolio.adhocParams.isPortGroup = this.customPortfolio.modellingType === ModellingType.PORTFOLIO;
        this.customPortfolio.benchmark = this.benchmark; // setting the custom portfolio benchmark
        if (this.customPortfolio instanceof PortfolioWithPositions && this.customPortfolio.isFactorExposureBasedComposition()) {
            this.customPortfolio.factorExposureCompositionSetting.factorToExposureMap = cloneDeep(this.addPortfolioService.factorToExposureMap);
        }
        this.cdRef.detectChanges();
        const securityRules: (SecurityRule | PortfolioRule)[] = [];
        // convert securities into rules
        this.addPortfolioService.selectedSecurities.forEach(security => {
            if (!security.error) {
                securityRules.push(security.isPort
                    ? new PortfolioRule(security.cusip, security.newValue, RuleUnit[this.modelingColumn.columnTag.toUpperCase()], security['id'], security['portfolioType'], true)
                    : new SecurityRule(security.cusip, security.newValue, RuleUnit[this.modelingColumn.columnTag.toUpperCase()], true)
                );
            }
        });
        // return if there is no valid rule to process or if there are no factors present in factorToExposure map
        if (securityRules.length === 0 && this.addPortfolioService.factorToExposureMap.size === 0) {
            return;
        }
        return this.portfolioService.fetchPortfolioInformation$(this.customPortfolio, { isLightVersion: true, includeMandate: true }, undefined, this.adhocPortParams, securityRules)
            .pipe(takeUntil(this.ngUnsubscribe),
                map((port: WhatIfPortfolio) => {
                    let portfolioToReturn;
                    // if there's any security that could not be processed / any skippedRules, show notification error on the screen
                    // otherwise, add portfolio ticker to selected portfolios and portfolio to adhocPortfoliosList
                    const processedRules = CompositionUtils.calculatePassedRules(securityRules, port.skippedRulesForEachDate);
                    this.customPortfolio.addHoldingChangesForAddedSecurities();
                    if ((processedRules.length === securityRules.length && port.holdingChanges.length > 0) || port.modellingType === ModellingType.EXPOSURE) {
                        if (port instanceof AdhocPortGroup) {
                            port.compositionRules.tradeRules = securityRules;
                        }
                        this.addPortfolioService.selectedPortfolioTickers.add(this.adhocPortParams);
                        this.addPortfolioService.adhocPortfoliosList.set(this.adhocPortParams, port);
                        portfolioToReturn = port;
                    } else if (processedRules.length > 0 && port.skippedRulesForEachDate.length > 0) {
                        this.notificationService.error('Some securities in ' + port.portName + ' could not be processed.', ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_FETCH_PORTFOLIO_INFORMATION_ERROR);
                        this.rules = {skippedRules: port.skippedRulesForEachDate, processedRules};
                        portfolioToReturn = new Error('Some securities in ' + port.portName + ' could not be processed.');
                    } else {
                        this.notificationService.error('Security in ' + port.portName + ' could not be processed.', ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_FETCH_PORTFOLIO_INFORMATION_ERROR);
                        this.rules = {skippedRules: port.skippedRulesForEachDate, processedRules};
                        portfolioToReturn = new Error('Securities in ' + port.portName + ' could not be processed.');
                    }
                    this.trackCustomPortfolioViaTelemetry(port);
                    return portfolioToReturn;
                }),
                catchError(error => {
                    this.notificationService.error(error, ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_FETCH_PORTFOLIO_INFORMATION_ERROR, true);
                    return error;
                }));
    }

    /**
     * Tracks type of custom portfolio created
     */
    trackCustomPortfolioViaTelemetry(port: WhatIfPortfolio): void {
        const customPortfolioType = TelemetryUtil.getTelemetricType(this.modellingType);
        const addedPortfoliosTypeToCountMap: Map<string, number> = new Map();
        port.holdingChanges.filter(change => change instanceof NewPortfolioHoldingChange)
            .forEach((change: NewPortfolioHoldingChange) => {
                const portfolioType = isNil(change.id) ? CommonConstants.PRODUCTION_PORTFOLIO : CommonConstants.WHAT_IF_PORTFOLIO;
                const count = addedPortfoliosTypeToCountMap.get(portfolioType);
                if (isNil(count)) {
                    addedPortfoliosTypeToCountMap.set(portfolioType, 1);
                } else {
                    addedPortfoliosTypeToCountMap.set(portfolioType, count + 1);
                }
            });
        this.telemetryStats.push(new TelemetryCustomPortfolioTrackingParameters({typeOfPortfolio: customPortfolioType,
            isCalculateNavUsed: false,
            isSecuritiesCleared: false ,
            hasOtherWhatIfs: port.holdingChanges?.some(change => change instanceof NewPortfolioHoldingChange && !isNil(change.id)),
            modellingColumnUsed: ModellingColumn[this.modelingColumn?.columnTag], // TODO: eventually modellingColumnUsed would have to be updated in telemetry parameters in graph event proto.
            addedPortfoliosTypeToCountMap
        }));
        this.telemetryStats.forEach(stats => {
            TelemetryService.track(TelemetryActionConstants.USER_BEHAVIOUR.CUSTOM_PORTFOLIO_STATS, stats);
        });
    }

    /**
     * Updates the ticker name of the custom portfolio
     */
    updatePortfolioName(event: CustomEvent<AuxTextInputValueChangedDetailInterface>): void {
        this.adhocPortParams.name = event.detail.value;
        this.updateAddCustomPortfolioButtonEnabled();
    }

    /**
     * Updates the full name of the custom portfolio
     */
    updatePortfolioFullName(event: CustomEvent<AuxTextInputValueChangedDetailInterface>): void {
        this.adhocPortParams.fullName = event.detail.value;
    }

    /**
     * Updates the notional market value of the custom portfolio
     */
    updatePortNotionalMV(event: CustomEvent<AuxTextInputValueChangedDetailInterface>): void {
        // validation performed later, when input loses focus
        this.portNMV = event.detail.value;
        this.updateAddCustomPortfolioButtonEnabled();
    }

    /**
     * Validates the input is a valid portfolio notional market value.  Clears input if invalid.
     */
    validatePortNotionalMV(): void {
        // try to parse the input into a valid number
        let parsedValue: number = NumberUtils.parseNumberString(this.portNMV);

        // must have a non-zero number
        if (!parsedValue || parsedValue === 0) {
            parsedValue = null;
        }

        // update displayed value with either parsedValue or clear if null
        this.portNMV = NumberUtils.commaSeparatedColumnFormatter((parsedValue) ? parsedValue.toString() : null);
        // save value
        this.adhocPortParams.portMktNotional = parsedValue;
        this.updateAddCustomPortfolioButtonEnabled();
        this.telemetryStats.forEach(stats => stats.isCalculateNavUsed = true);
    }

    /**
     * set this.updatedDate when the datepicker's value is changed
     */
    onDateChange(updatedDate: DateValue): void {
        this.adhocPortParams.date = updatedDate;
        if (this.customPortfolio) {
            this.customPortfolio.datePicker = new DateValue(updatedDate.serialize());
            this.portfolioService.isValidWhatIfBench(this.customPortfolio, this.customPortfolio.benchmark.portfolio);
        }
        this.updateCalculateNAVFlag();
    }

    /**
     * Updates the currency of the custom portfolio
     */
    updateCurrency(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.adhocPortParams.currency = (event.detail.value as AuxSelectOption).value;
        this.updateCalculateNAVFlag();
        this.updateAddCustomPortfolioButtonEnabled();
    }

    /**
     * Gets all the currencies and formats them into an object that can be used by the select box component
     */
    private formatCurrencyOptions(currencies: string[]): ExploreSelectOptionGroup[] {
        // set default currency
        this.adhocPortParams.currency = currencies[0];
        return [new ExploreSelectOptionGroup(currencies.map(currency => new ExploreSelectOption(
            currency, currency, currency === this.adhocPortParams.currency))
        )];
    }

    /**
     * Updates the selected modeling column
     */
    onModelingColumnUpdated(selectedColumn: ColumnConfig) {
        this.modelingColumn = selectedColumn;
        this.showCalculateNAVOption = selectedColumn.columnTag !== ColumnConstants.PCT_NOTIONAL_MARKET_VAL;
    }

    /**
     * Sets the modelling type
     * @param type
     */
    setModellingType(type: number): void {
        this.modellingType = type;
        this.showModellingTypes = false;
        if ( this.modellingType === ModellingType.POSITION || this.modellingType === ModellingType.EXPOSURE) {
            this.customPortfolio = new AdhocPortfolio(this.adhocPortParams.name, this.adhocPortParams.date);
            // Initializing benchmark as none
            this.benchmark = Benchmark.create(BenchmarkConstants.NONE_BENCH);
            this.customPortfolio.benchmark = this.benchmark;
        }
    }

    /**
     * updates portNMV when NMV is returned from security-search
     * @param portNMV
     */
    onPortNMVChanged(portNMV: string) {
        this.portNMV = portNMV;
        this.validatePortNotionalMV();
    }

    private updateCalculateNAVFlag() {
        if (this.addPortfolioService.selectedSecurities.size !== 0 && this.modelingColumn.columnTag !== ColumnConstants.PCT_NOTIONAL_MARKET_VAL) {
            this.isCalculateNAVDisabled = false;
        }
    }
}
