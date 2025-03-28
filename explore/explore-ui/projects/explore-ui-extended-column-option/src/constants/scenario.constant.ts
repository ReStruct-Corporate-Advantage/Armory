
export class ScenarioConstants {
    static readonly DEFAULT_SCENARIO_PURPOSE = 'P100';
    static readonly PATH_SEPARATOR = '@@@';
    static readonly SCENARIO_CODE_SEPARATOR = '::';
    static readonly ALADDIN_SCENARIOS = 'Aladdin Scenarios';
    static readonly ERROR_WHILE_FETCHING_SCENARIO = 'Error while fetching scenario';
    static readonly ERROR_WHILE_SAVING_SCENARIO = 'Error while saving scenario';
    static readonly ERROR_WHILE_LOADING_SCENARIOS = 'Error while loading scenarios';
    static readonly STORM_MODEL_NOT_SUPPORTED = 'STORM factors aren\'t shown on this screen given that they represent the total public equity universe. To maintain consistency in Stress P&L when converting a scenario from date range or implied shock to specified shock, select a BFRE risk model for the portfolio settings.';
    static readonly SUCCESS_SAVING_SCENARIO = 'Scenario saved successfully';

    static readonly DXS_SHOCK_UNIT = {
        SPREAD: 'SPREAD',
        PERCENTAGE_OF_SPREAD: 'PERCENTAGE_OF_SPREAD',
    };

    static readonly SCENARIO_VISIBILITY = {
        PRIVATE: 'PRIVATE',
        SHARED: 'SHARED',
    };

    static readonly SPECIFIED_SCENARIO_CONVERSION_REQUEST_COLUMNS = {
        TITLE_COL: 'rfv_ftitle',
        FACTOR_TAG: 'rfv_factor_tag_rk',
        SHOCK_COL: 'rfv_stress_shok_rk',
        SHOCK_UNIT_COL: 'rfv_factor_shock_unit_rk',
    };

    static readonly SPECIFIED_SCENARIO_CREATE_REQUEST_COLUMNS = {
        TITLE_COL: 'rfv_fms_title',
        FACTOR_TAG: 'rfv_fms_ftag',
        SHOCK_COL: 'rfv_stress_shok_rk',
    };

    static readonly ERROR_EMPTY_FACTORS = 'No factors selected. Please add some factors.';
    static readonly ERROR_IMPLIED_PROVIDE_INPUTS = 'Please provide some non-zero shock value or the custom factor tag to columns.';
    static readonly ERROR_DUPLICATE_FACTORS = 'Duplicate factors tags are not allowed. Please remove them.';
    static readonly ERROR_SCENARIO_CONVERSION_STORM_FACTORS = 'Please note that when converting an implied shock scenario with STORM factor shocks to a specified shock scenario, the Stress P&L will change between the implied shock and specified shock versions. While the STORM factor shocks will be used to imply shocks in all others factors, the shocks on STORM factors themselves are excluded from the specified shock screen due to the large amount of STORM factors.';
    static readonly ERROR_SCENARIO_SAVE_STORM_FACTORS = 'Currently, custom shocks based on STORM factors are not supported properly. Please remove them';

    static readonly NO_PERMISSION_TITLE = '(No Permissions) ';

}
