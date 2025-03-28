import {Injectable} from '@angular/core';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {
    ColumnConfig,
    CoreColumnUtils,
    ErrorTypeConstants, UIErrorParameters,
    WidgetConfigType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';
import {CoreRiskConstants, RiskSettings} from '@blk/explore-ui-risk';
import {DataRequestConstants} from '@constants/data-request.constants';
import {WidgetDataViewOption} from '@enums/widget-data-view-option.enum';
import {RequestAdapterConfig} from '@interfaces/request.interface';
import {ExploreResponse} from '@interfaces/response.interface';
import {Breakdown} from '@blk/explore-ui-breakdown';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {SecurityContributionSettings} from '@models/security-contribution-settings/security-contribution-settings';
import {FactorBlockInput} from '@models/widget/inputs/factor-block-input.model';
import {Widget} from '@models/widget/widget.model';
import {NotificationService} from '@services/notification';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {AbstractWidgetService} from '@services/widget/abstract-widget.service';
import {ColumnUtils} from '@utils/column.utils';
import {isEmpty, isUndefined, partition} from 'lodash';

/**
 * Widget data service for Security Contribution spritelet widget launched from FBA widget
 */
@Injectable()
export class SecurityContributionDataService extends AbstractWidgetService {

    /**
     * Constructor
     */
    constructor(protected exploreDataRequestService: ExploreDataRequestService, protected notificationService: NotificationService) {
        super(
            DataRequestConstants.DATA_REQUEST_URL.SECURITY_CONTRIBUTION_DATA,
            exploreDataRequestService,
            [WidgetConfigType.FACTOR_SECURITY_CONTRIBUTION],
            WidgetDataViewOption.HOLDINGS_VIEW
        );
    }

    /**
     * Modify the spritelet widget's inputs for the data request to backend
     * @param widgetInputs  Inputs to modify
     * @param widget  Security Contribution widget
     */
    protected modifyWidgetInputsForRequest(widgetInputs: Map<string, WidgetInput>, widget: Widget): void {
        // old favorites save this breakdown tree for security contribution widget and we do not want it in the request
        widgetInputs.delete(WidgetInputType.BREAKDOWN_TREE);

        // add security contribution widget default columns
        // Note: this must be done because old explore only save columns from parent widget and not the default ones needed for security contribution widget
        this.setSpriteletColumns(widgetInputs, widget);
    }

    /**
     * Add Security Contribution widget specific fields to request
     */
    protected createWidgetRequestParams(widget: Widget, requestParams: any, portfolio: Portfolio, widgetInputs: Map<string, WidgetInput>, isExportRequest?: boolean, omitData?: boolean,
                                        isRisklessCashBucketEnabled?: boolean): any {
        const widgetRequestParams = super.createWidgetRequestParams(widget, requestParams, portfolio, widgetInputs, isExportRequest, omitData, isRisklessCashBucketEnabled);

        const factorBlockInput = widgetInputs.get(FactorBlockInput.configType) as FactorBlockInput;
        const factorBreakdownTree = widgetInputs.get(CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN) as Breakdown;

        widgetRequestParams.factorBlockPath = factorBlockInput.blockPath;
        widgetRequestParams.factorBreakdownTree = JSON.stringify(factorBreakdownTree.serializeFullContent());

        return widgetRequestParams;
    }

    /**
     * AbstractWidgetService.createRequestConfig(Map<string, WidgetInput>, Widget, ExploreResponse, any)
     */
    protected createRequestConfig(widgetInputs: Map<string, WidgetInput>, widget: Widget, response: ExploreResponse, request: any, isCompareMode: boolean): RequestAdapterConfig {
        const requestConfig: RequestAdapterConfig = super.createRequestConfig(widgetInputs, widget, response, request, isCompareMode);

        requestConfig.columns = requestConfig.columns.filter(column => response.data.columns.includes(column.columnKey));
        return requestConfig;
    }

    /**
     * Adds default columns for Security Contribution spritelet widget in addition to the parent widget's columns.
     * Re-generates default columns each time and does not save them to favorite.
     */
    private setSpriteletColumns(widgetInputs: Map<string, WidgetInput>, widget: Widget): void {
        const parentColumnSet = (widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet);

        // go through the parent FBA widget columns and determine if a column has risk settings, if so do not add to security contribution widget
        const [rejectedColumns, parentColumns] = partition(parentColumnSet.columns, (column: ColumnConfig) => {
            return column.hasOptionValues()
                && CoreColumnUtils.getOptionValueByConfigType(column.optionValues, RiskSettings.CONFIG_TYPE)
                && !isEmpty((CoreColumnUtils.getOptionValueByConfigType(column.optionValues, RiskSettings.CONFIG_TYPE) as RiskSettings).getRequestParams());
        });

        // display alert of which columns were not added to spritelet
        this.notifyRejectedColumns(rejectedColumns);

        // set security contribution setting for each parent column
        parentColumns.forEach((column: ColumnConfig) => {
            // ensure option values defined
            column.optionValues = isUndefined(column.optionValues) ? [] : column.optionValues;

            let secContribSettings: SecurityContributionSettings = CoreColumnUtils.getOptionValueByConfigType(column.optionValues, SecurityContributionSettings.CONFIG_TYPE) as SecurityContributionSettings;
            if (!secContribSettings) {
                secContribSettings = new SecurityContributionSettings();
                column.optionValues.push(secContribSettings);
            }
            secContribSettings.isFactorBased = true;
        });

        // flag for if the parent contains a BENCH column
        const posTypeBenchExists = parentColumns.some(column => column.positionColumnType === 'BENCH');
        // flag for if the parent contains an ACTIVE column
        const posTypeActiveExists = parentColumns.some(column => column.positionColumnType === 'ACTIVE');

        // get default columns for security contribution spritelet from widget config JSON.
        // Note: these columns are re-generated each time and are not saved to the favorite
        const spriteletDefaultColumns = ColumnUtils.getWidgetConfigColumns(widget.widgetConfigInputs);

        const factorBlockInput = widgetInputs.get(FactorBlockInput.configType) as FactorBlockInput;

        // combine the columns from the parent widget and default columns for Security Contribution spritelet
        const combinedColumns: ColumnConfig[] = spriteletDefaultColumns.concat(parentColumns)
            .filter(column => column.hasOptionValues())
            .filter(column => {
                const secContribSettings = CoreColumnUtils.getOptionValueByConfigType(column.optionValues, SecurityContributionSettings.CONFIG_TYPE) as SecurityContributionSettings;

                if (!secContribSettings) {
                    return false;
                }
                // Remove columns if they should be shown only at factor block level and spritelet is launched from leaf level
                if (secContribSettings.showWhenFactorLevelOnly && factorBlockInput.isBlock) {
                    return false;
                }
                // Remove BENCH columns if no BENCH columns exist in parent
                if (secContribSettings.showWhenPosTypeBenchExists && !posTypeBenchExists) {
                    return false;
                }
                // Remove ACTIVE columns if no ACTIVE columns exist in parent
                if (secContribSettings.showWhenPosTypeActiveExists && !posTypeActiveExists) {
                    return false;
                }

                return true;
            });

        const combinedColumnSet = new ColumnSet();
        combinedColumnSet.columns = combinedColumns;
        widgetInputs.set(WidgetInputType.COLUMNS, combinedColumnSet);
    }

    /**
     * Displays notification for the columns that couldn't be added to Security Contribution widget
     * @param rejectedColumns  Columns not added
     */
    private notifyRejectedColumns(rejectedColumns: ColumnConfig[]): void {
        if (!rejectedColumns || !rejectedColumns.length) {
            return;
        }
        const rejectedColumnNames: string = rejectedColumns.map(column => column.columnTitle).join(', ');
        this.notificationService.warning('The following column(s): ' + rejectedColumnNames + ' are not included because they have column risk setting overrides. To see these column(s) please remove the column level overrides.', ErrorTypeConstants.UI_VALIDATION_WARNING, UIErrorParameters.TELEMETRY_FUNCTION_NAME_SET_SPRITELET_COLUMNS_REJECTED_WARNING);
    }
}
