import {Portfolio} from '@models/portfolio/portfolio.model';
import {IndexWeight} from '@models/portfolio/index-weight.model';
import {cloneDeep, flatten, isNil} from 'lodash';
import {Benchmark} from '@models/portfolio/benchmark.model';
import {BenchmarkConstants} from '@constants/benchmark.constants';
import {CompositionConstants} from '@constants/composition.constants';
import {ModellingType} from '@enums/modelling-type.enum';
import {RulesBasedPortfolio} from '@models/portfolio/rule-based-portfolio.model';
import {AdhocPortGroup} from '@models/portfolio/adhoc-portgroup.model';
import {ModalStateActionInfo} from '@models/favorite/modal-state-action-info.interface';

export class PortfolioUtils {
    /**
     * Try and assign a config type the passed in port data
     */
    static updateConfigType(portData: any) {
        if (!(portData instanceof Portfolio) && !portData.configType) {
            if (!portData.isWhatIfPortfolio) {
                portData.configType = Portfolio.configType;
            } else {
                // Update config type to Adhoc if portData has adhocParams
                if (!isNil(portData.adhocParams)) {
                    // Not using AdhocPortfolio.configType as it gives circular dependency issues
                    portData.configType = portData.adhocParams.isPortGroup ? AdhocPortGroup.configType : CompositionConstants.ADHOC_PORT_CONFIG_TYPE;
                } else {
                    // Set config type to rule based portfolio/positions based portfolio based on the modelling type
                    // Not using PortfolioWithPositions.configType as it gives circular dependency issues
                    portData.configType = portData.type === CompositionConstants.PORT_WITH_RULES.TYPE || portData.modellingType === ModellingType.SECTOR || portData.modellingType === ModellingType.PORTFOLIO ? RulesBasedPortfolio.configType : CompositionConstants.PORT_WITH_POSITIONS.TYPE;
                }
            }
        }
    }

    /**
     * Go through the main portfolio and return a list of all leaf level portfolios
     */
    static getAllLeafLevelPortfolios(mainPortfolio: Portfolio): Portfolio[] {
        // If the portfolio is a Composite, then return a list of Portfolios generated from the index weights
        if (mainPortfolio.isCompositePortfolio) {
            return mainPortfolio.indexWeights.map((indexWeight) => PortfolioUtils.convertIndexWeightToPortfolio(mainPortfolio, indexWeight));
        }

        const portfolios = [];
        for (const portfolio of mainPortfolio.portfolios) {
            if (portfolio.portfolios && portfolio.portfolios.length > 0) {
                // Recursively add further child portfolios
                portfolios.push(PortfolioUtils.getAllLeafLevelPortfolios(portfolio));
            } else {
                portfolios.push(portfolio);
            }
        }
        return flatten(portfolios);
    }

    /**
     * Copies portfolio settings from one portfolio to other portfolios
     */
    static copyPortfolioSettingsToPortfolios(originalPort: Portfolio, otherPorts: Portfolio[]): void {
        const expostSettings = cloneDeep(originalPort.expostSettings);
        const splitPositionSettings = cloneDeep(originalPort.splitPositionSettings);
        const lookthroughSettings = cloneDeep(originalPort.lookthroughSettings);
        const portfolioRiskSettings = cloneDeep(originalPort.portfolioRiskSettings);
        const filter = cloneDeep(originalPort.filter);
        const performanceSettings = cloneDeep(originalPort.performanceSettings);
        const applyFilterTo = cloneDeep(originalPort.applyFilterTo);
        const datePicker = cloneDeep(originalPort.datePicker);
        // const epnlSettings = cloneDeep(originalPort.epnlSettings);

        for (const otherPort of otherPorts) {
            otherPort.expostSettings = expostSettings;
            otherPort.splitPositionSettings = splitPositionSettings;
            otherPort.lookthroughSettings = lookthroughSettings;
            otherPort.portfolioRiskSettings = portfolioRiskSettings;
            otherPort.filter = filter;
            otherPort.performanceSettings = performanceSettings;
            otherPort.applyFilterTo = applyFilterTo;
            otherPort.datePicker = datePicker;
            // otherPort.epnlSettings = epnlSettings;
        }
    }

    /**
     * Takes an IndexWeight and returns a Portfolio object
     */
    static convertIndexWeightToPortfolio(mainPortfolio: Portfolio, indexWeight: IndexWeight): Portfolio {
        return new Portfolio(indexWeight.portfolioPortName, mainPortfolio.datePicker, mainPortfolio.isIndexResearchPortfolio, indexWeight.portfolioFullName);
    }

    /**
     * revert benchmark to previous value
     * if no previous value, revert to None
     */
    static revertBenchmark(portfolio: Portfolio, previousBench?: Benchmark): void {
        if (!previousBench) {
            portfolio.benchmark = new Benchmark({type: BenchmarkConstants.NONE_BENCH});
            return;
        }

        portfolio.benchmark.type = previousBench.type;
        portfolio.benchmark.name = previousBench.name;
        portfolio.benchmark.order = previousBench.order;
    }

    /**
     * checks for transition from what-if search mode to regular search mode
     *
     * 1) should be a what-if favorite type
     * 2) invoking source should match with expected
     * 3) action type should match with expected
     */
    static canTransitToRegularSearchMode(modalStateInfo: ModalStateActionInfo, expectedInvokingSource, expectedAction): boolean {
        return modalStateInfo.source === expectedInvokingSource &&
            !!CompositionConstants.WHAT_IF_FAVORITE_TYPES.get(modalStateInfo.favoriteType) &&
            modalStateInfo.reason === expectedAction;
    }

    /**
     * Encode a Portfolio object to a Base64 string
     * @param portfolio - The Portfolio object to encode
     * @returns The Base64 encoded string
     */
    static encodePortfolio(portfolio: Portfolio): string {
        const jsonString = JSON.stringify(portfolio.serialize());
        return btoa(jsonString);
    }

    /**
     * Decode a Base64 string to a Portfolio object
     * @param base64String - The Base64 string to decode
     * @returns The decoded Portfolio object
     */
    static decodePortfolio(base64String: string): Portfolio {
        const jsonString = atob(base64String);
        const jsonObject = JSON.parse(jsonString);
        const portfolio = new Portfolio();
        portfolio.deserialize(jsonObject);
        return portfolio;
    }
}
