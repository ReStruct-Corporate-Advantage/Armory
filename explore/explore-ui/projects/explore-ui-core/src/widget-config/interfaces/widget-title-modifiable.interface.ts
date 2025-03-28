import {isNil} from 'lodash';
import {DateValue} from '../../date/models/date-value/date-value.model';

/**
 * This interface will be implemented by those widget input models which impact the widget display title
 */
export interface WidgetTitleModifiable {
    /**
     * Modify the widget title with the widget settings.
     */
    getModifiedWidgetTitleDetails(portfolioDate?: DateValue): any;
}

/**
 * Utility method to check if the object is an instance of this.
 */
export function isWidgetTitleModifiable(object: any): object is WidgetTitleModifiable {
    if (isNil(object)) {
        return false;
    }
    return 'getModifiedWidgetTitleDetails' in object;
}
