import {SectorRuleUtils} from './sector-rule.utils';
import {Breakdown} from '../models/breakdown/breakdown.model';
import {BreakdownInitializer} from '../breakdown.initializer';
import {ColumnConfig, CoreUserMetaDataStore, UserMetaData} from '@blk/explore-ui-core';
import {ColumnSet} from '@blk/explore-ui-column-option';
import * as momentTz from 'moment-timezone';

describe('SectorRuleUtils', () => {

    beforeAll(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        BreakdownInitializer.registerSectorConfigTypes();
    });

    describe('createSectorInformation', () => {
        it('for normal sector', () => {
            const breakdown = TestSectorPathUtils.getNormalSectors();
            const node = TestSectorPathUtils.getNormalSectorsNode();
            const sectorRuleInfo = [];
            SectorRuleUtils.createSectorInformation(breakdown, node, sectorRuleInfo);
            const expectedSectorRuleInfo = {
                'subSector': {
                    'breakdownRuleType': 'String',
                    'useNoneBuckets': true,
                    'groupByColumn': {
                        'columnTag': 'sec_group',
                        'columnName': 'Security Group',
                        'positionColumnType': 'ALL',
                        'dataType': 'STRING'
                    }
                }, 'sectorValue': 'BND', 'sectorType': 'NormalSector'
            };
            expect(sectorRuleInfo[0].serialize()).toEqual(expectedSectorRuleInfo);
        });

        it('for custom sector', () => {
            CoreUserMetaDataStore.userMetaData.login = 'user01';
            const breakdown = TestSectorPathUtils.getCustomSectors();
            const node = TestSectorPathUtils.getCustomSectorsNode();
            const sectorRuleInfo = [];
            SectorRuleUtils.createSectorInformation(breakdown, node, sectorRuleInfo);
            const expectedSectorRuleInfo = {
                'sectorType': 'CustomSector',
                'sectorValue': 'Security Group Equals BND',
                'subSector': {
                    'breakdownRuleType': 'CustomSector',
                    'includeOtherBucket': true,
                    'title': 'Security Group Equals BND',
                    'rule': {
                        'colPositionColumnType': undefined,
                        'colTag': 'sec_group',
                        'colTitle': 'Security Group',
                        'colType': 'STRING',
                        'compType': 'Equals',
                        'compValues': ['BND'],
                        'compValuesLabel': ['BND'],
                        'ruleType': 'Rule',
                        'customSectorType': 'Attributes',
                        'includeNullValues': undefined
                    }
                }
            };
            expect(sectorRuleInfo[0].serialize()).toEqual(expectedSectorRuleInfo);
        });

        it('for sector with higher node level than breakdown level', () => {
            const breakdown = TestSectorPathUtils.getNormalSectors();
            const node = TestSectorPathUtils.getNormalSectorsNode();
            node.level = 5;
            const sectorRuleInfo = [];
            SectorRuleUtils.createSectorInformation(breakdown, node, sectorRuleInfo);
            const expectedSectorRuleInfo = {
                'subSector': {
                    'breakdownRuleType': 'String',
                    'useNoneBuckets': true,
                    'groupByColumn': {
                        'columnTag': 'gics_1_sector',
                        'columnName': 'GICS Sector',
                        'positionColumnType': 'ALL',
                        'dataType': 'STRING'
                    }
                }, 'sectorValue': 'Consumer Discretionary', 'sectorType': 'NormalSector'
            };
            expect(sectorRuleInfo[0].serialize()).toEqual(expectedSectorRuleInfo);
        });
    });

    describe('createCusipIdentificationInformation', () => {
        it('with only cusip', () => {
            const node = TestSectorPathUtils.getSecurityNode();
            const sectorRuleInfo = [];
            const widgetColumnSet = new ColumnSet();
            widgetColumnSet.columns.push(ColumnConfig.createColumn('pnl_cusip', 'ALL', 'pnl_cusip'));
            widgetColumnSet.columns.push(ColumnConfig.createColumn('pnl_sec_desc', 'ALL', 'pnl_sec_desc'));
            SectorRuleUtils.createCusipIdentificationInformation(sectorRuleInfo, node, widgetColumnSet);
            const expectedSectorRuleInfo = {
                'subSector': {
                    'breakdownRuleType': 'String',
                    'groupByColumn': {
                        'columnName': 'Cusip',
                        'columnTag': 'cusip',
                        'positionColumnType': 'ALL'
                    },
                    'useNoneBuckets': true
                }, 'sectorValue': 'CusipA', 'sectorType': 'NormalSector'
            };
            expect(sectorRuleInfo[0].serialize()).toEqual(expectedSectorRuleInfo);
        });

        it('with cusip and strategy', () => {
            const node = TestSectorPathUtils.getSecurityNode();
            const sectorRuleInfo = [];
            const widgetColumnSet = new ColumnSet();
            widgetColumnSet.columns.push(ColumnConfig.createColumn('pnl_cusip', 'ALL', 'pnl_cusip'));
            widgetColumnSet.columns.push(ColumnConfig.createColumn('pnl_sec_desc', 'ALL', 'pnl_sec_desc'));
            widgetColumnSet.columns.push(ColumnConfig.createColumn('pnl_strategy_id', 'ALL', 'pnl_strategy_id'));
            SectorRuleUtils.createCusipIdentificationInformation(sectorRuleInfo, node, widgetColumnSet);
            const expectedSectorRuleInfo = {
                'subSector': {
                    'breakdownRuleType': 'String',
                    'groupByColumn': {
                        'columnName': 'Cusip',
                        'columnTag': 'cusip',
                        'positionColumnType': 'ALL'
                    },
                    'useNoneBuckets': true
                }, 'sectorValue': 'CusipA', 'sectorType': 'NormalSector'
            };
            expect(sectorRuleInfo[0].serialize()).toEqual(expectedSectorRuleInfo);
        });
    });

    describe('createStrategyPathInformation', () => {
        it('for leaf node', () => {
            const node = TestSectorPathUtils.getSecurityNode();
            const sectorRuleInfo = [];
            SectorRuleUtils.createStrategyPathInformation(node, sectorRuleInfo);

            const expectedSectorRuleInfo = {
                'subSector': {
                    'breakdownRuleType': 'String',
                    'groupByColumn': {
                        'columnName': 'Strategy Name',
                        'columnTag': 'strategy_name',
                        'positionColumnType': 'ALL'
                    },
                    'useNoneBuckets': true
                }, 'sectorValue': 'Consumer Discretionary: BND', 'sectorType': 'NormalSector'
            };
            expect(sectorRuleInfo[0].serialize()).toEqual(expectedSectorRuleInfo);
        });

        it('for non leaf node', () => {
            const node = TestSectorPathUtils.getNormalSectorsNode();
            const sectorRuleInfo = [];
            SectorRuleUtils.createStrategyPathInformation(node, sectorRuleInfo);
            const expectedSectorRuleInfo = {
                'subSector': {
                    'breakdownRuleType': 'String',
                    'groupByColumn': {
                        'columnName': 'Strategy Name',
                        'columnTag': 'strategy_name',
                        'positionColumnType': 'ALL'
                    },
                    'useNoneBuckets': true
                }, 'sectorValue': 'Consumer Discretionary: BND', 'sectorType': 'NormalSector'
            };
            expect(sectorRuleInfo[0].serialize()).toEqual(expectedSectorRuleInfo);
        });
    });

    it('getPathToRoot', () => {
        const node = TestSectorPathUtils.getNormalSectorsNode();
        const pathsToParent = [];
        SectorRuleUtils.getPathToRoot(node, pathsToParent);
        expect(JSON.stringify(pathsToParent)).toEqual('[\"BND\",\"Consumer Discretionary\"]');
    });
});

export class TestSectorPathUtils {
    /**
     * Get Breakdown structure for normal sectors
     * returns {{breakdown: {breakdownTitle: string, subSectors: *[]}, customSectors: {}}}
     */
    static getNormalSectors() {
        const breakdownJSON = {
            'breakdown': {
                'breakdownTitle': '',
                'subSectors': [
                    {
                        'breakdownRuleType': 'String',
                        'useNoneBuckets': true,
                        'groupByColumn': {
                            'columnTag': 'gics_1_sector',
                            'columnName': 'GICS Sector',
                            'positionColumnType': 'ALL',
                            'dataType': 'STRING'
                        },
                        'subSectors': [
                            {
                                'breakdownRuleType': 'String',
                                'useNoneBuckets': true,
                                'groupByColumn': {
                                    'columnTag': 'sec_group',
                                    'columnName': 'Security Group',
                                    'positionColumnType': 'ALL',
                                    'dataType': 'STRING'
                                }
                            }
                        ]
                    }
                ]
            }
        };
        return new Breakdown(breakdownJSON);
    }

    /**
     * Get node structure for normal sectors
     * returns {{parent: {parent: {data: {title: string}},
     * data: {title: string}, level: number}, data: {title: string},
     * level: number, group: boolean}}
     */
    static getNormalSectorsNode(): any {

        return {
            parent: {
                parent: {
                    key: 'IP'
                },
                key: 'Consumer Discretionary',
                level: 1
            },
            key: 'BND',
            level: 2,
            group: true
        };
    }

    /**
     * Get Breakdown structure for custom sectors
     * returns {{breakdown: {breakdownTitle: string, subSectors: *[]},
     * customSectors: {0: {sectorName: string, includeOtherBucket: boolean, id: number,
     * sectorRule: {colType: string, colTag: string, compType: string, compValues: string[],
     * compValuesLabel: string[], ruleType: string, colTitle: string}}}}}
     */
    static getCustomSectors() {
        const breakdownJSON = {
            'breakdown': {
                'breakdownTitle': '',
                'subSectors': [{
                    'breakdownRuleType': 'String',
                    'useNoneBuckets': true,
                    'groupByColumn': {
                        'columnTag': 'gics_1_sector',
                        'columnName': 'GICS Sector',
                        'positionColumnType': 'ALL',
                        'dataType': 'STRING'
                    },
                    'subSectors': [{'breakdownRuleType': 'CustomSector', 'id': 0}]
                }]
            },
            'customSectors': {
                '0': {
                    'sectorName': 'Security Group Equals BND',
                    'includeOtherBucket': true,
                    'id': 0,
                    'sectorRule': {
                        'colType': 'STRING',
                        'colTag': 'sec_group',
                        'compType': 'Equals',
                        'compValues': ['BND'],
                        'compValuesLabel': ['BND'],
                        'ruleType': 'Rule',
                        'colTitle': 'Security Group'
                    }
                }
            }
        };
        return new Breakdown(breakdownJSON);
    }

    /**
     * Get node structure for custom sectors
     * returns {{parent: {parent: {data: {title: string}},
     * data: {title: string}, level: number}, data: {title: string}, level: number}}
     */
    static getCustomSectorsNode(): any {
        return {
            parent: {
                parent: {
                    key: 'IP'
                },
                key: 'Consumer Discretionary',
                level: 1
            },
            key: 'Security Group Equals BND',
            level: 2
        };
    }

    /**
     * Get security node data
     * returns {{parent: {parent: {data: {title: string}, level: number, parent: {data: {title: string}}},
     * data: {title: string}, level: number}, data: {title: string, data: string[]}, level: number, columnController: {allDisplayedColumns: *[]}}}
     */
    static getSecurityNode(): any {
        return {
            parent: {
                parent: {
                    key: 'Consumer Discretionary',
                    level: 1,
                    parent: {
                        key: 'IP'
                    }
                },
                key: 'BND',
                level: 2
            },
            data: {
                pnl_sec_desc: 'Security A',
                pnl_cusip: 'CusipA',
                pnl_strategy_id: 12345
            },
            level: 3,
        };
    }
}

