import {CoverageMeasureColumnOptionComponent} from './coverage-measure-column-option.component';
import {ColumnOptionTestBed} from '../../../test-utils';
import {CoverageMeasureColumnOption} from '../../../models/column-option/coverage-measure-column-option.model';
import {ColumnDefinition, CoreDefinitionStore, CoreWidgetConfigStore, WidgetConfigType} from '@blk/explore-ui-core';

describe('CoverageMeasureColumnOptionComponent', () => {
    let testBed: ColumnOptionTestBed<CoverageMeasureColumnOptionComponent, CoverageMeasureColumnOption>;

    const column1 = {
        title: 'Price',
        columnTag: 'price',
        uses: 'PORT',
        groups: ['POSITION']
    } as ColumnDefinition;
    const column2 = {
        title: 'Price Source',
        columnTag: 'price_source',
        uses: 'BENCH',
        groups: ['POSITION']
    } as ColumnDefinition;

    beforeEach(() => {
        CoreDefinitionStore.columns = [column1, column2];
    });

    beforeEach( () => {
        // Create the mocked column option to validate this component.
        const mockedOption = {
            'columnOptionAttributes': [{
                'title': 'Column Measure',
                'key': 'coverageMeasure',
                'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttribute',
                'dataType': 'S'
            }],
            'columnOptionConfigType': 'coverageMeasure',
            'columnOptionTitle': 'Coverage Measure',
            'CLASS_TYPE': 'com.bfm.prism.data.column.options.general.CoverageMeasureColumnOption',
            'columnOptionKey': 'coverageMeasure'
        };

        const widgetConfigInputs = {
            'customCoverageColumn': {
                'restrictedColumnOptions': {
                    'sections': [
                        'columnBreakdown',
                        'formatAndScaling',
                        'highlight',
                        'customColumnTitle'
                    ]
                }
            }
        };
        jest.spyOn(CoreWidgetConfigStore, 'getChartConfigForType').mockReturnValue(widgetConfigInputs);

        // Create the testbed for testing the component.
        testBed = new ColumnOptionTestBed<CoverageMeasureColumnOptionComponent, CoverageMeasureColumnOption>(CoverageMeasureColumnOptionComponent, new CoverageMeasureColumnOption(), mockedOption);
        testBed.component.widgetType = WidgetConfigType.RISK_EXPOSURE;
    });

    it('ngOnInit test', () => {
        testBed.fixture.detectChanges();
        testBed.component.ngOnInit();

        expect(testBed.component.title).toEqual('Column Measure');

        expect(testBed.component.isMeasureSelectionModalOpen).toEqual(false);

        expect(testBed.component.modifiedRestrictedColumnOptions.sections).toHaveLength(4);
        expect(testBed.component.modifiedRestrictedColumnOptions.options).toHaveLength(1);
    });
});
