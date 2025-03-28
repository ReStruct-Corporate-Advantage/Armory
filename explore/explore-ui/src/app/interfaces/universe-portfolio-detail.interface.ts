import {HoldingChange} from '@models/portfolio/composition/holding-change.model';

export interface UniversePortfolioDetail {
    name: string;
    filter?: string;
    sendPortfolio?: boolean;
    adhocParams?: any;
    holdingChanges?: HoldingChange[];
}
