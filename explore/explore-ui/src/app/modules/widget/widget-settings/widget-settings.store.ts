import {BehaviorSubject, Subject} from 'rxjs';
import {Injectable} from '@angular/core';

/**
 * WidgetSettingsStore to contain widget settings state and the state management logic
 *  WidgetSettingsModalComponent holds multiple instances of WidgetSettingComponent and this is to properly communicate within the component
 */
@Injectable()
export class WidgetSettingsStore {
    // quickColumnSetChanged$ and groupingTypeChanged$ are to communicate from FactorBasedWidgetQuickColumnsetComponent and subscribe in ColumnSetSettingsComponent
    quickColumnSetChanged$ = new Subject<string>();
    groupingTypeChanged$ =  new BehaviorSubject<string>(undefined);
}
