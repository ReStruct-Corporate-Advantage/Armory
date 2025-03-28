import {EventType} from './enums/event-type.enum';
import {BulkSavingEventDetailsKey} from './enums/bulk-saving-event.enum';
import {AcrmCustomLegendChangeEventDetailsKey} from './enums/custom-legend-event.enum';
import {AcrmRequestLevelChangeEventDetailsKey} from './enums/commitment-risk-data-event.enum';

export class TelemetryGenericEventParameters {
    // details include telemetry items in key/value pair.
    details: Map<EventDetailsKey, any>;

    /**
     * @param type: type/name of event.
     */
    constructor(public type: EventType) {
        this.details = new Map<EventDetailsKey, any>();
    }
}


// Add detailsKeys to EventDetailsKey
// eg> EventDetailsKey = DetailsKey1 | DetailsKey2 | DetailsKey3...
type EventDetailsKey = BulkSavingEventDetailsKey | AcrmCustomLegendChangeEventDetailsKey | AcrmRequestLevelChangeEventDetailsKey | string;
