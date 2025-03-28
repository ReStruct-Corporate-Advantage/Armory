import {MultiManagerUtils} from './multi-manager.utils';
import {ColumnConfig} from '@blk/explore-ui-core';
import {Breakdown, ColumnBreakdown, ColumnSector, MultiManagerBreakdownModel} from '@blk/explore-ui-breakdown';
import {
    MultiManagerBreakdownUtils
} from '../../../projects/explore-ui-breakdown/src/utils/multi-manager-breakdown.utils';
import {DefinitionsStore} from '@stores/definitions.store';

describe('MultiManagerUtils', () => {
    describe('isValidDecisionBenchConfig', () => {
        it('should return true if decisionBenchMap is empty', () => {
            const decisionBenchMap = new Map<string, string>();
            const allSectorPaths: string[] = ['path1', 'path2'];
            expect(MultiManagerUtils.isValidDecisionBenchConfig(decisionBenchMap, allSectorPaths)).toBe(true);
        });

        it('should return true if allSectorPaths are included in decisionBenchMap', () => {
            const decisionBenchMap = new Map<string, string>([['path1', 'value1'], ['path2', 'value2']]);
            const allSectorPaths: string[] = ['path1', 'path2'];
            expect(MultiManagerUtils.isValidDecisionBenchConfig(decisionBenchMap, allSectorPaths)).toBe(true);
        });

        it('should return false if any path in allSectorPaths is not included in decisionBenchMap', () => {
            const decisionBenchMap = new Map<string, string>([['path1', 'value1']]);
            const allSectorPaths: string[] = ['path1', 'path2'];
            expect(MultiManagerUtils.isValidDecisionBenchConfig(decisionBenchMap, allSectorPaths)).toBe(false);
        });
    });

    describe('columnContainsMultiManagerOptions', () => {
        it('should return true if column contains multi-manager data', () => {
            const column = new ColumnConfig();
            const breakdown = new ColumnBreakdown();
            breakdown.multiManagerData = { decompositionMode: 'someMode' } as MultiManagerBreakdownModel;
            column.optionValues = [breakdown];
            expect(MultiManagerUtils.columnContainsMultiManagerOptions(column)).toBe(true);
        });

        it('should return false if column does not contain multi-manager data', () => {
            const column = new ColumnConfig();
            const breakdown = new ColumnBreakdown();
            breakdown.multiManagerData = { decompositionMode: 'none' } as MultiManagerBreakdownModel;
            column.optionValues = [breakdown];
            expect(MultiManagerUtils.columnContainsMultiManagerOptions(column)).toBe(false);
        });

        it('should return false if column does not contain ColumnBreakdown option', () => {
            const column = new ColumnConfig();
            column.optionValues = [];
            expect(MultiManagerUtils.columnContainsMultiManagerOptions(column)).toBe(false);
        });
    });

    describe('compareChildren', () => {

        let widgetBreakdown: Breakdown;

        beforeEach(() => {
            widgetBreakdown = new Breakdown();
        });

        it('should return true if breakdownTree is the same as widgetBreakdown', () => {
            const breakdownTree = new Breakdown();
            jest.spyOn(MultiManagerBreakdownUtils, 'createBreakdownTreeForDecisionBenchData').mockReturnValue(breakdownTree);

            expect(MultiManagerUtils.compareChildren(breakdownTree.children, widgetBreakdown.children)).toBe(true);
        });

        it('should return true if both breakdownTree and widgetBreakdown have empty children', () => {
            const breakdownTree = new Breakdown();
            breakdownTree.children = [];
            widgetBreakdown.children = [];
            jest.spyOn(MultiManagerBreakdownUtils, 'createBreakdownTreeForDecisionBenchData').mockReturnValue(breakdownTree);

            expect(MultiManagerUtils.compareChildren(breakdownTree.children, widgetBreakdown.children)).toBe(true);
        });

        it('should return false if breakdownTree has children and widgetBreakdown does not', () => {
            const breakdownTree = new Breakdown();
            breakdownTree.children = [{} as ColumnSector];
            widgetBreakdown.children = [];
            jest.spyOn(MultiManagerBreakdownUtils, 'createBreakdownTreeForDecisionBenchData').mockReturnValue(breakdownTree);

           expect(MultiManagerUtils.compareChildren(breakdownTree.children, widgetBreakdown.children)).toBe(false);
        });

        it('should return false if widgetBreakdown has children and breakdownTree does not', () => {
            const breakdownTree = new Breakdown();
            breakdownTree.children = [];
            widgetBreakdown.children = [new ColumnSector()];
            jest.spyOn(MultiManagerBreakdownUtils, 'createBreakdownTreeForDecisionBenchData').mockReturnValue(breakdownTree);

            expect(MultiManagerUtils.compareChildren(breakdownTree.children, widgetBreakdown.children)).toBe(false);
        });

        it('should return false if breakdownTree and widgetBreakdown have different number of children', () => {
            const breakdownTree = new Breakdown();
            breakdownTree.children = [new ColumnSector(), new ColumnSector()];
            widgetBreakdown.children = [new ColumnSector()];
            jest.spyOn(MultiManagerBreakdownUtils, 'createBreakdownTreeForDecisionBenchData').mockReturnValue(breakdownTree);

            expect(MultiManagerUtils.compareChildren(breakdownTree.children, widgetBreakdown.children)).toBe(false);
        });

        it('should return true if breakdownTree and widgetBreakdown have the same children', () => {
            const breakdownTree = new Breakdown();
            const child = new ColumnSector();
            child.columnTag = 'tag1';
            breakdownTree.children = [child];
            widgetBreakdown.children = [child];
            jest.spyOn(MultiManagerBreakdownUtils, 'createBreakdownTreeForDecisionBenchData').mockReturnValue(breakdownTree);

            expect(MultiManagerUtils.compareChildren(breakdownTree.children, widgetBreakdown.children)).toBe(true);
        });

        it('should return false if breakdownTree and widgetBreakdown have different children', () => {
            const breakdownTree = new Breakdown();
            const child1 = new ColumnSector();
            child1.columnTag = 'tag1';
            const child2 = new ColumnSector();
            child2.columnTag = 'tag2';
            breakdownTree.children = [child1];
            widgetBreakdown.children = [child2];
            jest.spyOn(MultiManagerBreakdownUtils, 'createBreakdownTreeForDecisionBenchData').mockReturnValue(breakdownTree);

            expect(MultiManagerUtils.compareChildren(breakdownTree.children, widgetBreakdown.children)).toBe(false);
        });

        it('should return false if breakdownTree and widgetBreakdown have different nested children', () => {
            const breakdownTree = new Breakdown();
            const child1 = new ColumnSector();
            child1.columnTag = 'tag1';
            child1.children = [{ columnTag: 'nestedTag1' }] as ColumnSector[];

            const child2 = new ColumnSector();
            child2.columnTag = 'tag1';
            child2.children = [{ columnTag: 'nestedTag2' }] as ColumnSector[];
            breakdownTree.children = [child1];
            widgetBreakdown.children = [child2];
            jest.spyOn(MultiManagerBreakdownUtils, 'createBreakdownTreeForDecisionBenchData').mockReturnValue(breakdownTree);

            expect(MultiManagerUtils.compareChildren(breakdownTree.children, widgetBreakdown.children)).toBe(false);
        });
    });

    describe('isValidMMBreakdown', () => {
        let widgetBreakdown: Breakdown;

        beforeEach(() => {
            widgetBreakdown = new Breakdown();
            DefinitionsStore.topDownEligibleCols = ['col1', 'col2'];
        });

        it('should return true if widgetBreakdown has no children', () => {
            widgetBreakdown.children = undefined;

            expect(MultiManagerUtils.isValidMMBreakdown(widgetBreakdown)).toBe(false);
        });

        it('should return true if all children columnTags are valid', () => {
            const col = new ColumnSector();
            col.columnTag = 'col1';
            widgetBreakdown.children = [col] as ColumnSector[];

            expect(MultiManagerUtils.isValidMMBreakdown(widgetBreakdown)).toBe(true);
        });

        it('should return false if any child columnTag is invalid', () => {
            const col = new ColumnSector();
            col.columnTag = 'invalid';
            widgetBreakdown.children = [col] as ColumnSector[];

            expect(MultiManagerUtils.isValidMMBreakdown(widgetBreakdown)).toBe(false);
        });

        it('should return true if nested children columnTags are valid', () => {
            const col = new ColumnSector();
            col.columnTag = 'col1';
            const child = new ColumnSector();
            child.columnTag = 'col2';
            col.children = [child];
            widgetBreakdown.children = [col] as ColumnSector[];

            expect(MultiManagerUtils.isValidMMBreakdown(widgetBreakdown)).toBe(true);
        });

        it('should return false if any nested child columnTag is invalid', () => {
            const col = new ColumnSector();
            col.columnTag = 'col1';
            col.children = [new ColumnSector({ columnTag: 'invalid' })];
            widgetBreakdown.children = [col] as ColumnSector[];

            expect(MultiManagerUtils.isValidMMBreakdown(widgetBreakdown)).toBe(false);
        });

        it('should return true if DefinitionsStore.topDownEligibleCols is undefined', () => {
            const col = new ColumnSector();
            col.columnTag = 'col1';
            widgetBreakdown.children = [col] as ColumnSector[];

            expect(MultiManagerUtils.isValidMMBreakdown(widgetBreakdown)).toBe(true);
        });
    });
});
