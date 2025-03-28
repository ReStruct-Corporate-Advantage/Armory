import {HttpParams} from '@angular/common/http';
import {Inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map, share} from 'rxjs/operators';
import {
    HTTP_SERVICE_TOKEN,
    HttpServiceInterface,
    FactorModelColumnDefinition,
} from '@blk/explore-ui-core';

@Injectable()
/**
 * Service for loading factor definitions
 */
export class FactorDefinitionsService {

    /**
     * constructor
     */
    constructor(@Inject(HTTP_SERVICE_TOKEN) private http2BmsService: HttpServiceInterface) {
    }

    /**
     * Gets the factor definitions based on breakdown
     * @param riskFactorBreakdown string
     */
    fetchFactorDefinitions$(riskFactorBreakdown: string): Observable<FactorModelColumnDefinition[]> {
        return this.getFactorDefinitions$({ riskFactorBreakdown })
            .pipe(map(this.mapToFactorDefinition));
    }

    fetchFactorDefinitionsForFactorTags$(factorTags: string[]): Observable<FactorModelColumnDefinition[]> {
        return this.getFactorDefinitions$({ factorTags })
            .pipe(map(this.mapToFactorDefinition));
    }

    fetchFactorDefinitionsForFactorShocks$(factorTags: string[], impliedShockUnit: string): Observable<any[]> {
        return this.getFactorDefinitions$({ factorTags, impliedShockUnit })
            .pipe(map(this.mapToFactorShockUnit));
    }

    fetchFactorDefinitionsForExposure$(factorTags: string[]): Observable<any[]> {
        return this.getFactorDefinitions$({ factorTags, isFactorExposureUnitRequest: true })
            .pipe(map(this.mapToFactorShockUnit));
    }

    private getFactorDefinitions$(params: any): Observable<any[]> {
        return this.http2BmsService.post$('getFactorDefinitions', params, new HttpParams())
            .pipe(
                map((payload: any) => {
                    if (payload !== null && payload.data !== null && payload.data.length > 0 ) {
                        return payload.data;
                    }
                    throw new Error();
                }),
                share()
            );
    }

    private mapToFactorDefinition(data: any[]): FactorModelColumnDefinition[] {
        return data.map(col => {
            const colDef = new FactorModelColumnDefinition(col);
            colDef.columnDesc = colDef.columnTag + '::' + colDef.title;
            return colDef;
        });
    }

    private mapToFactorShockUnit(data: any[]): { colTag: string, shockUnit: string }[] {
        return data.map(col => ({ colTag: col.columnTag, shockUnit: col.shockUnit }));
    }
}
