import {RequestAdapterConfig} from '@interfaces/request.interface';
import {ExploreResponseConfig} from '@interfaces/response.interface';
import {SimpleCube} from '@qbstr/data-cube-reactive';
import {Notification} from './notification.model';
import {AbstractColDef} from 'ag-grid-community';
import {TreeCube} from '@utils/qbstr/tree-cube';

/**
 * Default interface for WidgetPayload
 */
export interface WidgetPayload {
    breakdownLevels?: string[];
    cube?: SimpleCube<any> | TreeCube;
    requestConfig?: RequestAdapterConfig;
    responseConfig?: ExploreResponseConfig;
    defaultColumnDefs?: AbstractColDef[];
    widgetConfigType?: string;
    notification?: Notification;
    customVizConfig?: any; // TODO: Should be typed
    widgetSpecificData?: any;
}
