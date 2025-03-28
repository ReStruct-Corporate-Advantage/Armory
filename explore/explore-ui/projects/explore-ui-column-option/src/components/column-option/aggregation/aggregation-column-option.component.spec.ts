import {AggregationColumnOption} from '../../../models/column-option/aggregation-column-option.model';
import {ColumnOptionTestBed} from '../../../test-utils/column-option-test-bed.testutil';
import {AggregationColumnOptionComponent} from './aggregation-column-option.component';

describe('AggregationColumnOptionComponent', () => {
    let testBed: ColumnOptionTestBed<AggregationColumnOptionComponent, AggregationColumnOption>;
    beforeEach(() => {
        // Create the mocked column option to validate this component.
        const mockedOption = {
            'columnOptionAttributes': [{
                'title': 'Type',
                'defaultValue': {
                    'value': '2',
                    'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
                    'label': 'Sum'
                },
                'key': 'aggregationType',
                'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeWithValues',
                'values': [{
                    'value': 4,
                    'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
                    'label': 'Market Value/Market Value'
                }, {
                    'value': 12,
                    'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
                    'label': 'Absolute Sum'
                }, {
                    'value': 3,
                    'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
                    'label': 'Spread Duration * Notional/Spread Duration * Notional'
                }, {
                    'value': 5,
                    'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
                    'label': 'Par Value/Par Value'
                }, {
                    'value': 2200,
                    'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
                    'label': 'Distinct Value Count'
                }, {
                    'value': 41,
                    'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
                    'label': 'Max'
                }, {
                    'value': 43,
                    'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
                    'label': 'Median'
                }, {
                    'value': 2,
                    'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
                    'label': 'Sum'
                }, {
                    'value': 115,
                    'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
                    'label': 'Par Val/Par Val Absolute Weight'
                }, {
                    'value': 2300,
                    'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
                    'label': 'Wt Avg'
                }, {
                    'value': 15,
                    'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
                    'label': 'Par Val/Par Val Ignore Zero'
                }, {
                    'value': 0,
                    'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
                    'label': 'None'
                }, {
                    'value': 2100,
                    'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
                    'label': 'Unique Value'
                }, {
                    'value': 42,
                    'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
                    'label': 'Min'
                }, {
                    'value': 1,
                    'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
                    'label': 'Notional Market Value/Market Value'
                }, {
                    'value': 14,
                    'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
                    'label': 'Market Value/Market Value, null value excluded'
                }, {
                    'value': 205,
                    'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
                    'label': 'Par Value/Par Value, with Title Traded',
                }, {
                    'value': 16,
                    'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
                    'label': 'Harmonic Mean'
                }, {
                    'value': 44,
                    'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
                    'label': 'Wt Avg Hmean',
                }, {
                    'value': 10,
                    'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
                    'label': 'Average',
                }],
                'dataType': 'S'
            }],
            'columnOptionConfigType': 'aggregation',
            'columnOptionTitle': 'Aggregation',
            'CLASS_TYPE': 'com.bfm.prism.data.column.options.general.AggregationColumnOption',
            'columnOptionKey': 'aggregation'
        };

        // Create the testbed for testing the component.
        testBed = new ColumnOptionTestBed<AggregationColumnOptionComponent, AggregationColumnOption>(AggregationColumnOptionComponent, new AggregationColumnOption(), mockedOption);
    });

    it('Validate init of the component', () => {
        expect(testBed.component.aggregationListAttribute).not.toBeUndefined();
        // aggregationListAttribute should be initialized
        expect(testBed.component.aggregationListAttribute.values.length).toBe(20);
    });

    it('Validate populateDropdownOptions', () => {
        testBed.component.populateDropDownOptions();
        expect(testBed.component.selectOptions[0].values.length).toBe(20);
    });

    it('Validate Find Aggregation Type', () => {
        let result = testBed.component.findAggregationItem(2);
        // Find Aggregation item with value 2
        expect(result).toStrictEqual({
            'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
            'label': 'Sum',
            'value': 2
        });
        // Find aggregation item for value 9 which is not in mocked column option
        result = testBed.component.findAggregationItem(9);
        expect(result).toBeUndefined();
    });
});
