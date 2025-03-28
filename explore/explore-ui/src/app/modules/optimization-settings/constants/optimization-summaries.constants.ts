import {OptimizationSummary} from '@optimization-settings-configuration/models/optimization-summary.model';
import {
    SUB_TYPE_FACTOR_CONSTRAINTS,
    SUB_TYPE_PORTFOLIO_CONSTRAINTS, SUB_TYPE_RELAXATION_CONSTRAINTS,
    SUB_TYPE_SECTOR_CONSTRAINTS,
    SUB_TYPE_SECURITY_CONSTRAINTS,
    TYPE_CONSTRAINTS,
    TYPE_INVESTMENT_UNIVERSE,
    TYPE_OBJECTIVES,
    TYPE_TIERS
} from './optimization-types.constants';
import {
    FACTOR_CONSTRAINTS_COL_DEFS, FACTOR_CONSTRAINTS_COL_DEFS_SHORT,
    PORTFOLIO_CONSTRAINTS_COL_DEFS, PORTFOLIO_CONSTRAINTS_COL_DEFS_SHORT,
    RELAXATION_CONSTRAINTS_COL_DEFS,
    SECTOR_CONSTRAINTS_COL_DEFS, SECTOR_CONSTRAINTS_COL_DEFS_SHORT,
    SECURITY_CONSTRAINTS_COL_DEFS, SECURITY_CONSTRAINTS_COL_DEFS_SHORT
} from '../constraints-settings/constants/constraint-col-defs.constants';
import {
    TAB_NAME_SCREENING,
    TAB_NAME_SECURITY_CONSTRAINTS
} from '@optimization-settings/constants/settings-tab-metadata.constants';
import {OptimizationConstants} from '@constants/optimization.constants';
import {
    FACTOR_CONSTRAINTS_TITLE,
    PORTFOLIO_CONSTRAINTS_TITLE, RELAXATION_CONSTRAINTS_TITLE, SECTOR_CONSTRAINTS_TITLE,
    SECURITY_CONSTRAINTS_TITLE
} from '@optimization-settings/constants/optimization-title.constants';

export const INVESTMENT_UNIVERSE_OPTIMIZATION_SUMMARY: OptimizationSummary = {
    title: 'Investment Universe',
    type: TYPE_INVESTMENT_UNIVERSE,
    columns: [
        {field: 'type', headerName: 'Type'},
        {field: 'name', headerName: 'Name'},
        {field: 'label', headerName: 'Label'}
    ]
};

export const OBJECTIVES_OPTIMIZATION_SUMMARY: OptimizationSummary = {
    title: 'Objectives',
    type: TYPE_OBJECTIVES,
    columns: [
        {field: 'objective', headerName: 'Objective'},
        {field: 'weight', headerName: 'Weight', type: 'auxNumberColumn', filter: 'auxNumberFilter'}
    ],
    additionalData: {
        optionsLabel: 'Objective Function Exposure'
    }
};

export const SCREENING_OPTIMIZATION_SUMMARY: OptimizationSummary = {
    title: 'Screening',
    type: TAB_NAME_SCREENING.toLowerCase(),
    columns: [
        {field: 'screening', headerName: 'Screening filter title'},
    ]
};

export const SECURITY_CONSTRAINTS_RISK_BUDGETING: OptimizationSummary = {
    title: TAB_NAME_SECURITY_CONSTRAINTS,
    type: OptimizationConstants.SECURITY_CONSTRAINT_RISK_BUDGETING,
    columns: [
        {field: 'security_constraints', headerName: 'Security List'},
    ]
};

export const TIER_DEFINITIONS_OPTIMIZATION_SUMMARY: OptimizationSummary = {
    title: 'Tier Definition',
    type: TYPE_TIERS,
    columns: [
        {field: 'tierType', headerName: 'Tier Type'},
        {field: 'tierOne', headerName: 'Tier One', type: 'auxNumberColumn'},
        {field: 'tierTwo', headerName: 'Tier Two', type: 'auxNumberColumn'},
        {field: 'riskBudgetTierRatio', headerName: 'Tier 2 Risk Contribution Ratio'}
    ]
};

export const PORTFOLIO_CONSTRAINTS_OPTIMIZATION_SUMMARY: OptimizationSummary = {
    title: PORTFOLIO_CONSTRAINTS_TITLE,
    type: TYPE_CONSTRAINTS,
    subType: SUB_TYPE_PORTFOLIO_CONSTRAINTS,
    columns: PORTFOLIO_CONSTRAINTS_COL_DEFS
};

export const SECURITY_CONSTRAINTS_OPTIMIZATION_SUMMARY: OptimizationSummary = {
    title: SECURITY_CONSTRAINTS_TITLE,
    type: TYPE_CONSTRAINTS,
    subType: SUB_TYPE_SECURITY_CONSTRAINTS,
    columns: SECURITY_CONSTRAINTS_COL_DEFS
};

export const SECTOR_CONSTRAINTS_OPTIMIZATION_SUMMARY: OptimizationSummary = {
    title: SECTOR_CONSTRAINTS_TITLE,
    type: TYPE_CONSTRAINTS,
    subType: SUB_TYPE_SECTOR_CONSTRAINTS,
    columns: SECTOR_CONSTRAINTS_COL_DEFS
};

export const FACTOR_CONSTRAINTS_OPTIMIZATION_SUMMARY: OptimizationSummary = {
    title: FACTOR_CONSTRAINTS_TITLE,
    type: TYPE_CONSTRAINTS,
    subType: SUB_TYPE_FACTOR_CONSTRAINTS,
    columns: FACTOR_CONSTRAINTS_COL_DEFS
};

export const PORTFOLIO_CONSTRAINTS_OPTIMIZATION_SUMMARY_SHORT: OptimizationSummary = {
    title: PORTFOLIO_CONSTRAINTS_TITLE,
    type: TYPE_CONSTRAINTS,
    subType: SUB_TYPE_PORTFOLIO_CONSTRAINTS,
    columns: PORTFOLIO_CONSTRAINTS_COL_DEFS_SHORT
};

export const SECURITY_CONSTRAINTS_OPTIMIZATION_SUMMARY_SHORT: OptimizationSummary = {
    title: SECURITY_CONSTRAINTS_TITLE,
    type: TYPE_CONSTRAINTS,
    subType: SUB_TYPE_SECURITY_CONSTRAINTS,
    columns: SECURITY_CONSTRAINTS_COL_DEFS_SHORT
};

export const SECTOR_CONSTRAINTS_OPTIMIZATION_SUMMARY_SHORT: OptimizationSummary = {
    title: SECTOR_CONSTRAINTS_TITLE,
    type: TYPE_CONSTRAINTS,
    subType: SUB_TYPE_SECTOR_CONSTRAINTS,
    columns: SECTOR_CONSTRAINTS_COL_DEFS_SHORT
};

export const FACTOR_CONSTRAINTS_OPTIMIZATION_SUMMARY_SHORT: OptimizationSummary = {
    title: FACTOR_CONSTRAINTS_TITLE,
    type: TYPE_CONSTRAINTS,
    subType: SUB_TYPE_FACTOR_CONSTRAINTS,
    columns: FACTOR_CONSTRAINTS_COL_DEFS_SHORT
};

export const RELAXATION_AND_SOFT_CONSTRAINT_CONTROLS_SUMMARY: OptimizationSummary = {
    title: RELAXATION_CONSTRAINTS_TITLE,
    type: TYPE_CONSTRAINTS,
    subType: SUB_TYPE_RELAXATION_CONSTRAINTS,
    columns: RELAXATION_CONSTRAINTS_COL_DEFS
};

export const OPTIMIZATION_SUMMARIES: OptimizationSummary[] = [
    INVESTMENT_UNIVERSE_OPTIMIZATION_SUMMARY,
    OBJECTIVES_OPTIMIZATION_SUMMARY,
    PORTFOLIO_CONSTRAINTS_OPTIMIZATION_SUMMARY,
    SECURITY_CONSTRAINTS_OPTIMIZATION_SUMMARY,
    SECTOR_CONSTRAINTS_OPTIMIZATION_SUMMARY,
    FACTOR_CONSTRAINTS_OPTIMIZATION_SUMMARY
];

export const RISK_PARITY_OPTIMIZATION_SUMMARIES: OptimizationSummary[] = [
    INVESTMENT_UNIVERSE_OPTIMIZATION_SUMMARY,
    OBJECTIVES_OPTIMIZATION_SUMMARY,
    SCREENING_OPTIMIZATION_SUMMARY,
    SECURITY_CONSTRAINTS_RISK_BUDGETING
];

export const RISK_PARITY_OPTIMIZATION_SUMMARIES_TIER_DEFINITION: OptimizationSummary[] = [
    INVESTMENT_UNIVERSE_OPTIMIZATION_SUMMARY,
    OBJECTIVES_OPTIMIZATION_SUMMARY,
    SCREENING_OPTIMIZATION_SUMMARY,
    TIER_DEFINITIONS_OPTIMIZATION_SUMMARY
];
