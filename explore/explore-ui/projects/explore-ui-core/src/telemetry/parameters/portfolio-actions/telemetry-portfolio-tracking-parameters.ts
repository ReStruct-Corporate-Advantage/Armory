import {AddPortSource, ExplorePortfolioTypeEnum} from '../../enums/telemetry-portfolio-source.enum';

/**
 * AddPortfolioTrackingParameters serves to capture the data inputs needed for
 * portfolio related tracking in telemetry.
 * For Example: When tracking portfolios searched, we call the method setSearchParameters
 *              and provide it with data points from the action we want to track
 * Methods should be added following the naming convention set<action found in TelemetryActionToTrackEnum>Parameters(...)
 */

export class AddPortfolioTrackingParameters {
    portNames: string;
    portfolioQueryDate: string;
    portType: ExplorePortfolioTypeEnum;
    addPortSource: AddPortSource;
    portArray: string[];

    /**
     * used to set the info needed for telemetry's ExploreAddPortfolio
     * @param portName: ticker name of the portfolio
     * @param portfolioQueryDate: Historical portfolio lookup date
     * @param portType : The type of portfolio we are searching for (ref: ExplorePortfolioTypeEnum)
     * @param addPortSource: Which component the portfolio was searched from
     */
    constructor(portNames: string, portfolioQueryDate: string, portType: ExplorePortfolioTypeEnum, addPortSource: AddPortSource) {
        this.portNames = portNames;
        this.portfolioQueryDate = portfolioQueryDate;
        this.portType = portType;
        this.addPortSource = addPortSource;
        this.portArray = this.portNames.split(', ');
    }
}
