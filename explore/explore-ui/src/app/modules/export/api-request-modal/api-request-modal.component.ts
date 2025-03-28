import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CommonConstants} from '@constants/common.constants';
import {NotificationService} from '@services/notification';
import {ClipboardService} from 'ngx-clipboard';
import {WidgetDataStoreMetaData} from '@models/dataStore/widget-data-store-meta-data.model';
import {
    AlertConstants,
    CommonUtils, CoreCommonConstants,
    CoreUserMetaDataStore,
    DateFormatConstants,
    ExploreRadioButton,
    GenerateApiRequestUnsupportedError,
    TelemetryActionConstants,
    TelemetryGenerateApiRequestParameters,
    TelemetryService,
    WidgetConfigType
} from '@blk/explore-ui-core';
import {Portfolio} from '@models/portfolio/portfolio.model';
import moment from 'moment';
import {isEmpty, isNil} from 'lodash';
import {UserMetaDataStore} from '@stores/user-meta-data.store';
import {UserPreference} from '@constants/user-preference.constants';
import {AuxNotificationStyleEnum, AuxRadioGroupChangedDetailInterface} from '@blk/aladdin-angular-components';
import {ApiModelConversionService} from '@services/portfolio-analytics-api/api-model-conversion.service';
import {Widget} from '@models/widget/widget.model';
import {ExportUtils} from '@utils/export/export.utils';
import {StatusConstants} from '@constants/status.constants';

/**
 * Modal to display the request body of a widget to be used for the Portfolio Analytics API
 */
@Component({
    selector: 'app-api-request-modal',
    templateUrl: './api-request-modal.component.html',
    styleUrls: ['./api-request-modal.component.scss']
})
export class ApiRequestModalComponent implements OnInit {

    static readonly API_REQUEST_BODY_COPY_SUCCESS = 'API request body has been copied to clipboard.';

    static readonly API_REQUEST_FORMAT_JSON: ApiRequestFormat = {
        label: 'JSON',
        eventData: 'Json',
        postProcessing: (responseData, modifyRequestFields, _configType) => {
            const obj = JSON.parse(responseData);
            const str = JSON.stringify(obj, modifyRequestFields, 4);
            return str.replace(/":true"/g, 'true').replace(/":false"/g, 'false');
        }
    };
    static readonly API_REQUEST_FORMAT_PYTHON: ApiRequestFormat = {
        label: 'Python',
        eventData: 'Python',
        postProcessing: (responseData, modifyRequestFields, _configType) => {
            const obj = JSON.parse(responseData);
            const str = JSON.stringify(obj, modifyRequestFields, 4);
            return str.replace(/":true"/g, 'True').replace(/":false"/g, 'False');
        }
    };

    static readonly API_REQUEST_FORMAT_ATX: ApiRequestFormat = {
        label: 'ATX',
        eventData: 'ATX',
        postProcessing: (responseData, modifyRequestFields, configType) => {
            const atxFinalObject = {};
            atxFinalObject['atxActivation'] = {};
            atxFinalObject['atxActivation']['tryItOut'] = {};
            const populate = atxFinalObject['atxActivation']['tryItOut'];
            const url = '/analytics/portfolio-analytics/reporting/v1/';
            populate['schemaId'] = '/agraph.analytics.portfolio_analytics.reporting.v1.PortfolioAnalyticsAPI';
            populate['restMethod'] = 'POST';
            if (configType === WidgetConfigType.RISK_EXPOSURE) {
                populate['url'] = url + 'portfolios:computePortfolioAnalytics';
            } else if (configType === WidgetConfigType.PGS) {
                populate['url'] = url + 'portfolios:computePortfolioSummaryAnalytics';
            } else if (configType === WidgetConfigType.TIME_SERIES) {
                populate['url'] = url + 'portfolios:computePortfolioTimeSeriesAnalytics';
            } else if (configType === WidgetConfigType.RETURNS) {
                populate['url'] = url + 'portfolios:computePortfolioPerformanceAttribution';
            }
            const obj = JSON.parse(responseData);
            populate['parameters'] = {};
            populate['body'] = obj;
            const str = JSON.stringify(atxFinalObject, modifyRequestFields, 4);
            return str.replace(/":true"/g, 'true').replace(/":false"/g, 'false');
        }
    };

    readonly FORMAT_MAP = new Map<string, ApiRequestFormat>(
        [
            [ApiRequestModalComponent.API_REQUEST_FORMAT_JSON.eventData, ApiRequestModalComponent.API_REQUEST_FORMAT_JSON],
            [ApiRequestModalComponent.API_REQUEST_FORMAT_PYTHON.eventData, ApiRequestModalComponent.API_REQUEST_FORMAT_PYTHON],
            [ApiRequestModalComponent.API_REQUEST_FORMAT_ATX.eventData, ApiRequestModalComponent.API_REQUEST_FORMAT_ATX]
        ]);

    readonly AuxNotificationStyleEnum = AuxNotificationStyleEnum;

    readonly MODAL_TITLE = 'API Request';
    readonly FORMAT_TYPE_LABEL = 'Choose a format';
    readonly COPY_TEXT = 'Copy request to clipboard';
    readonly CANCEL_TEXT = CommonConstants.BUTTON_TEXT.CANCEL;

    @Input() isOpen: boolean;

    @Input() portfolio: Portfolio;

    @Input() widget: Widget;

    @Input() widgetMetaData: WidgetDataStoreMetaData;

    @Output() modalClosed: EventEmitter<any> = new EventEmitter();

    apiRequestJson: string;

    apiEndpoint: string;

    apiRequestFormats: ExploreRadioButton[] = [];

    selectedFormat: ApiRequestFormat = ApiRequestModalComponent.API_REQUEST_FORMAT_JSON;

    isGenerateApiRequestSupported = true;

    isGenerateApiRequestErrored = false;

    unsupportedMessage: string;

    errorMessage: string;

    constructor(private notificationService: NotificationService,
                private clipboardService: ClipboardService,
                private apiModelConversionService: ApiModelConversionService) {
    }

    ngOnInit(): void {
        [this.isGenerateApiRequestSupported, this.unsupportedMessage] = ExportUtils.checkGenerateApiRequestSupported(this.portfolio);

        const prefMap = CoreUserMetaDataStore.userMetaData.preferences;
        const savedPref = prefMap.get(UserPreference.API_REQUEST_FORMAT.name);
        // set selected to what is saved in the user preference, otherwise defaults to JSON
        if (this.FORMAT_MAP.has(savedPref)) {
            this.selectedFormat = this.FORMAT_MAP.get(savedPref);
            // Corner case, if user perm changes
            if (this.selectedFormat === ApiRequestModalComponent.API_REQUEST_FORMAT_ATX && !CoreUserMetaDataStore.userMetaData.atxAccess) {
                // select the default to JSON
                this.selectedFormat = ApiRequestModalComponent.API_REQUEST_FORMAT_JSON;
            }
        }

        this.apiRequestFormats.push(new ExploreRadioButton(ApiRequestModalComponent.API_REQUEST_FORMAT_JSON.label, ApiRequestModalComponent.API_REQUEST_FORMAT_JSON.eventData === this.selectedFormat.eventData, !this.isGenerateApiRequestSupported, ApiRequestModalComponent.API_REQUEST_FORMAT_JSON.eventData));
        this.apiRequestFormats.push(new ExploreRadioButton(ApiRequestModalComponent.API_REQUEST_FORMAT_PYTHON.label, ApiRequestModalComponent.API_REQUEST_FORMAT_PYTHON.eventData === this.selectedFormat.eventData, !this.isGenerateApiRequestSupported, ApiRequestModalComponent.API_REQUEST_FORMAT_PYTHON.eventData));
        if (CoreUserMetaDataStore.userMetaData.atxAccess) {
            this.apiRequestFormats.push(new ExploreRadioButton(ApiRequestModalComponent.API_REQUEST_FORMAT_ATX.label, ApiRequestModalComponent.API_REQUEST_FORMAT_ATX.eventData === this.selectedFormat.eventData, !this.isGenerateApiRequestSupported, ApiRequestModalComponent.API_REQUEST_FORMAT_ATX.eventData));
        }
        if (this.isGenerateApiRequestSupported) {
            this.generateApiRequest();
        }
    }

    /**
     * when format selection is changed
     */
    onFormatSelection(event: CustomEvent<AuxRadioGroupChangedDetailInterface>): void {
        const updatedFormatType = event?.detail?.value?.eventData;
        const savedPref = CoreUserMetaDataStore.userMetaData.preferences.get(UserPreference.API_REQUEST_FORMAT.name);
        if (updatedFormatType && updatedFormatType !== savedPref) {
            this.selectedFormat = this.FORMAT_MAP.get(updatedFormatType);
            this.generateApiRequest();

            UserMetaDataStore.setPreferenceValue(UserPreference.API_REQUEST_FORMAT, this.selectedFormat.eventData);
        }
    }

    /**
     * Closes API request body modal
     */
    closeModal(): void {
        this.trackGenerateApiRequestTelemetry();
        this.modalClosed.emit();
    }

    /**
     * track generate api request telemetry
     */
    trackGenerateApiRequestTelemetry(): void {
        const generateApiRequestParameters = new TelemetryGenerateApiRequestParameters(
            {
                errorType: this.unsupportedMessage === AlertConstants.NOTIFICATION.COMPARISON_VIEW_ERROR ? GenerateApiRequestUnsupportedError.GENERATE_API_REQUEST_UNSUPPORTED_ERROR_COMPARISON_VIEW
                    : this.unsupportedMessage === AlertConstants.NOTIFICATION.WHAT_IF_PORT_ERROR ? GenerateApiRequestUnsupportedError.GENERATE_API_REQUEST_UNSUPPORTED_ERROR_WHAT_IF
                        : this.unsupportedMessage === AlertConstants.NOTIFICATION.CUSTOM_SCRATCH_PORT_ERROR ? GenerateApiRequestUnsupportedError.GENERATE_API_REQUEST_UNSUPPORTED_ERROR_CUSTOM_PORTFOLIO
                            : GenerateApiRequestUnsupportedError.GENERATE_API_REQUEST_UNSUPPORTED_ERROR_UNSPECIFIED
            });
        TelemetryService.track(TelemetryActionConstants.USER_BEHAVIOUR.CLICK_ON_GENERATE_API_REQUEST, generateApiRequestParameters);
    }

    /**
     * Copies API request body to clipboard
     */
    copyToClipboard(): void {
        this.notificationService.success(ApiRequestModalComponent.API_REQUEST_BODY_COPY_SUCCESS);
        // copy request body to clipboard
        this.clipboardService.copyFromContent(this.apiRequestJson);

        this.closeModal();
    }

    /**
     * Generates API request body and then formats to correct data format
     */
    private generateApiRequest(): void {
        const generateApiRequestPayload = this.apiModelConversionService.getGenerateApiRequestPayload(this.widget, this.portfolio);
        const apiRequestObject = this.apiModelConversionService.convertExploreModelToApiModel$(generateApiRequestPayload, StatusConstants.GENERATING_API_REQUEST);
        // HACK: proto fields with "repeated" (arrays) get appended with "List"
        // since the API doesn't recognize this modified field name we must revert it back
        // ie, splitPositionTypesList -> splitPositionTypes
        const removeListSuffixFromFieldName = (objectToSearch: any): any => {
            Object.keys(objectToSearch).forEach(key => {
                if (Array.isArray(objectToSearch[key]) && key.endsWith('List')) {
                    // remove "List" from end
                    const fieldWithoutList = key.substring(0, key.length - 4);
                    objectToSearch[fieldWithoutList] = objectToSearch[key];
                    delete objectToSearch[key];
                }
            });
        };

        // some of the API request fields must be modified as they are being serialized to JSON.  This function is called on each field
        const modifyRequestFields = (fieldName: string, value: any) => {
            // remove any empty fields, <protoClass>.toObject() will show empty string for favoriteId if not set
            if (isNil(value) || value.length === 0) {
                return undefined;
            }

            if (typeof value === 'object') {
                removeListSuffixFromFieldName(value);
            }

            if (typeof value === 'boolean') {
                return value ? ':true' : ':false';
            }

            if (fieldName.endsWith('Date') && value.year && value.month && value.day) {
                // convert from date object -> 'YYYY-MM-DD' string
                return moment(`${value.year}-${value.month}-${value.day}`, DateFormatConstants.YYYY_MM_DD_DASH).format(DateFormatConstants.YYYY_MM_DD_DASH);
            } else {
                return value;
            }
        };

        apiRequestObject.subscribe({
            next: (response) => {
                const responseData = response.data as string;
                this.selectedFormat['isSelected'] = true;
                this.apiRequestJson = this.selectedFormat['postProcessing'](responseData, modifyRequestFields, this.widget.configType);
                this.apiEndpoint = isEmpty(response?.apiEndpoint) ? CoreCommonConstants.EMPTY_STRING : CommonUtils.getURLOrigin() + response.apiEndpoint;
            },
            error: (err: any) => {
                console.error('Failed to generate API request');
                this.errorMessage = err.message ?? 'Failed to generate API request';
                if (!err.message) {
                    this.closeModal();
                } else {
                    this.isGenerateApiRequestErrored = true;
                }
            }
        });
    }
}

interface ApiRequestFormat {
    label: string;
    eventData: string;
    postProcessing: (obj, modifyRequestFields, configType) => string;
}
