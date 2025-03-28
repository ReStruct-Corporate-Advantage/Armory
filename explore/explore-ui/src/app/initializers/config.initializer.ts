import {ColumnOptionInitializer, ColumnSet, CustomCalculationColumnOption, FormatAndScaleFactory, HighlightComparisonType, HighlightRuleFactory} from '@blk/explore-ui-column-option';
import {ExtendedColumnOptionInitializer} from '@blk/explore-ui-extended-column-option';
import {
    ChartWidgetInputConfigType,
    ColumnConstants,
    ColumnOptionFactory,
    ConfigTypeFactory,
    CoreInitializer,
    DefinitionInitializer,
    ExpostSettings,
    legacyWidgetInputConfigTypes,
    PerformanceSettings, WidgetDisplayInputConfigType, WidgetInputType
} from '@blk/explore-ui-core';
import {RiskSettings} from '@blk/explore-ui-risk';
import {BatchReportConfig} from '@models/batch-reporting/batch-report-config.model';
import {BatchRowConfig} from '@models/batch-reporting/batch-row-config.model';
import {BatchDailyFrequency} from '@models/batch-reporting/scheduled-batch/batch-frequency/batch-daily-frequency.model';
import {BatchMonthlyFrequency} from '@models/batch-reporting/scheduled-batch/batch-frequency/batch-monthly-frequency.model';
import {BatchSchedule} from '@models/batch-reporting/scheduled-batch/batch-schedule.model';
import {ScheduledBatchConfig} from '@models/batch-reporting/scheduled-batch/scheduled-batch-config.model';
import {BreakdownInitializer, ColumnBreakdown, SectorConstants} from '@blk/explore-ui-breakdown';
import {DateFormat} from '@models/column-formats/date-format.model';
import {TimeSpanColumnFormat} from '@models/column-formats/time-span-column-format.model';
import {CollapsedLookthroughColumnOption} from '@models/columns/column-options/collapsed-lookthrough-column-option.model';
import {CumulativeReturnColumnOption} from '@models/columns/column-options/cumulative-return-column-option.model';
import {DateDataFormatter} from '@models/data-formatters/date-data.formatter';
import {TimeSpanDataFormatter} from '@models/data-formatters/time-span-data.formatter';
import {GpBreakdownColumnDefinition} from '@models/definitions/column-definitions/gp-breakdown-column-definition.model';
import {PraadaBreakdownColumnDefinition} from '@models/definitions/column-definitions/praada-breakdown-column-definition.model';
import {ExcelExportConfig} from '@models/export/excel-export-config.model';
import {PDFExportConfig} from '@models/export/pdf-export-config.model';
import {TablePDFExportConfig} from '@models/export/table-pdf-export-config.model';
import {WorkpadExcelExportConfig} from '@models/export/workpad-excel-export-config.model';
import {ExpostReturnSettings} from '@models/expostSettings/expost-return-settings.model';
import {ExpostTimeSeriesSettings} from '@models/expostSettings/expost-time-series-settings.model';
import {BetweenHighlightRule} from '@models/highlight-rules/between-highlight-rule.model';
import {EqualsHighlightRule} from '@models/highlight-rules/equals-highlight-rule.model';
import {LessThanGreaterThanHighlightRule} from '@models/highlight-rules/less-than-greater-than-highlight-rule.model';
import {QuantileHighlightRule} from '@models/highlight-rules/quantile-highlight-rule.model';
import {StdDeviationHighlightRule} from '@models/highlight-rules/std-deviation-highlight-rule.model';
import {StringHighlightRule} from '@models/highlight-rules/string-highlight-rule.model';
import {TopBottomHighlightRule} from '@models/highlight-rules/top-bottom-highlight-rule.model';
import {LookthroughFilterRule} from '@models/lookthrough/look-through-filter-rule.model';
import {LookthroughfilterRulesFav} from '@models/lookthrough/look-through-filter-rules-fav.model';
import {AdhocPortfolio} from '@models/portfolio/adhoc-portfolio.model';
import {AdhocPortGroup} from '@models/portfolio/adhoc-portgroup.model';
import {NewPortfolioHoldingChange} from '@models/portfolio/composition/new-portfolio-holding-change.model';
import {NewSecurityHoldingChange} from '@models/portfolio/composition/new-security-holding-change.model';
import {PortfolioHoldingChange} from '@models/portfolio/composition/portfolio-holding-change.model';
import {PortfolioSecurityHoldingChange} from '@models/portfolio/composition/portfolio-security-holding-change.model';
import {OptimizationSettings} from '@models/portfolio/optimization/optimization-settings.model';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {RulesBasedPortfolio} from '@models/portfolio/rule-based-portfolio.model';
import {ActiveBreakdownRule} from '@models/portfolio/tradeRules/active-breakdown-rule.model';
import {ActiveSectorRule} from '@models/portfolio/tradeRules/active-sector-rule.model';
import {ActiveSecurityRule} from '@models/portfolio/tradeRules/active-security-rule.model';
import {BreakdownTreeRule} from '@models/portfolio/tradeRules/breakdown-tree-rule.model';
import {NAVSecurityRule} from '@models/portfolio/tradeRules/nav-security-rule.model';
import {PortfolioRule} from '@models/portfolio/tradeRules/portfolio-rule.model';
import {SectorRule} from '@models/portfolio/tradeRules/sector-rule.model';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {RiskColumnSettings} from '@models/riskSettings/risk-column-settings.model';
import {SecurityContributionSettings} from '@models/security-contribution-settings/security-contribution-settings';
import {BreakdownValidator} from '@models/widget-input-validator/breakdown-validator.model';
import {ColumnSetValidator} from '@models/widget-input-validator/column-set-validator.model';
import {AbsoluteValueSetting} from '@models/widget/inputs/chart-settings/absolute-value-setting.model';
import {BarChartSettings} from '@models/widget/inputs/chart-settings/bar-chart-settings.model';
import {BarChartAdditionalSettings} from '@models/widget/inputs/chart-settings/bar-chart-additional-settings.model';
import {ChartSettings} from '@models/widget/inputs/chart-settings/chart-settings.model';
import {GridLines} from '@models/widget/inputs/chart-settings/grid-lines.model';
import {ScatterDrilldownSetting} from '@models/widget/inputs/chart-settings/scatter-drilldown-setting.model';
import {SecondaryAxis} from '@models/widget/inputs/chart-settings/secondary-axis.model';
import {TimeSeriesSettings} from '@models/widget/inputs/chart-settings/time-series-settings.model';
import {ExpandedState} from '@models/widget/inputs/expanded-state.model';
import {ExpostSortedColumns} from '@models/widget/inputs/expost-sorted-columns/expost-sorted.columns';
import {FactorBlockInput} from '@models/widget/inputs/factor-block-input.model';
import {FactorPathInput} from '@models/widget/inputs/factor-path-input.model';
import {FootnoteState} from '@models/widget/inputs/footnote-state.model';
import {MinValFilter} from '@models/widget/inputs/min-val-filter.model';
import {PieChartDisplayInput} from '@models/widget/inputs/chart-settings/pie-chart-display-input.model';
import {PivotTableSettingsModel} from '@models/widget/inputs/pivot-table-settings.model';
import {PortfolioOverrideInput} from '@models/widget/inputs/portfolio-override-input.model';
import {ReturnChartStyleSettingsModel} from '@models/widget/inputs/chart-settings/return-chart-style-settings.model';
import {ReturnSpriteletInput} from '@models/widget/inputs/return-spritelet-input.model';
import {RiskAndExposureAdditionalSettings} from '@models/widget/inputs/risk-and-exposure-additional-settings.model';
import {ShowAsChartInput} from '@models/widget/inputs/show-as-chart-input.model';
import {SortedColumns} from '@models/widget/inputs/sorted-columns/sorted-columns';
import {TopBottomFilterInput} from '@models/widget/inputs/top-bottom-filter-input.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {ReportGroup} from '@models/workspace/report-group.model';
import {Report} from '@models/workspace/report.model';
import {Workspace} from '@models/workspace/workspace.model';
import {CompositionConstants} from '../constants';
import {HoldingChangeFactory} from '../factories/holding-change.factory';
import {RuleFactory} from '../factories/rule.factory';
import {WidgetInputValidatorFactory} from '../factories/widget-input-validator.factory';
import {ApiRequestInitializer} from './api-request.initializer';
import {FundCusip} from '@models/widget/inputs/fund-cusip.model';
import {CommitmentHorizon} from '@models/widget/inputs/commitment-risk/commitment-horizon.model';
import {CommitmentHorizonSelectedTab} from '@models/widget/inputs/commitment-risk/commitment-horizon-selected-tab.model';
import {LightLookthrough} from '@models/lookthrough/light-lookthrough.model';
import {SuppressRootNodeSetting} from '@models/widget/inputs/suppress-root-node-setting.model';
import {
    PortfolioSecuritiesHoldingChange
} from '@models/portfolio/composition/portfolio-securities-holding-change.model';
import { SortedColumnsX } from '@models/widget/inputs/chart-settings/sorted-columns-x.model';
import { SortedColumnsY } from '@models/widget/inputs/chart-settings/sorted-columns-y.model';
import {MarginAnalyticsCassiniSettings} from '@models/widget/inputs/margin-analytics-cassini-settings.model';
import {OverrideDateSortByOldest} from '@models/widget/inputs/override-date-sort-by-oldest.model';
import {PortfolioNavSecurityRule} from '@models/portfolio/tradeRules/portfolio-nav-security-rule.model';
import {PortfolioNavSecurityHoldingChange} from '@models/portfolio/composition/portfolio-nav-securities-holding-change.model';
import {CompositionSetting} from '@models/portfolio/composition/composition-setting.model';
import {CompositionRule} from '@models/portfolio/composition/composition-rule.model';
import {TopBottomSectoring} from '@models/widget/inputs/top-bottom-sectoring/top-bottom-sectoring.model';
import {HideUnassignedFilterInput} from '@models/widget/inputs/hide-unassigned-filter-input.model';
import {FactorDataChartSettings} from '@models/widget/inputs/chart-settings/factor-data-chart-settings.model';
import {FactorDataRiskMatrixSettings} from '@models/widget/inputs/factor-data-settings/factor-data-risk-matrix-settings.model';
import {FactorDataHighlightSettings} from '@models/widget/inputs/factor-data-settings/factor-data-highlight-settings.model';
import {ColorScale} from '@models/widget/inputs/chart-settings/color-scale.model';
import {CustomColorPositiveNegative} from '@models/widget/inputs/chart-settings/custom-color-positive-negative';
import {AxisSettings} from '@models/widget/inputs/chart-settings/axis-settings.model';
import {CommitmentRiskGrouping} from '@models/widget/inputs/commitment-risk/commitment-risk-grouping.model';
import {LookThroughSettingsWithRules} from '@models/lookthrough/look-through-settings-with-rules.model';
import {ComboChartColumnSettings} from '@models/widget/inputs/chart-settings/combo-chart-column-settings.model';
import {TimePeriodIntervalSettings} from '@models/widget/inputs/chart-settings/time-period-interval-settings.model';
import {CommitmentRiskScenario} from '@models/widget/inputs/commitment-risk/commitment-risk-scenario.model';
import {CommitmentRiskLegendSettings} from '@models/widget/inputs/chart-settings/commitment-risk-legend-settings.model';
import {PgsStackedBarChartSettingsModel} from '@models/widget/inputs/chart-settings/pgs-stacked-bar-chart-settings.model';
import {
    PgsCustomCalculationColumnOption
} from '../../../projects/explore-ui-column-option/src/models/column-option/pgs-custom-calculation-column-option.model';
import { CollapsedColumns } from '@models/widget/inputs/collapsed-columns.model';
import {CashflowDownloadSettings} from '@models/widget/inputs/cashflow-download-settings.model';
import { DecarbonizationChartSettings } from '@models/widget/inputs/decarbonization-chart-settings.model';
import {RiskParitySettings} from '@models/portfolio/optimization/risk-parity-settings.model';
import {
    DiversificationScoreFactorSettings
} from '@models/widget/inputs/chart-settings/diversification-score-factor-settings';
import {FactorExposureCompositionSetting} from '@models/portfolio/composition/factor-exposure-composition-setting.model';
import {ShowSectorLevelDataOnlyModel} from '@models/widget/inputs/show-sector-level-data-only.model';

export class ConfigInitializer {
    static initializeConfig() {
        ConfigInitializer.registerDefinitionsConfigTypes();
        DefinitionInitializer.registerDefinitionsConfigTypes();
        CoreInitializer.registerWidgetInputTypes();

        ConfigInitializer.registerWorkspaceConfigTypes();
        ConfigInitializer.registerWidgetInputTypes();

        ConfigInitializer.registerWidgetInputValidators();

        ConfigInitializer.registerDataFormatterTypes();
        ColumnOptionInitializer.registerDataFormatterTypes();

        ConfigInitializer.registerHoldingChangeTypes();
        ConfigInitializer.registerRuleTypes();
        ConfigInitializer.registerPortfolioTypes();
        ConfigInitializer.registerExportTypes();
        ConfigInitializer.registerWhatIfTypes();
        ConfigInitializer.registerLookthroughTypes();
        ConfigInitializer.registerHighlightRuleTypes();
        ConfigInitializer.registerCompositionTypes();

        ApiRequestInitializer.registerWidgetApiRequestTypes();
        BreakdownInitializer.initializeConfig();
    }

    static registerWidgetInputValidators(): void {
        WidgetInputValidatorFactory.registerInputValidator(ColumnSet.configType, new ColumnSetValidator());
        WidgetInputValidatorFactory.registerInputValidator(SectorConstants.ConfigType.BREAKDOWN, new BreakdownValidator());
    }

    static registerWidgetInputTypes() {
        ColumnOptionInitializer.registerColumnConfigTypes();
        ColumnOptionInitializer.registerColumnOptionTypes();
        ExtendedColumnOptionInitializer.registerColumnOptionTypes();
        ConfigInitializer.registerColumnOptionTypes();
        ConfigInitializer.registerChartWidgetInputConfigTypes();
        ConfigInitializer.registerWidgetDisplayInputConfigTypes();

        ConfigTypeFactory.registerConfigType(TopBottomFilterInput.configType, TopBottomFilterInput);
        ConfigTypeFactory.registerConfigType(HideUnassignedFilterInput.configType, HideUnassignedFilterInput);
        ConfigTypeFactory.registerConfigType(PivotTableSettingsModel.configType, PivotTableSettingsModel);
        ConfigTypeFactory.registerConfigType(SortedColumns.configType, SortedColumns);

        ConfigTypeFactory.registerConfigType(RiskAndExposureAdditionalSettings.configType, RiskAndExposureAdditionalSettings);
        ConfigTypeFactory.registerConfigType(CommitmentHorizonSelectedTab.configType, CommitmentHorizonSelectedTab);
        ConfigTypeFactory.registerConfigType(LightLookthrough.configType, LightLookthrough);
        ConfigTypeFactory.registerConfigType(LookThroughSettingsWithRules.configType, LookThroughSettingsWithRules);
        ConfigTypeFactory.registerConfigType(TopBottomSectoring.configType, TopBottomSectoring);
        ConfigTypeFactory.registerConfigType(PerformanceSettings.CONFIG_TYPE, PerformanceSettings);
        ConfigTypeFactory.registerConfigType(PerformanceSettings.LEGACY_WIDGET_CONFIG_TYPE, PerformanceSettings);
        ConfigTypeFactory.registerConfigType(RiskSettings.CONFIG_TYPE, RiskSettings);
        ConfigTypeFactory.registerConfigType(RiskSettings.LEGACY_WIDGET_CONFIG_TYPE, RiskSettings);
        ConfigTypeFactory.registerConfigType(RiskColumnSettings.CONFIG_TYPE, RiskColumnSettings);
        ConfigTypeFactory.registerConfigType(ExpostSettings.configType, ExpostSettings);
        ConfigTypeFactory.registerConfigType(ExpostTimeSeriesSettings.configType, ExpostTimeSeriesSettings);
        ConfigTypeFactory.registerConfigType(ExpostReturnSettings.configType, ExpostReturnSettings);
        ConfigTypeFactory.registerConfigType(ReturnSpriteletInput.configType, ReturnSpriteletInput);
        ConfigTypeFactory.registerConfigType(PortfolioOverrideInput.configType, PortfolioOverrideInput);
        ConfigTypeFactory.registerConfigType(MinValFilter.configType, MinValFilter);
        ConfigTypeFactory.registerConfigType(ExpandedState.CONFIG_TYPE, ExpandedState);
        ConfigTypeFactory.registerConfigType(FootnoteState.CONFIG_TYPE, FootnoteState);
        ConfigTypeFactory.registerConfigType(ShowAsChartInput.configType, ShowAsChartInput);
        ConfigTypeFactory.registerConfigType(CollapsedColumns.CONFIG_TYPE, CollapsedColumns);
        ConfigTypeFactory.registerConfigType(FactorBlockInput.configType, FactorBlockInput);
        ConfigTypeFactory.registerConfigType(FactorPathInput.configType, FactorPathInput);
        ConfigTypeFactory.registerConfigType(BarChartAdditionalSettings.configType, BarChartAdditionalSettings);
        ConfigTypeFactory.registerConfigType(ExpostSortedColumns.configType, ExpostSortedColumns);
        ConfigTypeFactory.registerConfigType(CustomCalculationColumnOption.CONFIG_TYPE, CustomCalculationColumnOption);
        ConfigTypeFactory.registerConfigType(PgsCustomCalculationColumnOption.CONFIG_TYPE, PgsCustomCalculationColumnOption);
        ConfigTypeFactory.registerConfigType(SuppressRootNodeSetting.configType, SuppressRootNodeSetting);
        ConfigTypeFactory.registerConfigType(FundCusip.configType, FundCusip);
        ConfigTypeFactory.registerConfigType(CommitmentHorizon.configType, CommitmentHorizon);
        ConfigTypeFactory.registerConfigType(FactorDataChartSettings.configType, FactorDataChartSettings);
        ConfigTypeFactory.registerConfigType(FactorDataRiskMatrixSettings.configType, FactorDataRiskMatrixSettings);
        ConfigTypeFactory.registerConfigType(FactorDataHighlightSettings.configType, FactorDataHighlightSettings);
        ConfigTypeFactory.registerConfigType(CashflowDownloadSettings.configType, CashflowDownloadSettings);
        ConfigTypeFactory.registerConfigType(MarginAnalyticsCassiniSettings.configType, MarginAnalyticsCassiniSettings);
        ConfigTypeFactory.registerConfigType(OverrideDateSortByOldest.configType, OverrideDateSortByOldest);
        ConfigTypeFactory.registerConfigType(CommitmentRiskGrouping.configType, CommitmentRiskGrouping);
        ConfigTypeFactory.registerConfigType(CommitmentRiskScenario.configType, CommitmentRiskScenario);
        ConfigTypeFactory.registerConfigType(WidgetInputType.COMMITMENT_RISK_CHART_COLUMNS, ColumnSet);
        ConfigTypeFactory.registerConfigType(WidgetInputType.COMMITMENT_RISK_TABLE_COLUMNS, ColumnSet);
        ConfigTypeFactory.registerConfigType(WidgetInputType.DIVERSIFICATION_SCORE_FACTOR_SETTINGS, DiversificationScoreFactorSettings);
        ConfigTypeFactory.registerConfigType(ShowSectorLevelDataOnlyModel.configType, ShowSectorLevelDataOnlyModel);
    }

    static registerWidgetDisplayInputConfigTypes(): void {
        ConfigTypeFactory.registerConfigType(WidgetDisplayInputConfigType.CHART_SETTINGS, ChartSettings);
        ConfigTypeFactory.registerConfigType(WidgetDisplayInputConfigType.COMMITMENT_RISK_LEGEND_SETTINGS, CommitmentRiskLegendSettings);
    }

    static registerChartWidgetInputConfigTypes(): void {
        ConfigTypeFactory.registerConfigType(ChartWidgetInputConfigType.GRID_LINES, GridLines);
        ConfigTypeFactory.registerConfigType(ChartWidgetInputConfigType.PRIMARY_AXIS_SETTINGS, AxisSettings);
        ConfigTypeFactory.registerConfigType(ChartWidgetInputConfigType.SECONDARY_AXIS_SETTINGS, AxisSettings);
        ConfigTypeFactory.registerConfigType(ChartWidgetInputConfigType.TIME_PERIOD_INTERVAL_SETTINGS, TimePeriodIntervalSettings);
        ConfigTypeFactory.registerConfigType(ChartWidgetInputConfigType.SECONDARY_AXIS, SecondaryAxis);
        ConfigTypeFactory.registerConfigType(ChartWidgetInputConfigType.SECONDARY_AXIS_COLUMN, SecondaryAxis);
        ConfigTypeFactory.registerConfigType(ChartWidgetInputConfigType.COMBO_CHART_COLUMN_SETTINGS, ComboChartColumnSettings);
        ConfigTypeFactory.registerConfigType(ChartWidgetInputConfigType.COLOR_SCALE, ColorScale);
        ConfigTypeFactory.registerConfigType(ChartWidgetInputConfigType.PGS_STACKED_BAR_CHART_SETTINGS, PgsStackedBarChartSettingsModel);
        ConfigTypeFactory.registerConfigType(ChartWidgetInputConfigType.BAR_SETTINGS, BarChartSettings);
        ConfigTypeFactory.registerConfigType(ChartWidgetInputConfigType.CUSTOM_COLOR_POSITIVE_NEGATIVE, CustomColorPositiveNegative);
        ConfigTypeFactory.registerConfigType(ChartWidgetInputConfigType.RETURN_CHART_STYLE_SETTINGS, ReturnChartStyleSettingsModel);
        ConfigTypeFactory.registerConfigType(ChartWidgetInputConfigType.SORTED_COLUMNS_X, SortedColumnsX);
        ConfigTypeFactory.registerConfigType(ChartWidgetInputConfigType.SORTED_COLUMNS_Y, SortedColumnsY);
        ConfigTypeFactory.registerConfigType(ChartWidgetInputConfigType.ABSOLUTE_VALUE, AbsoluteValueSetting);
        ConfigTypeFactory.registerConfigType(ChartWidgetInputConfigType.PIE_CHART_DISPLAY, PieChartDisplayInput);
        ConfigTypeFactory.registerConfigType(ChartWidgetInputConfigType.SCATTER_SETTINGS, ScatterDrilldownSetting);
        ConfigTypeFactory.registerConfigType(ChartWidgetInputConfigType.TIME_SERIES_CHART_SETTINGS, TimeSeriesSettings);
        ConfigTypeFactory.registerConfigType(ChartWidgetInputConfigType.TIME_SERIES_FORMAT_SETTINGS, TimeSeriesSettings);
        ConfigTypeFactory.registerConfigType(ChartWidgetInputConfigType.TIME_SERIES_TIME_PERIOD_SETTINGS, TimeSeriesSettings);
        ConfigTypeFactory.registerConfigType(ChartWidgetInputConfigType.DECARBONIZATION_CHART_SETTINGS, DecarbonizationChartSettings);

        // legacy input config types
        ConfigTypeFactory.registerConfigType(legacyWidgetInputConfigTypes.OVERRIDE_AXIS_TITLE, AxisSettings);
    }

    /**
     * Initialize the required configs for definitions service
     */
    static registerDefinitionsConfigTypes() {
        // The reason we have done this here rather than in individual models is to allow lazy loading... So Angular unlike Angular js supports lazy loading which means
        // that all the models listed below are not loaded until they are needed.. We want to register them before invoking Definitions service though hence making sure that we call this when
        // Definitions Service is initialized.. If we keep it in the respective models, them we would need to add these as providers in the metadata.module.ts to eager load them
        ConfigTypeFactory.registerConfigType(ColumnConstants.GP_BREAKDOWN_COL_DEF_BEAN, GpBreakdownColumnDefinition);
        ConfigTypeFactory.registerConfigType(ColumnConstants.PRAADA_BREAKDOWN_COL_DEF_BEAN, PraadaBreakdownColumnDefinition);

        ConfigTypeFactory.registerConfigType(DateFormat.CONFIG_TYPE, DateFormat);
        ConfigTypeFactory.registerConfigType(TimeSpanColumnFormat.CONFIG_TYPE, TimeSpanColumnFormat);
    }

    /**
     * Register the config objects with the factory under all the names it is known.
     */
    static registerWorkspaceConfigTypes(): void {
        ConfigTypeFactory.registerConfigType(Workspace.configType, Workspace);
        ConfigTypeFactory.registerConfigType('WORKSPACE', Workspace);
        ConfigTypeFactory.registerConfigType(FlatWorkpad.configType, FlatWorkpad);
        ConfigTypeFactory.registerConfigType(ReportGroup.configType, ReportGroup);
        ConfigTypeFactory.registerConfigType(Portfolio.configType, Portfolio);
        ConfigTypeFactory.registerConfigType(Report.configType, Report);
        ConfigTypeFactory.registerConfigType('layouts', Report);
        ConfigTypeFactory.registerConfigType('LAYOUT', Report);
    }

    /**
     * Initialize the required configs for column options
     */
    static registerColumnOptionTypes() {
        ColumnOptionFactory.registerOptionType(ColumnBreakdown.CONFIG_TYPE, ColumnBreakdown);
        ColumnOptionFactory.registerOptionType(CumulativeReturnColumnOption.CONFIG_TYPE, CumulativeReturnColumnOption);
        ColumnOptionFactory.registerOptionType(SecurityContributionSettings.CONFIG_TYPE, SecurityContributionSettings);
        ColumnOptionFactory.registerOptionType(CollapsedLookthroughColumnOption.CONFIG_TYPE, CollapsedLookthroughColumnOption);
    }

    /**
     * Initialize data formatter config types
     */
    static registerDataFormatterTypes() {
        FormatAndScaleFactory.registerFormatterType(DateFormat.CONFIG_TYPE, DateDataFormatter);
        FormatAndScaleFactory.registerFormatterType(TimeSpanColumnFormat.CONFIG_TYPE, TimeSpanDataFormatter);
    }

    /**
     * Initialize holding changes config types
     */
    static registerHoldingChangeTypes() {
        HoldingChangeFactory.registerChangeType(CompositionConstants.HOLDING_CHANGE_TYPES.SECURITY, PortfolioSecurityHoldingChange);
        HoldingChangeFactory.registerChangeType(CompositionConstants.HOLDING_CHANGE_TYPES.NEW_SECURITY, NewSecurityHoldingChange);
        HoldingChangeFactory.registerChangeType(CompositionConstants.HOLDING_CHANGE_TYPES.PORTFOLIO, PortfolioHoldingChange);
        HoldingChangeFactory.registerChangeType(CompositionConstants.HOLDING_CHANGE_TYPES.NEW_PORTFOLIO, NewPortfolioHoldingChange);
        HoldingChangeFactory.registerChangeType(CompositionConstants.HOLDING_CHANGE_TYPES.PORT_SECURITIES, PortfolioSecuritiesHoldingChange);
        HoldingChangeFactory.registerChangeType(CompositionConstants.HOLDING_CHANGE_TYPES.PORTFOLIO_NAV_SECURITY, PortfolioNavSecurityHoldingChange);
    }

    static registerCompositionTypes(): void {
        ConfigTypeFactory.registerConfigType(CompositionSetting.configType, CompositionSetting);
        ConfigTypeFactory.registerConfigType(FactorExposureCompositionSetting.configType, FactorExposureCompositionSetting);
        ConfigTypeFactory.registerConfigType(CompositionRule.configType, CompositionRule);
    }

    /**
     * Initialize portfolio modeling rule types
     */
    static registerRuleTypes() {
        RuleFactory.registerRuleType(CompositionConstants.RULE_TYPES.PORTFOLIO, PortfolioRule);
        RuleFactory.registerRuleType(CompositionConstants.RULE_TYPES.ACTIVE_SECTOR, ActiveSectorRule);
        RuleFactory.registerRuleType(CompositionConstants.RULE_TYPES.ACTIVE_SECURITY, ActiveSecurityRule);
        RuleFactory.registerRuleType(CompositionConstants.RULE_TYPES.SECTOR, SectorRule);
        RuleFactory.registerRuleType(CompositionConstants.RULE_TYPES.NAV_SECURITY, NAVSecurityRule);
        RuleFactory.registerRuleType(CompositionConstants.RULE_TYPES.PORTFOLIO_NAV_SECURITY, PortfolioNavSecurityRule);
        RuleFactory.registerRuleType(CompositionConstants.RULE_TYPES.BREAKDOWN_TREE, BreakdownTreeRule);
        RuleFactory.registerRuleType(CompositionConstants.RULE_TYPES.ACTIVE_BREAKDOWN, ActiveBreakdownRule);
    }

    /**
     * Initialize all different portfolio config types
     */
    static registerPortfolioTypes() {
        ConfigTypeFactory.registerConfigType(WhatIfPortfolio.configType, WhatIfPortfolio);
        ConfigTypeFactory.registerConfigType(PortfolioWithPositions.configType, PortfolioWithPositions);
        ConfigTypeFactory.registerConfigType(RulesBasedPortfolio.configType, RulesBasedPortfolio);
        ConfigTypeFactory.registerConfigType(AdhocPortfolio.configType, AdhocPortfolio);
        ConfigTypeFactory.registerConfigType(AdhocPortGroup.configType, AdhocPortGroup);
    }

    /**
     * Initialize all export and batch reporting related config types
     */
    static registerExportTypes() {
        // Export types
        ConfigTypeFactory.registerConfigType(ExcelExportConfig.CONFIG_TYPE, ExcelExportConfig);
        ConfigTypeFactory.registerConfigType(WorkpadExcelExportConfig.CONFIG_TYPE, WorkpadExcelExportConfig);
        ConfigTypeFactory.registerConfigType(PDFExportConfig.CONFIG_TYPE, PDFExportConfig);
        ConfigTypeFactory.registerConfigType(TablePDFExportConfig.CONFIG_TYPE, TablePDFExportConfig);

        // Batch reporting types
        ConfigTypeFactory.registerConfigType(BatchReportConfig.configType, BatchReportConfig);
        ConfigTypeFactory.registerConfigType('BATCH_REPORTING', BatchReportConfig);
        ConfigTypeFactory.registerConfigType(BatchRowConfig.configType, BatchRowConfig);

        // Scheduled batch reporting types
        ConfigTypeFactory.registerConfigType(ScheduledBatchConfig.configType, ScheduledBatchConfig);
        ConfigTypeFactory.registerConfigType(BatchSchedule.configType, BatchSchedule);
        ConfigTypeFactory.registerConfigType(BatchDailyFrequency.configType, BatchDailyFrequency);
        ConfigTypeFactory.registerConfigType(BatchMonthlyFrequency.configType, BatchMonthlyFrequency);
    }

    static registerWhatIfTypes() {
        ConfigTypeFactory.registerConfigType(OptimizationSettings.configType, OptimizationSettings);
        ConfigTypeFactory.registerConfigType(RiskParitySettings.configType, RiskParitySettings);
    }

    /**
     * Initialize all Lookthrough related config types
     */
    static registerLookthroughTypes() {
        ConfigTypeFactory.registerConfigType(LookthroughFilterRule.configType, LookthroughFilterRule);
        ConfigTypeFactory.registerConfigType(LookthroughfilterRulesFav.configType, LookthroughfilterRulesFav);
    }

    /**
     * Initializes all the highlight rule types to their corresponding classes
     */
    static registerHighlightRuleTypes() {
        HighlightRuleFactory.registerRuleType(HighlightComparisonType.EQUALS, EqualsHighlightRule);
        HighlightRuleFactory.registerRuleType(HighlightComparisonType.DOES_NOT_EQUAL, EqualsHighlightRule);
        HighlightRuleFactory.registerRuleType(HighlightComparisonType.GREATER_THAN, LessThanGreaterThanHighlightRule);
        HighlightRuleFactory.registerRuleType(HighlightComparisonType.LESS_THAN, LessThanGreaterThanHighlightRule);
        HighlightRuleFactory.registerRuleType(HighlightComparisonType.GT_THAN_EQUAL, LessThanGreaterThanHighlightRule);
        HighlightRuleFactory.registerRuleType(HighlightComparisonType.LESS_THAN_EQUAL, LessThanGreaterThanHighlightRule);
        HighlightRuleFactory.registerRuleType(HighlightComparisonType.STARTS_WITH, StringHighlightRule);
        HighlightRuleFactory.registerRuleType(HighlightComparisonType.CONTAINS, StringHighlightRule);
        HighlightRuleFactory.registerRuleType(HighlightComparisonType.DOES_NOT_CONTAIN, StringHighlightRule);
        HighlightRuleFactory.registerRuleType(HighlightComparisonType.TOP, TopBottomHighlightRule);
        HighlightRuleFactory.registerRuleType(HighlightComparisonType.BOTTOM, TopBottomHighlightRule);
        HighlightRuleFactory.registerRuleType(HighlightComparisonType.BETWEEN, BetweenHighlightRule);
        HighlightRuleFactory.registerRuleType(HighlightComparisonType.STD_DEV_IN, StdDeviationHighlightRule);
        HighlightRuleFactory.registerRuleType(HighlightComparisonType.STD_DEV_OUT, StdDeviationHighlightRule);
        HighlightRuleFactory.registerRuleType(HighlightComparisonType.QUANTILE, QuantileHighlightRule);
    }
}
