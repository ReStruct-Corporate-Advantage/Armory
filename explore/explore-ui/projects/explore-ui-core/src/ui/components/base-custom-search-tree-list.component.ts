import {AuxAdvancedTreeListInterface} from '@blk/aladdin-angular-components';
import {ChangeDetectorRef} from '@angular/core';
import {SubscribableComponent} from '../../core/components/subscribable.component';
import {CoreColumnConstants, CoreCommonConstants} from '../../core/constants';
import {CoreColumnUtils} from '../../column/core-column.utils';
import {TelemetryService} from '../../telemetry/telemetry.service';
import {TelemetryActionConstants} from '../../telemetry/constants';
import {isNil, now} from 'lodash';
import {TelemetryUtil} from '../../telemetry/utils/telemetry.util';
import {TelemetryColumnSearchParameters} from '../../telemetry/parameters';
import {ExploreColumnQueryAction} from '../../telemetry/enums';
import SearchMapping from '../../assets/search-mappings.json';
import {CommonUtils} from '../../core/utils';
import {CoreDefinitionStore} from '../../definition/core-definition.store';
import {TokenConstants} from '../../definition/token/token.constants';
import {CoreColumnDefUtils} from '../../column/core-column-def.utils';

interface SearchInfo {
    originalString: string;
    searchTerms: string[];
    searchPortBenchActive: boolean;
    noOfValidCharacters: number;
    altSearchStrings: string[];
    altSearchTerms: string[][];
}

/**
 * Base component for advance tree list to implement custom search on source data available
 * Wiki - https://webster.bfm.com/Wiki/display/apps/Explore+Column+Search
 */
export abstract class BaseCustomSearchTreeListComponent extends SubscribableComponent {

    static MATCH_SCORE_PROPERTY = 'matchScore';

    static MATCH_SCORE_THRESHOLD = 'matchScoreThreshold';

    static ALTERNATE_SEARCH_MATCH = 'altSearchMatch';

    stringMapping: [string, string[]][];

    columnCount = CoreCommonConstants.EMPTY_STRING; // Number of columns in the search result, formatted with parentheses
    isDescriptionSearch: boolean;
    searchQuery: TelemetryColumnSearchParameters;
    searchStringWithNoMatch: string;

    constructor(protected changeDetectorRef: ChangeDetectorRef) {
        super();
        this.stringMapping = Object.entries(SearchMapping);
    }

    /**
     * Callback to perform custom search on tree list data
     */
    customSearch = (dataFlat: AuxAdvancedTreeListInterface[], searchString: string) => {
        return this.searchData(dataFlat, searchString);
    };

    /**
     * Callback to perform custom sort on tree list data
     */
    customSort = (searchString: string) => {
        const searchInfo = this.createSearchInfo(searchString);
        if (searchInfo.originalString && searchInfo.noOfValidCharacters > 2) {

            return (a: AuxAdvancedTreeListInterface, b: AuxAdvancedTreeListInterface): number => {
                return this.compareTreeNodes(searchInfo.searchPortBenchActive, a, b);
            };
        }
    };

    compareTreeNodes(searchPortBenchActive: boolean, a: AuxAdvancedTreeListInterface, b: AuxAdvancedTreeListInterface) {
        const aUppercase = searchPortBenchActive ? a.label.toUpperCase() : CoreColumnDefUtils.getStrippedName(a.label).toUpperCase();
        const bUppercase = searchPortBenchActive ? b.label.toUpperCase() : CoreColumnDefUtils.getStrippedName(b.label).toUpperCase();

        if (!a.parent && !b.parent) {
            return a.key <= b.key ? -1 : 1;
        } else if (aUppercase === bUppercase && !!a.eventData && !!b.eventData && !!a.eventData.uses && !!b.eventData.uses) {
            const valA = CoreColumnUtils.getUseOrder(a.eventData.uses, a.label);
            const valB = CoreColumnUtils.getUseOrder(b.eventData.uses, b.label);
            return valA <= valB ? -1 : 1;
        } else if ( !a[BaseCustomSearchTreeListComponent.ALTERNATE_SEARCH_MATCH] && b[BaseCustomSearchTreeListComponent.ALTERNATE_SEARCH_MATCH]) {
            return -1;
        } else if ( a[BaseCustomSearchTreeListComponent.ALTERNATE_SEARCH_MATCH] && !b[BaseCustomSearchTreeListComponent.ALTERNATE_SEARCH_MATCH]) {
            return 1;
        } else if (a[BaseCustomSearchTreeListComponent.MATCH_SCORE_PROPERTY] >= 0 && b[BaseCustomSearchTreeListComponent.MATCH_SCORE_PROPERTY] >= 0) {
            // If the scores are equal then sort by the titles.
            // The main reason for this is we want "Market Value" to show before "Market Value %".
            if (a[BaseCustomSearchTreeListComponent.MATCH_SCORE_PROPERTY] === b[BaseCustomSearchTreeListComponent.MATCH_SCORE_PROPERTY]) {
                return aUppercase <= bUppercase ? -1 : 1;
            }
            return a[BaseCustomSearchTreeListComponent.MATCH_SCORE_PROPERTY] >= b[BaseCustomSearchTreeListComponent.MATCH_SCORE_PROPERTY] ? -1 : 1;
        }
        return aUppercase <= bUppercase ? -1 : 1;
    }

    /**
     * Method to reset any past search results properties like match indexes, match flag and match score
     */
    resetSearchResult(dataFlat: AuxAdvancedTreeListInterface[]): void {
        dataFlat.forEach((treeNode: AuxAdvancedTreeListInterface) => {
            treeNode.match = false;
            treeNode[BaseCustomSearchTreeListComponent.MATCH_SCORE_PROPERTY] = 0;
            treeNode.isExpanded = false;
            treeNode.matchStart = null;
            treeNode.matchEnd = null;
            treeNode[BaseCustomSearchTreeListComponent.ALTERNATE_SEARCH_MATCH] = false;
        });
    }

    /**
     * create search info object
     */
    createSearchInfo(originalString: string): SearchInfo {
        // have time taken for search maybe in proto
        originalString = originalString?.toUpperCase();
        const searchTerms = this.getSearchTerms(originalString);
        const altSearchStrings = this.getAlternateStrings(originalString);
        const altSearchTerms = altSearchStrings.map(altString => this.getSearchTerms(altString));
        return { originalString, searchTerms, searchPortBenchActive: this.searchForPortBenchActive(searchTerms), noOfValidCharacters: this.getNumberOfValidCharacters(searchTerms), altSearchStrings, altSearchTerms};
    }

    getNumberOfValidCharacters(searchTerms: string[]): number {
        return searchTerms?.reduce((sum, a) => sum + a.length, 0);
    }

    /**
     * find Search Mapping
     */
    getAlternateStrings(originalString: string): string[] {
        const altSearchString = [];
        for (const [key, value] of this.stringMapping) {
            if (originalString.trim().toUpperCase().includes(key.trim().toUpperCase())) {
                value.forEach(altVal => altSearchString.push(originalString.trim().toUpperCase().replace(key.trim().toUpperCase(), altVal.trim().toUpperCase())));
            }
        }
        return altSearchString;
    }

    getSearchTerms(originalString: string): string[] {
        const searchTerms = originalString?.split(/[\s_+%.\/-]+/);
        if (originalString?.includes('%')) {
            searchTerms?.push('%');
        }
        return searchTerms?.filter(item => item.trim().length > 0);
    }

    private searchForPortBenchActive(searchTerms: string[]): boolean {
        return searchTerms.some(searchTerm => {
           return searchTerm.includes(CoreColumnConstants.COLUMN_PREFIX.BENCHMARK.trim().toUpperCase()) ||
               CoreColumnConstants.COLUMN_PREFIX.BENCHMARK.trim().toUpperCase().startsWith(searchTerm) ||
               searchTerm.includes(CoreColumnConstants.COLUMN_PREFIX.PORTFOLIO.trim().toUpperCase()) ||
               CoreColumnConstants.COLUMN_PREFIX.PORTFOLIO.trim().toUpperCase().startsWith(searchTerm) ||
               searchTerm.includes(CoreColumnConstants.COLUMN_PREFIX.ACTIVE.trim().toUpperCase()) ||
               CoreColumnConstants.COLUMN_PREFIX.ACTIVE.trim().toUpperCase().startsWith(searchTerm);
        });
    }

    /**
     * Search data bound with custom search
     */
    private searchData(dataFlat: AuxAdvancedTreeListInterface[], searchString: string): AuxAdvancedTreeListInterface[] {
        const startTime = now();
        const searchInfo = this.createSearchInfo(searchString);
        // check the matchScore if specified in URl params else default to 0.5
        const matchScoreProp = CommonUtils.getURLParam(BaseCustomSearchTreeListComponent.MATCH_SCORE_PROPERTY);
        const matchScoreToUse = !isNil(matchScoreProp) ? Number(matchScoreProp) : 0.5;

        this.resetSearchResult(dataFlat);
        dataFlat.forEach((treeNode: AuxAdvancedTreeListInterface) => {
            this.performSearchOnTreeNode(treeNode, searchInfo, matchScoreToUse);
        });
        const matchedNodes =  this.getMatchingNodes(dataFlat, matchScoreToUse);
        this.addSearchTelemetry(searchString, startTime);
        return matchedNodes;
    }

    /**
     * check if tree node matches search and set relevant properties
     */
    private performSearchOnTreeNode(treeNode: AuxAdvancedTreeListInterface, searchInfo: SearchInfo, matchScoreToUse: number) {
        // Do not perform search on parent nodes
        if (treeNode.children) {
            return;
        }

        // Search by Column definition
        let treeNodeString;
        if (this.isDescriptionSearch && treeNode.eventData && treeNode.eventData.columnDesc) {
            treeNodeString = treeNode.eventData.columnDesc.toUpperCase();
        } else {
            // Search by Column Name
            treeNodeString = searchInfo.searchPortBenchActive ? treeNode.label.toUpperCase() : CoreColumnDefUtils.getStrippedName(treeNode.label).toUpperCase();
        }
        const nodeWords = this.getSearchTerms(treeNodeString);

        if (!this.performSearchOnNode(treeNode, treeNodeString, nodeWords, searchInfo.originalString, searchInfo.searchTerms, matchScoreToUse)) {
            for (let index = 0; index < searchInfo.altSearchTerms.length; index++) {
                if (this.performSearchOnNode(treeNode, treeNodeString, nodeWords, searchInfo.altSearchStrings[index], searchInfo.altSearchTerms[index], matchScoreToUse)) {
                    treeNode[BaseCustomSearchTreeListComponent.ALTERNATE_SEARCH_MATCH] = true;
                    break;
                }
            }
        }
    }

    performSearchOnNode(treeNode: AuxAdvancedTreeListInterface, treeNodeString: string, nodeWords: string[], originalString: string, searchTerms: string[], matchScoreToUse: number): boolean {
        const noOfValidCharacters = this.getNumberOfValidCharacters(searchTerms);
        // check if any of node words are contained in search string
        // this is to handle scenarios where user misses space, like marketvalue search string against market value node
        let originalStringToSearchNodeWords = originalString;
        const nodeWordsInSearchString = nodeWords.filter(item => {
            if (originalStringToSearchNodeWords.indexOf(item) > -1) {
                // this is done to avoid false postives
                // Example Node Words are P & & and original string is P&L. The match will come true if we not remove the already found string from original string
                originalStringToSearchNodeWords = originalStringToSearchNodeWords.replace(item, '');
                return true;
            }
            return false;
        });

        // Check if the item contains all the parts to search.
        const searchWordsInNodeString = searchTerms.filter(item => treeNodeString.indexOf(item) > -1);
        const isMatch = searchWordsInNodeString.length === searchTerms.length || nodeWordsInSearchString.reduce((partialSum, a) => partialSum + a.length, 0) === noOfValidCharacters;
        if (!!isMatch) {
            treeNode.match = true;
            treeNode[BaseCustomSearchTreeListComponent.MATCH_SCORE_PROPERTY] = this.calculateScore(searchTerms, nodeWords, searchWordsInNodeString, nodeWordsInSearchString);
            this.setNodeProperties(treeNode, originalString, nodeWordsInSearchString, matchScoreToUse);
        }
        return isMatch;
    }

    /**
     * Calculate the match score of tree node that's matching search info, this helps in sorting the search results
     * for first condition - Search Terms [Market, Value] or [Value, Market ]node words ['Market', Value'] or [Value, Market] will be exact match so highest score as 1 - which is exact match.
     * Second Condition - Search Terms [MarketValue] or [valuemarket] nodewords ['Market', Value'] or [Value, Market] exact match so score 1.
     * final condition where we calculate score - Example 1 = SearchTerms = [MarketValue] or [ValueMarket]
     * Node Words = [Market Value %] NodeWordsInSearchString = [Market, Value], SearchWordsInNodeString = []
     * searchWordsScore = 0/3 = 0
     * nodeWordsScore = 2/3 = .66
     * score returned = .66
     * Example 2 SearchTerms = [Market Val] or [Val Market] or [val mark]
     * Node Words = [Market Value %] NodeWordsInSearchString = [], SearchWordsInNodeString = [val, mark]
     * searchWordsScore = 2/3 = .66
     * nodeWordsScore = 0/3 = 0
     * score returned = .66
     */
    calculateScore(searchTerms: string[], nodeWords: string[], searchWordsInNodeString: string[], nodeWordsInSearchString: string[]) {
        const searchWordsScore = searchWordsInNodeString.length / nodeWords.length;
        const nodeWordsScore = nodeWordsInSearchString.length / nodeWords.length;
        if (searchTerms.length === nodeWords.length) {
            return 1;
        } else if (searchTerms.join(CoreCommonConstants.EMPTY_STRING).length === nodeWords.join(CoreCommonConstants.EMPTY_STRING).length) {
            return 1;
        } else {
            return Math.max(searchWordsScore, nodeWordsScore);
        }
    }

    /**
     * set node properties for node that matches search
     */
    private setNodeProperties(treeNode: AuxAdvancedTreeListInterface, originalString: string, nodeWordsInSearchString: string[], matchScoreToUse: number) {
        this.setMatchStartEndIndex(treeNode, originalString, nodeWordsInSearchString);
        // in description mode we do not want to expand/collapse by match score
        const shouldExpendParents = !this.isDescriptionSearch ? treeNode[BaseCustomSearchTreeListComponent.MATCH_SCORE_PROPERTY] >= matchScoreToUse : true;

        while (treeNode.parent) {
            if (!treeNode.parent.isExpanded) {
                treeNode.parent.isExpanded = shouldExpendParents;
            }
            treeNode.parent.match = true;
            treeNode = treeNode.parent;
        }
    }

    private setMatchStartEndIndex(treeNode: AuxAdvancedTreeListInterface, originalString: string, nodeWordsInSearchString: string[]) {
        // If the whole string matches then we can do the highlighting, otherwise ignore it.
        const highlightPos = treeNode.label.toUpperCase().indexOf(originalString);
        if (highlightPos >= 0) {
            treeNode.matchStart = highlightPos;
            treeNode.matchEnd = highlightPos + originalString.length;
        } else if (!this.isDescriptionSearch && nodeWordsInSearchString.length > 0) {
            const treeNodeString = this.getSearchTerms(treeNode.label.toUpperCase()).join(CoreCommonConstants.SINGLE_SPACE);
            let longestContWord = CoreCommonConstants.EMPTY_STRING;
            let currentWord = CoreCommonConstants.EMPTY_STRING;
            let startIndex = 0;
            let firstWordIndex = 0;
            while (startIndex < nodeWordsInSearchString.length) {
                const newWord = (currentWord + CoreCommonConstants.SINGLE_SPACE + nodeWordsInSearchString[startIndex]).trim();
                if (treeNodeString.includes(newWord)) {
                    currentWord = newWord;
                    startIndex++;
                    if (currentWord.length > longestContWord.length) {
                        longestContWord = currentWord;
                    }
                } else {
                    currentWord = currentWord.substring(nodeWordsInSearchString[firstWordIndex].length).trim();
                    firstWordIndex++;
                }
            }
            const longestSubArray = longestContWord.split(CoreCommonConstants.SINGLE_SPACE);
            treeNode.matchStart = treeNode.label.toUpperCase().indexOf(longestSubArray[0]);
            treeNode.matchEnd = treeNode.label.toUpperCase().indexOf(longestSubArray[longestSubArray.length - 1]) + longestSubArray[longestSubArray.length - 1].length;
        }
    }

    private getMatchingNodes(dataFlat: AuxAdvancedTreeListInterface[], matchScoreToUse: number):  AuxAdvancedTreeListInterface[] {
        let filteredData = dataFlat.filter(item => item.match);
        this.columnCount = this.getColumnCount(filteredData);
        // get count of all matching columns
        const flatColumns = filteredData.filter(item => !item.children);
        flatColumns.forEach((node, index) => node[CoreCommonConstants.COLUMN_ORDER_IN_SEARCH_RESULTS] = index + 1);
        const orignalColumnCount = flatColumns.length;

        const matchScoreThresholdProp = CommonUtils.getURLParam(BaseCustomSearchTreeListComponent.MATCH_SCORE_THRESHOLD);

        const defaultMatchScoreThreshold = CoreDefinitionStore.tokens[TokenConstants.EXPLORE_COL_SEARCH_THRESHOLD] ? Number(CoreDefinitionStore.tokens[TokenConstants.EXPLORE_COL_SEARCH_THRESHOLD]) : 30;

        const thresholdToExpandAllCategories = !isNil(matchScoreThresholdProp) ? Number(matchScoreThresholdProp) : defaultMatchScoreThreshold;

        if (orignalColumnCount > thresholdToExpandAllCategories) { // if count is greater than threshold then apply further filtering and keep the nodes collapsed
            // Filter out children nodes of collapsed category if we are not in description mode search
            filteredData = this.isDescriptionSearch ? filteredData : filteredData.filter(node => this.isNodeMatchingCriteria(node, matchScoreToUse));
        } else { // if count is less than 10 then do not filter and keep nodes expanded
            filteredData.filter(item => item.children).forEach(node => node.isExpanded = true);
        }
        this.changeDetectorRef.markForCheck();
        return filteredData;
    }

    /**
     * helper method to filter out child nodes below match score threshold or intermediate node having parent node isExpanded set to false
     */
    private isNodeMatchingCriteria(node: AuxAdvancedTreeListInterface, matchScoreToUse: number): boolean {
        let isChildBelowScoreOrIntermediateNode = false;
        if (isNil(node.children)) { // check if node is a child node and below match score threshold
            isChildBelowScoreOrIntermediateNode = node[BaseCustomSearchTreeListComponent.MATCH_SCORE_PROPERTY] < matchScoreToUse;
        } else if (node.parent) { // check if node is an intermediate parent node
            isChildBelowScoreOrIntermediateNode = true;
        }
        return !(isChildBelowScoreOrIntermediateNode && !node.parent?.isExpanded);
    }

    private addSearchTelemetry(searchString: string, startTime: number): void {
        const columnCntAsNumeric = TelemetryUtil.getColumnCountAsNumeric(this.columnCount);
        this.searchQuery = new TelemetryColumnSearchParameters(searchString, this.isDescriptionSearch, columnCntAsNumeric,  TelemetryUtil.getDuration(now() - startTime));

        // if there are no results for the search string and search string is different from previous search string with no results
        // then track the search query e.g. return1, return12 and return123 will result in only 1 event tracked i.e. return1
        if (columnCntAsNumeric === 0 && !searchString.startsWith(this.searchStringWithNoMatch)) {
            this.searchQuery.columnSearchQueryAction = ExploreColumnQueryAction.EXPLORE_COLUMN_QUERY_ACTION_SEARCH_NO_RESULTS;
            TelemetryService.track(TelemetryActionConstants.USER_BEHAVIOUR.COLUMN_SEARCH_QUERY, this.searchQuery);
            this.searchStringWithNoMatch = searchString;
        }
    }

    /**
     * Get unfiltered tree list source data
     */
    abstract getSourceData(): AuxAdvancedTreeListInterface[];

    /**
     * Get the column count to be shown in column counter
     */
    abstract getColumnCount(filteredData: AuxAdvancedTreeListInterface[]): string;
}
