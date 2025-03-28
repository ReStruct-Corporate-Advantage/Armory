import {AbstractColumnOption, ColumnConstants, ColumnOptionFactory} from '@blk/explore-ui-core';
import {ConfigInitializer} from '../../../initializers/config.initializer';
import {CumulativeReturnColumnOption} from '@models/columns/column-options/cumulative-return-column-option.model';
import {EquityColumnOption} from '@blk/explore-ui-column-option';

describe('Tests for CumulativeReturnColumnOption', () => {
    let columnOption: CumulativeReturnColumnOption;

    beforeEach(() => {
        ConfigInitializer.registerColumnOptionTypes();
        columnOption = new CumulativeReturnColumnOption();
    });

    /**
     * Tests addRequestParams
     */
    it('Test addRequestParams', () => {
        // By default cumulative return is expected to be true
        const requestParams: any = {};
        columnOption.addRequestParams(requestParams);
        console.log(requestParams[ColumnConstants.CUMULATIVE_OPTION]);
        expect(requestParams[ColumnConstants.CUMULATIVE_OPTION]).toStrictEqual(true);

        // Set cumulative return to false and check it gets reflected in the request params
        columnOption.isCumulative = false;
        columnOption.addRequestParams(requestParams);
        expect(requestParams[ColumnConstants.CUMULATIVE_OPTION]).toStrictEqual(false);
    });

    /**
     * Tests serialize
     */
    it('Test serialize', () => {
        const data = columnOption.serialize();
        // By default expect cumulative returns flag to be true
        expect(data[ColumnConstants.CUMULATIVE_OPTION]).toStrictEqual(true);
    });

    /**
     * Tests deserialise
     */
    it('Test deserialize', () => {
        const data = {};
        data[ColumnConstants.CUMULATIVE_OPTION] = false;

        columnOption = new CumulativeReturnColumnOption(data);
        expect(columnOption.isCumulative).toStrictEqual(false);
    });

    /**
     * Tests an option creation by ColumnOptionFactory
     */
    it('Test create from factory', () => {
        const option: AbstractColumnOption = ColumnOptionFactory.createNewModel(CumulativeReturnColumnOption.CONFIG_TYPE);
        expect(option instanceof CumulativeReturnColumnOption).toStrictEqual(true);
    });

    /**
     * Tests equals
     */
    it('Test equals', () => {
        // Should not be equal to undefined
        expect(columnOption.equals(undefined)).toStrictEqual(false);

        // Should not be equal to null
        expect(columnOption.equals(null)).toStrictEqual(false);

        // Should not be equal to other type
        expect(columnOption.equals(new EquityColumnOption())).toStrictEqual(false);

        // Should not be equal to the option with the different isCumulative flag
        const otherColumnOption = new CumulativeReturnColumnOption();
        otherColumnOption.isCumulative = false;
        expect(columnOption.equals(otherColumnOption)).toStrictEqual(false);

        // Should be equal to the option with the same isCumulative flag
        otherColumnOption.isCumulative = true;
        expect(columnOption.equals(otherColumnOption)).toStrictEqual(true);
    });

    /**
     * Tests isValid
     */
    it('Test isValid', () => {
        // Newly created option is expected to be valid
        expect(columnOption.isValid()).toStrictEqual(true);

        // An option with the undefined flag is expected to be invalid
        columnOption.isCumulative = undefined;
        expect(columnOption.isValid()).toStrictEqual(false);
    });
});
