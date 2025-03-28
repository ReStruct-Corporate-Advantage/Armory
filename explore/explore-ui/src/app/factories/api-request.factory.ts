import {WidgetConfigType} from '@blk/explore-ui-core';

/**
 * Holds the mappings of fields in Explore to the corresponding API enums
 */
export class ApiRequestFactory {
    private static widgetApiRequestType: Map<WidgetConfigType, any> = new Map<WidgetConfigType, any>();


    static registerWidgetApiRequestType(widgetType: WidgetConfigType, apiRequestType: any): void {
        this.widgetApiRequestType.set(widgetType, apiRequestType);
    }

    static widgetHasApiRequestType(widgetType: WidgetConfigType): boolean {
        return this.widgetApiRequestType.has(widgetType);
    }

    static getWidgetApiRequestType(widgetType: WidgetConfigType): any {
        return this.widgetApiRequestType.get(widgetType);
    }
}
