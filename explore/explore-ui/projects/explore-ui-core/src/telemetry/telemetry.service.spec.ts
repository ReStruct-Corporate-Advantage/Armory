import {TelemetryActionConstants} from './constants/telemetry-action.constants';
import {AddPortSource} from './enums';
import {AddPortfolioTrackingParameters, ColumnDescriptionTrackingParameters} from './parameters';
import {TelemetryService} from './telemetry.service';
import {ErrorTypeConstants, UIErrorParameters} from './scenarios';
import {agraph_platform_event_logging_explore_event_v1_ExploreUIErrorSchema as ExploreUIErrorSchema} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb_schema';
import {ExploreUIError} from '@blk/aladdin-graph-everything/platform/event_logging/explore_event/v1/explore_ui_event_pb';

describe('TelemetryService', () => {
    let telemetryService;

    beforeEach(() => {
        const workspaceId = 1;
        const userMetaDataLogin = 'login';
        const userMetaDataUserOrg = 'userOrg';
        const webBrowser = 'chrome';
        telemetryService = new TelemetryService();
        telemetryService.initializeTelemetry(workspaceId, userMetaDataLogin, userMetaDataUserOrg,
            webBrowser, 'true', 'exploreTelemetryTest', '3.2.0');
    });

    it('should initialize when urlParam and metadata are set', () => {
        expect(TelemetryService['telemetryConfig']).toBeTruthy();
    });

    it('should generate app context', () => {
        const context = TelemetryService['exploreAppContext'];
        expect(context).toBeTruthy();
        expect(context.getBrowser()).toEqual('chrome');
        expect(context.getWorkspaceId()).toEqual('1');

    });

    describe('test track', () => {
        beforeEach(() => {
            jest.spyOn(TelemetryService['telemetryConfig'], 'add').mockImplementation(() => {
                return true;
            });
        });

        it('should log exploreAddPortfolioEvent for each ticker', () => {
            const tickers = 'PEP, ASEAN-HS';
            const date = 'T-1';
            const portType = 1;
            const addPortSource = AddPortSource.INTRO_SCREEN;
            const portfolioTrackingParams = new AddPortfolioTrackingParameters(
                tickers,
                date,
                portType,
                addPortSource);

            TelemetryService.track(
                TelemetryActionConstants.PORTFOLIO.ADD_PORTFOLIO,
                portfolioTrackingParams);
            expect(TelemetryService['telemetryConfig'].add).toHaveBeenCalledTimes(2);
        });

        it('should log exploreColumnDefinitionEvent', () => {
            const colTag = 'pvt_mv';
            const columnTrackingParams = new ColumnDescriptionTrackingParameters(colTag);
            TelemetryService.track(
                TelemetryActionConstants.COLUMN.SHOW_COLUMN_DEFINITION,
                columnTrackingParams);
            expect(TelemetryService['telemetryConfig'].add).toHaveBeenCalled();
        });

        it('should set functionName', () => {
            const uiErrorParameters = new UIErrorParameters(ErrorTypeConstants.UI_VALIDATION_ERROR, 'Date Vary is not supported with Column Level Breakdowns. Remove the column level breakdown to proceed.');
            TelemetryService.track(
                UIErrorParameters.ACTION,
                uiErrorParameters,
                UIErrorParameters.TELEMETRY_FUNCTION_NAME_DATE_VARY_WITH_COLUMN_BREAKDOWN_ERROR
            );
            expect(TelemetryService['telemetryConfig'].add).toHaveBeenCalledWith(
                expect.any(ExploreUIError),
                ExploreUIErrorSchema,
                UIErrorParameters.TELEMETRY_FUNCTION_NAME_DATE_VARY_WITH_COLUMN_BREAKDOWN_ERROR);
        });
    });

});

