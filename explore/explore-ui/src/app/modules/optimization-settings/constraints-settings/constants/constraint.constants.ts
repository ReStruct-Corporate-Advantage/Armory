import {
    SUB_TYPE_FACTOR_CONSTRAINTS,
    SUB_TYPE_SECTOR_CONSTRAINTS
} from '@optimization-settings/constants/optimization-types.constants';
import {
    ConstraintRelationsKey
} from '@optimization-settings/constraints-settings/models/constraint-relations-key.model';
import {RELAXATION_COL_DEF} from '@optimization-settings/constraints-settings/constants/constraint-col-defs.constants';
import {DependentConstraintsMetaData} from '@optimization-settings/constraints-settings/models/dependent-constraints-meta-data.model';

export const YES = 'Yes';

export const NO = 'No';

export const FREEZE_INITIAL_SHORT_POSITIONS = 'Freeze Initial Short Positions ex Cash';

export const QUICK_FACTOR_BLOCK_LIST = [
    {label: 'None', value: ''},
    {label: 'EQ Style', value: 'EQ_STYLE'},
    {label: 'EQ Country', value: 'EQ_COUNTRY'},
    {label: 'EQ FX', value: 'EQ_CURRENCY'},
    {label: 'USD Interest Rates', value: 'BRS_GOLD__1_USDIR'},
    {label: 'US Corp IG Ind', value: 'CORP40_US_IND_IG'},
    {label: 'US Corp HY Ind', value: 'CORP40_US_IND_HY'}
];

export const FACTOR_TAG_DELIMITER = ',';

export const SELECT_FROM_UNIVERSE = 'Select from universe';

export const CUSTOM_SECURITY_LIST = 'Custom security list';

export const FILTER_NAME = 'Filter Name';

export const CUSTOM_FILTER = 'Custom Filter';

export const ASSET_BUY_SELL_NOTIFICATION = 'Relaxation must be applied to all trade size constraints or none. When selecting / unselecting one, relaxation will be automatically applied / removed from all.';

export const CONSTRAINT_RELATIONS: ReadonlyMap<string, DependentConstraintsMetaData> = new Map<string, DependentConstraintsMetaData>([
    [ConstraintRelationsKey.createEasyObject(SUB_TYPE_SECTOR_CONSTRAINTS, RELAXATION_COL_DEF.field),
        DependentConstraintsMetaData.createDependentConstraintsMetaData([], 'Relaxation must be applied to all sector constraints or none. When selecting / unselecting one, relaxation will be automatically applied / removed from all.')
    ],
    [ConstraintRelationsKey.createEasyObject(SUB_TYPE_FACTOR_CONSTRAINTS, RELAXATION_COL_DEF.field),
        DependentConstraintsMetaData.createDependentConstraintsMetaData([], 'Relaxation must be applied to all factor constraints or none. When selecting / unselecting one, relaxation will be automatically applied / removed from all.')
    ],
    [ConstraintRelationsKey.createEasyObject('max_buy_size', RELAXATION_COL_DEF.field),
        DependentConstraintsMetaData.createDependentConstraintsMetaData(['min_buy_size', 'max_sell_size', 'min_sell_size'], ASSET_BUY_SELL_NOTIFICATION)
    ],
    [ConstraintRelationsKey.createEasyObject('min_buy_size', RELAXATION_COL_DEF.field),
        DependentConstraintsMetaData.createDependentConstraintsMetaData(['max_buy_size', 'max_sell_size', 'min_sell_size'], ASSET_BUY_SELL_NOTIFICATION)
    ],
    [ConstraintRelationsKey.createEasyObject('max_sell_size', RELAXATION_COL_DEF.field),
        DependentConstraintsMetaData.createDependentConstraintsMetaData(['min_sell_size', 'max_buy_size', 'min_buy_size'], ASSET_BUY_SELL_NOTIFICATION)
    ],
    [ConstraintRelationsKey.createEasyObject('min_sell_size', RELAXATION_COL_DEF.field),
        DependentConstraintsMetaData.createDependentConstraintsMetaData(['max_sell_size', 'max_buy_size', 'min_buy_size'], ASSET_BUY_SELL_NOTIFICATION)
    ]
]);
