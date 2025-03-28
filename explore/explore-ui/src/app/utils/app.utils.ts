import {CommonUtils, CoreAppUtils, ExploreDialogParam, TokenConstants, TokenUtils, UserMetaDataUtils, AlertConstants} from '@blk/explore-ui-core';
import {URLConstants, UtilConstants} from '../constants';
import {NotificationService} from '../shared/services';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {Buffer} from 'buffer';

/**
 * Explore utility library that is used throughout Explore application and other Explore libraries
 */
export class AppUtils {
    public static SECURITY_MASTER = 'SECURITY_MASTER';
    public static ANSER = 'ANSER';
    public static ALADDIN_VIEW = 'ALADDIN_VIEW';
    public static ALADDIN_RESEARCH = 'ALADDIN_RESEARCH';
    public static readonly FILE_DOWNLOADER = 'ExploreFileDownloader';
    public static readonly FILE_DOWNLOADER_BETA = 'ExploreFileDownloaderBeta';
    public static readonly FILE_DOWNLOADER_GAMMA = 'ExploreFileDownloaderBeta';

    /**
     * Check if Ctrl pressed (on Windows) or Cmd pressed (on MAC)
     */
    static isCtrlPressed(event: any): boolean {
        if (event && event.detail && event.detail.srcEvent) {
            return !!(event.detail.srcEvent.ctrlKey || event.detail.srcEvent.metaKey);
        }
        return !!(event && (event.ctrlKey || event.metaKey));
    }

    /**
     * Check if Shift pressed
     */
    static isShiftPressed(event: any): boolean {
        if (event && event.detail && event.detail.srcEvent) {
            const srcEvent = event.detail.srcEvent;
            return !!srcEvent.shiftKey;
        }
        return !!(event && event.shiftKey);
    }

    /**
     * Method to bypass alert if Ctrl or Cmd is pressed else ask for confirmation
     */
    static alertNotification(
        event: any,
        alertHeader: string,
        alertBody: string,
        confirmBtn: string,
        secondaryBtn: string,
        functionCallback: Function,
        notificationService: NotificationService,
        type: string = AlertConstants.TYPE.ALERT_WITH_OPTIONS
    ) {
        // Ctrl delete is a force delete with no confirmation
        if (AppUtils.isCtrlPressed(event)) {
            functionCallback();
        } else {
            // Open Warning Dialog
            notificationService.openDialog(
                new ExploreDialogParam(
                    type,
                    alertHeader,
                    alertBody,
                    confirmBtn,
                    secondaryBtn,
                    functionCallback
                )
            );
        }
    }

    /**
     * This method returns the href without the URL Constants.
     * If location is localhost then use dev explore-beta url.
     */
    static getHref(): string {
        return CommonUtils.isLocalHost() ? URLConstants.DEV_EXPLORE_BETA_URL : CommonUtils.getLocation().href.split('?')[0];
    }

    /**
     * Get base url for http request
     */
    static getBaseUrl(isExploreContextPath = true): string {
        // Get the base url
        let httpBmsUrl = URLConstants.HTTP2BMS_BASE_URL + (isExploreContextPath ? AppUtils.getExploreContextPath() : '');

        // Check for external BEN client
        if (CoreAppUtils.isExternalBENClient()) {
            httpBmsUrl = UtilConstants.RISK + httpBmsUrl;
        }

        return httpBmsUrl;
    }

    /**
     * Get value of source id specified in URL
     */
    static getCustomSourceId(name?: string): any {
        return (
            decodeURIComponent(
                (new RegExp('[?|&]' + (name ? name : UtilConstants.SOURCE_ID) + '=' + '([^&;]+?)(&|#|;|$)').exec(
                    CommonUtils.getLocation().search
                ) || ['', ''])[1]
                    .toString()
                    .replace(/\+/g, '%20')
            ) || null
        );
    }

    /**
     * Gets the value of a URL parameter and if it is not set returns the default value supplied.
     * @param name the parameter to load.
     * @param defaultValue the default value if it si not set.
     */
    static getURLParamWithDefault(name: string, defaultValue: boolean): string | boolean {
        const value = CommonUtils.getURLParam(name);
        return value ? value : defaultValue;
    }

    /**
     * Get custom source if specified in URL.
     */
    static getCustomSource(): string {
        const customSourceId: number = AppUtils.getCustomSourceId();
        return customSourceId ? UtilConstants.SOURCE_ID2 + customSourceId : '';
    }

    /**
     * Get explore title.
     */
    static getExploreTitle(): string {
        if (CommonUtils.isExploreBeta()) {
            return 'Explore Beta';
        }

        if (CommonUtils.isExploreGamma()) {
            return 'Explore Gamma';
        }

        return 'Explore';
    }

    /**
     * Get explore context path.
     */
    static getExploreContextPath(): string {
        if (CommonUtils.isExploreBeta()) {
            return URLConstants.EXPLORE_BETA_CONTEXT_PATH;
        }

        if (CommonUtils.isExploreGamma()) {
            return URLConstants.EXPLORE_GAMMA_CONTEXT_PATH;
        }

        return URLConstants.EXPLORE_CONTEXT_PATH;
    }

    /**
     * isObject
     */
    static isObject(data: any): boolean {
        return !!data && typeof data === 'object';
    }

    /**
     * Checks if the price popup feature is enabled
     */
    public static isPricePopupFeatureEnabled(): boolean {
        if (!TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_PRICE_CHART)) {
            return false;
        }
        return UserMetaDataUtils.getUserPerm(TokenConstants.PRICE_POPUP_ACCESS);
    }

    /**
     * Checks if the security master feature is enabled
     */
    public static isSecurityMasterEnabled(): boolean {
        return UserMetaDataUtils.hasLaunchApp(AppUtils.SECURITY_MASTER);
    }

    /**
     * Checks if the aladdinResearch feature is enabled
     */
    public static isAladdinResearchEnabled(): boolean {
        return UserMetaDataUtils.hasLaunchApp(AppUtils.ALADDIN_RESEARCH);
    }

    /**
     * Checks if the AnSer feature is enabled
     */
    public static isAnSerEnabled(): boolean {
        return UserMetaDataUtils.hasLaunchApp(AppUtils.ANSER);
    }

    /**
     * Checks if the AladdinView feature is enabled
     */
    public static isAladdinViewEnabled(): boolean {
        return UserMetaDataUtils.hasLaunchApp(AppUtils.ALADDIN_VIEW);
    }

    /**
     * @return File Downloader app name
     */
    public static getFileDownloaderAppName(): string {
        if (CommonUtils.isExploreBeta()) {
            return AppUtils.FILE_DOWNLOADER_BETA;
        }

        if (CommonUtils.isExploreGamma()) {
            return AppUtils.FILE_DOWNLOADER_GAMMA;
        }

        return AppUtils.FILE_DOWNLOADER;
    }

    /**
     * Checks if Climate-related features are enabled.
     */
    public static isClimateEnabled(): boolean {
        return TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_CLIMATE_ENABLED);
    }

    /**
     * Checkis if telemetry-tracking is enabled
     */
    public static isTelemetryTrackingEnabled(): boolean {
        return TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_TELEMETRY_ENABLED) && AppUtils.getURLParamWithDefault(URLConstants.TELEMETRY, true) !== 'false';
    }

    /**
     * Sends a workstation control message to launch another application
     * @param appName
     * @param parameters
     */
    public static launchApp(appName: string, parameters?: string) {
        const origin: string = CommonUtils.isLocalHost() ? URLConstants.DEV_URL : CommonUtils.getLocation().origin;

        // Launch app from url
        let url: string = origin + '/LaunchApp/' + appName + '?close_window=1';
        if (parameters) {
            url += '&' + parameters;
        }

        // Opens up a new window for the constructed URL
        console.log('Launching app via url=' + url);
        window.open(url, 'Launch' + appName, 'height=200,width=200');
    }

    static checkBrowser(): string {
        enum Browser {
            'Chrome' = 0,
            'Internet Explorer' = 1,
            'FireFox' = 2,
            'Safari' = 3,
            'Opera' = 4,
        }
        const userAgentStr = navigator.userAgent;
        let chrome = userAgentStr.indexOf('Chrome') > -1;
        const IE = userAgentStr.indexOf('MSIE') > -1 ||  userAgentStr.indexOf('rv:') > -1;
        const fireFox = userAgentStr.indexOf('Firefox') > -1;
        const safari = userAgentStr.indexOf('Safari') > -1 && !chrome;
        const opera = userAgentStr.indexOf('OP') > -1;
        chrome = chrome && opera ? false : chrome;

        const browserArr = [chrome, IE, fireFox, safari, opera];
        const i = browserArr.findIndex(b => b === true);
        return i > -1 ? Browser[i] : 'Cannot determine browser';
    }

    /**
     * This method checks if EbC Environment is active
     */
    static checkEbcEnvironment(): boolean {
        return window && window['ebc'];
    }

    /**
     * This method returns the EBC object via which we call the APIs
     */
    static ebcObject(): any {
        return window['ebc'];
    }

    /**
     * This method returns configured Column Tags from Widget
     */
    static getConfigColumnTags(widget): string[] {
        const colTags = [];
        for  (const colSet of widget.dataStore.metaData.inputs.values()) {
            if (colSet instanceof ColumnSet) {
                colSet.columns.forEach(col => colTags.push(col.columnTag));
            }
        }
        return colTags;
    }

    /**
     * This copies the provided text to clipboard
     * basically it mimics CTRL + C on text
     */
    static copyTextToClipboard(textToCopy: string): boolean {
        // Create the textarea input to hold our text.
        const element = document.createElement('textarea');
        // set the display to none to hide the element from UI
        element.setAttribute('style', 'border: none; opacity: 0');
        // Set the value of the textarea to be our config.
        element.value = textToCopy;
        // Add it to the document so that it can be focused.
        document.body.appendChild(element);
        // Focus on the element so that it can be copied.
        element.focus();
        element.setSelectionRange(0, element.value.length);
        // If the copy command was executed successfully then show the notification.
        const success = document.execCommand('copy');
        // Remove the element to keep the document clear.
        document.body.removeChild(element);
        return success;
    }


    /**
     * Encodes request params in base64
     * Doesn't encode if token is set to N or if url parameter encodeRequest is 'false'
     * @param requestParams
     * @private
     */
    public static encodeRequest(requestParams: any): any {
        // portIds must always be included as a param to be used by combined LRO in LongRunningHandlerService
        const portIds = [];
        if (requestParams.multiRequests) {
            requestParams.multiRequests.forEach((request: any) => {
                portIds.push(request.portId);
                delete request.portId;
            });
        } else {
            portIds.push(requestParams.portId);
            delete requestParams.portId;
        }

        const isEncodeRequest: string | boolean = AppUtils.getURLParamWithDefault(URLConstants.ENCODE_REQUEST, true);
        if (!TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENCODE_REQUEST) || isEncodeRequest === 'false') {
            // if encoding is turned off i.e.url param encodeRequest ='false', return request params as is
            return { portIdsLRO: portIds, ...requestParams};
        }
        // stringify requestParams and encode to base64
        // do not encode portIds as it needs to be accessible to LongRunningHandlerService
        return {
            requestParams: Buffer.from(JSON.stringify(requestParams)).toString('base64'),
            portIdsLRO: portIds
        };
    }
}
