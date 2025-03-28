import { ColumnOptionTestBed } from '../../../test-utils';
import { FxFactorOptionsColumnOptionComponent } from './fx-factor-options-column-option.component';
import { FxFactorOptionsColumnOption } from '../../../models/column-option/fx-factor-options-column-option.model';
import {ExploreSelectOption} from '@blk/explore-ui-core';

describe('fxCrossCurrencyComponent', () => {
    let testBed: ColumnOptionTestBed<FxFactorOptionsColumnOptionComponent, FxFactorOptionsColumnOption>;

    beforeEach(() => {
        // Create the mocked column option to validate this component.
        const mockedOption = {
            'columnOptionAttributes': [{
                'title': 'FX Currencies',
                'key': 'fxCurrencies',
                'dataType': 'S',
                'values': [
                    {
                        'value': 'USD',
                        'label': '0'
                    },
                    {
                        'value': 'ADP',
                        'label': '1'
                    },
                ]
            }],
            'columnOptionConfigType': 'fxFactorOptionsColumnOption',
            'columnOptionTitle': 'FX factor options',
            'columnOptionKey': 'fxFactorOptionsColumnOption'
        };

        // Create the testbed for testing the component.
        testBed = new ColumnOptionTestBed<FxFactorOptionsColumnOptionComponent, FxFactorOptionsColumnOption>(FxFactorOptionsColumnOptionComponent, new FxFactorOptionsColumnOption(), mockedOption);
    });

    it('Validate init of the component', () => {
        expect(testBed.component.fxCrossCurrencyOptions).not.toBeUndefined();
        // aggregationListAttribute should be initialized
        expect(testBed.component.fxCrossCurrencyOptions[0].values.length).toBe(2);
        expect(testBed.component.optionValue.fxCrossCurrency).toBe(undefined);
        expect(testBed.component.optionValue.isFxCrossCurrencyChanged).toBe(false);
    });

    it('Validate Update option value', () => {
        const newFxCurrency = 'ADP';
        const newAuxSelectOption = new ExploreSelectOption(newFxCurrency, newFxCurrency, true);

        const event = new CustomEvent<any>('');
        event.initCustomEvent('', true, true, { value: newAuxSelectOption });

        testBed.component.onFxCurrencyChanged(event);
        expect(testBed.component.optionValue.fxCrossCurrency).toBe(newFxCurrency);
        expect(testBed.component.optionValue.isFxCrossCurrencyChanged).toBe(true);
    });
});
