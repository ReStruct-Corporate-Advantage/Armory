import {ConfigTypeFactory} from './favorite/factories';
import {ColumnState} from './widget-config/models/column-state.model';

export class CoreInitializer {
    static registerWidgetInputTypes(): void {
        ConfigTypeFactory.registerConfigType(ColumnState.CONFIG_TYPE, ColumnState);
    }
}
