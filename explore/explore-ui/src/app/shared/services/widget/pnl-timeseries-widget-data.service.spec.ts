import {PnlTimeseriesWidgetDataService} from '@services/widget/pnl-timeseries-widget-data.service';
import {WidgetConfigType} from '@blk/explore-ui-core';
import {Widget} from '@models/widget/widget.model';
import {ExploreResponse} from '@interfaces/response.interface';
import {RequestAdapterConfig} from '@interfaces/request.interface';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {FundCusip} from '@models/widget/inputs/fund-cusip.model';

describe('test PnlTimeseriesWidgetDataService', () => {

    const service = new PnlTimeseriesWidgetDataService(null);

    describe('getStaticWidgetRequestParams', () => {
        it('hvar pnl timeseries from PGS', () => {
            const widget = new Widget();
            widget.configType = WidgetConfigType.PNL_TS;
            const staticWidgetRequestParams = service.getStaticWidgetRequestParams(widget);
            expect(staticWidgetRequestParams.isPortGroupSummaryRequest).toBe('Y');
        });
    });

    describe('getStaticWidgetRequestParams', () => {
        it('mcvar pnl timeseries from PGS', () => {
            const staticWidgetRequestParams = service.getStaticWidgetRequestParams();
            expect(staticWidgetRequestParams.isPortGroupSummaryRequest).toBe('Y');
        });
    });

    describe('processResponse', () => {
        it('should process the response and assign the processed data to the attributes in the given widget payload in case of fundCusip', () => {
            const widget = new Widget();
            const requestAdapterConfig = {} as RequestAdapterConfig;
            const response = {} as ExploreResponse;
            const widgetPayload = {} as WidgetPayload;
            const cube = {};
            const breakdownLevels = {};
            widget.dataStore.metaData.inputs = new Map();
            widget.dataStore.metaData.inputs.set(FundCusip.configType, new FundCusip('cusip'));

            // @ts-ignore
            jest.spyOn(service, 'createCube').mockReturnValue({ cube, breakdownLevels });

            service['processResponse'](widget, requestAdapterConfig, response, widgetPayload);

            expect(widgetPayload.cube).toBe(cube);
            expect(widgetPayload.breakdownLevels).toBe(breakdownLevels);
            expect(requestAdapterConfig.portfolio).toBe('cusip');
        });
        it('should process the response and assign the processed data to the attributes in the given widget payload', () => {
            const widget = new Widget();
            const requestAdapterConfig = {} as RequestAdapterConfig;
            const response = {} as ExploreResponse;
            const widgetPayload = {} as WidgetPayload;
            const cube = {};
            const breakdownLevels = {};

            // @ts-ignore
            jest.spyOn(service, 'createCube').mockReturnValue({ cube, breakdownLevels });

            service['processResponse'](widget, requestAdapterConfig, response, widgetPayload);

            expect(widgetPayload.cube).toBe(cube);
            expect(widgetPayload.breakdownLevels).toBe(breakdownLevels);
            expect(requestAdapterConfig.portfolio).toBeUndefined();
        });
    });
});
