import {
    ConfigTypeFactory,
    DefinitionInitializer,
    NumericColumnFormat,
    ColumnOptionFactory,
    PerformanceSettings, CoreFavoriteConstants
} from '@blk/explore-ui-core';
import {RiskSettings, RiskRatioSettings} from '@blk/explore-ui-risk';
import {ClimateDamageFunctionsColumnOption} from './models/column-option/climate-damage-functions-column-option.model';
import {ClimateScenariosColumnOption} from './models/column-option/climate-scenarios-column-option.model';
import {FormatAndScaleFactory} from './factories';
import {ActiveCalculationColumnOption} from './models/column-option/active-calculation-column-option.model';
import {AggregationColumnOption} from './models/column-option/aggregation-column-option.model';
import {BookColumnOption} from './models/column-option/book-column-option.model';
import {ChartTypeColumnOption} from './models/column-option/chart-type-column-option.model';
import {ConsarSettingsColumnOption} from './models/column-option/consar-settings-column-option.model';
import {CustomAggregationColumnOption} from './models/column-option/custom-aggregation-column-option.model';
import {CustomCalculationColumnOption} from './models/column-option/custom-calculation-column-option.model';
import {CustomDxsColumnOption} from './models/column-option/custom-dxs-column-option.model';
import {CustomPerformanceColumnOption} from './models/column-option/custom-performance-column-option.model';
import {DateColumnFormatColumnOption} from './models/column-option/date-column-format-column-option.model';
import {DefinitionColumnOption} from './models/column-option/definition-column-option.model';
import {EuroBondColumnOption} from './models/column-option/euro-bond-column-option.model';
import {CustomCalculationMeasureNodeColumnOption} from './models/column-option/custom-calculation-measure-node-column-option.model';
import {EquityColumnOption} from './models/column-option/equity-column-option.model';
import {ExpostColumnOption} from './models/column-option/expost-column-option.model';
import {HighlightColumnOption} from './models/column-option/highlight-column-option.model';
import {IrrMultiTimePeriodColumnOption} from './models/column-option/irr-multi-time-period-column-option.model';
import {IssuerCountColumnOption} from './models/column-option/issuer-count-column-option.model';
import {KeyRateDurationColumnOption} from './models/column-option/key-rate-duration-column-option.model';
import {LiquidityColumnOption} from './models/column-option/liquidity-column-option.model';
import {NumericColumnFormatColumnOption} from './models/column-option/numeric-column-format-column-option.model';
import {OverrideDateColumnOption} from './models/column-option/override-date-column-option.model';
import {RiskDecompositionColumnOption} from './models/column-option/risk-decomposition-column-option.model';
import {TimeToMaturityColumnOption} from './models/column-option/time-to-maturity-column-option.model';
import {ResearchAdditionalDisplayColumnOption} from './models/column-option/research-additional-display-column-option.model';
import {SecurityDescriptionColumnOption} from './models/column-option/security-description-column-option.model';
import {ColumnSet} from './models/column-set/column-set.model';
import {ColumnConfig} from '@blk/explore-ui-core';
import {CustomTitleColumnOption} from './models/column-option/custom-title-column-option.model';
import {PortfolioNameColumnOption} from './models/column-option/portfolio-name-column-option.model';
import {ScenarioColumnOption} from './models/column-option/scenario-column-option.model';
import {SwapEquivalentColumnOption} from './models/column-option/swap-equivalent-column-option.model';
import {ValueXXColumnOption} from './models/column-option/value-x-x-column-option.model';
import {NumericDataFormatter} from './models/data-formatter/numeric-data-formatter.model';
import {TransitionClimateScenariosColumnOption} from './models/column-option/transition-climate-scenarios-column-option.model';
import {CombinedClimateScenariosColumnOption} from './models/column-option/combined-climate-scenarios-column-option.model';
import {TempAlignmentScenariosColumnOption} from './models/column-option/temp-alignment-scenarios-column-option.model';
import {TransitionClimateContributorsColumnOption} from './models/column-option/transition-climate-contributors-column-option.model';
import {StyleAnalysisColumnOption} from './models/column-option/style-analysis-column-option.model';
import {FxFactorOptionsColumnOption} from './models/column-option/fx-factor-options-column-option.model';
import {ScopeColumnOption} from './models/column-option/scope-column-option.model';
import {RbcRegimeSettingsColumnOption} from './models/column-option/rbc-regime-settings-column-option.model';
import {HorizonYearColumnOption} from './models/column-option/horizon-year-column-option.model';
import {PgsCustomCalculationColumnOption} from './models/column-option/pgs-custom-calculation-column-option.model';
import {CreditVarSettingsColumnOption} from './models/column-option/credit-var/credit-var-settings-column-option.model';
import {EconomyExposureDateVaryColumnOptionModel} from './models/column-option/economy-exposure-date-vary-column-option.model';
import {ScenarioAdditionalColumnOptionModel} from './models/column-option/scenario-additional-column-option.model';
import {MissingDataHandlingColumnOptionModel} from './models/column-option/missing-data-handling-column-option.model';
import {ClimateFiscalYearsColumnOption} from './models/column-option/climate-fiscal-years-column-option.model';
import {CoverageMeasureColumnOption} from './models/column-option/coverage-measure-column-option.model';
import {FactorSettingsColumnOption} from './models/column-option/factor-settings-column-option.model';
import {ESGFiscalYearsColumnOption} from './models/column-option/esg-fiscal-years-column-option.model';

export class ColumnOptionInitializer {

    static initializeConfig(): void {
        DefinitionInitializer.registerDefinitionsConfigTypes();
        ColumnOptionInitializer.registerDataFormatterTypes();
    }

    /**
     * Initialize data formatter config types
     */
    static registerDataFormatterTypes(): void {
        FormatAndScaleFactory.registerFormatterType(NumericColumnFormat.CONFIG_TYPE, NumericDataFormatter);
    }

    /**
     * Initialize all the column related config types
     */
    static registerColumnConfigTypes(): void {
        ConfigTypeFactory.registerConfigType(ColumnConfig.configType, ColumnConfig);
        ConfigTypeFactory.registerConfigType(CoreFavoriteConstants.OPTO_CUSTOM_CALC_COLUMN, ColumnConfig);  // for opto custom calc column
        ConfigTypeFactory.registerConfigType(CoreFavoriteConstants.PGS_CUSTOM_CALC_COLUMN, ColumnConfig);  // for pgs custom calc column
        ConfigTypeFactory.registerConfigType(ColumnSet.configType, ColumnSet);
        ConfigTypeFactory.registerConfigType('MULTI_REPORT', ColumnSet);
        ConfigTypeFactory.registerConfigType('SINGLE_REPORT', ColumnSet);
        ConfigTypeFactory.registerConfigType('PERFORMANCE_REPORT', ColumnSet);
        ConfigTypeFactory.registerConfigType('CHART_REPORT', ColumnSet);
        ConfigTypeFactory.registerConfigType('EXPOST_REPORT', ColumnSet);
        ConfigTypeFactory.registerConfigType('RETURN_REPORT', ColumnSet);
        ConfigTypeFactory.registerConfigType('RISK_REPORT', ColumnSet);
        ConfigTypeFactory.registerConfigType('report', ColumnSet);
        ConfigTypeFactory.registerConfigType('REPORT', ColumnSet);
        ConfigTypeFactory.registerConfigType('columns', ColumnSet);
    }

    /**
     * Initialize the required configs for column options
     */
    static registerColumnOptionTypes(): void {
        ColumnOptionFactory.registerOptionType(ActiveCalculationColumnOption.CONFIG_TYPE, ActiveCalculationColumnOption);
        ColumnOptionFactory.registerOptionType(AggregationColumnOption.CONFIG_TYPE, AggregationColumnOption);
        ColumnOptionFactory.registerOptionType(BookColumnOption.CONFIG_TYPE, BookColumnOption);
        ColumnOptionFactory.registerOptionType(CustomTitleColumnOption.CONFIG_TYPE, CustomTitleColumnOption);
        ColumnOptionFactory.registerOptionType(OverrideDateColumnOption.CONFIG_TYPE, OverrideDateColumnOption);
        ColumnOptionFactory.registerOptionType(EconomyExposureDateVaryColumnOptionModel.CONFIG_TYPE, EconomyExposureDateVaryColumnOptionModel);
        ColumnOptionFactory.registerOptionType(DefinitionColumnOption.CONFIG_TYPE, DefinitionColumnOption);
        ColumnOptionFactory.registerOptionType(NumericColumnFormatColumnOption.CONFIG_TYPE, NumericColumnFormatColumnOption);
        ColumnOptionFactory.registerOptionType(DateColumnFormatColumnOption.CONFIG_TYPE, DateColumnFormatColumnOption);
        ColumnOptionFactory.registerOptionType(PerformanceSettings.CONFIG_TYPE, PerformanceSettings);
        ColumnOptionFactory.registerOptionType(RiskSettings.CONFIG_TYPE, RiskSettings);
        ColumnOptionFactory.registerOptionType(RiskSettings.LEGACY_CONFIG_TYPE, RiskSettings);
        ColumnOptionFactory.registerOptionType(TimeToMaturityColumnOption.CONFIG_TYPE, TimeToMaturityColumnOption);
        ColumnOptionFactory.registerOptionType(ValueXXColumnOption.CONFIG_TYPE, ValueXXColumnOption);
        ColumnOptionFactory.registerOptionType(SecurityDescriptionColumnOption.CONFIG_TYPE, SecurityDescriptionColumnOption);
        ColumnOptionFactory.registerOptionType(IssuerCountColumnOption.CONFIG_TYPE, IssuerCountColumnOption);
        ColumnOptionFactory.registerOptionType(SwapEquivalentColumnOption.CONFIG_TYPE, SwapEquivalentColumnOption);
        ColumnOptionFactory.registerOptionType(ScenarioColumnOption.CONFIG_TYPE, ScenarioColumnOption);
        ColumnOptionFactory.registerOptionType(ScenarioColumnOption.ALT_CONFIG_TYPE, ScenarioColumnOption);
        ColumnOptionFactory.registerOptionType(ScenarioAdditionalColumnOptionModel.CONFIG_TYPE, ScenarioAdditionalColumnOptionModel);
        ColumnOptionFactory.registerOptionType(KeyRateDurationColumnOption.CONFIG_TYPE, KeyRateDurationColumnOption);
        ColumnOptionFactory.registerOptionType(EquityColumnOption.CONFIG_TYPE, EquityColumnOption);
        ColumnOptionFactory.registerOptionType(ResearchAdditionalDisplayColumnOption.CONFIG_TYPE, ResearchAdditionalDisplayColumnOption);
        ColumnOptionFactory.registerOptionType(CustomAggregationColumnOption.CONFIG_TYPE, CustomAggregationColumnOption);
        ColumnOptionFactory.registerOptionType(CustomDxsColumnOption.CONFIG_TYPE, CustomDxsColumnOption);
        ColumnOptionFactory.registerOptionType(CustomCalculationMeasureNodeColumnOption.CONFIG_TYPE, CustomCalculationMeasureNodeColumnOption);
        ColumnOptionFactory.registerOptionType(CustomCalculationColumnOption.CONFIG_TYPE, CustomCalculationColumnOption);
        ColumnOptionFactory.registerOptionType(PgsCustomCalculationColumnOption.CONFIG_TYPE, PgsCustomCalculationColumnOption);
        ColumnOptionFactory.registerOptionType(CustomPerformanceColumnOption.CONFIG_TYPE, CustomPerformanceColumnOption);
        ColumnOptionFactory.registerOptionType(HighlightColumnOption.CONFIG_TYPE, HighlightColumnOption);
        ColumnOptionFactory.registerOptionType(ExpostColumnOption.CONFIG_TYPE, ExpostColumnOption);
        ColumnOptionFactory.registerOptionType(RiskDecompositionColumnOption.CONFIG_TYPE, RiskDecompositionColumnOption);
        ColumnOptionFactory.registerOptionType(LiquidityColumnOption.CONFIG_TYPE, LiquidityColumnOption);
        ColumnOptionFactory.registerOptionType(EuroBondColumnOption.CONFIG_TYPE, EuroBondColumnOption);
        ColumnOptionFactory.registerOptionType(IrrMultiTimePeriodColumnOption.CONFIG_TYPE, IrrMultiTimePeriodColumnOption);
        ColumnOptionFactory.registerOptionType(ConsarSettingsColumnOption.CONFIG_TYPE, ConsarSettingsColumnOption);
        ColumnOptionFactory.registerOptionType(PortfolioNameColumnOption.CONFIG_TYPE, PortfolioNameColumnOption);
        ColumnOptionFactory.registerOptionType(ClimateScenariosColumnOption.CONFIG_TYPE, ClimateScenariosColumnOption);
        ColumnOptionFactory.registerOptionType(TransitionClimateScenariosColumnOption.CONFIG_TYPE, TransitionClimateScenariosColumnOption);
        ColumnOptionFactory.registerOptionType(CombinedClimateScenariosColumnOption.CONFIG_TYPE, CombinedClimateScenariosColumnOption);
        ColumnOptionFactory.registerOptionType(TempAlignmentScenariosColumnOption.CONFIG_TYPE, TempAlignmentScenariosColumnOption);
        ColumnOptionFactory.registerOptionType(ClimateFiscalYearsColumnOption.CONFIG_TYPE, ClimateFiscalYearsColumnOption);
        ColumnOptionFactory.registerOptionType(ClimateDamageFunctionsColumnOption.CONFIG_TYPE, ClimateDamageFunctionsColumnOption);
        ColumnOptionFactory.registerOptionType(TransitionClimateContributorsColumnOption.CONFIG_TYPE, TransitionClimateContributorsColumnOption);
        ColumnOptionFactory.registerOptionType(ChartTypeColumnOption.CONFIG_TYPE, ChartTypeColumnOption);
        ColumnOptionFactory.registerOptionType(RiskRatioSettings.CONFIG_TYPE, RiskRatioSettings);
        ColumnOptionFactory.registerOptionType(StyleAnalysisColumnOption.CONFIG_TYPE, StyleAnalysisColumnOption);
        ColumnOptionFactory.registerOptionType(ScopeColumnOption.CONFIG_TYPE, ScopeColumnOption);
        ColumnOptionFactory.registerOptionType(FxFactorOptionsColumnOption.CONFIG_TYPE, FxFactorOptionsColumnOption);
        ColumnOptionFactory.registerOptionType(RbcRegimeSettingsColumnOption.CONFIG_TYPE, RbcRegimeSettingsColumnOption);
        ColumnOptionFactory.registerOptionType(HorizonYearColumnOption.CONFIG_TYPE, HorizonYearColumnOption);
        ColumnOptionFactory.registerOptionType(CreditVarSettingsColumnOption.CONFIG_TYPE, CreditVarSettingsColumnOption);
        ColumnOptionFactory.registerOptionType(MissingDataHandlingColumnOptionModel.CONFIG_TYPE, MissingDataHandlingColumnOptionModel);
        ColumnOptionFactory.registerOptionType(CoverageMeasureColumnOption.CONFIG_TYPE, CoverageMeasureColumnOption);
        ColumnOptionFactory.registerOptionType(FactorSettingsColumnOption.CONFIG_TYPE, FactorSettingsColumnOption);
        ColumnOptionFactory.registerOptionType(ESGFiscalYearsColumnOption.CONFIG_TYPE, ESGFiscalYearsColumnOption);
    }
}
