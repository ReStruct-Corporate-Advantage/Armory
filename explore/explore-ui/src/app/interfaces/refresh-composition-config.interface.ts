import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model'
import {SortedColumn} from '@models/widget/inputs/sorted-columns/sorted-column';
import {ExpandedState} from '@models/widget/inputs/expanded-state.model';

/**
 * Represents arguments taken by the callForRefreshComposition()
 * method in composition-modelling.
 */
export interface RefreshCompositionConfig {
    portfolio: WhatIfPortfolio;
    showNotification?: boolean;
    sortModel?: SortedColumn[];
    expandedState?: ExpandedState;
}
