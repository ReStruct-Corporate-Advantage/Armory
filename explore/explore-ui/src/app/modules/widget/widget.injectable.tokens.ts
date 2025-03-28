// export injection token placeholder for injection collection of AbstractWidgetService implementations
import {InjectionToken} from '@angular/core';
import {BaseRightClickHandler} from '../../vizualizations/table/right-click-handler/base-right-click.handler';

export const WIDGET_RIGHT_CLICK_HANDLER = new InjectionToken<BaseRightClickHandler>('WidgetRightClickHandlers');
