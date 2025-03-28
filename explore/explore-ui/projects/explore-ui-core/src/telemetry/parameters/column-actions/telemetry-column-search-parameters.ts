import {ExploreColumnQueryAction} from '../../enums';
import {Duration} from 'google-protobuf/google/protobuf/duration_pb';

export class TelemetryColumnSearchParameters {
    searchQuery: string;
    columnCount: number;
    isDescriptionSearch: boolean;
    timeTaken: Duration;
    addedColumnAndOrder: Map<string, number>;
    private _columnSearchQueryAction: ExploreColumnQueryAction;

    constructor(searchQuery: string, isDescriptionSearch: boolean, columnCount: number, timeTaken: Duration, columnSearchQueryAction?: ExploreColumnQueryAction, addedColumnAndOrder?: Map<string, number>) {
       this.searchQuery = searchQuery;
       this.isDescriptionSearch = isDescriptionSearch;
       this.columnCount = columnCount;
       this.timeTaken = timeTaken;
       this._columnSearchQueryAction = columnSearchQueryAction;
       this.addedColumnAndOrder = addedColumnAndOrder;
    }

    get columnSearchQueryAction() {
        return this._columnSearchQueryAction;
    }

    set columnSearchQueryAction(value: ExploreColumnQueryAction) {
        this._columnSearchQueryAction = value;
    }
}
