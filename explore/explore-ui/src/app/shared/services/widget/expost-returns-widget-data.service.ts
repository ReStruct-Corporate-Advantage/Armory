import {DataRequestConstants} from '../../../constants';
import {WidgetDataViewOption} from '@enums/widget-data-view-option.enum';
import {Widget} from '@models/widget/widget.model';
import {AbstractExpostWidgetDataService} from '@services/widget/abstract-expost-widget-data.service';
import {ExpostReturnSettings} from '@models/expostSettings/expost-return-settings.model';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {ColumnSet, ExpostColumnOption, NumericColumnFormatColumnOption} from '@blk/explore-ui-column-option';
import {TableColumnState, WidgetConfigType, WidgetInput, WidgetInputType, ColumnConstants} from '@blk/explore-ui-core';
import {Injectable} from '@angular/core';

/**
 * Service to retrieve data for the Expost Returns widget
 */
@Injectable()
export class ExpostReturnsWidgetDataService extends AbstractExpostWidgetDataService {

    /**
     * Creates a new instance with the given parameter
     * @param exploreDataRequestService a service to use to 'talk' to the backend server
     */
    constructor(protected exploreDataRequestService: ExploreDataRequestService) {
        super(DataRequestConstants.DATA_REQUEST_URL.EXPOST_RETURNS_DATA, exploreDataRequestService, [WidgetConfigType.EXPOST_RETURNS], WidgetDataViewOption.NOT_APPLICABLE);
    }

    /**
     * Adds columns that are applicable to the Expost Returns to the given widget inputs.
     * @param widgetInputs widget inputs to modify
     * @param widget a widget to modify the inputs for
     */
    protected modifyWidgetInputsForRequest(widgetInputs: Map<string, WidgetInput>, widget: Widget): void {
        const columnSet: ColumnSet = new ColumnSet();

        // Add Sec Desc as the first column
        columnSet.createColumnAndAdd(ColumnConstants.COLUMN_TAG.SEC_DESC);
        // Add a couple more columns if applicable
        const expostReturnSettings: ExpostReturnSettings = widgetInputs.get(ExpostReturnSettings.EXPOST_RETURN_SETTINGS) as ExpostReturnSettings;
        this.createAndAddColumn(columnSet, ColumnConstants.CUMULATIVE_RETURN, expostReturnSettings);
        if (expostReturnSettings.showBench) {
            this.createAndAddColumn(columnSet, ColumnConstants.BENCH_CUMULATIVE_RETURN, expostReturnSettings);
        }

        if (expostReturnSettings.showActive) {
            this.createAndAddColumn(columnSet, ColumnConstants.ACTIVE_CUMULATIVE_RETURN, expostReturnSettings);
        }

        // lets add columnSet in dataStore
        widget.dataStore.metaData.inputs.set(WidgetInputType.COLUMNS, columnSet);

        // Add columns to the inputs
        widgetInputs.set(WidgetInputType.COLUMNS, columnSet);
    }

    createAndAddColumn(columnSet: ColumnSet, columnTag: string, expostReturnSettings: ExpostReturnSettings) {
        const cumulativeReturnColumn = columnSet.createColumnAndAdd(columnTag);
        cumulativeReturnColumn.optionValues.push(new NumericColumnFormatColumnOption());
        columnSet.columnState.columns.push(new TableColumnState(cumulativeReturnColumn.columnKey, null));
        if (expostReturnSettings?.expostSettings) {
            const expostColumnOption = new ExpostColumnOption({
                isNetReturns: expostReturnSettings.expostSettings.isGrossAndNetReturns || expostReturnSettings.expostSettings.isNetReturns,
                samplingPeriod: expostReturnSettings.expostSettings.samplingPeriod,
                statisticPeriods: expostReturnSettings.expostSettings.statisticPeriods,
                isLogNormal: expostReturnSettings.expostSettings.isLogNormal,
                categoryBreakdown: expostReturnSettings.expostSettings.categoryBreakdown,
                isGrossAndNetReturns: expostReturnSettings.expostSettings.isGrossAndNetReturns
            });
            cumulativeReturnColumn.optionValues.push(expostColumnOption);
        }
        if (!expostReturnSettings?.expostSettings?.isGrossAndNetReturns) {
            return;
        }
        const cumulativeReturnColumnGross = columnSet.createColumnAndAdd(columnTag, columnTag + 'GROSS');
        cumulativeReturnColumnGross.optionValues.push(new NumericColumnFormatColumnOption());
        columnSet.columnState.columns.push(new TableColumnState(cumulativeReturnColumnGross.columnKey, null));
        if (expostReturnSettings?.expostSettings) {
            const expostColumnOption = new ExpostColumnOption({
                isNetReturns: false,
                samplingPeriod: expostReturnSettings.expostSettings.samplingPeriod,
                statisticPeriods: expostReturnSettings.expostSettings.statisticPeriods,
                isLogNormal: expostReturnSettings.expostSettings.isLogNormal,
                categoryBreakdown: expostReturnSettings.expostSettings.categoryBreakdown,
                isGrossAndNetReturns: expostReturnSettings.expostSettings.isGrossAndNetReturns
            });
            cumulativeReturnColumnGross.optionValues.push(expostColumnOption);
        }
    }
}
