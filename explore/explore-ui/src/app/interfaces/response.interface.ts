/**
 * PossibleColumnGroup part of the response
 */
import {ResponseData} from '@blk/explore-ui-core';

export interface PossibleColumnGroup {
    groupName: string;
    columnKeys: string[];
    columnKeyToChildHeaderMap: {[column: string]: string};
}

/**
 * Column headers details defined in the ExploreResponse
 */
export interface ColumnHeaderDetails {
    columnKeyToTagMap: {[column: string]: string};
    possibleColumnGroups?: PossibleColumnGroup[];
    columnKeyToDisplayNameMap: {[column: string]: string};
    orderedColumnKeys?: string[];
}

export interface DateRange {
    startDate: Date;
    endDate: Date;
}

/**
 * Footer details defined in the ExploreResponse
 */
export interface FooterDetails {
    PUBLISH_TIME?: number;
    proxies?: any;
    activeReturn?: number;
    portfolioActiveReturn?: number;
    benchmarkActiveReturn?: number;
    startDate?: string;
    endDate?: string;
    cusipsTitleMap?: any;
    missingExposures?: string | {[key: string]: any};
    missingBetas?: string | Map<string, DateRange[]>;
    assetsCount?: number;
    dateOverride?: Map<string, string[]>;
    scenarios?: any;
    missingUnitValues: any[];
}

/**
 * SplitColumnHeader definition
 */
export interface SplitColumnHeaderKey {
    header: string;
    originalKey: string;
    updatedKeySuffix: string;
    updatedKey: string;
    children?: SplitColumnHeaderKey[];
}

/**
 * The structure of the SpliColumnKeys in the ExploreResponse
 */
export interface SplitColumnKeys {
    [column: string]: SplitColumnHeaderKey[];
}

export interface ExploreResponseConfig {
    columns?: string[];
    columnHeaderDetails?: ColumnHeaderDetails;
    splitColumnKeys?: SplitColumnKeys;
    footerDetails?: FooterDetails;
    collapsableColumns?: Set<string>;
}

/**
 * Shape of the ExploreResponse
 */
export interface ExploreResponse {
    data: (ExploreResponseConfig & {data: ResponseData});
    message?: string;
    errorCode?: string;
}



/**
 * Utility interface that helps with passing group level data
 */
export interface GroupLevel {
    groupColumns: string[];
    groupKeys: any[];
}
