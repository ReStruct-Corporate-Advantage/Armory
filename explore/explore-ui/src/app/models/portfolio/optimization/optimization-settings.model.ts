import {AbstractFavoriteConfig, FavoriteDisplayEnum, FavoriteType, SerializeFavoriteType} from '@blk/explore-ui-core';
import {OptimizationConstants} from '@constants/optimization.constants';
import {cloneDeep, find, isEmpty, isNil, isObject} from 'lodash';
import {DefinitionsStore} from '../../../stores';
import {Constraint} from '../constraints/constraint.model';
import {InvestmentUniverseSettings} from '../investmentUniverse/investment-universe-settings.model';
import {ObjectiveSettings} from '../objectives/objective.settings.model';
import {PortfolioObjective} from '../objectives/portfolio-objective.model';
import {AdvancedRiskSettings} from '@blk/explore-ui-risk';
import {Breakdown} from '@blk/explore-ui-breakdown';
import {ALL_TYPE, PORTFOLIO} from '@optimization-settings/constraints-settings/constants/sector-constraint.constants';
import {SUB_TYPE_SECTOR_CONSTRAINTS} from '@optimization-settings/constants/optimization-types.constants';
import {CompositionUtils} from '@utils/composition.utils';
import {isNotDeprecatedActiveSectorConstraint} from '@optimization-settings/constraints-settings/utils/constraint.utils';

/**
 * Model class for representing a entire set of Optimization settings
 */
export class OptimizationSettings extends AbstractFavoriteConfig {

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
        return FavoriteType.OPTO_SETTINGS;
    }

    mipTimeLimit: number;
    objectiveSettings: ObjectiveSettings = new ObjectiveSettings();
    investmentUniverseSettings: InvestmentUniverseSettings = new InvestmentUniverseSettings();
    portfolioConstraints: Constraint[] = [];
    securityConstraints: Constraint[] = [];
    sectorConstraints: Constraint[] = [];
    factorConstraints: Constraint[] = [];
    optimizationAdvancedRiskSettings: AdvancedRiskSettings = new AdvancedRiskSettings();
    efficientEnabledConstraints: Set<Constraint> = new Set<Constraint>();
    isEfficientFrontierEnabled = false;
    iterations = 10;
    iterationType = OptimizationConstants.MANUAL_ITERATION_TYPE;
    selectedYAxis: string;
    isModified: boolean;
    isFirstLoad = true;
    breakdownTree: Breakdown;

    /**
     * compares the 2 constraint lists
     * returns false if mismatch occurs at any point
     */
    static compareConstraints(constraints: Constraint[], otherConstraints: Constraint[]): boolean {
        for (let i = 0; i < constraints.length; i++) {
            if (!constraints[i].equals(otherConstraints[i])) {
                return false;
            }
        }
        return true;
    }

    /**
     * Gets the favorite type for this config.
     */
    protected getConfigType(): string {
        return OptimizationSettings.configType;
    }

    /**
     * This function is used to serialize the optimization favorite.
     */
    protected doSerialize(isNested?: boolean | SerializeFavoriteType): any {
        return {
            mipTimeLimit: this.mipTimeLimit,
            investmentUniverseSettings: this.investmentUniverseSettings.serialize(),
            objectiveSettings: this.objectiveSettings.serialize(),
            portfolioConstraints: this.serializeConstraints(this.portfolioConstraints, isNested),
            securityConstraints: this.serializeConstraints(this.securityConstraints, isNested),
            sectorConstraints: this.serializeConstraints(this.sectorConstraints, isNested),
            factorConstraints: this.serializeConstraints(this.factorConstraints, isNested),
            optimizationAdvancedRiskSettings: this.optimizationAdvancedRiskSettings.serialize(),
            // add iterations only if efficient frontier is enabled.
            ...(this.isEfficientFrontierEnabled && this.efficientEnabledConstraints.size > 0 ? {
                isEfficientFrontierEnabled: this.isEfficientFrontierEnabled,
                iterations: this.iterations,
                efficientEnabledConstraints: this.serializeConstraints(Array.from(this.efficientEnabledConstraints), isNested)
            } : {})
        };
    }

    /**
     * This function is used to deserialize the optimization favorite.
     */
    protected doDeserialize(data: any): void {
        // Get out of here if there is no data.
        if (!data) {
            return;
        }

        // The old favorites has an additional wrapper optimizationSettings, so just grab it out if it is there.
        if (data.optimizationSettings) {
            data = data.optimizationSettings;
        }

        // Deserialize the parts.
        this.mipTimeLimit = data.mipTimeLimit;

        this.investmentUniverseSettings.deserialize(data.investmentUniverseSettings);
        this.objectiveSettings.deserialize(data.objectiveSettings);
        this.portfolioConstraints = this.deserializeConstraints(data.portfolioConstraints);
        this.securityConstraints = this.deserializeConstraints(data.securityConstraints);
        this.sectorConstraints = this.deserializeConstraints(data.sectorConstraints);
        this.factorConstraints = this.deserializeConstraints(data.factorConstraints);
        this.optimizationAdvancedRiskSettings.deserialize(data.optimizationAdvancedRiskSettings);

        if (data.isEfficientFrontierEnabled && this.efficientEnabledConstraints.size > 0) {
            this.isEfficientFrontierEnabled = data.isEfficientFrontierEnabled;
            this.iterations = data.iterations;
        }
    }

    /**
     * Function to cloneDeep the contents of another config object into this one.
     */
    protected doCopyFrom(source: AbstractFavoriteConfig): void {
        if (!(source instanceof OptimizationSettings)) {
            return;
        }

        this.investmentUniverseSettings = cloneDeep(source.investmentUniverseSettings);
        this.objectiveSettings = cloneDeep(source.objectiveSettings);
        this.portfolioConstraints = cloneDeep(source.portfolioConstraints);
        this.securityConstraints = cloneDeep(source.securityConstraints);
        this.sectorConstraints = cloneDeep(source.sectorConstraints);
        this.factorConstraints = cloneDeep(source.factorConstraints);
        this.mipTimeLimit = cloneDeep(source.mipTimeLimit);
        this.isEfficientFrontierEnabled = cloneDeep(source.isEfficientFrontierEnabled);
        this.iterations = cloneDeep(source.iterations);
        this.efficientEnabledConstraints = cloneDeep(source.efficientEnabledConstraints);
        this.optimizationAdvancedRiskSettings = cloneDeep(source.optimizationAdvancedRiskSettings);
        this.selectedYAxis = cloneDeep(source.selectedYAxis);
    }

    /**
     * Serializes a list of constraints .
     */
    protected serializeConstraints(constraints: Constraint[], isNested?: boolean | SerializeFavoriteType): any[] {
        // If there are no constraints then get out of here with nothing.
        if (isEmpty(constraints)) {
            return undefined;
        }

        // Go through each of the constraints and serialize them.
        return constraints.map((item) => item.serialize(isNested));
    }

    /**
     * * Deserializes a list of constraints .
     */
    protected deserializeConstraints(data: any[]): Constraint[] {
        // If there are no constraints then get out of here.
        // Go through each of the constraints and deserialize them.
        return isEmpty(data)
            ? []
            : data.map((item) => {
                // check if constraint exists with constraintTag; and position type
                // NOTE: we check with positionType because we now send position type in the constraint
                let constraint: any = find(DefinitionsStore.optimizationConstraint, {
                    columnTag: item.constraintTag,
                    constraintType: item.constraintType,
                    uses: item.positionType
                });

                item = this.updateExistingConstraint(constraint, item);

                constraint = new Constraint(item);

                // check if constraint is efficient enabled
                if (CompositionUtils.checkIfConstraintInEfficientFormat(constraint)) {
                    this.efficientEnabledConstraints.add(constraint);
                }

                if (!isNotDeprecatedActiveSectorConstraint(constraint.positionType, constraint.constraintTag)) {
                    constraint.title += ' (DEPRECATED)';
                }

                return constraint;
            });
    }

    /**
     * Return false if the passed in optimization settings is not equal to this
     */
    equals(otherOptimizationSettings: OptimizationSettings): boolean {
        if (!this.objectiveSettings.equals(otherOptimizationSettings.objectiveSettings)) {
            return false;
        }
        if (!this.investmentUniverseSettings.equals(otherOptimizationSettings.investmentUniverseSettings)) {
            return false;
        }
        if (this.portfolioConstraints.length !== otherOptimizationSettings.portfolioConstraints.length) {
            return false;
        }
        if (this.securityConstraints.length !== otherOptimizationSettings.securityConstraints.length) {
            return false;
        }
        if (this.sectorConstraints.length !== otherOptimizationSettings.sectorConstraints.length) {
            return false;
        }
        if (this.factorConstraints.length !== otherOptimizationSettings.factorConstraints.length) {
            return false;
        }
        if (this.mipTimeLimit !== otherOptimizationSettings.mipTimeLimit) {
            return false;
        }

        if (this.isEfficientFrontierEnabled !== otherOptimizationSettings.isEfficientFrontierEnabled) {
            return false;
        }

        if (this.iterations !== otherOptimizationSettings.iterations) {
            return false;
        }

        if (this.selectedYAxis !== otherOptimizationSettings.selectedYAxis) {
            return false;
        }

        if (!this.optimizationAdvancedRiskSettings.equals(otherOptimizationSettings.optimizationAdvancedRiskSettings)) {
            return false;
        }

        // below calls should return false if any of the 2 lists are found to be unequal
        return OptimizationSettings.compareConstraints(this.portfolioConstraints, otherOptimizationSettings.portfolioConstraints) &&
            OptimizationSettings.compareConstraints(this.securityConstraints, otherOptimizationSettings.securityConstraints) &&
            OptimizationSettings.compareConstraints(this.sectorConstraints, otherOptimizationSettings.sectorConstraints) &&
            OptimizationSettings.compareConstraints(this.factorConstraints, otherOptimizationSettings.factorConstraints);
    }

    /**
     * Adding a default objective.
     */
    setDefaultObjective() {
        this.objectiveSettings.portfolioObjectives.push(new PortfolioObjective());
        this.objectiveSettings.portfolioObjectives[0].weight = 1.0;
        this.objectiveSettings.portfolioObjectives[0].key = 'MINIMIZE_RISK';
    }

    /**
     * Clears all the settings in this model.
     */
    clear(): void {
        this.id = undefined;
        this.owner = undefined;
        this.title = OptimizationConstants.NEW_OPTO_SETTINGS_TITLE;
        this.objectiveSettings = new ObjectiveSettings();
        this.investmentUniverseSettings = new InvestmentUniverseSettings();
        this.portfolioConstraints = [];
        this.securityConstraints = [];
        this.sectorConstraints = [];
        this.factorConstraints = [];
        this.isEfficientFrontierEnabled = false;
        this.iterations = 10;
        this.efficientEnabledConstraints = new Set<Constraint>();
        this.selectedYAxis = undefined;
        this.optimizationAdvancedRiskSettings = new AdvancedRiskSettings();
    }

    getDisplayType(parent?: any): FavoriteDisplayEnum {
        return FavoriteDisplayEnum.OPTIMIZATION_SETTINGS;
    }

    /**
     * Finds matching constraint from DefinitionsStore and updates instances of constraints with values of matching constraint
     * @param constraint
     * @param item
     * @private
     */
    private updateExistingConstraint(constraint: any, item: any): any {
        // Ideally this block should be removed but to avoid regression this block still exist but no performance impact.
        if (isNil(constraint)) {
            constraint = find(DefinitionsStore.optimizationConstraint, {
                constraintTag: item.constraintTag,
                constraintType: item.constraintType,
                uses: item.positionType
            });
        }

        // if not found; check against aliasConstraintTag;
        if (isNil(constraint)) {
            constraint = find(DefinitionsStore.optimizationConstraint, {
                aliasConstraintTag: item.constraintTag,
                constraintType: item.constraintType
            });
        }

        if (constraint) {
            item.title = constraint.title;
            item.isRelaxable = constraint.isRelaxable;
            item.group = constraint.group;
            // For some of the constraints such as climate and ESG we do not have constraint.group field instead we have constraint.groups so we are extracting group from there as the first element of the array. This part of code is required when we load a fav so that the constraint gets initialized correctly.
            if (constraint.groups && isNil(item.group)) {
                item.group = constraint.groups[0];
            }
            item.positionType = constraint.uses;
            item.constraintTag = constraint.columnTag;
            item.columnFormat = constraint.columnFormat;
            // Sector constraints with All Sectors and No Breakdowns aren't relevant anymore. They have been moved under the Portfolio bucket in sector constraints. This is to ensure backward compatibility for existing favorites
            if (constraint.constraintType === SUB_TYPE_SECTOR_CONSTRAINTS && item.optionValues?.sectorConstraintType === ALL_TYPE && new Breakdown(item.optionValues?.breakdownTree)?.isEmpty()) {
                item.optionValues.sectorConstraintType = PORTFOLIO;
            }
        }

        return item;
    }
}
