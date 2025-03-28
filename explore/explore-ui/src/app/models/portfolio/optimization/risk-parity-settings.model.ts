import {RiskParityCase} from '@enums/risk-parity-case.enum';
import {CustomFilter} from '@blk/explore-ui-breakdown';
import {AbstractFavoriteConfig, FavoriteDisplayEnum, SerializeFavoriteType} from '@blk/explore-ui-core';
import {cloneDeep, isEmpty, isObject} from 'lodash';
import {ObjectiveSettings} from '@models/portfolio/objectives/objective.settings.model';
import {InvestmentUniverseSettings} from '@models/portfolio/investmentUniverse/investment-universe-settings.model';
import {TierDefinition} from '@models/portfolio/optimization/tier-definition.model';
import {PortfolioObjective} from '@models/portfolio/objectives/portfolio-objective.model';
import {FavoriteConstants} from '@constants/favorite.constants';
import {Security} from '@interfaces/security.interface';

/**
 * Model class for representing a entire set of Risk Parity settings
 */
export class RiskParitySettings extends AbstractFavoriteConfig {

    riskParityCase: RiskParityCase = RiskParityCase.ABSOLUTE;
    filter: CustomFilter = new CustomFilter();
    objectiveSettings: ObjectiveSettings = new ObjectiveSettings();
    investmentUniverseSettings: InvestmentUniverseSettings = new InvestmentUniverseSettings();
    tierDefinitions: TierDefinition = new TierDefinition();
    securityConstraints: Map<string, Security> = new Map<string, Security>();
    isModified: boolean;

    /**
     * Constructor.
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Gets the config type.
     */
    static get configType(): string {
        return FavoriteConstants.RISK_PARITY_SETTINGS;
    }

    /**
     * Gets the favorite type for this config.
     */
    protected getConfigType(): string {
        return RiskParitySettings.configType;
    }

    /**
     * This function is used to serialize the optimization favorite.
     */
    protected doSerialize(isNested?: boolean | SerializeFavoriteType): any {
        const dataToSave = {
            riskParityCase: this.riskParityCase,
            investmentUniverseSettings: this.investmentUniverseSettings.serialize(),
            objectiveSettings: this.objectiveSettings.serialize(isNested),
            tierDefinitions: this.tierDefinitions.serialize(isNested),
            ...(!this.filter?.isFilterEmpty() ? {filter: this.filter.serialize(isNested)} : {}),
            securityConstraints: {}
        };
        if (!isEmpty(this.securityConstraints)) {
            dataToSave.securityConstraints = Object.fromEntries(this.securityConstraints);
        }
        return dataToSave;
    }

    /**
     * This function is used to deserialize the optimization favorite.
     */
    protected doDeserialize(data: any): void {
        // Get out of here if there is no data.
        if (!data) {
            return;
        }
        if (data.filter && !isEmpty(Object.keys(data.filter))) {
            if (!this.filter) {
                this.filter = new CustomFilter();
            }
            this.filter.deserialize(data.filter);
        }
        this.investmentUniverseSettings.deserialize(data.investmentUniverseSettings);
        this.objectiveSettings.deserialize(data.objectiveSettings);
        this.riskParityCase = data.riskParityCase;
        this.tierDefinitions.deserialize(data.tierDefinitions);
        if (!isEmpty(data.securityConstraints)) {
            this.securityConstraints = new Map(Object.entries(data.securityConstraints));
        }
    }

    /**
     * Function to cloneDeep the contents of another config object into this one.
     */
    protected doCopyFrom(source: AbstractFavoriteConfig): void {
        if (!(source instanceof RiskParitySettings)) {
            return;
        }

        this.investmentUniverseSettings = cloneDeep(source.investmentUniverseSettings);
        this.objectiveSettings = cloneDeep(source.objectiveSettings);
        this.filter = cloneDeep(source.filter);
        this.riskParityCase = cloneDeep(source.riskParityCase);
        this.tierDefinitions = cloneDeep(source.tierDefinitions);
        this.securityConstraints = cloneDeep(source.securityConstraints);
    }

    /**
     * Return false if the passed in optimization settings is not equal to this
     */
    equals(otherRiskParitySettings: RiskParitySettings): boolean {
        if (!this.objectiveSettings.equals(otherRiskParitySettings.objectiveSettings)) {
            return false;
        }
        if (!this.investmentUniverseSettings.equals(otherRiskParitySettings.investmentUniverseSettings)) {
            return false;
        }
        if (this.riskParityCase !== otherRiskParitySettings.riskParityCase) {
            return false;
        }
        if (!this.filter.equals(otherRiskParitySettings.filter)) {
            return false;
        }
        if (!this.tierDefinitions.equals(otherRiskParitySettings.tierDefinitions)) {
            return false;
        }
        if (this.securityConstraints?.size !== otherRiskParitySettings.securityConstraints?.size && Array.from(this.securityConstraints?.keys()).every((key) => this.securityConstraints.get(key) !== otherRiskParitySettings.securityConstraints.get(key))) {
            return false;
        }
        return true;
    }

    /**
     * Adding a default objective.
     */
    setDefaultObjective() {
        this.objectiveSettings.riskParityEnabled = true;
        this.objectiveSettings.portfolioObjectives.push(new PortfolioObjective());
        this.objectiveSettings.portfolioObjectives[0].weight = 1.0;
        this.objectiveSettings.portfolioObjectives[0].key = 'MINIMIZE_IDIO_RISK';
        this.objectiveSettings.portfolioObjectives.push(new PortfolioObjective());
        this.objectiveSettings.portfolioObjectives[1].weight = 1.0;
        this.objectiveSettings.portfolioObjectives[1].key = 'MINIMIZE_SYSTEMATIC_RISK';
    }

    getDisplayType(parent?: any): FavoriteDisplayEnum {
        return FavoriteDisplayEnum.RISK_PARITY_SETTINGS;
    }
}
