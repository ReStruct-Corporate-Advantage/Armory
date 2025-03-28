import {RiskParityCase} from '@enums/risk-parity-case.enum';
import {TierDefinitionType} from '@enums/tier-definition-type.enum';
import {NumberUtils} from '@utils/number.utils';

/**
 * Constants for Optimization
 */
export class OptimizationConstants {

    /**
     * Static string for Absolute objective type
     */
    static readonly ACTIVE_OBJECTIVE_TYPE = 'Active';

    /**
     * Static string for General Portfolio Objectives
     */
    static readonly GENERAL_PORTFOLIO_OBJECTIVE = 'General';

    /**
     * Static string for General Portfolio Objectives
     */
    static readonly STRESS_SCENARIO_PORTFOLIO_OBJECTIVE = 'STRESS_SCENARIO';

    static readonly ALPHA_SCORE_PORTFOLIO_OBJECTIVE = 'ALPHA_SCORE';

    static readonly STRESS_SCENARIO_DATE_RANGE = 'MAXIMIZE_RETURNS_DATE_RANGE_SCENARIO';

    /**
     * Key to represent the objectives type
     */
    static readonly OBJECTIVES_TYPE = 'type';

    /**
     * New optimization settings title
     */
    static readonly NEW_OPTO_SETTINGS_TITLE = 'Optimization Settings';

    /**
     * Risk Parity settings title
     */
    static readonly RISK_PARITY_SETTINGS_TITLE = 'Risk Parity Settings';

    /**
     * Static string for General Portfolio Objectives
     */
    static readonly MAXIMIZE_ALPHA_STRESS_SCENARIO = 'MAXIMIZE_ALPHA_STRESS_SCENARIO';

    static readonly MAXIMIZE_ALPHA_SCORE = 'MAXIMIZE_ALPHA_SCORE';

    static readonly MINIMIZE_TCOST = 'MINIMIZE_TCOST';

    static readonly MINIMIZE_RISK = 'MINIMIZE_RISK';

    static readonly MINIMIZE_SYSTEMATIC_RISK = 'MINIMIZE_SYSTEMATIC_RISK';

    static readonly ALPHA_SCORE_BUTTON_TITLE = 'Add Column';

    /**
     * Static string for Absolute objective type
     */
    static readonly ABSOLUTE_OBJECTIVE_TYPE = 'Absolute';

    /**
     * Static string for Allow short position column tag
     */
    static readonly ALLOW_SHORT_POSITION_COL_TAG = 'allow_short_position';

    /**
     * Static string for Allow short position column title
     */
    static readonly ALLOW_SHORT_POSITION = 'Allow Short Positions';

    /**
     * Static string for Notional budget column tag
     */
    static readonly NOTIONAL_BUDGET_COL_TAG = 'notl_budget_const';

    /**
     * constant indicating manual quick factor block change
     */
    static readonly MANUAL_QUICK_FACTOR_CHANGE = 'opened,changed';

    /**
     * constant indicating programmatic quick factor block change
     */
    static readonly PROGRAMMATIC_QUICK_FACTOR_CHANGE = 'changed';

    /**
     * constant indicating programmatic quick factor block opened
     */
    static readonly MANUAL_QUICK_FACTOR_OPENED = 'opened';

    /**
     * Timeout options for optimization
     */
    static readonly FIRST_SOLUTION = 'FIRST_SOLUTION';
    static readonly TIMEOUT_LIMIT = 'TIMEOUT_LIMIT';
    static readonly MAX_TIMEOUT_LIMIT = 'MAX_TIMEOUT_LIMIT';

    /**
     * Label for timeout options
     */
    static readonly ABSOLUTE_RISK_LABEL = 'Absolute';
    static readonly ACTIVE_RISK_LABEL = 'Active';

    /**
     * Label for timeout options
     */
    static readonly FIRST_SOLUTION_LABEL = 'First solution available';
    static readonly TIMEOUT_LIMIT_LABEL = 'Optimal result within timeout limit';
    static readonly MAX_TIMEOUT_LIMIT_LABEL = 'Best result within maximum timeout limit';

    /**
     * title for timeout options
     */
    static readonly FIRST_SOLUTION_TITLE = 'This option returns the first viable solution the solver can find \nwithin 1 minute.';
    static readonly TIMEOUT_LIMIT_TITLE = 'This option allows for the flexibility to toggle between precision \nand speed. Note that the timeout is applied on \nthe optimization solver. Actual run time will take longer.';
    static readonly MAX_TIMEOUT_LIMIT_TITLE = 'This option allows solver to search for the optimal solution \nwithin 15 minutes.';

    /**
     * title for risk parity options
     */
    static readonly RISK_PARITY_ABSOLUTE_TITLE = 'Absolute - The most basic absolute risk budget optimization is the case of risk parity, which equalizes the risk contribution across all non-cash holdings based on a target risk contribution to each asset. The target risk contribution for each asset is dictated by the number of holdings in the investment universe. For example, if the portfolio has 20 positions, each security will contribute to 1/20 (0.05) of the risk. Additionally, for a more general absolute risk budget case, the user can specify percentage amounts that an individual asset should contribute to the final total risk.';
    static readonly RISK_PARITY_ACTIVE_TITLE = '\n \n  Active - An active risk budget optimization takes as input the initial active risk contribution of a portfolio and reallocates that risk based on security tiers. The tiers are derived based on first ranking the active weights of the initial portfolio. With this ranking, the user can define the tier cutoff by setting the number of assets to be placed in each tier or by setting the percentile threshold for each tier. Additionally, the ratio of active risk allocated to each security in a tier relative to the active risk of each asset in the highest tier can be set to determine relative risk budget, thus representing conviction in allocating to a tier.';

    static readonly MANUAL_ITERATION_TYPE = 'Manual';
    static readonly PRE_DEFINED_ITERATION_TYPE = 'Pre-defined';

    /**
     * Timeout options to be displayed in optimization
     */
    static readonly TIMEOUT_OPTIONS: { value: string, label: string, title: string }[] = [
        {value: OptimizationConstants.FIRST_SOLUTION, label: OptimizationConstants.FIRST_SOLUTION_LABEL,  title: OptimizationConstants.FIRST_SOLUTION_TITLE},
        {value: OptimizationConstants.TIMEOUT_LIMIT, label: OptimizationConstants.TIMEOUT_LIMIT_LABEL,  title: OptimizationConstants.TIMEOUT_LIMIT_TITLE},
        {value: OptimizationConstants.MAX_TIMEOUT_LIMIT, label: OptimizationConstants.MAX_TIMEOUT_LIMIT_LABEL,  title: OptimizationConstants.MAX_TIMEOUT_LIMIT_TITLE},
    ];

    /**
     * Timeout options to be displayed in optimization
     */
    static readonly RISK_PARITY_OPTIONS: { value: RiskParityCase, label: string}[] = [
        {value: RiskParityCase.ABSOLUTE, label: OptimizationConstants.ABSOLUTE_RISK_LABEL},
        {value: RiskParityCase.ACTIVE, label: OptimizationConstants.ACTIVE_RISK_LABEL}
    ];

    static readonly TIER_DEFINITION_TYPE_OPTIONS: { value: TierDefinitionType, label: string, title: string, tooltipText: string }[] = [
        {value: TierDefinitionType.NAME, label: 'Name',  title: 'Name', tooltipText: 'The number of names specified here determines the cutoff point for which assets are considered to be Tier 1, Tier 2, or Tier 3 based on the active market value weight rank, with Tier 3 referring to any asset beyond the defined Tier 2 rank cutoff.'},
        {value: TierDefinitionType.PERCENTILE, label: 'Percentile',  title: 'Percentile', tooltipText: 'The active market value weight percentile specified here determines the cutoff point for which assets are considered to be Tier 1, Tier 2, or Tier 3, with Tier 3 referring to any asset with an active market value weight percentile beyond the defined Tier 2 cutoff. The percentile is determined based on high to low sorting.'}
    ];

    static readonly UPLOAD_ALPHA_SECURITY_SEARCH_COL_DEF = {
        headerName: 'Alpha',
        field: 'alpha',
        type: 'auxNumberColumn',
        filter: 'auxNumberFilter',
        hide: false,
        minWidth: 140,
        editable: true,
        valueFormatter: params => NumberUtils.numberColumnFormatter(params),
        valueSetter: params => NumberUtils.percentageValueSetter(params)
    };

    static readonly SECURITY_CONSTRAINT_RISK_BUDGETING_COL_DEF = {
        headerName: 'Risk Budgeting Percentage',
        field: 'riskContributionPercentage',
        type: 'auxNumberColumn',
        filter: 'auxNumberFilter',
        hide: false,
        minWidth: 140,
        editable: true,
        valueFormatter: params => NumberUtils.numberColumnFormatter(params),
        valueSetter: params => NumberUtils.percentageValueSetter(params)
    };

    static readonly SECURITY_CONSTRAINT_RISK_BUDGETING = 'security_constraints_risk_budgeting';
    static readonly ACTIVE_SECTOR_CONSTRAINTS_INFO = 'Active constraints should be defined using a relative bound type to the benchmark.';

    /**
     * Efficient frontier constraint help message
     */
    static readonly EF_HELP_MSG_TXT = 'To run the efficient frontier analysis, please:';
    static readonly EF_HELP_MSG_TXT_OPTION_1 = `Either specify the two endpoints, separated by ':'. (By default, the analysis will create 10 iterations on the frontier. To change this default setting, please go to 'Optimization Settings'. )`;
    static readonly EF_HELP_MSG_TXT_OPTION_2 = `Or specify the individual points on the frontier, separated by ','.`;
}
