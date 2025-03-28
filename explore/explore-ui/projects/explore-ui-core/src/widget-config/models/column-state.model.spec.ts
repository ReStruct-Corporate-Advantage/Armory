import {ColumnState} from './column-state.model';

describe('ColumnState', () => {
    const data = {
        'columns': [
            {'columnKey': 'ag-Grid-AutoColumn', 'width': 100, 'pinned': null},
            {'columnKey': '_ROOT_', 'width': 100, 'pinned': null},
            {'columnKey': 'level-1', 'width': 100, 'pinned': null},
            {'columnKey': 'security_description_1', 'width': 100, 'pinned': null},
            {'columnKey': 'cusip_0', 'width': 100, 'pinned': null},
            {'columnKey': 'pct_mv_1', 'width': 215, 'pinned': 'right'}
        ]
    };

    const columnState = new ColumnState(data);

    it('test mergeColumnState', () => {
        const columnSt = new ColumnState(data);
        const dataForMergedState = {
            'columns': [
                {'columnKey': 'pct_mv_1', 'width': 300, 'pinned': 'right'},
                {'columnKey': 'pct_mv_1|FUND', 'width': 300, 'pinned': 'right'}
            ]
        };
        columnSt.mergeColumnState(new ColumnState(dataForMergedState));
        expect(columnSt.columns.length).toEqual(7);
        expect(columnSt.columns.find(column => column.columnKey === 'pct_mv_1').width).toEqual(215);
    });

    describe('Serialize/Deserialize Test', () => {
        it('should serialize/deserialize with data', () => {
            expect(columnState.columns).toEqual(data.columns);

            const serializedColumnState = columnState.serialize();
            expect(serializedColumnState).toEqual(data);
        });

        it('should deserialize input from old favorite', () => {
            const oldFavData = {
                'inputs': {
                    'columns': {
                        'configType': 'columnSet',
                        'columns': [
                            {'columnTag': 'security_description', 'columnKey': 'security_description_1', 'positionColumnType': 'ALL', 'title': 'Security Description'},
                            {'columnTag': 'cusip', 'columnKey': 'cusip_0', 'positionColumnType': 'ALL', 'title': 'CUSIP'},
                            {'columnTag': 'pct_mv', 'columnKey': 'pct_mv_1', 'positionColumnType': 'PORT', 'displayWidth': 754.8486328125, 'title': 'Market Value %'}
                        ],
                        'type': 'REPORT',
                        'hiddenColumn': {'columnTag': 'cusip', 'positionColumnType': 'ALL', 'columnKey': 'cusip_hidden'}
                    },
                    'columnWidths': {
                        'columnWidths': [
                            {'columnKey': 'pct_mv_1|Total', 'columnTag': 'Total', 'displayWidth': 542.123046875},
                            {'columnKey': 'pct_mv_1|CASH', 'columnTag': 'CASH'},
                            {'columnKey': 'pct_mv_1|EQUITY', 'columnTag': 'EQUITY'},
                            {'columnKey': 'pct_mv_1|FUND', 'columnTag': 'FUND'}
                        ]
                    }
                }
            };

            const columnState2 = ColumnState.createFromLegacyColumnData(oldFavData.inputs.columns);
            columnState2.addLegacyColumnWidths(oldFavData);

            expect(columnState2.columns.length).toBe(4);
            expect(columnState2.columns[2].width).toBe(754.8486328125);
            expect(columnState2.columns[3].width).toBe(542.123046875);
        });

        it('should deserialize pivot input from old favorite', () => {
            const oldFavData = {
                'inputs': {
                    'columnWidths': {
                        'widgetType': 'pivot',
                        '_columnWidths': [
                            {
                                '_columnTag': 'Total',
                                '_positionColumnType': null,
                                '_columnKey': 'pct_notional_val_0|Total',
                                '_columnTitle': '',
                                '_displayWidth': 54
                            },
                            {
                                '_columnTag': 'AU',
                                '_positionColumnType': null,
                                '_columnKey': 'pct_notional_val_0|AU',
                                '_columnTitle': '',
                                '_displayWidth': 560
                            },
                            {
                                '_columnTag': 'CN',
                                '_positionColumnType': null,
                                '_columnKey': 'pct_notional_val_0|CN',
                                '_columnTitle': '',
                                '_displayWidth': 126
                            },
                            {
                                '_columnTag': 'EU',
                                '_positionColumnType': null,
                                '_columnKey': 'pct_notional_val_0|EU',
                                '_columnTitle': '',
                                '_displayWidth': 172
                            }
                        ],
                        'columnWidths': [
                            {
                                '_columnTag': 'Total',
                                '_positionColumnType': null,
                                '_columnKey': 'pct_mv_1571042838997|Total',
                                '_columnTitle': null,
                                '_displayWidth': 48
                            },
                            {
                                '_columnTag': 'Belgium',
                                '_positionColumnType': null,
                                '_columnKey': 'pct_mv_1571042838997|Belgium',
                                '_columnTitle': null,
                                '_displayWidth': 301
                            },
                            {
                                '_columnTag': 'China',
                                '_positionColumnType': null,
                                '_columnKey': 'pct_mv_1571042838997|China',
                                '_columnTitle': null,
                                '_displayWidth': 325
                            },
                            {
                                '_columnTag': 'France',
                                '_positionColumnType': null,
                                '_columnKey': 'pct_mv_1571042838997|France',
                                '_columnTitle': null,
                                '_displayWidth': 97
                            },
                            {
                                '_columnTag': 'Hong Kong',
                                '_positionColumnType': null,
                                '_columnKey': 'pct_mv_1571042838997|Hong Kong',
                                '_columnTitle': null,
                                '_displayWidth': 269
                            }
                        ]
                    }
                }
            };

            const columnState3 = new ColumnState();
            columnState3.addLegacyColumnWidths(oldFavData);

            expect(columnState3.columns.length).toBe(9);
            expect(columnState3.columns[0].width).toBe(48);
            expect(columnState3.columns[1].width).toBe(301);
            expect(columnState3.columns[2].width).toBe(325);
            expect(columnState3.columns[3].width).toBe(97);
            expect(columnState3.columns[4].width).toBe(269);
            expect(columnState3.columns[5].width).toBe(54);
            expect(columnState3.columns[6].width).toBe(560);
            expect(columnState3.columns[7].width).toBe(126);
            expect(columnState3.columns[8].width).toBe(172);

        });
    });

    describe('equals Test', () => {
        it('should test if equals', () => {
            expect(columnState.equals(data)).toBeTruthy();

            data.columns[5].width = 500;
            expect(columnState.equals(data)).toBeFalsy();

            data.columns.pop();
            expect(columnState.equals(data)).toBeFalsy();
        });
    });

    describe('isDataStoreInput Test', () => {
        it('should check if isDataStoreInput', () => {
            expect(columnState.isDataStoreInput()).toBeFalsy();
        });
    });

    it('Test shouldSkipSerialize', () => {
        expect(columnState.shouldSkipSerialize()).toBeFalsy();
    });
});
