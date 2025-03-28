import {CompositionConstants} from '../../constants';
import {ModellingType} from '@enums/modelling-type.enum';
import {HoldingChange} from './composition/holding-change.model';
import {WhatIfPortfolio} from './what-if-portfolio.model';
import {OptimizationSettings} from './optimization/optimization-settings.model';
import {Portfolio} from './portfolio.model';
import {cloneDeep, isArray, isEmpty, isEqual, isNil} from 'lodash';
import {HoldingChangeFactory} from '../../factories/holding-change.factory';
import {AbstractFavoriteConfig, DateValue, FavoriteDisplayEnum, SerializeFavoriteType} from '@blk/explore-ui-core';
import {LatestOptimizationRunDetails} from '@models/portfolio/optimization/latest-optimization-run-details';
import {RiskParitySettings} from '@models/portfolio/optimization/risk-parity-settings.model';
import {OptimizationTypeEnum} from '@enums/optimization-type.enum';
import {FactorExposureCompositionSetting} from '@models/portfolio/composition/factor-exposure-composition-setting.model';

/**
 * Implementation class for What If Portfolio for a point in time analysis.
 */
export class PortfolioWithPositions extends WhatIfPortfolio {

    readonly HOLDING_CHANGES: string = 'holdingChanges';
    static readonly OPTO_FINAL_HOLDINGS: string = 'optoFinalHoldings';
    readonly HOLDING_CHANGES_GENERATED_FOR_ADDED_SECURITIES = 'holdingChangesGeneratedForAddedSecurities';
    readonly LATEST_OPTIMIZATION_RUN_DETAILS: string = 'latestOptimizationRunDetails';
    readonly DATE: string = 'date';

    date: string;
    optimizationSettings: OptimizationSettings = new OptimizationSettings();
    riskParitySettings: RiskParitySettings = new RiskParitySettings();
    latestOptimizationRunDetails: LatestOptimizationRunDetails[] = [];
    efficientFrontierCacheKey: string;
    iterationIndexList: number[] = [];
    portToUnderLyingPortsMap: Map<string, Set<string>> = new Map<string, Set<string>>();
    optimizationType: OptimizationTypeEnum;
    optoFinalHoldings: HoldingChange[] = [];
    factorExposureCompositionSetting: FactorExposureCompositionSetting = new FactorExposureCompositionSetting();

    static get configType(): string {
        return CompositionConstants.PORT_WITH_POSITIONS.TYPE;
    }

    constructor(ticker?: string, datePicker?: any, holdingChanges?: HoldingChange[], title?: string) {
        super(ticker, datePicker);
        if (datePicker) {
            this.date = datePicker.date;
        }
        if (holdingChanges) {
            this.holdingChanges = holdingChanges;
        }

        // This needs to be done here because title depends on date
        this.title = this.getDefaultTitle(title);
        this.modellingType = ModellingType.POSITION;
        this.updateOptimizationSettings();
    }

    get type(): string {
        return this.getConfigType();
    }

    /**
     * Add default objective if none exists
     */
    updateOptimizationSettings(): void {
        // If no objectives exist. Add a default one.
        if (!this.optimizationSettings.objectiveSettings.portfolioObjectives || this.optimizationSettings.objectiveSettings.portfolioObjectives.length === 0) {
            this.optimizationSettings.setDefaultObjective();
        }
        // If no objectives exist. Add a default one.
        if (!this.riskParitySettings.objectiveSettings.portfolioObjectives || this.riskParitySettings.objectiveSettings.portfolioObjectives.length === 0) {
            this.riskParitySettings.setDefaultObjective();
        }
    }

    /**
     * Get the default title for this what if portfolio
     */
    protected getDefaultTitle(title: string): string {
        return title ? title : this.portName + ' ' + this.date;
    }

    /**
     * Serialize holding changes and date
     */
    protected doSerialize(isNested?: boolean | SerializeFavoriteType): any {
        const serializedObj = super.doSerialize(isNested);
        if (!isEmpty(this.holdingChanges)) {
            serializedObj[this.HOLDING_CHANGES] = this.holdingChanges.map(holdingChange => holdingChange.serialize());
        }
        if (!isEmpty(this.optoFinalHoldings)) {
            serializedObj[PortfolioWithPositions.OPTO_FINAL_HOLDINGS] = this.optoFinalHoldings.map(holdingChange => holdingChange.serialize());
        }
        if (!isEmpty(this.holdingChangesGeneratedForAddedSecurities)) {
            serializedObj[this.HOLDING_CHANGES_GENERATED_FOR_ADDED_SECURITIES] = this.holdingChangesGeneratedForAddedSecurities.map(holdingChange => holdingChange.serialize());
        }
        if (!this.date) {
            this.date = this.datePicker.date;
        }
        if (!isEmpty(this.latestOptimizationRunDetails)) {
            serializedObj[this.LATEST_OPTIMIZATION_RUN_DETAILS] = this.latestOptimizationRunDetails.map(runDetails => runDetails?.serialize());
        }
        serializedObj[this.DATE] = this.date;
        serializedObj.optimizationType = this.optimizationType;
        serializedObj.optimizationSettings = this.optimizationSettings.serialize();
        serializedObj.riskParitySettings = this.riskParitySettings.serialize();
        // For port with positions we want to store the actual date and not a relative date since this is point in time portfolio
        serializedObj.datePicker.date = this.date;
        serializedObj.datePicker.dateString = false;
        serializedObj.datePicker.dateStringValue = '';
        serializedObj.iterationIndexList = [...this.iterationIndexList];

        if (this.isFactorExposureBasedComposition()) {
            const serializedFactorExposureCompositionSetting = this.factorExposureCompositionSetting.serialize();
            if (!isEmpty(serializedFactorExposureCompositionSetting)) {
                serializedObj.factorExposureCompositionSetting = serializedFactorExposureCompositionSetting;
            }
        }

        return serializedObj;
    }

    /**
     * Remove opto final holdings as well apart from the holding changes
     * Required since opto final holdings are referred while painting trades table
     * in case of optimization
     * @param holdingChangesToBeRetained
     */
    clearHoldingChanges(holdingChangesToBeRetained?: HoldingChange[]) {
        super.clearHoldingChanges(holdingChangesToBeRetained);
        this.optoFinalHoldings = [];
    }

    /**
     * Deserialize the holding changes and the date
     */
    protected doDeserialize(data: any): void {
        super.doDeserialize(data);
        if (!isEmpty(data[this.HOLDING_CHANGES])) {
            this.holdingChanges = data[this.HOLDING_CHANGES].map(holdingChange => HoldingChangeFactory.convertObjectToHoldingChange(holdingChange));
        }
        if (!isEmpty(data[PortfolioWithPositions.OPTO_FINAL_HOLDINGS])) {
            this.optoFinalHoldings = data[PortfolioWithPositions.OPTO_FINAL_HOLDINGS].map(holdingChange => HoldingChangeFactory.convertObjectToHoldingChange(holdingChange));
        }
        if (!isEmpty(data[this.HOLDING_CHANGES_GENERATED_FOR_ADDED_SECURITIES])) {
            this.holdingChangesGeneratedForAddedSecurities = data[this.HOLDING_CHANGES_GENERATED_FOR_ADDED_SECURITIES].map(holdingChange => HoldingChangeFactory.convertObjectToHoldingChange(holdingChange));
        }
        const rawRunDetails = data[this.LATEST_OPTIMIZATION_RUN_DETAILS];

        // deserialize runDetails, catering legacy as well.
        if (!isArray(rawRunDetails) && !isNil(rawRunDetails)) {
            this.latestOptimizationRunDetails.push(new LatestOptimizationRunDetails(rawRunDetails));
        } else if (isArray(rawRunDetails) && !isEmpty(rawRunDetails)) {
            rawRunDetails.forEach(runDetail => this.latestOptimizationRunDetails.push(new LatestOptimizationRunDetails(runDetail)));
        }
        this.date = data[this.DATE];
        if (this.date && (!this.datePicker || this.datePicker.date !== this.date)) {
            this.datePicker = new DateValue({
                date: this.date,
                dateString: false,
                dateStringValue: '',
                calCode: this.datePicker ? this.datePicker.calCode : ''
            });
        } else {
            this.date = this.datePicker?.date;
        }
        if (data.optimizationSettings) {
            this.optimizationSettings.deserialize(data.optimizationSettings);
        }
        if (data.riskParitySettings) {
            this.riskParitySettings.deserialize(data.riskParitySettings);
        }
        if (!isEmpty(data.iterationIndexList)) {
            this.iterationIndexList = [...data.iterationIndexList];
        }
        if (data.optimizationType) {
            this.optimizationType = data.optimizationType;
        }

        // Deserialize factor exposure map
        if (data.factorExposureCompositionSetting) {
            this.factorExposureCompositionSetting.deserialize(data.factorExposureCompositionSetting);
        }
    }

    /**
     * Matches the attributes with other PortfolioWithPositions portfolio
     */
    equals(obj: WhatIfPortfolio): boolean {
        if (!(obj instanceof PortfolioWithPositions)) {
            return false;
        }

        if (!super.equals(obj)) {
            return false;
        }

        if (this.date !== obj.date) {
            return false;
        }

        if ((!this.holdingChanges && obj.holdingChanges) || (this.holdingChanges && !obj.holdingChanges)) {
            return false;
        }

        if (this.holdingChanges.length !== obj.holdingChanges.length) {
            return false;
        }

        if ((!this.optoFinalHoldings && obj.optoFinalHoldings) || (this.optoFinalHoldings && !obj.optoFinalHoldings)) {
            return false;
        }

        if (this.optoFinalHoldings.length !== obj.optoFinalHoldings.length) {
            return false;
        }

        if (!this.riskParitySettings.equals(obj.riskParitySettings)) {
            return false;
        }

        for (let i = 0; i < this.holdingChanges.length; i++) {
            if (!isEqual(this.holdingChanges[i].serialize(), obj.holdingChanges[i].serialize())) {
                return false;
            }
        }

        for (let i = 0; i < this.optoFinalHoldings.length; i++) {
            if (!isEqual(this.optoFinalHoldings[i].serialize(), obj.optoFinalHoldings[i].serialize())) {
                return false;
            }
        }

        if (!this.factorExposureCompositionSetting.equals(obj.factorExposureCompositionSetting)) {
            return false;
        }

        return true;
    }

    protected doCopyFrom(source: AbstractFavoriteConfig): void {
        if (!(source instanceof Portfolio)) {
            return;
        }

        super.doCopyFrom(source);

        if (!(source instanceof PortfolioWithPositions)) {
            if (source.datePicker) {
                this.date = source.datePicker.date;
            }
            return;
        }

        this.date = cloneDeep(source.date);
        this.holdingChanges = cloneDeep(source.holdingChanges);
        this.optoFinalHoldings = cloneDeep(source.optoFinalHoldings);
        this.optimizationSettings = cloneDeep(source.optimizationSettings);
        this.riskParitySettings  = cloneDeep(source.riskParitySettings);
        this.latestOptimizationRunDetails = cloneDeep(source.latestOptimizationRunDetails);
        this.factorExposureCompositionSetting.copyFrom(source.factorExposureCompositionSetting);
    }

    addOptoFinalHoldings(holdingChanges: HoldingChange[]): void {
        this.optoFinalHoldings = this.addHoldingChangesToContainer(holdingChanges, this.optoFinalHoldings);
    }

    /**
     * This method adds request params for the PortfolioWithPositions
     */
    addRequestParams(requestParams: any): void {
        super.addRequestParams(requestParams);

        if (this.isFactorExposureBasedComposition()) {
            this.factorExposureCompositionSetting.addRequestParams(requestParams);
        }
    }

    /**
     * Get the type of What if portfolio to be used for favorite type
     */
    protected getConfigType(): string {
        return PortfolioWithPositions.configType;
    }

    getDisplayType(parent?: any): FavoriteDisplayEnum {
        return FavoriteDisplayEnum.PORT_WITH_POSITIONS;
    }

    /**
     * Custom description for portfolio with positions - portfolio name plus point in time date
     */
    protected getPortfolioName(): string {
        return super.getPortfolioName() + CompositionConstants.FAV_ID_DELIMITER + this.date;
    }
}
