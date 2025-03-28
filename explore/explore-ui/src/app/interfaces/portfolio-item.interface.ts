import {Security} from '@interfaces/security.interface';
import {HoldingChange} from '@models/portfolio/composition/holding-change.model';

export interface PortfolioItem extends Security {
    holdingChanges?: HoldingChange[];
    id?: number|string;
    portfolioType?: string;
    owner?: string;
    ticker?: string;
}
