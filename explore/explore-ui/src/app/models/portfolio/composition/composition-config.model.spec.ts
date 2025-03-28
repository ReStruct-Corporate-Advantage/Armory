import {CompositionConfig} from '@models/portfolio/composition/composition-config.model';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {ModellingType} from '@enums/modelling-type.enum';
import {CompositionUtils} from '@utils/composition.utils';
import {ROOT_LEVEL} from '@utils/qbstr';
import {CompositionConstants} from '@constants/composition.constants';
import {ExploreTableEditingParams} from '@interfaces/explore-table-editing-params.interface';
import {AbstractColDef, RowNode} from 'ag-grid-community';
import {ColumnConfig} from '@blk/explore-ui-core';

describe('CompositionConfig', () => {
    let port: WhatIfPortfolio;
    let compositionConfig: CompositionConfig;

    beforeEach(() => {
        port = new WhatIfPortfolio();
        port.modellingType = ModellingType.SECTOR;
        compositionConfig = CompositionUtils.createCompositionConfig(port);
    });

    describe('tests isSectorValueZero', () => {
        const params: ExploreTableEditingParams = {
            api: null,
            colDef: null,
            column: null,
            columnApi: null,
            data: null,
            node: new RowNode()
        };

        it('Test isSectorValueZero method with zero value', () => {
            params.node.data = {
                pct_notional_val_before: 0.00
            };
            params.node.group = true;

            expect(compositionConfig.isSectorValueZero(params, 'pct_notional_val_before')).toBe(true);
        });

        it('Test isSectorValueZero method with non-zero value', () => {
            params.node.data = {
                pct_notional_val_before: 0.05
            };
            params.node.group = true;

            expect(compositionConfig.isSectorValueZero(params, 'pct_notional_val_before')).toBe(false);
        });

        it('Test isSectorValueZero method with null value', () => {
            params.node.data = {};
            params.node.group = true;

            expect(compositionConfig.isSectorValueZero(params, 'pct_notional_val_before')).toBe(false);
        });
    });

    it('Test isCellEditable', () => {
        jest.spyOn(compositionConfig, 'isSectorValueZero').mockReturnValue(false);

        const params: ExploreTableEditingParams = {
            api: null,
            colDef: null,
            column: null,
            columnApi: null,
            data: null,
            node: new RowNode()
        };

        params.node.group = true;
        params.node.field = '';
        expect(compositionConfig.isCellEditable(port, params, '')).toBeTruthy();

        params.node.group = false;
        expect(compositionConfig.isCellEditable(port, params, '')).toBeFalsy();

        port.modellingType = ModellingType.POSITION;
        expect(compositionConfig.isCellEditable(port, params, '')).toBeTruthy();

        params.node = undefined;
        expect(compositionConfig.isCellEditable(port, params, '')).toBeFalsy();

        port.modellingType = ModellingType.PORTFOLIO;
        expect(compositionConfig.isCellEditable(port, params, '')).toBeFalsy();

        params.node = new RowNode();
        params.node.field = ROOT_LEVEL;
        params.node.group = false;
        port.isPortfolioGroup = true;
        expect(compositionConfig.isCellEditable(port, params, '')).toBeFalsy();

        params.node.field = '';
        params.data = {
            portfolio_name: CompositionConstants.CASH_OFFSET
        };
        expect(compositionConfig.isCellEditable(port, params, '')).toBeFalsy();

        params.data = {};
        expect(compositionConfig.isCellEditable(port, params, '')).toBeTruthy();
    });

    it('tests formatPctColumns', () => {
        expect(compositionConfig.formatPctColumns({value: '5.64755'} as any, 3)).toEqual('5.648');
        expect(compositionConfig.formatPctColumns({value: 'ABC'} as any, 3)).toEqual('ABC');
    });

    it('send default composition column test case', () => {
        port.compositionSetting.selectedColumns.push(new ColumnConfig({
            'columnTag': 'pct_mv',
            'positionColumnType': 'ACTIVE',
            'columnKey': 'pct_mv_active',
        }));
        const defaultCompositionConfig = compositionConfig.getRequestColumns(port);
        expect(defaultCompositionConfig[0].columnTag).toBe('cusip');
        expect(defaultCompositionConfig[1].columnTag).toBe('security_description');
        expect(defaultCompositionConfig[2].columnTag).toBe('pct_mv');
        expect(defaultCompositionConfig[3].columnTag).toBe('notional_mv');
        expect(defaultCompositionConfig[4].columnTag).toBe('pct_notional_val');
        expect(defaultCompositionConfig[5].columnTag).toBe('market_val');
        expect(defaultCompositionConfig[6].columnTag).toBe('quantity');
        expect(defaultCompositionConfig[7].columnKey).toBe('cur_face');
        expect(defaultCompositionConfig[8].columnKey).toBe('pct_mv_active');
    });

    it('test getColumnDefinitions', () => {
        const defaultColDef: AbstractColDef[] = compositionConfig.getColumnDefinitions(port);
        expect(defaultColDef.length).toBe(4);
    });

    it('tests getCellStyleForChanges', () => {
        // #1 - change is present
        jest.spyOn(compositionConfig, 'isChangePresent').mockReturnValue(true);
        expect(compositionConfig.getCellStyleForChanges({colDef: {}}, true)).toEqual([
            'ag-theme-apgux-composition-cell-edited',
            'ag-theme-apgux-composition-cell-un-editable',
            'aux-right-align-cell'
        ]);
        expect(compositionConfig.getCellStyleForChanges({colDef: {}}, false, true, false).length).toBe(0);

        // #2 - change is not present
        jest.clearAllMocks();
        jest.spyOn(compositionConfig, 'isChangePresent').mockReturnValue(false);
        expect(compositionConfig.getCellStyleForChanges({colDef: {}}, true)).toEqual([
            'ag-theme-apgux-composition-cell-un-editable',
            'aux-right-align-cell'
        ]);
    });

    it('test getChangeClass', () => {
        const params: any = {
            data: {
                cur_face_before: 10,
                cur_face_after: 20
            },
            colDef: {columnTag: 'cur_face'}
        };
        expect(compositionConfig.getChangeClass(params, true)).toStrictEqual([
            'ag-theme-apgux-composition-cell-edited'
        ]);
    });

    it('tests isChangePresent', () => {
        const params: any = {
            data: {
                col1_before: 10,
                col1_after: 12,
                col2_before: 10.000000001,
                col2_after: 10.000000000002,
                col3_before: null,
                col3_after: 1,
                col4_before: null,
                col4_after: null
            }
        };

        expect(compositionConfig.isChangePresent(params, 'colBefore', 'colAfter')).toBeFalsy();
        expect(compositionConfig.isChangePresent(params, 'col3_before', 'col3_after')).toBeTruthy();
        expect(compositionConfig.isChangePresent(params, 'col4_before', 'col4_after')).toBeFalsy();
        expect(compositionConfig.isChangePresent(params, 'col1_before', 'col1_after')).toBeTruthy();
        expect(compositionConfig.isChangePresent(params, 'col2_before', 'col2_after')).toBeFalsy();

        // params.data undefined (happens in case of no rows - say, no filter results)
        expect(compositionConfig.isChangePresent({}, 'colBefore', 'colAfter')).toBeFalsy();
    });
});
