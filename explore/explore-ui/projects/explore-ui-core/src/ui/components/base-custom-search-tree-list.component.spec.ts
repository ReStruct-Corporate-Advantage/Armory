import {BaseCustomSearchTreeListComponent} from './base-custom-search-tree-list.component';
import {ColumnDefinition} from '../../definition/models/column-definition.model';

import {ColumnSelectorOption} from '@blk/explore-ui-column-option';
import {AuxAdvancedTreeListInterface} from '@blk/aladdin-angular-components';
import {CoreColumnConstants} from '../../core/constants';
import {CommonUtils} from '../../core/utils';
import {TelemetryService} from "../../telemetry/telemetry.service";
import {TelemetryActionConstants} from "../../telemetry/constants";
import {TelemetryColumnSearchParameters} from "../../telemetry/parameters";

describe('BaseCustomSearchTreeListComponent', () => {
    let component: BaseCustomSearchTreeListComponent;
    const colDef = new ColumnDefinition();
    colDef.columnDesc = 'This is a cusip description';
    const columSelectorOptionData: ColumnSelectorOption[] = [new ColumnSelectorOption('cusip', null, [new ColumnSelectorOption('cus', null, null,
        null, null, true)], null, null, true), new ColumnSelectorOption('cusi', null, null, null, colDef, null), new ColumnSelectorOption('Market Value %', null, null, null, colDef, null),
        new ColumnSelectorOption('Benchmark Market Value', null, null, null, colDef, null), new ColumnSelectorOption('Market Value', null, null, null, colDef, null),
        new ColumnSelectorOption('Portfolio Full Name', null, null, null, colDef, null), new ColumnSelectorOption('Stress P&L', null, null, null, colDef, null), new ColumnSelectorOption('& & P', null, null, null, colDef, null)];

    const changeDetectorRef = {
        markForCheck: jest.fn(),
        checkNoChanges: jest.fn(),
        reattach: jest.fn(),
        detach: jest.fn(),
        detectChanges: jest.fn(),
    };

    beforeAll(() => {
        component = new class extends BaseCustomSearchTreeListComponent {
            getColumnCount(filteredData: AuxAdvancedTreeListInterface[]): string {
                return filteredData.length.toString();
            }

            getSourceData(): AuxAdvancedTreeListInterface[] {
                return columSelectorOptionData;
            }
        }(changeDetectorRef);
    });

    it('search by column tag', () => {
        component.customSearch(columSelectorOptionData, 'cus');
        const colCount = 1;
        expect(component.columnCount).toEqual(colCount.toString());
        let columnsFiltered = component.customSearch(columSelectorOptionData, 'marketvalue');
        expect(columnsFiltered.length).toEqual(3);
        columnsFiltered = component.customSearch(columSelectorOptionData, 'valuemarket');
        expect(columnsFiltered.length).toEqual(3);
        columnsFiltered = component.customSearch(columSelectorOptionData, 'value market');
        expect(columnsFiltered.length).toEqual(3);
        columnsFiltered = component.customSearch(columSelectorOptionData, 'value mark');
        expect(columnsFiltered.length).toEqual(3);
        columnsFiltered = component.customSearch(columSelectorOptionData, 'mark val');
        expect(columnsFiltered.length).toEqual(3);
        columnsFiltered = component.customSearch(columSelectorOptionData, 'market value');
        expect(columnsFiltered.length).toEqual(3);
        columnsFiltered = component.customSearch(columSelectorOptionData, 'market value%');
        expect(columnsFiltered.length).toEqual(1);
        columnsFiltered = component.customSearch(columSelectorOptionData, 'value%');
        expect(columnsFiltered.length).toEqual(1);
        columnsFiltered = component.customSearch(columSelectorOptionData, 'market%');
        expect(columnsFiltered.length).toEqual(1);
        columnsFiltered = component.customSearch(columSelectorOptionData, 'mark%');
        expect(columnsFiltered.length).toEqual(1);
    });

    it('search by column tag with different separators', () => {
        let columnsFiltered = component.customSearch(columSelectorOptionData, 'market_value');
        expect(columnsFiltered.length).toEqual(3);
        columnsFiltered = component.customSearch(columSelectorOptionData, 'value/market');
        expect(columnsFiltered.length).toEqual(3);
        columnsFiltered = component.customSearch(columSelectorOptionData, 'value-market');
        expect(columnsFiltered.length).toEqual(3);
        columnsFiltered = component.customSearch(columSelectorOptionData, 'value_mark');
        expect(columnsFiltered.length).toEqual(3);
        columnsFiltered = component.customSearch(columSelectorOptionData, 'mark_val');
        expect(columnsFiltered.length).toEqual(3);
        columnsFiltered = component.customSearch(columSelectorOptionData, 'mark.val');
        expect(columnsFiltered.length).toEqual(3);
        columnsFiltered = component.customSearch(columSelectorOptionData, 'mark+val');
        expect(columnsFiltered.length).toEqual(3);
        columnsFiltered = component.customSearch(columSelectorOptionData, 'market_value');
        expect(columnsFiltered.length).toEqual(3);
        columnsFiltered = component.customSearch(columSelectorOptionData, 'market_value%');
        expect(columnsFiltered.length).toEqual(1);
        columnsFiltered = component.customSearch(columSelectorOptionData, 'value_%');
        expect(columnsFiltered.length).toEqual(1);
        columnsFiltered = component.customSearch(columSelectorOptionData, 'market/%');
        expect(columnsFiltered.length).toEqual(1);
        columnsFiltered = component.customSearch(columSelectorOptionData, 'Full Portfolio');
        expect(columnsFiltered.length).toEqual(1);
    });

    it('Alternative keyword search', () => {
        let columnsFiltered = component.customSearch(columSelectorOptionData, 'P&L');
        expect(columnsFiltered.length).toEqual(1);
        columnsFiltered = component.customSearch(columSelectorOptionData, 'PNL');
        expect(columnsFiltered.length).toEqual(1);
        columnsFiltered = component.customSearch(columSelectorOptionData, 'Profit and loss');
        expect(columnsFiltered.length).toEqual(1);
    });

    it('search with different port/bench/active words', () => {
        let columnsFiltered = component.customSearch(columSelectorOptionData, 'bench market value');
        expect(columnsFiltered.length).toEqual(1);
        columnsFiltered = component.customSearch(columSelectorOptionData, 'benchmark market value');
        expect(columnsFiltered.length).toEqual(1);
    });

    it('search by column description', () => {
        const columSelectorOptionDataSearchByDesc: ColumnSelectorOption[] = [new ColumnSelectorOption('label', null, [new ColumnSelectorOption('cus', null, null,
            null, null, true)], null, null, true), new ColumnSelectorOption('cusi', null, null, null, colDef, null)];
        component.isDescriptionSearch = true;
        component.customSearch(columSelectorOptionDataSearchByDesc, 'cus');
        const colCount = 1;
        expect(component.columnCount).toEqual(colCount.toString());
    });

    it('collapse/expand category based on match score', () => {
        component.isDescriptionSearch = false;
        const securityChildNodes = [new ColumnSelectorOption('Model Duration by type (MOD_DUR_STERL) - Level 1', null, null, 'column', colDef, null, null),
            new ColumnSelectorOption('Model Duration by type (MOD_DUR_STERL) - Level 2', null, null, 'column', colDef, null, null),
            new ColumnSelectorOption('Model Duration by type (MOD_DUR_STERL) - Level 3', null, null, 'column', colDef, null, null),
            new ColumnSelectorOption('Model Duration by type (MOD_DUR_STERL) - Level 4', null, null, 'column', colDef, null, null),
            new ColumnSelectorOption('Model Duration by type (MOD_DUR_STERL) - Level 5', null, null, 'column', colDef, null, null)];
        const groupSecurityNode = new ColumnSelectorOption('Security', null, securityChildNodes, 'group', colDef, null, null);
        securityChildNodes.forEach(node => node.parent = groupSecurityNode);

        const riskChildNodes = [new ColumnSelectorOption('Duration 1', null, null, 'column', colDef, null, null),
            new ColumnSelectorOption('Duration 2', null, null, 'column', colDef, null, null),
            new ColumnSelectorOption('Duration 3', null, null, 'column', colDef, null, null),
            new ColumnSelectorOption('Duration 4', null, null, 'column', colDef, null, null),
            new ColumnSelectorOption('Duration 5', null, null, 'column', colDef, null, null),
            new ColumnSelectorOption('Duration 6', null, null, 'column', colDef, null, null)];
        const groupRiskNode = new ColumnSelectorOption('Risk', null, riskChildNodes, 'group', colDef, null, null);
        riskChildNodes.forEach(node => node.parent = groupRiskNode);

        const columSelectorOptionDataNew: ColumnSelectorOption[] = [groupSecurityNode, ...securityChildNodes, groupRiskNode, ...riskChildNodes];
        let results = component.customSearch(columSelectorOptionDataNew, 'duration');
        expect(results.length).toEqual(13);
        expect(results.find(node => node.label === groupSecurityNode.label).isExpanded).toBeTruthy();
        expect(results.find(node => node.label === groupRiskNode.label).isExpanded).toBeTruthy();
        expect(results.find(node => node.label === securityChildNodes[0].label)).toBeTruthy();
        expect(results.find(node => node.label === riskChildNodes[0].label)).toBeTruthy();

        jest.spyOn(CommonUtils, 'getURLParam').mockReturnValue('0.5');
        results = component.customSearch(columSelectorOptionDataNew, 'duration');
        expect(results.length).toEqual(8);
        expect(results.find(node => node.label === groupSecurityNode.label).isExpanded).toBeFalsy();
        expect(results.find(node => node.label === groupRiskNode.label).isExpanded).toBeTruthy();
        expect(results.find(node => node.label === securityChildNodes[0].label)).toBeFalsy();
        expect(results.find(node => node.label === riskChildNodes[0].label)).toBeTruthy();
    });

    it('compare tree nodes for sorting', () => {
        const node1 = {
            'label': 'Market Value %',
            'uid': 'abs_pct_market_val_PORT',
            'children': null,
            'type': 'column',
            'eventData': {'uses': 'PORT'},
            'key': 0,
            'parent': {},
            'isExpanded': false,
            'isHidden': false,
            'match': true,
            'matchStart': 9,
            'matchEnd': 20,
            matchScore: 1
        } as any as AuxAdvancedTreeListInterface;
        const node2 = {
            'label': 'Absolute Market Value %',
            'uid': 'pct_market_val_PORT',
            'children': null,
            'type': 'column',
            'eventData': {'uses': 'PORT'},
            'key': 0,
            'parent': {},
            'isExpanded': false,
            'isHidden': false,
            'match': true,
            'matchStart': 9,
            'matchEnd': 20,
            matchScore: 0.5
        } as any as AuxAdvancedTreeListInterface;
        expect(component.compareTreeNodes(false, node1, node2)).toEqual(-1);
        node2['matchScore'] = 1;
        expect(component.compareTreeNodes(false, node1, node2)).toEqual(1);
        node2.label = 'Active Market Value';
        node1.label = 'Bench Market Value';
        node1.eventData = {
            uses: CoreColumnConstants.USE_TYPES.BENCH
        };
        node1.eventData = {
            uses: CoreColumnConstants.USE_TYPES.ACTIVE
        };
        expect(component.compareTreeNodes(false, node1, node2)).toEqual(-1);
        node1.key = 2;
        node1.parent = undefined;
        node2.parent = undefined;
        expect(component.compareTreeNodes(false, node1, node2)).toEqual(1);
    });

    describe('test addSearchTelemetry in BaseCustomSearchTreeListComponent', () => {
        let telemetryServiceSpy: jest.SpyInstance;

        beforeEach(() => {
            telemetryServiceSpy = jest.spyOn(TelemetryService, 'track');
        });

        afterEach(() => {
            // Clear all mocks after each test
            jest.clearAllMocks();
        });

        it('should not call TelemetryService.track when searchStringWithNoMatch is undefined and columnCount is non-zero', () => {
            // Arrange
            const searchString = 'testSearch';
            const startTime = Date.now();
            component.columnCount = '1';

            // Act
            component.addSearchTelemetry(searchString, startTime);

            // Assert
            expect(telemetryServiceSpy).not.toHaveBeenCalled();
        });

        it('should call TelemetryService.track when searchStringWithNoMatch is undefined and columnCount is zero', () => {
            // Arrange
            const searchString = 'testSearch';
            const startTime = Date.now();
            component.columnCount = '0';

            // Act
            component.addSearchTelemetry(searchString, startTime);

            // Assert
            expect(telemetryServiceSpy).toHaveBeenCalled();
        });

        it('should not call TelemetryService.track when columnCount is zero and searchStringWithNoMatch is substring of searchString', () => {
            // Arrange
            const searchString = 'testSearch';
            const startTime = Date.now();
            component.columnCount = '0';
            component.searchStringWithNoMatch = 'test';

            // Act
            component.addSearchTelemetry(searchString, startTime);

            // Assert
            expect(telemetryServiceSpy).not.toHaveBeenCalled();
        });

        it('should call TelemetryService.track when columnCount is zero and searchStringWithNoMatch is not substring of searchString', () => {
            // Arrange
            const searchString = 'colSearch';
            const startTime = Date.now();
            component.columnCount = '0';
            component.searchStringWithNoMatch = 'test';

            // Act
            component.addSearchTelemetry(searchString, startTime);

            // Assert
            expect(telemetryServiceSpy).toHaveBeenCalled();
        });
    });
});
