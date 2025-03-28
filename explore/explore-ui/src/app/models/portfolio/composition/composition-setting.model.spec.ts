import {CompositionSetting} from './composition-setting.model';
import {BreakdownInitializer} from '@blk/explore-ui-breakdown';
import {SerializeFavoriteType,CoreUserMetaDataStore,UserMetaData} from '@blk/explore-ui-core';

describe('CompositionSetting', () => {
    beforeAll(() => {
        BreakdownInitializer.registerSectorConfigTypes();
        BreakdownInitializer.registerBreakdownConfigTypes();
    });
    beforeEach(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
    });

    const compositionSettingJson = {
        'isNormalized': true,
        'tradingColumn': 'pct_notional_val',
        'secDescType': 'BB_TICKER',
        'breakdownTree': {
            'breakdown': {
                'isConfigured': false,
                'breakdownTitle': 'Security Group',
                'subSectors': [{
                    'breakdownRuleType': 'String',
                    'groupByColumn': {
                        'columnName': 'Security Group',
                        'columnTag': 'sec_group',
                        'positionColumnType': 'ALL',
                        'dataType': undefined
                    },
                    'useNoneBuckets': undefined
                }
                ]
            },
            'title': 'Security Group'
        },
        'compositionFilter': {
            'breakdown': {
                'subSectors': [
                    {
                        'breakdownRuleType': 'CustomSector',
                        'includeOtherBucket': true,
                        'rule': {
                            'colPositionColumnType': 'ALL',
                            'colTag': 'sec_group',
                            'colTitle': 'Security Group',
                            'colType': 'STRING',
                            'compType': 'Does Not Equal',
                            'compValues': [
                                'FUND'
                            ],
                            'compValuesLabel': undefined,
                            'customSectorType': 'Attributes',
                            'ruleType': 'Rule',
                            'includeNullValues': false
                        },
                        'title': 'Custom Sector'
                    }
                ]
            }
        },
        'selectedColumns': [
            {
                'columnKey': 'pct_notional_val',
                'columnTag': 'pct_notional_val',
                'positionColumnType': 'PORT',
                'title': undefined
            },
            {
                'columnKey': 'pct_mv',
                'columnTag': 'pct_mv',
                'positionColumnType': 'PORT',
                'title': undefined
            }
        ],
        'showActiveInComposition': false,
        'isApplyFilterToNewWidgetsChecked': false,
        'isOptimizationCashSettingChecked': undefined,
        'title': undefined
    };

    it('tests component creation', () => {
        expect(new CompositionSetting()).toBeTruthy();
    });

    it('tests serialize/deserialize', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        expect(new CompositionSetting(compositionSettingJson).serialize()).toEqual(compositionSettingJson);
    });

    it('does not include selected columns when they are initialized to default and checking for favorite change', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const compositionSettings = new CompositionSetting(compositionSettingJson);
        compositionSettings.defaultSelectedColumns = compositionSettings.selectedColumns;

        const serializedSettings = compositionSettings.serialize(SerializeFavoriteType.FAVORITE_CHANGE_DETECTION);
        expect(serializedSettings.selectedColumns).toBeUndefined();
    });

    it('isConfigured should be true when breakdown is initialized to default and checking for favorite change', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const compositionSettings = new CompositionSetting(compositionSettingJson);

        let serializedSettings = compositionSettings.serialize(SerializeFavoriteType.FAVORITE_CHANGE_DETECTION);
        expect(serializedSettings.breakdownTree.breakdown.isConfigured).toBeFalsy();

        compositionSettings.breakdownTree.isConfigured = undefined;
        serializedSettings = compositionSettings.serialize(SerializeFavoriteType.FAVORITE_CHANGE_DETECTION);
        expect(serializedSettings.breakdownTree.breakdown.isConfigured).toBeTruthy();
    });

    it('tests copyFrom', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        const sourceCompositionSetting: CompositionSetting = new CompositionSetting(compositionSettingJson);
        const targetCompositionSetting: CompositionSetting = new CompositionSetting();
        targetCompositionSetting.copyFrom(sourceCompositionSetting);
        expect(targetCompositionSetting.serialize()).toEqual({
            'breakdownTree': {
                'breakdown': {
                    'breakdownTitle': 'Security Group',
                    'isConfigured': undefined,
                    'subSectors': [
                        {
                            'breakdownRuleType': 'String',
                            'groupByColumn': {
                                'columnName': 'Security Group',
                                'columnTag': 'sec_group',
                                'dataType': undefined,
                                'positionColumnType': 'ALL'
                            },
                            'useNoneBuckets': undefined
                        }
                    ]
                },
                'title': 'Security Group'
            },
            'isNormalized': true,
            'compositionFilter': {
                'breakdown': {
                    'subSectors': [
                        {
                            'breakdownRuleType': 'CustomSector',
                            'includeOtherBucket': true,
                            'rule': {
                                'colPositionColumnType': 'ALL',
                                'colTag': 'sec_group',
                                'colTitle': 'Security Group',
                                'colType': 'STRING',
                                'compType': 'Does Not Equal',
                                'compValues': [
                                    'FUND'
                                ],
                                'compValuesLabel': undefined,
                                'customSectorType': 'Attributes',
                                'includeNullValues': false,
                                'ruleType': 'Rule'
                            },
                            'title': 'Custom Sector'
                        }
                    ]
                }
            },
            'selectedColumns': [
                {
                    'columnKey': 'pct_notional_val',
                    'columnTag': 'pct_notional_val',
                    'positionColumnType': 'PORT',
                    'title': undefined
                },
                {
                    'columnKey': 'pct_mv',
                    'columnTag': 'pct_mv',
                    'positionColumnType': 'PORT',
                    'title': undefined
                }
            ],
            'showActiveInComposition': false,
            'tradingColumn': 'pct_notional_val',
            'secDescType': 'BB_TICKER',
            'isApplyFilterToNewWidgetsChecked': false,
            'isOptimizationCashSettingChecked': undefined,
            'title': undefined
        });
    });
});
