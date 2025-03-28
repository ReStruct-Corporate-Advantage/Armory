/**
 * This utils class will be used to look up error message from error codes
 */
export class ErrorCodeLookupUtils {
    private static _errCodes: Map<string, string> =
        new Map([
            ['10001', 'The server has timed out. Reduce the number of columns in your widget or split this request into multiple widgets to try again. Alternatively, if you were able to process this request successfully in the past, there may be a temporary issue or the portfolio and benchmark assignment have evolved to be too large. Either way, if you are still encountering this error, please reach out to Aladdin Help for further guidance.'],
            ['10002', 'The request failed for VaR and/or Stress PnL calculations due to missing portfolio factor exposures. This might arise when running a time series over a period in which a new portfolio is inserted into a group, and this new portfolio does not have it\'s first exposure date set properly. Alternatively, bad data might have prevented the generation of exposure data for the portfolio. To remediate this please reach out to client support teams.']
        ]);

    private static _uiPreferredMessages: Map<string, string> =
        new Map([
            ['Error while retrieving data from VAR Server with error [current_bb is NULL. > ]', 'The Factor based analysis widget requires a factor breakdown. Provide a quick grouping or configurable breakdown and try again.']
        ]);

    public static findErrorMessage(code: string): string {
        let errorMsg;
        if (this._errCodes.get(code)) {
            errorMsg = this._errCodes.get(code);
        }
        return errorMsg;
    }

    public static findConvertedMessage(prefix: string, origMessage: string): string {
        return this._uiPreferredMessages.get(origMessage) ? this._uiPreferredMessages.get(origMessage) : prefix + origMessage;
    }
}
