import {OptimizationColDef} from '@optimization-settings-configuration/models/optimization-col-def';
import {AuxGridColumnType} from '@blk/aladdin-angular-components';

export const CONSTRAINT_COL_DEF: OptimizationColDef = {
    field: 'constraint',
    headerName: 'Constraint'
};

export const CONSTRAINT_MEASURE_COL_DEF: OptimizationColDef = {
    field: 'constraint',
    headerName: 'Constraint Measure'
};

export const CONSTRAINT_TYPE_COL_DEF: OptimizationColDef = {
    field: 'constraintType',
    headerName: 'Constraint Type'
};

export const CONSTRAINT_SCOPE_COL_DEF: OptimizationColDef = {
    field: 'constraintScope',
    headerName: 'Constraint Scope'
};

export const VALUE_COL_DEF: OptimizationColDef = {
    field: 'value',
    headerName: 'Value'
};

export const UNIT_COL_DEF: OptimizationColDef = {
    field: 'unit',
    headerName: 'Unit'
};

export const LOWER_BOUND_COL_DEF: OptimizationColDef = {
    field: 'lowerBound',
    headerName: 'Lower Bound',
    type: AuxGridColumnType.AUX_NUMBER_COLUMN,
    filter: 'auxNumberFilter'
};

export const UPPER_BOUND_COL_DEF: OptimizationColDef = {
    field: 'upperBound',
    headerName: 'Upper Bound',
    type: AuxGridColumnType.AUX_NUMBER_COLUMN,
    filter: 'auxNumberFilter'
};

export const RELAXATION_COL_DEF: OptimizationColDef = {
    field: 'relaxation',
    headerName: 'Relaxation',
    type: AuxGridColumnType.AUX_CHECKBOX_COLUMN,
    dependsOn: 'isRelaxable'
};

export const ASSOCIATED_LIST_COL_DEF: OptimizationColDef = {
    field: 'associatedList',
    headerName: 'Associated List'
};

export const NAME_COL_DEF: OptimizationColDef = {
    field: 'name',
    headerName: 'Name'
};

export const OBJECTIVE_NAME_COL_DEF: OptimizationColDef = {
    field: 'objectiveName',
    headerName: 'Objective Name'
};

export const INITIAL_VALUE_COL_DEF: OptimizationColDef = {
    field: 'initial',
    headerName: 'Initial'
};

export const FINAL_VALUE_COL_DEF: OptimizationColDef = {
    field: 'final',
    headerName: 'Final'
};

export const OBJECTIVES_SUMMARY_COL_DEFS: OptimizationColDef[] = [
    OBJECTIVE_NAME_COL_DEF,
    INITIAL_VALUE_COL_DEF,
    FINAL_VALUE_COL_DEF
];

export const PORTFOLIO_CONSTRAINTS_COL_DEFS: OptimizationColDef[] = [
    CONSTRAINT_COL_DEF,
    VALUE_COL_DEF,
    UNIT_COL_DEF,
    LOWER_BOUND_COL_DEF,
    UPPER_BOUND_COL_DEF,
    RELAXATION_COL_DEF
];

export const SECURITY_CONSTRAINTS_COL_DEFS: OptimizationColDef[] = [
    CONSTRAINT_COL_DEF,
    VALUE_COL_DEF,
    UNIT_COL_DEF,
    LOWER_BOUND_COL_DEF,
    UPPER_BOUND_COL_DEF,
    ASSOCIATED_LIST_COL_DEF,
    RELAXATION_COL_DEF
];

export const SECTOR_CONSTRAINTS_COL_DEFS: OptimizationColDef[] = [
    CONSTRAINT_COL_DEF,
    VALUE_COL_DEF,
    NAME_COL_DEF,
    LOWER_BOUND_COL_DEF,
    UPPER_BOUND_COL_DEF,
    RELAXATION_COL_DEF
];

export const FACTOR_CONSTRAINTS_COL_DEFS: OptimizationColDef[] = [
    CONSTRAINT_COL_DEF,
    NAME_COL_DEF,
    LOWER_BOUND_COL_DEF,
    UPPER_BOUND_COL_DEF,
    RELAXATION_COL_DEF
];

export const PORTFOLIO_CONSTRAINTS_COL_DEFS_SHORT: OptimizationColDef[] = [
    CONSTRAINT_COL_DEF,
    RELAXATION_COL_DEF
];

export const SECURITY_CONSTRAINTS_COL_DEFS_SHORT: OptimizationColDef[] = [
    CONSTRAINT_COL_DEF,
    RELAXATION_COL_DEF
];

export const SECTOR_CONSTRAINTS_COL_DEFS_SHORT: OptimizationColDef[] = [
    CONSTRAINT_COL_DEF,
    RELAXATION_COL_DEF
];

export const FACTOR_CONSTRAINTS_COL_DEFS_SHORT: OptimizationColDef[] = [
    CONSTRAINT_COL_DEF,
    RELAXATION_COL_DEF
];

export const RELAXATION_CONSTRAINTS_COL_DEFS: OptimizationColDef[] = [
    CONSTRAINT_TYPE_COL_DEF,
    CONSTRAINT_SCOPE_COL_DEF,
    CONSTRAINT_MEASURE_COL_DEF,
    LOWER_BOUND_COL_DEF,
    UPPER_BOUND_COL_DEF,
    RELAXATION_COL_DEF
];
