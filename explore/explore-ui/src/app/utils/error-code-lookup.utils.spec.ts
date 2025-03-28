import {ErrorCodeLookupUtils} from '@utils/error-code-lookup.utils';

describe('ErrorCodeLookupUtils Test', () => {
    it('test findErrorMessage', () => {
        expect(ErrorCodeLookupUtils.findErrorMessage('10001')).toBe('The server has timed out. Reduce the number of columns in your widget or split this request into multiple widgets to try again. Alternatively, if you were able to process this request successfully in the past, there may be a temporary issue or the portfolio and benchmark assignment have evolved to be too large. Either way, if you are still encountering this error, please reach out to Aladdin Help for further guidance.');
        expect(ErrorCodeLookupUtils.findErrorMessage('xxxxx')).toBeUndefined();
    });

    it('test findConvertedMessage', () => {
        expect(ErrorCodeLookupUtils.findConvertedMessage('No data in the response, response.message =', 'Some random Error msg')).toBe('No data in the response, response.message =Some random Error msg');
        expect(ErrorCodeLookupUtils.findConvertedMessage('No data in the response, response.message =', 'Error while retrieving data from VAR Server with error [current_bb is NULL. > ]')).toBe('The Factor based analysis widget requires a factor breakdown. Provide a quick grouping or configurable breakdown and try again.');
    });
});
