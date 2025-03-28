/**
 * The shape of data in the ExploreResponse
 */
export interface ResponseData {
    title?: string;
    data: any[];
    color?: string;
    children?: ResponseData[];
    rowId?: number|string;
    dateList?: string[];
    dateToIndexMap?: Map<string, number>;
    columnKeyToIndexMap?: Map<string, number>;
    factorData?: Map<string, number[]>;
    riskMatrixData?: any[];
    sectorOrder?: number;
    bgColorData?: string[]; // background color for each data column in row
    fgColorData?: string[]; // foreground color for each data column in row
    originalTitle?: string;
}
