import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, map} from 'rxjs/operators';
import {InvestmentOpinion, MarketData, ResearchNoteData, Trade} from '@blk/ar-common';
import {Observable, throwError} from 'rxjs';

/**
 * Service that calls the AladdinResearchServer to retrieve price chart related data
 */
@Injectable({
    providedIn: 'root'
})
export class PriceChartService {
    private _apiEnvironmentPrefix: string = '/aladdinresearch/';

    private equityPriceDataURL = 'app/get-equity-price-data';
    private tradesByDateRangeURL = 'app/get-trades-by-date-range';
    private getNotesByDateRangeURL = 'search/get-notes-by-date-range';
    private getListHistoryURL = 'app/get-list-history';

    /**
     * Constructor
     */
    constructor(private http: HttpClient) {}

    /**
     * Return equity price data
     * @param cusip
     * @param startDate
     * @param endDate
     */
    getEquityPriceDataURL(cusip: string, startDate: any, endDate: any): Observable<MarketData[]> {
        const options = {
            params: {
                cusip: cusip,
                startDate: startDate,
                endDate: endDate
            }
        };
        return this.http.get(this._apiEnvironmentPrefix + this.equityPriceDataURL, options).pipe(
            map(
                (response) => {
                    return (response as Array<any>).map((o) => {
                        return {
                            price: o.price,
                            date: new Date(o.date),
                            currency: o.currency,
                        } as MarketData;
                    });
                },
                catchError((error) => throwError(error))
            )
        );
    }

    /**
     * Returns trade data, dates should in M/d/yyyy format
     * @param portGrp
     * @param cusip
     * @param startDate
     * @param endDate
     */
    getTradesData(portGrp: string, cusip: string, startDate: any, endDate: any): Observable<Trade[]> {
        const options = {
            params: {
                portGrp: portGrp,
                cusip: cusip,
                startDate: startDate,
                endDate: endDate
            }
        };
        return this.http.get(this._apiEnvironmentPrefix + this.tradesByDateRangeURL, options).pipe(
            map(
                (responseData) => {
                    if (responseData) {
                        const tradeData = responseData as Array<any>;
                        return tradeData.map((o) => {
                            return {
                                ...o,
                                tradeDate: new Date(o.tradeDate)
                            } as Trade;
                        });
                    }
                },
                catchError((error) => throwError(error))
            )
        );
    }

    /**
     * Returns research notes data, dates should in M/d/yyyy format
     * @param portGrp
     * @param cusip
     * @param startDate
     * @param endDate
     */
    getNotesByDateRange(cusip: string, startDate: any, endDate: any): Observable<ResearchNoteData[]> {
        const options = {
            params: {
                cusip: cusip,
                startDate: startDate,
                endDate: endDate
            }
        };
        return this.http.get(this._apiEnvironmentPrefix + this.getNotesByDateRangeURL, options).pipe(
            map(
                (responseData) => {
                    return (responseData as Array<any>).map((o) => {
                        return {
                            noteId: o.id,
                            publishTime: new Date(o.pub_time),
                            analystName: o.analyst_name,
                            subject: o.subject
                        } as ResearchNoteData;
                    });
                },
                catchError((error) => throwError(error))
            )
        );
    }
    /**
     * Returns list history data, dates should in M/d/yyyy format
     * @param cusip
     * @param listName
     * @param startDate
     * @param endDate
     */
    getListHistoryByDate(cusip: string, listName: string, startDate: any, endDate: any): Observable<InvestmentOpinion[]> {
        return this.http
            .get(this._apiEnvironmentPrefix + this.getListHistoryURL, {
                params: {
                    id: cusip,
                    listName: listName,
                    startDate: startDate,
                    endDate: endDate
                }
            })
            .pipe(
                map(
                    (responseData) => {
                        return (responseData as Array<any>).map((o) => {
                            return {
                                currentStatus: o.currentStatus,
                                endTime: o.endTime ? new Date(o.endTime) : new Date(),
                                startTime: new Date(o.startTime),
                                listName: o.listName,
                                modifiedBy: o.modifiedBy,
                                modifierName: o.modifierName,
                                value: o.value
                            } as InvestmentOpinion;
                        });
                    },
                    catchError((error) => throwError(error))
                )
            );
    }
}
