import {DateColumnFormatColumnOption} from '../../../models/column-option/date-column-format-column-option.model';
import {ColumnOptionTestBed} from '../../../test-utils';
import {DateFormatColumnOptionComponent} from './date-format-column-option.component';

describe('dateFormatColumnOptionsComponent', () => {
    let testBed: ColumnOptionTestBed<DateFormatColumnOptionComponent, DateColumnFormatColumnOption>;

    beforeEach(() => {
        // Create the mocked column option to validate this component.
        const mockedOption = {
            'columnOptionAttributes': [{
                'title': 'Date Format',
                'key': 'dateFormat',
                'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeWithValues',
                'values': [{
                    'value': 'Aladdin date format',
                    'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
                    'label': '-1'
                }, {
                    'value': 'M/d/yyyy',
                    'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
                    'label': '0'
                }],
                'dataType': 'S'
            }],
            'columnOptionConfigType': 'dateColumnFormatColumnOption',
            'columnOptionTitle': 'Display options',
            'CLASS_TYPE': 'com.bfm.prism.data.column.options.general.DateFormattingOptions',
            'columnOptionKey': 'formatAndScaling'
        };

        // Create the testbed for testing the component.
        testBed = new ColumnOptionTestBed<DateFormatColumnOptionComponent, DateColumnFormatColumnOption>(DateFormatColumnOptionComponent, new DateColumnFormatColumnOption(), mockedOption);
    });

    it('Validate init of the component', () => {
        expect(testBed.component.dateFormatListAttribute).not.toBeUndefined();
        // aggregationListAttribute should be initialized
        expect(testBed.component.dateFormatListAttribute.values.length).toBe(2);
        expect(testBed.component.selectedFormat).toBe('Aladdin date format');
    });

    it('Validate Update option value', () => {
        testBed.component.updateOptionValue('M/d/yyyy');
        expect(testBed.component.optionValue.value).toBe('M/d/yyyy');
        expect(testBed.component.optionValue.label).toBe(0);
    });

    it('Validate Find Aggregation Type', () => {
        let result = testBed.component.findDateFormatItem('Aladdin date format');
        // Find Aggregation item with value 2
        expect(result).toStrictEqual({
            'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
            'label': '-1',
            'value': 'Aladdin date format'
        });
        // Find aggregation item for value 9 which is not in mocked column option
        result = testBed.component.findDateFormatItem('MM/DD/YYYY');
        expect(result).toBeUndefined();
    });
});
