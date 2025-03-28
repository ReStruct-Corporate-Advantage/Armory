import {AuxSelectionTreeInterface} from '@blk/aladdin-angular-components';

/**
 * each individual item in the index research tree of portfolios
 */

export class IndexSearchTreeItem implements AuxSelectionTreeInterface {
    fullName: string;
    ticker: string;
    label: string;
    children: IndexSearchTreeItem[];

    constructor(ticker: string, fullName: string, children: IndexSearchTreeItem[]) {
        this.ticker = ticker;
        this.fullName = fullName;
        this.label = ticker ? ticker + ' (' + fullName + ')' : fullName;
        this.children = children;
    }
}
