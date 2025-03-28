import {
    ColumnConfig,
    ColumnDefinition,
    CoreDefinitionStore,
} from '@blk/explore-ui-core';
import {DefinitionColumnOptionComponent} from './definition-column-option.component';
import {DefinitionColumnOption} from '../../../models/column-option/definition-column-option.model';
import {ColumnOptionTestBed} from '../../../test-utils/column-option-test-bed.testutil';

describe('DefinitionColumnOptionComponent', () => {
    let testBed: ColumnOptionTestBed<DefinitionColumnOptionComponent, DefinitionColumnOption>;

    const description = '% of market value';

    beforeEach(() => {

        // create empty column def in store
        const pctMVColumnDef = new ColumnDefinition();
        pctMVColumnDef.title = 'Market Value %';
        pctMVColumnDef.columnTag = 'pct_mv';
        pctMVColumnDef.uses = 'PORT';
        CoreDefinitionStore.columnTagColumnsPairs.set('pct_mv', [pctMVColumnDef]);

        // Create the mocked column option to validate this component.
        const mockedOption = {
            columnOptionAttributes: [{
                'title': 'Definition',
                'key': 'definition',
                'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttribute',
                'dataType': 'S'
            }],
            columnOptionConfigType: 'definition',
            columnOptionTitle: 'Definition',
            CLASS_TYPE: 'com.bfm.prism.data.column.options.general.DefinitionColumnOption',
            columnOptionKey: 'definition'
        };

        testBed = new ColumnOptionTestBed<DefinitionColumnOptionComponent, DefinitionColumnOption>(
            DefinitionColumnOptionComponent,
            new DefinitionColumnOption,
            mockedOption,
            undefined,
            'pct_mv',
            'PORT',
            ColumnConfig.createColumn('pct_mv', 'PORT', 'pct_mv_1', 'Market Value %'),
        );
    });

    it('retrieves column description that already has been loaded', () => {
        // set column description in store
        const cols = CoreDefinitionStore.columnTagColumnsPairs.get('pct_mv');
        cols.forEach(col => col.columnDesc = description);
        testBed.component['initializeComponent']();
        expect(testBed.component.definition.columnDesc).toEqual(description);
    });
});
