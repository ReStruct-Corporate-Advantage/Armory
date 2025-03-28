/**
 * Constants class for look-through settings
 */
export class LookthroughConstants {
    static readonly LOOK_THROUGH_CONST = {
        'LT_WITH_CAPITAL_L': 'Look-Through',
        'LT_WITH_SMALL_L': 'look-through'
    };

    static readonly LOOK_THROUGH_GROUP_MAP = {
        'Portfolio': 0,
        'Portfolio & Benchmark': 1,
        'Benchmark': 2
    };

    static readonly PORTFOLIO = 'Portfolio';
    static readonly PORTFOLIO_BENCHMARK = 'Portfolio & Benchmark';
    static readonly BENCHMARK = 'Benchmark';


    static readonly DISPLAY_NAME_SEPARATOR = '-*-*-*';

    static readonly NO_LOOK_THROUGH_SECURITIES = 'No Look-through Securities';

    static readonly LT_FILTER_RULES = 'LT_FILTER_RULES';
    static readonly LT_FILTER_RULE = 'LookthroughFilterRule';
    static readonly LT_TYPE_FULL = 'Full';
    static readonly RISK_PROXY = 'RISK_PROXY';

    // Look-Through columns tag definitions
    static readonly PORT_NAME_COL_TAG = 'port_full_name';
    static readonly SEC_GROUP_COL_TAG = 'sec_group';
    static readonly SEC_TYPE_COL_TAG = 'sec_type';
    static readonly SEC_DESC_COL_TAG = 'sec_desc';
    static readonly ISSUER_NAME_COL_TAG = 'issuer_name';
    static readonly ADL_INFO_COL_TAG = 'sec_desc2';
    static readonly TYPE_COL_TAG = 'underl_sec_type';

    // Look-Through Columns key definitions
    static readonly PORT_NAME_COL_KEY = 'port_full_name_1';
    static readonly SEC_GROUP_COL_KEY = 'sec_group_1';
    static readonly SEC_TYPE_COL_KEY = 'sec_type_1';
    static readonly SEC_DESC_COL_KEY = 'sec_desc_1';
    static readonly ISSUER_NAME_COL_KEY = 'issuer_name_1';
    static readonly ADL_INFO_COL_KEY = 'sec_desc2_1';
    static readonly TYPE_COL_KEY = 'underl_sec_type_1';

    // Look-Through Columns key definitions
    static readonly PORT_NAME_COL_DESC = 'Look-Through Portfolio';
    static readonly SEC_GROUP_COL_DESC = 'Security Group';
    static readonly SEC_TYPE_COL_DESC = 'Security Type';
    static readonly SEC_DESC_COL_DESC = 'Look-through Security Description';
    static readonly ISSUER_NAME_COL_DESC = 'Look-through Portfolio Full Name';
    static readonly ADL_INFO_COL_DESC = 'Additional Info';
    static readonly TYPE_COL_DESC = 'Type';
    static readonly LT_REFRESH_MSG = [{'id': '1', 'message': 'Refresh to view Look-Through Summary.', 'notificationStyle': 'message'}];
    static readonly LT_REFRESH_PUSH = 'push';
    static readonly LT_REFRESH_TYPE = 'widget';
    static readonly LT_REFRESH_POLITENESS = 'polite';
}
