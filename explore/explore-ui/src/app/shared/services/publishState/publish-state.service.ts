import {Injectable} from '@angular/core';
import {TokenConstants, TokenUtils} from '@blk/explore-ui-core';
import {Http2BmsService} from '@services/bms';
import {Observable, of, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {PublishStateRequestPayload} from '@interfaces/publish-state-request-payload.interface';
import {BenchmarkConstants, StatusConstants} from '../../../constants';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {PublishStateItem} from '@models/publishState/publish-state-item.model';
import {cloneDeep} from 'lodash';
import {PublishStateCode} from '@enums/publish-state-code.enum';
import moment from 'moment';
import {PublishStateConstants} from '@constants/publish-state.constants';
import {HttpUtils} from '@utils/http.utils';
import {HttpParams} from '@angular/common/http';
import {AdhocPortfolio} from '@models/portfolio/adhoc-portfolio.model';

/**
 * Service responsible for fetching publish state data
 */
@Injectable({
    providedIn: 'root'
})
export class PublishStateService {

    constructor(private httpService: Http2BmsService) {
    }

    /**
     * Fetches the publish state info for a given portfolio.
     */
    fetchPublishedState$(portfolio: Portfolio, showLoading?: boolean): Observable<Portfolio> {

        // do not fetch data if publish state fetch is not enabled
        if (!TokenUtils.isFeatureEnabled(TokenConstants.ENABLE_PUBLISH_STATE) ) {
            return of(portfolio);
        }

        const publishStateWrapper = portfolio.publishStateWrapperSubject$.getValue();

        publishStateWrapper.isNullQC = false;

        // reset until fetch has happened
        publishStateWrapper.hasBeenFetched = false;

        // When fetching publish state while loading port info.. show Loading would be passed in as true.. we want to show loading overlay for publish state in that case since the portfolio in the workpad only gets updated ince this operation is
        // completed.. So want to make sure user can;t click reload until that and loading port info overlay is shown
        let params = new HttpParams();
        if (showLoading) {
            params = HttpUtils.getCopiedParamWithLoadingKeyAndMessage(params, StatusConstants.LOADING_DATA_FOR + portfolio.portName.toUpperCase());
        }

        return this.httpService.post$('getPublishedState', this.createPublishStateRequestPayload(portfolio), params)
            .pipe(map((payload) => {
                const oldPubData = cloneDeep(publishStateWrapper.publishedStateResults);
                publishStateWrapper.publishedStateResults = new Array<PublishStateItem>(); // reset for every new request

                if (payload.data && payload.data.data) {
                    payload.data.data.forEach((item: any) => {
                        const publishCode = item.publishStateCode || PublishStateCode.UNPUBLISHED;
                        let publishDate = item.publishTime || PublishStateConstants.NOT_APPLICABLE;

                        // If it's published, convert the date to a readable format.
                        if (publishDate !== PublishStateConstants.NOT_APPLICABLE) {
                            publishDate = moment(publishDate).local().format(PublishStateConstants.FORMAT_WITH_SECONDS);

                            const match = oldPubData.find(p => p.portfolioName === item.portfolioName);
                            if (match && ((match.publishDate !== PublishStateConstants.NOT_APPLICABLE && publishDate > moment(match.publishDate).local().format('MMM DD YYYY, h:mm A')) ||
                                match.publishDate === PublishStateConstants.NOT_APPLICABLE)) {
                                publishStateWrapper.isQCDataObsolete = true;
                            }
                        }
                        publishStateWrapper.publishedStateResults.push(new PublishStateItem(item.portfolioName, publishCode, publishDate));
                    });
                }
                publishStateWrapper.hasBeenFetched = true;
                publishStateWrapper.isFirstLoad = false;
                publishStateWrapper.lastFetchedTime = moment(); // update the time
                portfolio.publishStateWrapperSubject$.next(publishStateWrapper);
                return portfolio;
            }), catchError(error => throwError(error)));
    }

    /**
     * Create publish state request payload for fetching publish state data
     */
    createPublishStateRequestPayload(portfolio: Portfolio): PublishStateRequestPayload {
        const requestPayload: PublishStateRequestPayload = {
            portfolio: portfolio.portName,
            forDate: portfolio.datePicker.date,
            publishRequestBenchName: (portfolio.benchmark && portfolio.benchmark.name) ? portfolio.benchmark.name : '',
            publishRequestBenchSelection: (portfolio.benchmark && portfolio.benchmark.type) ? portfolio.benchmark.type : BenchmarkConstants.NONE_BENCH,
            isIndexHistoryPort: portfolio.isIndexResearchPortfolio,
            ...(portfolio instanceof AdhocPortfolio ? {adhocPortParams: portfolio.adhocParams} : {})
        };

        // if benchmark exists, get the name, order and type
        // the middleware only checks for order if the benchmark is not None
        if (requestPayload.publishRequestBenchSelection !== BenchmarkConstants.NONE_BENCH) {
            requestPayload.publishRequestBenchOrder = portfolio.benchmark.order;
        }

        // We do not want to fetch benchmark data if the benchmark is an aggregate. We'll send it as None to the back-end.
        // The backend ignores benchmarks marked None
        if (portfolio.benchmark && (portfolio.benchmark.type === BenchmarkConstants.BENCH_AGGREGATE || portfolio.benchmark.type === BenchmarkConstants.BENCH_AGGREGATE_SEC)) {
            requestPayload.publishRequestBenchSelection = BenchmarkConstants.NONE_BENCH;
        }

        if (portfolio.lookthroughSettings.isLookThroughEnabled || portfolio.lookthroughSettings.isBenchLookThroughEnabled) {
            requestPayload.isLookThroughEnabled = portfolio.lookthroughSettings.isLookThroughEnabled;
            requestPayload.isBenchLookThroughEnabled = portfolio.lookthroughSettings.isBenchLookThroughEnabled;
            requestPayload.ltSecurityProxyTypes = portfolio.lookthroughSettings.ltProxies;
            requestPayload.ltSecurityTypes = portfolio.lookthroughSettings.ltSecurityTypes;
        }

        return requestPayload;
    }
}
