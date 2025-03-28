import {WidgetConfigInput} from './widget-config-input.interface';

/**
 * Interface defining the input category in a widget config json file
 */
export interface WidgetConfigInputCategory {
    categoryType: string;
    categoryTitle: string;
    visible?: boolean;
    inputs: WidgetConfigInput[];
    noAccordion?: boolean;
    inputNotValidForTables?: boolean;
}
