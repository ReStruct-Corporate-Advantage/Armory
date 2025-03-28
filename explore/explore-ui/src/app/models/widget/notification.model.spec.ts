import {Notification} from '@models/widget/notification.model';
import {ErrorTypeConstants, UIErrorParameters} from '@blk/explore-ui-core';

describe('Test Notification Model', () => {
    it('test createErrorNotification', () => {
        const errorMessage = 'error No data in the response, response.message =Cannot invoke "com.bfm.util.BRecordSet.getColumnIdx(String)" because "rptCols" is null';
        const notification = Notification.createErrorNotification(errorMessage, ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_HANDLE_RESPONSE_ERROR, false);
        expect(notification).toBeDefined();
        expect(notification.id).toBe('errorNodataintheresponseresponsemessageCannotinvokecombfmutilBRecordSetgetColumnIdxStringbecauserptColsisnullerror');
        expect(notification.message).toBe(errorMessage);
    });
});
