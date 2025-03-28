import {HttpParams} from '@angular/common/http';
import {Inject, Injectable} from '@angular/core';
import {HTTP_SERVICE_TOKEN, HttpServiceInterface, ColumnStaticStringValue} from '@blk/explore-ui-core';
import {forkJoin, Observable, of, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';

@Injectable()
/**
 * Service for loading column options
 */
export class ColumnStaticValuesService {

    staticColumnValues: Map<string, ColumnStaticStringValue[]> = new Map<string, ColumnStaticStringValue[]>();

    /**
     * constructor
     */
    constructor(@Inject(HTTP_SERVICE_TOKEN) private http2BmsService: HttpServiceInterface) {
    }

    /**
     * Method to get static value of column using column Tag
     */
    getColumnStaticValues$(colTag: string): Observable<ColumnStaticStringValue[]> {
        if (this.staticColumnValues.get(colTag)) {
            return of(this.staticColumnValues.get(colTag));
        } else {
            return this.http2BmsService.get$('getStaticColumnValues', new HttpParams().set('colTag', colTag)).pipe(
                map((payload: any): any => {
                    this.staticColumnValues.set(colTag, payload.data);
                    return payload.data as ColumnStaticStringValue[];
                }),
                catchError((error) => throwError(error))
            );
        }
    }

    getColumnStaticValuesForColumns$(colTags: string[]): Observable<ColumnStaticStringValue[]> {
        const observableQueue: Observable<ColumnStaticStringValue[]>[] = colTags.map(colTag =>
            this.getColumnStaticValues$(colTag)
        );

        return forkJoin(observableQueue).pipe(
            map((staticValuesArray: ColumnStaticStringValue[][]) => {
                // To keep only unique entries
                const columnStaticValuesMap: Map<string, ColumnStaticStringValue> = new Map();

                staticValuesArray
                    .flatMap(staticValue => staticValue)
                    .forEach(staticValue => {
                        if (!columnStaticValuesMap.has(staticValue.value)) {
                            columnStaticValuesMap.set(staticValue.value, staticValue);
                        }
                    });

                return Array.from(columnStaticValuesMap.values());
            }),
            catchError((error) => throwError(error)),
        );
    }
}
