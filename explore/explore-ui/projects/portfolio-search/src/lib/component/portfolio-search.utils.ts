import {AuxSearchSelectOptionsInterface, AuxSelectOption} from '@blk/aladdin-angular-components';
import {PortfolioSearchComponent} from './portfolio-search.component';

export class PortfolioSearchUtils {

    /**
     * returns the select props object for parametric search with what-if selected as default
     */
    static getSelectProps(): AuxSearchSelectOptionsInterface {
        return {
            data: [
                {
                    values: [
                        {
                            displayValue: 'Portfolio',
                            value: {includePorts: true, includeWhatIfPorts: false}
                        },
                        {
                            displayValue: 'What-if Portfolio',
                            value: {includePorts: false, includeWhatIfPorts: true}
                        }
                    ]
                }
            ]
        };
    }

    /**
     * Refreshes the select props object to point to the value whose index has been passed
     */
    static refreshSelectPropsFromParent(portfolioSearch: PortfolioSearchComponent, index: number, isWhatIfLoaded?: boolean): void {
        portfolioSearch.selectProps = PortfolioSearchUtils.getSelectProps();
        portfolioSearch.selectProps.selected = {
            ...portfolioSearch.selectProps.data[0].values[index]
        };
        portfolioSearch.selectedPortfolioType = portfolioSearch.selectProps.selected as AuxSelectOption;
        if (isWhatIfLoaded) {
            portfolioSearch.searchTerms = [];
            portfolioSearch.searchString = '';
        }
    }
}
