import {cloneDeep} from 'lodash';
import {BehaviorSubject} from 'rxjs';
import {WidgetConfig} from './models/widget-config.model';

export class CoreWidgetConfigStore {

    static currentWidgetConfigType$ = new BehaviorSubject<string>(undefined);

    /**
     * Map of widget config type to the widget config - this is moved from WidgetConfigFactory
     */
    static chartConfig = new Map<string, WidgetConfig>();

    /**
     * getChartConfigForType
     */
    static getChartConfigForType(configType: string): WidgetConfig {
        return cloneDeep(CoreWidgetConfigStore.chartConfig.get(configType));
    }

    /**
     * get current Widget (lifespan is for the duration widget settings is open)
     */
    static getCurrentWidgetConfigType(): string {
        return CoreWidgetConfigStore.currentWidgetConfigType$.getValue();
    }

    /**
     * update current widget (to be updated to undefined as soon as widget settings are closed)
     */
    static updateCurrentWidgetConfigType(configType: string): void {
        CoreWidgetConfigStore.currentWidgetConfigType$.next(configType);
    }

    /**
     * Returns Null safe Widget/Chart's display title
     */
    static getWidgetTitle(configType: string): string {
        if (!configType || !this.getChartConfigForType(configType)) {
            return '';
        }
        const origTitle = CoreWidgetConfigStore.getChartConfigForType(configType).title;
        return origTitle ? origTitle : '';
    }
}
