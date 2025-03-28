import {TestBed} from '@angular/core/testing';
import {OptimizationSettingsTransformerService} from './optimization-settings-transformer.service';
import {OptimizationSettings} from '@models/portfolio/optimization/optimization-settings.model';
import {SettingsTab} from '@optimization-settings-configuration/models/settings-tab-data.model';
import {InvestmentUniverseSettingsComponent} from '../investment-universe-settings/container/investment-universe-settings.component';
import {
    SETTING_NAME_CONSTRAINT_SUB_TYPE,
    SETTING_NAME_INVESTMENT_UNIVERSE,
    SETTING_NAME_OBJECTIVES,
    SETTING_NAME_PARENT_CONFIG,
    SETTING_NAME_SUMMARIES_WITH_VALUES,
    TAB_NAME_CONSTRAINTS,
    TAB_NAME_OBJECTIVES
} from '../constants/settings-tab-metadata.constants';
import {getInvestmentUniverseSettingsData, getOptimizationSettingsTestData} from '../constants/test-data.testutils';
import {ObjectiveSettings} from '@models/portfolio/objectives/objective.settings.model';
import {ObjectivesSettingsComponent} from '../objectives-settings/container/objectives-settings.component';
import {ConstraintsSettingsComponent} from '@optimization-settings-configuration/constraints-settings/container/constraints-settings.component';
import {InvestmentUniverseSettings} from '@models/portfolio/investmentUniverse/investment-universe-settings.model';
import {
    FACTOR_CONSTRAINTS_OPTIMIZATION_SUMMARY_SHORT,
    PORTFOLIO_CONSTRAINTS_OPTIMIZATION_SUMMARY_SHORT,
    RELAXATION_AND_SOFT_CONSTRAINT_CONTROLS_SUMMARY,
    SECTOR_CONSTRAINTS_OPTIMIZATION_SUMMARY_SHORT,
    SECURITY_CONSTRAINTS_OPTIMIZATION_SUMMARY_SHORT
} from '../constants/optimization-summaries.constants';
import {TYPE_CONSTRAINTS} from '../constants/optimization-types.constants';
import {RiskParitySettings} from '@models/portfolio/optimization/risk-parity-settings.model';
import {RiskParityCase} from '@enums/risk-parity-case.enum';
import {ScreeningFilterComponent} from '../../riskParity/components/screening-filter/screening-filter.component';
import {CustomFilter} from '@blk/explore-ui-breakdown';
import {TierDefinitionComponent} from '../../riskParity/components/tier-definition/tier-definition.component';
import {TierDefinition} from '@models/portfolio/optimization/tier-definition.model';
import {SecuritySearchWithCustomColDefComponent} from '../../../shared/components/security-search/security-search-with-custom-col-def/security-search-with-custom-col-def.component';
import {Security} from '@interfaces/security.interface';

describe('OptimizationSettingsTransformerService', () => {
    let service: OptimizationSettingsTransformerService;
    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(OptimizationSettingsTransformerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should convert from optimizationSettings to SettingsTabs', () => {
        const optimizationSettings: OptimizationSettings = getOptimizationSettingsTestData();
        const tabs: SettingsTab[] = service.settingsToTabs(optimizationSettings);

        expect(tabs.length).toEqual(3);
        expect(tabs[0].component).toBe(InvestmentUniverseSettingsComponent);
        expect((tabs[0].inputs.get(SETTING_NAME_INVESTMENT_UNIVERSE) as InvestmentUniverseSettings)
            .investmentUniverse.length).toEqual(4);
        expect(tabs[1].name).toEqual(TAB_NAME_OBJECTIVES);
        expect(tabs[2]).toEqual({
            name: TAB_NAME_CONSTRAINTS,
            component: ConstraintsSettingsComponent,
            inputs: new Map<string, any>([
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
            subTypeInput: SETTING_NAME_CONSTRAINT_SUB_TYPE,
            type: TYPE_CONSTRAINTS,
        });
    });

    it('should convert riskSettingsToTabs', () => {
        const riskParitySettings = new RiskParitySettings();
        riskParitySettings.riskParityCase = RiskParityCase.ABSOLUTE;
        expect(service.riskSettingsToTabs(riskParitySettings).length).toBe(4);
    });

    it('should convert SettingsTabs to RiskParity Settings', () => {
        const settingsTabs: SettingsTab[] = [];
        settingsTabs.push({
            name: 'TestTabName',
            component: InvestmentUniverseSettingsComponent,
            inputs: new Map([[SETTING_NAME_INVESTMENT_UNIVERSE, getInvestmentUniverseSettingsData()]])
        });

        settingsTabs.push({
            name: '',
            component: ObjectivesSettingsComponent,
            inputs: new Map([[SETTING_NAME_OBJECTIVES, new ObjectiveSettings()]])
        });

        settingsTabs.push({
            name: '',
            component: ScreeningFilterComponent,
            inputs: new Map([['portFilter', new CustomFilter()]])
        });

        settingsTabs.push({
            name: '',
            component: TierDefinitionComponent,
            inputs: new Map([['tiers', new TierDefinition()]])
        });

        settingsTabs.push({
            name: '',
            component: SecuritySearchWithCustomColDefComponent,
            inputs: new Map([['selectedSecurities', new Map<string, Security>()]])
        });

        const optimizationSettings: OptimizationSettings = service.tabsToSettingsRiskParity(settingsTabs);

        expect(optimizationSettings).toBeTruthy();
        expect(optimizationSettings.investmentUniverseSettings.investmentUniverse.length).toEqual(4);
        expect(optimizationSettings.securityConstraints).toBeTruthy();
    });

    it('should convert SettingsTabs to OptimizationSettings', () => {
        const settingsTabs: SettingsTab[] = [];
        settingsTabs.push({
            name: 'TestTabName',
            component: InvestmentUniverseSettingsComponent,
            inputs: new Map([[SETTING_NAME_INVESTMENT_UNIVERSE, getInvestmentUniverseSettingsData()]])
        });

        settingsTabs.push({
            name: '',
            component: ObjectivesSettingsComponent,
            inputs: new Map([[SETTING_NAME_OBJECTIVES, new ObjectiveSettings()]])
        });

        settingsTabs.push({
            name: '',
            component: ConstraintsSettingsComponent,
            inputs: new Map([[SETTING_NAME_SUMMARIES_WITH_VALUES, [{
                values: []
            }, {
                values: []
            }, {
                values: []
            }, {
                values: []
            }]],
                [SETTING_NAME_PARENT_CONFIG , new OptimizationSettings()]])
        });

        const optimizationSettings: OptimizationSettings = service.tabsToSettings(settingsTabs);

        expect(optimizationSettings).toBeTruthy();
        expect(optimizationSettings.investmentUniverseSettings.investmentUniverse.length).toEqual(4);
        expect(optimizationSettings.objectiveSettings).toBeTruthy();
        expect(optimizationSettings.portfolioConstraints).toBeTruthy();
    });
});
