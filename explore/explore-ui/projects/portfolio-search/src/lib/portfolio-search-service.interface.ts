import {Observable} from 'rxjs';

/**
 * Interface for Portfolio Search
 */
export interface PortfolioSearchServiceInterface {
    searchPortfolio$(text: string, includePorts?: boolean, includeWhatIfPorts?: boolean): Observable<any>;
}
