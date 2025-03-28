import {ActiveCalculationColumnOptionComponent} from './active-calculation/active-calculation-column-option.component';
import {AggregationColumnOptionComponent} from './aggregation/aggregation-column-option.component';
import {BookColumnOptionComponent} from './book/book-column-option.component';
import {ClimateDamageFunctionColumnOptionComponent} from './climate-damage-function/climate-damage-function-column-option.component';
import {ClimateScenarioColumnOptionComponent} from './climate-scenario/climate-scenario-column-option.component';
import {ConsarSettingsColumnOptionComponent} from './consar-settings/consar-settings-column-option.component';
import {CustomAggregationColumnOptionComponent} from './custom-aggregation/custom-aggregation-column-option.component';
import {CustomCalculationMeasureNodeColumnOptionComponent} from './custom-calculation-measure-node/custom-calculation-measure-node-column-option.component';
import {CustomCalculationColumnOptionComponent} from './custom-calculation/custom-calculation-column-option.component';
import {CustomDxsColumnOptionComponent} from './custom-dxs/custom-dxs-column-option.component';
import {CustomPerformanceColumnOptionComponent} from './custom-performance/custom-performance-column-option.component';
import {CustomTitleColumnOptionComponent} from './custom-title/custom-title-column-option.component';
import {DateFormatColumnOptionComponent} from './date-format/date-format-column-option.component';
import {DefinitionColumnOptionComponent} from './definition/definition-column-option.component';
import {EuroBondColumnOptionComponent} from './euro-bond/euro-bond-column-option.component';
import {EquityColumnOptionComponent} from './equity/equity-column-option.component';
import {ExpostColumnOptionsComponent} from './expost/expost-column-options.component';
import {HighlightColumnOptionComponent} from './highlight/highlight-column-option.component';
import {IrrMultiTimePeriodColumnOptionComponent} from './irr-multi-time-period/irr-multi-time-period-column-option.component';
import {IssuerCountColumnOptionComponent} from './issuer-count/issuer-count-column-option.component';
import {KeyRateDurationColumnOptionComponent} from './key-rate-duration/key-rate-duration-column-option.component';
import {LiquidityColumnOptionComponent} from './liquidity/liquidity-column-option.component';
import {NumericColumnFormatColumnOptionComponent} from './numeric-column-format/numeric-column-format-column-option.component';
import {OverrideDateColumnOptionsComponent} from './override-date/override-date-column-options.component';
import {PerformanceColumnOptionsComponent} from './performance/performance-column-options.component';
import {PortfolioNameColumnOptionComponent} from './portfolio-name/portfolio-name-column-option.component';
import {ResearchAdditionalDisplayColumnOptionComponent} from './research-additional-display/research-additional-display-column-option.component';
import {RiskDecompositionColumnOptionComponent} from './risk-decomposition/risk-decomposition-column-option.component';
import {RiskFactorViewColumnOptionComponent} from './risk-factor-view/risk-factor-view-column-option.component';
import {ScenarioColumnOptionComponent} from './scenario/scenario-column-option.component';
import {SecurityDescriptionColumnOptionComponent} from './security-description/security-description-column-option.component';
import {SwapEquivalentColumnOptionComponent} from './swap-equivalent/swap-equivalent-column-option.component';
import {TimeToMaturityColumnOptionComponent} from './time-to-maturity/time-to-maturity-column-option.component';
import {ValueXXColumnOptionComponent} from './value-x-x/value-x-x-column-option.component';
import {TransitionClimateScenarioColumnOptionComponent} from './transition-climate-scenario/transition-climate-scenario-column-option.component';
import {CombinedClimateScenarioColumnOptionComponent} from './combined-climate-scenario/combined-climate-scenario-column-option.component';
import {TempAlignmentScenarioColumnOptionComponent} from './temp-alignment-scenario/temp-alignment-scenario-column-option.component';
import { TransitionClimateContributorColumnOptionComponent } from './climate-damage-function/transition-climate-contributor-column-option.component';
import {RiskRatioComponent} from './risk-ratio/risk-ratio.component';
import {StyleAnalysisColumnOptionComponent} from './style-analysis/style-analysis-column-option.component';
import {FxFactorOptionsColumnOptionComponent} from './fx-factor-options/fx-factor-options-column-option.component';
import {ScopeColumnOptionComponent} from './scope/scope-column-option.component';
import {RbcRegimeSettingsColumnOptionComponent} from './risk-based-capital/rbc-regime-settings-column-option.component';
import {HorizonYearComponent} from './horizon-year/horizon-year.component';
import {
    PgsCustomCalculationColumnOptionComponent
} from './pgs-custom-calc/pgs-custom-calculation-column-option.component';
import {BaseDateVaryComponent} from './override-date/date-vary/base-date-vary.component';
import {CreditVarSettingsColumnOptionComponent} from './credit-var-settings-column-option/credit-var-settings-column-option.component';
import {ScenarioAdditionalColumnOptionComponent} from './scenario/additional-settings/scenario-additional-column-option.component';
import {MissingDataHandlingColumnOptionComponent} from './missing-data-handling/missing-data-handling-column-option.component';
import {
    ClimateFiscalYearsColumnOptionComponent
} from './climate-fiscal-years/climate-fiscal-years-column-option.component';
import {CoverageMeasureColumnOptionComponent} from './coverage-measure-column-option/coverage-measure-column-option.component';
import {FactorSettingsComponent} from "./factor-settings/factor-settings.component";
import {EsgFiscalYearColumnOptionComponent} from './esg-fiscal-year-column-option/esg-fiscal-year-column-option.component';

export const columnOptionComponentList = [
    ActiveCalculationColumnOptionComponent,
    AggregationColumnOptionComponent,
    SecurityDescriptionColumnOptionComponent,
    SwapEquivalentColumnOptionComponent,
    ScenarioColumnOptionComponent,
    ScenarioAdditionalColumnOptionComponent,
    KeyRateDurationColumnOptionComponent,
    EquityColumnOptionComponent,
    NumericColumnFormatColumnOptionComponent,
    ResearchAdditionalDisplayColumnOptionComponent,
    CustomAggregationColumnOptionComponent,
    RiskFactorViewColumnOptionComponent,
    CustomCalculationMeasureNodeColumnOptionComponent,
    CustomCalculationColumnOptionComponent,
    PgsCustomCalculationColumnOptionComponent,
    HighlightColumnOptionComponent,
    OverrideDateColumnOptionsComponent,
    BaseDateVaryComponent,
    DefinitionColumnOptionComponent,
    ScopeColumnOptionComponent,
    DateFormatColumnOptionComponent,
    TimeToMaturityColumnOptionComponent,
    HorizonYearComponent,
    CreditVarSettingsColumnOptionComponent,
    // ColumnBreakdownColumnOptionComponent,
    ExpostColumnOptionsComponent,
    RiskDecompositionColumnOptionComponent,
    ConsarSettingsColumnOptionComponent,
    IrrMultiTimePeriodColumnOptionComponent,
    PortfolioNameColumnOptionComponent,
    RiskRatioComponent,
    FxFactorOptionsColumnOptionComponent,
    RbcRegimeSettingsColumnOptionComponent,
    FactorSettingsComponent,

    // Column Options that can modify the column title
    BookColumnOptionComponent,
    CustomDxsColumnOptionComponent,
    CustomPerformanceColumnOptionComponent,
    CustomTitleColumnOptionComponent,
    IssuerCountColumnOptionComponent,
    ValueXXColumnOptionComponent,
    PerformanceColumnOptionsComponent,
    LiquidityColumnOptionComponent,
    EuroBondColumnOptionComponent,
    ClimateScenarioColumnOptionComponent,
    ClimateDamageFunctionColumnOptionComponent,
    TransitionClimateContributorColumnOptionComponent,
    TransitionClimateScenarioColumnOptionComponent,
    CombinedClimateScenarioColumnOptionComponent,
    TempAlignmentScenarioColumnOptionComponent,
    ClimateFiscalYearsColumnOptionComponent,
    StyleAnalysisColumnOptionComponent,
    MissingDataHandlingColumnOptionComponent,
    CoverageMeasureColumnOptionComponent,
    EsgFiscalYearColumnOptionComponent
];
