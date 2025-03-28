import {Inject, Injectable, Injector} from '@angular/core';
import {WIDGET_RIGHT_CLICK_HANDLER} from '../../../modules/widget/widget.injectable.tokens';
import {BaseRightClickHandler} from './base-right-click.handler';

/*
 * Service Registry class that Registers all the right click handlers and creates a map.
 * Each getRightClickHandler will create a new instance of BaseRightClickHandler
 */
@Injectable()
export class RightClickHandlerRegistry {

    protected rightClickHandlerMap: Map<string, BaseRightClickHandler> = new Map<string, BaseRightClickHandler>();

    /**
     * rightClickHandlers are injected as defined in explore-table.module.ts
     */
    constructor(@Inject(WIDGET_RIGHT_CLICK_HANDLER) protected rightClickHandlers: any[], @Inject(Injector) private injector: Injector) {
        rightClickHandlers.forEach((rightClickHandler: any) => {
            rightClickHandler.getWidgetConfigTypes().forEach((widgetConfigType: string) => {
                this.register(widgetConfigType, rightClickHandler);
            });
        });
    }

    /**
     * get right click handler based on widget config type
     *
     */
    public getRightClickHandler(widgetConfigType: string): BaseRightClickHandler {
        const rightClickHandler: any = this.rightClickHandlerMap.get(widgetConfigType);
        return rightClickHandler ? new rightClickHandler(this.injector) : null;
    }

    /**
     * Register the widget right click handler to type it serves
     *
     */
    public register(widgetConfigType: string, rightClickHandler: any): void {
        this.rightClickHandlerMap.set(widgetConfigType, rightClickHandler);
    }
}
