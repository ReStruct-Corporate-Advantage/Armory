import {Duration} from 'google-protobuf/google/protobuf/duration_pb';

export class TelemetrySemanticSearchParameters {
    widgetType: string;
    colSearchType: string;
    requestedRows: number;
    searchQuery: string;
    timeTaken: Duration;
    columnCount: number;
    likeResult: boolean;

    constructor(widgetType: string, colSearchType: string, requestedRows: number, searchQuery: string, timeTaken: Duration, columnCount: number, likeResult?: boolean) {
        this.widgetType = widgetType;
        this.colSearchType = colSearchType;
        this.requestedRows = requestedRows;
        this.searchQuery = searchQuery;
        this.timeTaken = timeTaken;
        this.columnCount = columnCount;
        this.likeResult = likeResult;
    }

}
