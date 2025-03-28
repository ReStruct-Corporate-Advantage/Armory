import {CoreColumnUtils} from './core-column.utils';
import {ColumnDefinition} from '../definition/models/column-definition.model';
import {PortfolioRiskColumnCategoryDefinition} from '../definition/models/portfolio-risk-column-category-definition.model';
import {CoreDefinitionStore} from '../definition/core-definition.store';
import {ColumnConfig} from './models/column-config/column-config.model';
import {CoreColumnDefUtils} from './core-column-def.utils';

describe('CoreColumnUtils', () => {
    it('tests createColumnDefinitions', () => {
        const data = {
            ColumnDefinitions: [{
                columnTag: 'gross_margin',
                dataType: 'DOUBLE',
                uses: 'ALL',
                title: 'Gross Margin',
                constraintType: 'SECTOR_CONSTRAINT',
                columnFormat: {},
                configType: 'ColumnDefinitionBean'
            }, {
                columnTag: 'ActRetSemid',
                dataType: 'DOUBLE',
                uses: 'ACTIVE',
                title: 'Active Semi Deviation',
                columnFormat: {},
                configType: 'ColumnDefinitionBean'
            },
            {
                columnTag: 'cusip_1',
                dataType: 'STRING',
                uses: 'ALL',
                title: 'cusip',
                CLASS_TYPE: 'com.bfm.app.explore.json.ColumnDefinitionBean'
            },
            {
                columnTag: 'cusip_2',
                dataType: 'STRING',
                uses: 'ALL',
                title: 'cusip',
                CLASS_TYPE: 'com.bfm.app.prism.json.PortfolioRiskColumnCategoryDefinitionBean'
            },
            {
                columnTag: 'cusip_3',
                dataType: 'STRING',
                uses: 'ALL',
                title: 'cusip'
            },
            {
                columnTag: 'cusip_4',
                dataType: 'STRING',
                uses: 'ALL',
                title: 'cusip',
                configType: 'PortfolioRiskColumnCategoryDefinitionBean'
            }],
            optimizationConstraints: []
        };

        CoreColumnUtils.createColumnDefinitions(data);
        expect(data.optimizationConstraints.length).toBe(1);
        expect(data.optimizationConstraints[0].columnTag).toBe('gross_margin');

        expect(CoreColumnUtils.getColumnDefByTag('cusip_1') instanceof ColumnDefinition);
        expect(CoreColumnUtils.getColumnDefByTag('cusip_2') instanceof PortfolioRiskColumnCategoryDefinition);
        expect(CoreColumnUtils.getColumnDefByTag('cusip_3') instanceof ColumnDefinition);
        expect(CoreColumnUtils.getColumnDefByTag('cusip_4') instanceof PortfolioRiskColumnCategoryDefinition);
    });

    describe('getStrippedName Test', () => {
        it('should update string if starts from Portfolio', () => {
            expect(CoreColumnDefUtils.getStrippedName('Portfolio test')).toBe('test');
        });

        it('should update string if starts from Benchmark', () => {
            expect(CoreColumnDefUtils.getStrippedName('Benchmark test')).toBe('test');
        });

        it('should update string if starts from Active', () => {
            expect(CoreColumnDefUtils.getStrippedName('Active test')).toBe('test');
        });

        it('should return input value if not starts with planned string', () => {
            expect(CoreColumnDefUtils.getStrippedName('test-value Portfolio')).toBe('test-value Portfolio');
        });
    });


    it('should return undefined if column definition is not found', () => {
        const column = new ColumnConfig();
        column.columnTag = 'non_existent_tag';

        const result = CoreColumnUtils.getOriginalTitleForResearchTopicColumns(column);
        expect(result).toBeUndefined();
    });

    it('should update column title for RESEARCH_NOTE column with topics in columnTag', () => {
        const column = new ColumnConfig();
        column.columnTag = 'research_topics';
        const colDef = new ColumnDefinition();
        colDef.columnType = 'RESEARCH_NOTE';
        colDef.groups = ['Group1', 'Group2'];
        colDef.title = 'Research Title';
        CoreDefinitionStore.columnTagColumnsPairs.set('research_topics', [colDef]);

        CoreColumnUtils.getOriginalTitleForResearchTopicColumns(column);
        expect(column.columnTitle).toBe('Group2 - Research Title');
    });

    it('should not update column title if column type is not RESEARCH_NOTE', () => {
        const column = new ColumnConfig();
        column.columnTag = 'research_topics';
        const colDef = new ColumnDefinition();
        colDef.columnType = 'OTHER_TYPE';
        colDef.groups = ['Group1', 'Group2'];
        colDef.title = 'Other Title';
        CoreDefinitionStore.columnTagColumnsPairs.set('research_topics', [colDef]);

        CoreColumnUtils.getOriginalTitleForResearchTopicColumns(column);
        expect(column.columnTitle).toBeUndefined();
    });

    it('should not update column title if column tag does not include topics', () => {
        const column = new ColumnConfig();
        column.columnTag = 'research_other';
        const colDef = new ColumnDefinition();
        colDef.columnType = 'RESEARCH_NOTE';
        colDef.groups = ['Group1', 'Group2'];
        colDef.title = 'Research Title';
        CoreDefinitionStore.columnTagColumnsPairs.set('research_other', [colDef]);

        CoreColumnUtils.getOriginalTitleForResearchTopicColumns(column);
        expect(column.columnTitle).toBeUndefined();
    });

    describe('getUseOrder', () => {
        it('should return 0 if input is port or portfolio', () => {
            expect(CoreColumnUtils.getUseOrder('PORT', 'Portfolio')).toBe(0);
        });

        it('should return 1 if input is bench or benchmark', () => {
            expect(CoreColumnUtils.getUseOrder('BENCH', 'Benchmark')).toBe(1);
        });

        it('should return 2 if input is active', () => {
            expect(CoreColumnUtils.getUseOrder('ACTIVE', 'Active')).toBe(2);
        });

        it('should return 0 in other cases', () => {
            expect(CoreColumnUtils.getUseOrder('PORTBENCH', 'PORTBENCH')).toBe(0);
        });
    });
});
