/**
 * Represents the column definition which is part of the RequestConfig
 */

export interface VizualizationColumnConfigEF {
    columnKey: string;
    columnTitle: string;
    dataType: string;
    isSubtotalable: boolean;
    formatter: {
        scalingFactor?: number,
        decimalPlaces?: number
    };
}

/**
 * Represents the RequestConfig
 */
export interface RequestConfig {
    portfolio: string;
    columns: VizualizationColumnConfigEF[];
}

export interface ResponseConfig {
    columns?: string[];
}

/**
 * Shape of the Response
 */
export interface EfficientFrontierResponse {
    data: (ResponseConfig & {data: ResponseData});
    message?: string;
}

/**
 * The shape of data in the Response
 */
export interface ResponseData {
    title?: string;
    data: any[];
    children?: ResponseData[];
    rowId?: number;
    sectorOrder?: number;
}

/**
 * Utility interface that helps with passing group level data
 */
export interface GroupLevel {
    groupColumns: string[];
    groupKeys: any[];
}
