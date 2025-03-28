import {Injectable} from '@angular/core';
import {SettingsTab} from '@optimization-settings-configuration/models/settings-tab-data.model';
import {
    InvestmentUniverseSettingsComponent
} from '../investment-universe-settings/container/investment-universe-settings.component';
import {ObjectivesSettingsComponent} from '../objectives-settings/container/objectives-settings.component';
import {OptimizationSettings} from '@models/portfolio/optimization/optimization-settings.model';
import {
    SETTING_NAME_CONSTRAINT_SUB_TYPE,
    SETTING_NAME_INVESTMENT_UNIVERSE,
    SETTING_NAME_OBJECTIVES,
    SETTING_NAME_PARENT_CONFIG,
    SETTING_NAME_SUMMARIES_WITH_VALUES,
    TAB_NAME_CONSTRAINTS,
    TAB_NAME_INVESTMENT_UNIVERSE,
    TAB_NAME_OBJECTIVES,
    TAB_NAME_SCREENING,
    TAB_NAME_SECURITY_CONSTRAINTS,
    TAB_NAME_TIER_DEFINITION
} from '../constants/settings-tab-metadata.constants';
import {InvestmentUniverseSettings} from '@models/portfolio/investmentUniverse/investment-universe-settings.model';
import {
    FACTOR_CONSTRAINTS_OPTIMIZATION_SUMMARY_SHORT,
    PORTFOLIO_CONSTRAINTS_OPTIMIZATION_SUMMARY_SHORT,
    RELAXATION_AND_SOFT_CONSTRAINT_CONTROLS_SUMMARY,
    SECTOR_CONSTRAINTS_OPTIMIZATION_SUMMARY_SHORT,
    SECURITY_CONSTRAINTS_OPTIMIZATION_SUMMARY_SHORT
} from '../constants/optimization-summaries.constants';
import {Constraint} from '@models/portfolio/constraints/constraint.model';
import {
    OptimizationSummaryWithValues
} from '@optimization-settings-configuration/models/optimization-summary-with-values';
import {
    ConstraintsSettingsComponent
} from '@optimization-settings-configuration/constraints-settings/container/constraints-settings.component';
import {
    TYPE_CONSTRAINTS,
    TYPE_INVESTMENT_UNIVERSE,
    TYPE_OBJECTIVES,
    TYPE_TIERS
} from '../constants/optimization-types.constants';
import {RiskParitySettings} from '@models/portfolio/optimization/risk-parity-settings.model';
import {ScreeningFilterComponent} from '../../riskParity/components/screening-filter/screening-filter.component';
import {TierDefinitionComponent} from '../../riskParity/components/tier-definition/tier-definition.component';
import {RiskParityCase} from '@enums/risk-parity-case.enum';
import {
    SecuritySearchWithCustomColDefComponent
} from '../../../shared/components/security-search/security-search-with-custom-col-def/security-search-with-custom-col-def.component';
import {OptimizationConstants} from '@constants/optimization.constants';
import {
    ConstraintOptionTypeKey
} from '@optimization-settings/constraints-settings/enums/constraint-option-type-key.enum';

/**
 * This service is actually a transformer of data for communication between the optimization-settings module
 * and the optimization-settings-configuration module.
 * It is used to convert from OptimizationSettings model to SettingsTab, which will be used in the
 * OptimizationSettingsModal to create the tabs. Moreover this will also be transforming the
 * SettingsTab to the OptimizationSettings model.
 */
@Injectable({
    providedIn: 'root'
})
export class OptimizationSettingsTransformerService {
    settingsToTabs(optimizationSettings: OptimizationSettings): SettingsTab[] {
        return this.create(optimizationSettings);
    }

    /**
     * convert risk parity settings to tabs
     */
    riskSettingsToTabs(riskParitySettings: RiskParitySettings): SettingsTab[] {
        const tabs: SettingsTab[] = [];
        tabs.push(...[this.createTab(TAB_NAME_INVESTMENT_UNIVERSE, TYPE_INVESTMENT_UNIVERSE, InvestmentUniverseSettingsComponent, new Map([[SETTING_NAME_INVESTMENT_UNIVERSE, riskParitySettings.investmentUniverseSettings]])),
            this.createTab(TAB_NAME_OBJECTIVES, TYPE_OBJECTIVES, ObjectivesSettingsComponent, new Map([[SETTING_NAME_OBJECTIVES, riskParitySettings.objectiveSettings]])),
            this.createTab(TAB_NAME_SCREENING, TAB_NAME_SCREENING.toLowerCase(), ScreeningFilterComponent, new Map([['portFilter', riskParitySettings.filter]]))]
        );
        if (riskParitySettings.riskParityCase === RiskParityCase.ACTIVE) {
            tabs.push(this.createTab(TAB_NAME_TIER_DEFINITION, TYPE_TIERS, TierDefinitionComponent, new Map([['tiers', riskParitySettings.tierDefinitions]])));
        } else {
            tabs.push(this.createTab(TAB_NAME_SECURITY_CONSTRAINTS, OptimizationConstants.SECURITY_CONSTRAINT_RISK_BUDGETING, SecuritySearchWithCustomColDefComponent, new Map<string, any>([[ConstraintOptionTypeKey.SELECTED_SECURITIES, riskParitySettings.securityConstraints], ['customColConfig', OptimizationConstants.SECURITY_CONSTRAINT_RISK_BUDGETING_COL_DEF]])));
        }
        return tabs;
    }

    private create(optimizationSettings: OptimizationSettings): SettingsTab[] {
        const tabs: SettingsTab[] = [];

        tabs.push(
            this.createTab(
                TAB_NAME_INVESTMENT_UNIVERSE,
                TYPE_INVESTMENT_UNIVERSE,
                InvestmentUniverseSettingsComponent,
                new Map([[SETTING_NAME_INVESTMENT_UNIVERSE, optimizationSettings.investmentUniverseSettings]])
            )
        );

        tabs.push(
            this.createTab(
                TAB_NAME_OBJECTIVES,
                TYPE_OBJECTIVES,
                ObjectivesSettingsComponent,
                new Map([[SETTING_NAME_OBJECTIVES, optimizationSettings.objectiveSettings]])
            )
        );

        tabs.push(
            this.createTab(
                TAB_NAME_CONSTRAINTS,
                TYPE_CONSTRAINTS,
                ConstraintsSettingsComponent,
                new Map<string, any>([
                    [SETTING_NAME_PARENT_CONFIG, optimizationSettings],
                    [SETTING_NAME_SUMMARIES_WITH_VALUES, [{
                        summary: PORTFOLIO_CONSTRAINTS_OPTIMIZATION_SUMMARY_SHORT,
                        values: optimizationSettings.portfolioConstraints
                    }, {
                        summary: SECURITY_CONSTRAINTS_OPTIMIZATION_SUMMARY_SHORT,
                        values: optimizationSettings.securityConstraints
                    }, {
                        summary: SECTOR_CONSTRAINTS_OPTIMIZATION_SUMMARY_SHORT,
                        values: optimizationSettings.sectorConstraints
                    }, {
                        summary: FACTOR_CONSTRAINTS_OPTIMIZATION_SUMMARY_SHORT,
                        values: optimizationSettings.factorConstraints
                    }, {
                        summary: RELAXATION_AND_SOFT_CONSTRAINT_CONTROLS_SUMMARY,
                        values: []
                    }]]
                ]),
                SETTING_NAME_CONSTRAINT_SUB_TYPE
            )
        );

        return tabs;
    }

    private createTab(name: string, type: string, component: any, inputs: Map<string, any>, subTypeInput?: string): SettingsTab {
        return {
            name,
            type,
            component,
            inputs,
            subTypeInput
        };
    }

    /**
     * initializes settings from tab and returns it
     */
    tabsToSettingsRiskParity(settingsTabs: SettingsTab[], riskParityCase?: RiskParityCase): RiskParitySettings {
        const riskParitySettings: RiskParitySettings = new RiskParitySettings({'riskParityCase': riskParityCase});
        settingsTabs.forEach((settingsTab) => {
            switch (settingsTab.component) {
                case InvestmentUniverseSettingsComponent:
                    riskParitySettings.investmentUniverseSettings.investmentUniverse =
                        [...(settingsTab.inputs.get(SETTING_NAME_INVESTMENT_UNIVERSE) as InvestmentUniverseSettings).investmentUniverse];
                    break;
                case ObjectivesSettingsComponent:
                    riskParitySettings.objectiveSettings = settingsTab.inputs.get(SETTING_NAME_OBJECTIVES);
                    break;
                case ScreeningFilterComponent:
                    riskParitySettings.filter = settingsTab.inputs.get('portFilter');
                    break;
                case TierDefinitionComponent:
                    riskParitySettings.tierDefinitions = settingsTab.inputs.get('tiers');
                    break;
                case SecuritySearchWithCustomColDefComponent:
                    riskParitySettings.securityConstraints = settingsTab.inputs.get(ConstraintOptionTypeKey.SELECTED_SECURITIES);
                    break;
            }
        });
        return riskParitySettings;
    }

    /**
     * initializes mean variance optimization settings from tab and returns it
     */
    tabsToSettings(settingsTabs: SettingsTab[]): OptimizationSettings {
        const optimizationSettings: OptimizationSettings = new OptimizationSettings();
        settingsTabs.forEach((settingsTab) => {
            if (settingsTab.component === InvestmentUniverseSettingsComponent) {
                optimizationSettings.investmentUniverseSettings.investmentUniverse =
                    [...(settingsTab.inputs.get(SETTING_NAME_INVESTMENT_UNIVERSE) as InvestmentUniverseSettings).investmentUniverse];
            } else if (settingsTab.component === ObjectivesSettingsComponent) {
                optimizationSettings.objectiveSettings = settingsTab.inputs.get(SETTING_NAME_OBJECTIVES);
            } else if (settingsTab.component === ConstraintsSettingsComponent) {
                const summaries: OptimizationSummaryWithValues<Constraint[]>[] = settingsTab.inputs.get(SETTING_NAME_SUMMARIES_WITH_VALUES);
                optimizationSettings.portfolioConstraints = summaries[0].values;
                optimizationSettings.securityConstraints = summaries[1].values;
                optimizationSettings.sectorConstraints = summaries[2].values;
                optimizationSettings.factorConstraints = summaries[3].values;
                const parentConfig: OptimizationSettings = settingsTab.inputs.get(SETTING_NAME_PARENT_CONFIG);
                optimizationSettings.isEfficientFrontierEnabled = parentConfig.isEfficientFrontierEnabled;
                optimizationSettings.efficientEnabledConstraints = parentConfig.efficientEnabledConstraints;
                optimizationSettings.iterations = parentConfig.iterations;
                optimizationSettings.iterationType = parentConfig.iterationType;
            }
        });
        return optimizationSettings;
    }
}
