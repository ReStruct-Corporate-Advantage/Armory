import {TelemetryEventsProtobuffFactory} from './factories/telemetry-events-protobuff.factory';
import {TelemetryPortfolioActionTracker} from './scenarios/portfolio-actions/telemetry-portfolio-action-tracker';
import {TelemetryColumnActionTracker} from './scenarios/column-actions/telemetry-column-action-tracker';
import {TelemetryFavoriteConfigActionTracker} from './scenarios/favorite-config-actions/telemetry-favorite-config-action-tracker';
import {TelemetryActionConstants} from './constants/telemetry-action.constants';
import {TelemetryMenuOptionActionTracker} from './scenarios/menu-option-actions/telemetry-menu-option-action-tracker';
import {TelemetryCustomCalcActionTracker} from './scenarios/custom-calc-actions/telemetry-custom-calc-action-tracker';
import {TelemetryWidgetReloadActionTracker} from './scenarios/report-actions/telemetry-widget-reload-action-tracker';
import {TelemetryReportActionTracker} from './scenarios/report-actions/telemetry-report-action-tracker';
import {TelemetryMenuOptionWorkspaceDateChangedTracker} from './scenarios/menu-option-actions/telemetry-menu-option-workspace-date-changed-tracker';
import {TelemetryColumnFilteringActionTracker} from './scenarios/column-actions/telemetry-column-filtering-action-tracker';
import {TelemetryCollapsedLookThroughErrorTracker} from './scenarios/widget-actions/telemetry-collapsed-look-through-error-tracker';
import {TelemetryWidgetSearchActionTracker} from './scenarios/widget-actions/telemetry-widget-search-action-tracker';
import {TelemetryWhatIfPortfolioTracker} from './scenarios/portfolio-actions/telemetry-what-if-portfolio-tracker';
import {TelemetryCustomPortfolioTracker} from './scenarios/portfolio-actions/telemetry-custom-portfolio-tracker';
import {TelemetryClickOnOptimizationSummaryTracker} from './scenarios/modelling-actions/telemetry-click-on-optimization-summary-tracker';
import {TelemetryClickOnOptimizeModelTracker} from './scenarios/modelling-actions/telemetry-click-on-optimize-model-tracker';
import {TelemetryTradeTableExportTracker} from './scenarios/export-actions/telemetry-trade-table-export-tracker';
import {TelemetryClickOnHelpTracker} from './scenarios/modelling-actions/telemetry-click-on-help-tracker';
import {TelemetryClickOnResetCompositionTracker} from './scenarios/modelling-actions/telemetry-click-on-reset-composition-tracker';
import {TelemetryOptimizationRunTracker} from './scenarios/optimization-run-actions/telemetry-optimization-run-tracker';
import {TelemetryClickOnAddCashTracker} from './scenarios/modelling-actions/telemetry-click-on-add-cash-tracker';
import {TelemetryModellingAddEntitiesTracker} from './scenarios/modelling-actions/telemetry-modelling-add-entities-tracker';
import {TelemetryGenerateApiRequestActionTracker} from './scenarios/widget-actions/telemetry-generate-api-request-action-tracker';
import {TelemetryExportExcelRequestTracker} from './scenarios/export-actions/telemetry-export-excel-request-tracker';
import {TelemetryExportPDFRequestTracker} from './scenarios/export-actions/telemetry-export-pdf-request-tracker';
import {TelemetryDeleteFavoriteTracker} from './scenarios/delete-favorite-actions/telemetry-delete-favorite-tracker';
import {TelemetryUIErrorTracker} from './scenarios/errors/telemetry-ui-error-tracker';
import {UIErrorParameters} from './scenarios/errors/ui-error-parameters';
import {TelemetryClickEventTracker} from './scenarios/element-click-actions/telemetry-click-event-tracker';
import {
    TelemetryComparisonModeTracker,
    TelemetryCompositionChangeTracker, TelemetryFactorDataRiskMatrixRequestTracker, TelemetryFactorDataTimeSeriesRequestTracker,
    TelemetryLoadOptimizationScenariosTracker, TelemetryPgsChartsTracker, TelemetryRiskBudgetingTracker
} from './scenarios';
import {TelemetryLoadPortfolioTracker} from './scenarios/portfolio-actions/telemetry-load-portfolio-tracker';
import {TelemetrySaveWhatIfPortfolioTracker} from './scenarios/portfolio-actions/telemetry-save-what-if-portfolio-tracker';
import {TelemetryInvestmentUniverseTracker} from './scenarios/optimization-run-actions/telemetry-investment-universe-run-tracker';
import {TelemetryColumnSearchActionTracker} from './scenarios/column-actions/telemetry-column-search-action-tracker';
import {TelemetryGenericEventTracker} from './generic-event';
import {TelemetryConstraintsTracker} from './scenarios/optimization-run-actions/telemetry-constraints-tracker';
import {TelemetryWidgetStyleAnalysisTracker} from './scenarios/widget-actions/telemetry-widget-style-analysis-tracker';
import {TelemetrySemanticSearchActionTracker} from './scenarios/column-actions/telemetry-semantic-search-action-tracker';
import {TelemetryStressScenarioCreationConfigEventTracker} from './scenarios/column-actions/stress-scenarios/telemetry-stress-scenario-creation-config-event-tracker';

export class TelemetryRegisterInitializer {
    static initialize() {
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.GENERIC_EVENT, TelemetryGenericEventTracker);
        TelemetryRegisterInitializer.registerPortfolioActions();
        TelemetryRegisterInitializer.registerColumnActions();
        TelemetryRegisterInitializer.registerFavoriteConfigActions();
        TelemetryRegisterInitializer.registerMenuOptionActions();
        TelemetryRegisterInitializer.registerUserActions();
        TelemetryRegisterInitializer.registerCustomCalcActions();
        TelemetryRegisterInitializer.registerErrorActions();
    }

    static registerPortfolioActions() {
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.PORTFOLIO.ADD_PORTFOLIO, TelemetryPortfolioActionTracker);
    }

    static registerColumnActions() {
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.COLUMN.SHOW_COLUMN_DEFINITION, TelemetryColumnActionTracker);
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.COLUMN.COLUMN_FILTER, TelemetryColumnFilteringActionTracker);
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.COLUMN.STRESS_SCENARIO_CREATION, TelemetryStressScenarioCreationConfigEventTracker);
    }

    static registerFavoriteConfigActions() {
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.FAVORITE.LOAD_FAVORITE, TelemetryFavoriteConfigActionTracker);
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.FAVORITE.LOAD_PORTFOLIO, TelemetryLoadPortfolioTracker);
    }

    static registerMenuOptionActions() {
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.MENU_OPTIONS.RUN_ALL_REPORTS, TelemetryMenuOptionActionTracker);
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.MENU_OPTIONS.GET_WORKSPACE_URL, TelemetryMenuOptionActionTracker);
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.MENU_OPTIONS.SET_WORKSPACE_DATE, TelemetryMenuOptionWorkspaceDateChangedTracker);
    }

    static registerUserActions() {
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.USER_BEHAVIOUR.RELOAD_WIDGET, TelemetryWidgetReloadActionTracker);
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.USER_BEHAVIOUR.RELOAD_OR_CANCEL_REPORT, TelemetryReportActionTracker);
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.USER_BEHAVIOUR.ADD_WIDGET, TelemetryReportActionTracker);
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.USER_BEHAVIOUR.COMPARISON_MODE, TelemetryComparisonModeTracker);
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.USER_BEHAVIOUR.WIDGET_SHOW_FOOTNOTES, TelemetryReportActionTracker);
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.USER_BEHAVIOUR.WIDGET_COPY_PASTE, TelemetryReportActionTracker);
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.USER_BEHAVIOUR.WIDGET_SEARCH, TelemetryWidgetSearchActionTracker);
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.USER_BEHAVIOUR.COMPOSITION_CHANGE, TelemetryCompositionChangeTracker);
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.USER_BEHAVIOUR.EXPORT_TRADE_TABLE, TelemetryTradeTableExportTracker);
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.USER_BEHAVIOUR.ADD_WHAT_IF_PORTFOLIO, TelemetryWhatIfPortfolioTracker);
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.USER_BEHAVIOUR.CUSTOM_PORTFOLIO_STATS, TelemetryCustomPortfolioTracker);
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.USER_BEHAVIOUR.CLICK_ON_OPTIMIZE_MODEL, TelemetryClickOnOptimizeModelTracker);
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.USER_BEHAVIOUR.CLICK_ON_OPTIMIZATION_SUMMARY, TelemetryClickOnOptimizationSummaryTracker);
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.USER_BEHAVIOUR.MODELLING_CLICK_ON_HELP, TelemetryClickOnHelpTracker);
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.USER_BEHAVIOUR.LOAD_OPTIMIZATION_SCENARIOS, TelemetryLoadOptimizationScenariosTracker);
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.USER_BEHAVIOUR.CLICK_ON_RESET_COMPOSITION, TelemetryClickOnResetCompositionTracker);
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.USER_BEHAVIOUR.RUN_OPTIMIZATION, TelemetryOptimizationRunTracker);
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.USER_BEHAVIOUR.RUN_OPTIMIZATION_CONSTRAINTS, TelemetryConstraintsTracker);
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.USER_BEHAVIOUR.RISK_BUDGETING_DETAILS, TelemetryRiskBudgetingTracker);
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.USER_BEHAVIOUR.CLICK_ON_ADD_CASH, TelemetryClickOnAddCashTracker);
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.USER_BEHAVIOUR.ADD_ENTITIES, TelemetryModellingAddEntitiesTracker);
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.USER_BEHAVIOUR.CLICK_ON_GENERATE_API_REQUEST, TelemetryGenerateApiRequestActionTracker);
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.USER_BEHAVIOUR.CLICK_ON_EXCEL_EXPORT, TelemetryExportExcelRequestTracker);
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.USER_BEHAVIOUR.CLICK_ON_PDF_EXPORT, TelemetryExportPDFRequestTracker);
        TelemetryEventsProtobuffFactory.registerProtoTypes(UIErrorParameters.ACTION, TelemetryUIErrorTracker);
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.USER_BEHAVIOUR.CLICK_ON_DELETE_FAVORITE, TelemetryDeleteFavoriteTracker);
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.USER_BEHAVIOUR.CLICK_ON_UI_ELEMENT, TelemetryClickEventTracker);
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.USER_BEHAVIOUR.SAVE_WHAT_IF, TelemetrySaveWhatIfPortfolioTracker);
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.USER_BEHAVIOUR.INVESTMENT_UNIVERSE, TelemetryInvestmentUniverseTracker);
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.USER_BEHAVIOUR.COLUMN_SEARCH_QUERY, TelemetryColumnSearchActionTracker);
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.USER_BEHAVIOUR.SEMANTIC_SEARCH_QUERY, TelemetrySemanticSearchActionTracker);
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.USER_BEHAVIOUR.STYLE_ANALYSIS_COLUMNS, TelemetryWidgetStyleAnalysisTracker);
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.USER_BEHAVIOUR.FACTOR_DATA_WIDGET_RISK_MATRIX_REQUEST, TelemetryFactorDataRiskMatrixRequestTracker);
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.USER_BEHAVIOUR.FACTOR_DATA_WIDGET_TIME_SERIES_REQUEST, TelemetryFactorDataTimeSeriesRequestTracker);
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.USER_BEHAVIOUR.PGS_CHART_LAUNCHED, TelemetryPgsChartsTracker);

    }

    static registerErrorActions() {
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.UI_ERRORS.COLLAPSED_LOOK_THROUGH_ERROR, TelemetryCollapsedLookThroughErrorTracker);
    }

    static registerCustomCalcActions() {
        TelemetryEventsProtobuffFactory.registerProtoTypes(TelemetryActionConstants.CUSTOM_CALC.FORMULA_SHORTCUT_CLICKED, TelemetryCustomCalcActionTracker);
    }
}
