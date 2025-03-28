import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { cloneDeep, each, isObject, trimEnd } from 'lodash';

import { CoreRequestConstants } from '../core/constants';
import { CommonUtils } from '../core/utils';
import { WidgetConfigType } from './enums';
import { WidgetConfig } from './models/widget-config.model';
import { WIDGET_CONFIG_DIRECTORY_TOKEN } from './tokens';

export interface WidgetConfigResolverOptions {
    requestLoadingMessage?: string;
}

export type WidgetConfigByTypeMap =  { [widgetConfigType in WidgetConfigType]: WidgetConfig };

@Injectable()
export class WidgetConfigResolverService {
    private readonly widgetConfigDirectoryPath: string;

    constructor(@Inject(WIDGET_CONFIG_DIRECTORY_TOKEN) private widgetConfigDirectoryValue: string,
                private httpClient: HttpClient) {
        this.widgetConfigDirectoryPath = trimEnd(widgetConfigDirectoryValue, '/');
    }

    public resolveConfig$(widgetConfigJson: any, options?: WidgetConfigResolverOptions): Observable<WidgetConfigByTypeMap> {
        const widgetConfig = cloneDeep(widgetConfigJson);
        return this.resolveReferences$(widgetConfig, options);
    }

    /**
     * Resolves references to other json files as well as referenced objects
     */
    private resolveReferences$(data: any, options?: WidgetConfigResolverOptions): Observable<WidgetConfigByTypeMap> {
        // First get all refJsons replaces with actual jsons.
        const observableQueue: Observable<void>[] = [];

        each(Object.keys(data), (key: string) => {
            const widgetConfig = data[key];
            if (!widgetConfig.$refJson) {
                return;
            }
            observableQueue.push(this.resolveRefJson$(data, widgetConfig.$refJson, key, options));
        });
        // Now resolve all referenced objects
        return forkJoin(observableQueue).pipe(map(() => this.resolveRefObjects(data)));
    }

    /**
     * Resolve all references to other json files
     */
    private resolveRefJson$(data: any, fileName: string, key: string, options?: WidgetConfigResolverOptions): Observable<void> {
        let params = new HttpParams();

        if (options?.requestLoadingMessage) {
            const loadingKey = CoreRequestConstants.LOADING_PREFIX + CommonUtils.generateUniqueIdAsString(7);
            params = params
                .set(CoreRequestConstants.LOADING_KEY, loadingKey)
                .set(CoreRequestConstants.LOADING_MESSAGE, options.requestLoadingMessage);
        }

        return this.httpClient.get(this.getWidgetConfigUrl(fileName), {params}).pipe(map(jsonData => {
            data[key] = jsonData;
        }));
    }

    /**
     * Resolve all referenced json objects
     */
    private resolveRefObjects(data: any): WidgetConfigByTypeMap {
        // Find the $refObjects object.
        const refObjects = data.$refObjects;
        if (!refObjects) {
            // there are no reference objects so just get out of here.
            return data;
        }

        const refItems = [];
        this.findRefObjects(data, refItems);

        // Now that we have all the reference items we can substitute the real values in for them.
        each(refItems, (item: any) => {
            // Make sure the key exists, if not log that it doesn't so we can find it in the console.
            const refObject = refObjects[item.refKey];
            if (!refObject) {
                console.error('Could not find reference object ' + item.refKey + ' for object', item.parentObject);
            }

            // Get the reference object and put it in place of the $ref item.
            item.parentObject[item.parentKey] = refObject;
        });

        // Remove the $refObjects from the data object.
        // This is done last as we may have nested $ref items.
        delete data.$refObjects;

        return data;
    }

    /**
     * Find all the $ref items within this object.
     */
    private findRefObjects(searchObject: any, list: any) {
        // If it is not an object then just get out of here.
        if (!isObject(searchObject)) {
            return;
        }

        Object.keys(searchObject).forEach((key: string) => {
            // Skip if not a property of this object directly.
            if (!searchObject.hasOwnProperty(key)) {
                return;
            }

            const childObj = searchObject[key];
            if (childObj == null) {
                // Do nothing.
            } else if (childObj.$ref) {
                list.push({
                    parentObject: searchObject,
                    parentKey: key,
                    refKey: childObj.$ref
                });
            } else {
                // Recurse and see if there are any child elements that have it.
                this.findRefObjects(childObj, list);
            }
        });
    }

    private getWidgetConfigUrl(widgetConfigFileName: string) {
        if (this.widgetConfigDirectoryPath) {
            return `${this.widgetConfigDirectoryPath}/${widgetConfigFileName}`;
        } else {
            return widgetConfigFileName;
        }
    }
}
