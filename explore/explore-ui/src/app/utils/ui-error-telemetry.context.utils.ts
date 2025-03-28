import {AlertConstants, TelemetryService, UIErrorParameters} from "@blk/explore-ui-core";
import {Notification} from "@models/widget/notification.model";
import {TelemetryContextUtils} from "@utils/telemetry-context.utils";

export class UIErrorTelemetryContextUtils {

    /**
     * Create UI error parameters to track
     */
    static createUIErrorParameters(errorType: string, errorMessage: string, widgetType?: string, widgetTitle?: string): UIErrorParameters {
        const analysisContext = TelemetryContextUtils.getAnalysisContext();
        return new UIErrorParameters(
            errorType,
            errorMessage,
            analysisContext.portfolioTickers,
            analysisContext.isComparisonEnabled,
            analysisContext.reportTitle,
            analysisContext.reportId,
            analysisContext.reportOwner,
            widgetType,
            widgetTitle
        );
    }

    /**
     * Get UI parameters and track
     */
    static notificationTrack(notification: Notification): Promise<void> {
        //check if it is error or warning, if it is a success notification we don't want it
        if (notification.notificationStyle == AlertConstants.NOTIFICATION_STYLE.ERROR || notification.notificationStyle == AlertConstants.NOTIFICATION_STYLE.WARNING) {
            let actionParameters;
            if (notification.widgetConfigType) {
                actionParameters = UIErrorTelemetryContextUtils.createUIErrorParameters(notification.errorType, notification.message, notification.widgetConfigType, notification.widgetTitle);
            } else {
                //if it doesn't have widget info then it is toaster level
                actionParameters = UIErrorTelemetryContextUtils.createUIErrorParameters(notification.errorType, notification.message);
            }
            return TelemetryService.track(UIErrorParameters.ACTION, actionParameters, notification.functionName)
        }
    }
}
