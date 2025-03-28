import { ColumnOptionTestBed } from '../../../test-utils';
import {CreditVarSettingsColumnOptionComponent} from './credit-var-settings-column-option.component';
import {
    CreditVarSettingsColumnOption
} from '../../../models/column-option/credit-var/credit-var-settings-column-option.model';

describe('CreditVarSettingsColumnOptionComponent', () => {
    let testBed: ColumnOptionTestBed<CreditVarSettingsColumnOptionComponent, CreditVarSettingsColumnOption>;

    beforeEach(() => {
        // Create the mocked column option to validate this component.
        const mockedOption = {
            'columnOptionAttributes': [
                {
                    'title': 'Credit VaR Settings',
                    'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeWithValues',
                    'key': 'creditVarSettings',
                    'dataType': 'N',
                    'values': [
                        {
                            'value': 84,
                            'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
                            'label': '84'
                        },
                        {
                            'value': 95,
                            'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
                            'label': '95'
                        },
                        {
                            'value': 97.5,
                            'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
                            'label': '97.5'
                        },
                        {
                            'value': 99,
                            'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
                            'label': '99'
                        },
                        {
                            'value': 99.5,
                            'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
                            'label': '99.5'
                        },
                        {
                            'value': 99.9,
                            'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttributeValue',
                            'label': '99.9'
                        }
                    ]
                }
            ],
            'columnOptionConfigType': 'creditVarSettings',
            'columnOptionTitle': 'Credit VaR Settings',
            'CLASS_TYPE': 'com.bfm.prism.data.column.options.creditvar.CreditVaRSettingsColumnOption',
            'columnOptionKey': 'creditVarSettings'
        };

        // Create the testbed for testing the component.
        testBed = new ColumnOptionTestBed<CreditVarSettingsColumnOptionComponent, CreditVarSettingsColumnOption>(CreditVarSettingsColumnOptionComponent, new CreditVarSettingsColumnOption(), mockedOption);
    });

    it('Validate init of the component', () => {
        expect(testBed.component.confidenceLevelsData).not.toBeUndefined();
        expect(testBed.component.confidenceLevelsData[0].values.length).toBe(6);
        expect(testBed.component.optionValue.confidenceLevelPercentage).toBe(84);
    });

    it('Validate Update option value', () => {
        const newConfidenceLevel = 99.5;
        testBed.component.onConfidenceLevelChanged(newConfidenceLevel);
        expect(testBed.component.optionValue.confidenceLevelPercentage).toBe(newConfidenceLevel);
    });
});
