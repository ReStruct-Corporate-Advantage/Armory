import {Inject, Injectable} from '@angular/core';
import {AbstractWidgetService} from './abstract-widget.service';

/*
 * Service Registry class that Registers all the services and creates a map of widgetConfig -> AbstractWidgetService
 */
@Injectable()
export class WidgetServiceRegistry {

    protected registryMap: Map<string, AbstractWidgetService> = new Map<string, AbstractWidgetService>();

    /**
     * services are injected as defined in widget.module.ts
     * @param widgetDataServices a collection of the widget data services to create the instane with
     */
    constructor (@Inject(AbstractWidgetService) protected widgetDataServices: AbstractWidgetService[]) {
        widgetDataServices.forEach((widgetDataService: AbstractWidgetService) => {
            (widgetDataService.getWidgetConfigTypes()).forEach((configType: string) => this.register(configType, widgetDataService));
       });
    }

    /**
     * get service based on widget type
     *
     * @param widgetType a type of the widget for which the service is required
     */
    public getService (widgetType: string): AbstractWidgetService {
        return this.registryMap.get(widgetType);
    }

    /**
     * Register the widget service to type it serves
     *
     * @param widgetType a type of the widget to register the service for
     * @param abstractWidgetService a service to register for the given widget type
     */
    public register (widgetType: string, abstractWidgetService: AbstractWidgetService): void {
        this.registryMap.set(widgetType, abstractWidgetService);
    }
}
