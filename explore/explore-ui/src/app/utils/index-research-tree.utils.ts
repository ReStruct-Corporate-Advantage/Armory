import {IndexSearchItem} from '@services/explore-index-search/explore-index-search.service';
import {IndexSearchTreeItem} from '@models/portfolio/index-search-tree-item.model';
import {isEmpty} from 'lodash';

/**
 * Utility class for initializing index research tree in index research tab(add portfolio) and changing index research portfolio from portfolio header
 */
export class IndexResearchTreeUtils {

    /**
     * create the source data for the picklist using the index data from indexSearchService.searchIndex$
     */
    static createIndexTree(data: IndexSearchItem[]): Array<{ children: IndexSearchTreeItem[], ticker: string, label: string }> {
        if (data) {
            const temp = [];
            data.forEach(element => {
                temp.push({
                    ticker: element.ticker,
                    label: element.ticker ? element.ticker + ' (' + element.fullName + ')' : element.fullName,
                    children: this.createFamilyIndexTree(element.familyTree),
                });
            });
            return temp;
        }
    }

    /**
     * recursively loop through the children of each index so the tree structure can be created in the piclist
     */
    private static createFamilyIndexTree(familyTree: IndexSearchItem[]): IndexSearchTreeItem[] {
        if (!familyTree || familyTree.length === 0) {
            return undefined;
        } else {
            const tree = [];
            familyTree.forEach(index => {
                const children = this.createFamilyIndexTree(index.familyTree);
                if (index.ticker || !isEmpty(children)) {
                    tree.push(new IndexSearchTreeItem(index.ticker, index.fullName, children));
                }
            });
            return tree;
        }
    }

}
