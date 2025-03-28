import {PortfolioSearchItem, PortfolioSearchServiceInterface} from '@blk/explore-ui-portfolio-search';
import {Injectable} from '@angular/core';
import {HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Http2BmsService} from '@services/bms';
import {CompositionConstants, RequestConstants} from '../../../constants';
import {LoadFavoriteAction} from '@models/favorite/load-favorite-action.model';
import {ExploreSelectOptionGroup} from '@blk/explore-ui-core';
import {FavoriteConstants} from '@constants/favorite.constants';
import {AppStore} from '../../../app.store';
import {ModalInvokeSource} from '@models/favorite/modal-invoke-source.enum';
import {HttpUtils} from '@utils/http.utils';
import {isArray} from 'lodash';

/**
 * ExplorePortfolioSearchService used in blk-portfolio-search
 */
@Injectable({
    providedIn: 'root'
})
export class ExplorePortfolioSearchService implements PortfolioSearchServiceInterface {

    constructor(private http2BmsService: Http2BmsService, private appStore: AppStore) {
    }

    /**
     * Function to perform the search operation for the portfolio
     * @param text  Text to search
     * @param includePorts  Flag to include normal portfolios in search results
     * @param includeWhatIfPorts  Flag to include 'what if portfolios' in search results
     */
    searchPortfolio$(text: string, includePorts: boolean = true, includeWhatIfPorts: boolean = false, loadingMessage?: string, isUploadListRequest?: boolean): Observable<any> {
        let params = new HttpParams({
            fromObject: {
                searchText: text.toUpperCase(),
                includePorts: includePorts.toString(),
                includeWhatIfPorts: includeWhatIfPorts.toString(),
                isUploadListRequest: !!isUploadListRequest
            }
        });

        if (loadingMessage) {
            params = HttpUtils.getCopiedParamWithLoadingKeyAndMessage(params, loadingMessage);
        }
        return this.http2BmsService.get$(RequestConstants.PORT_SEARCH, params).pipe(
            map((payload: any): any => {
                return payload.data;
            })
        );
    }

    /**
     * pushes information required by load favorite modal (if flag is set) and returns the action object
     */
    enableWhatIfSearch(loadWhatIfPortCallbackChain: PortSearchItemCallback | PortSearchItemCallback[], invokeModal = false, sourceId?: string, source?: ModalInvokeSource): LoadFavoriteAction {
        const [favType, folder]: [string, string] = [CompositionConstants.WHATIF_POS.TYPE, FavoriteConstants.PORTFOLIO_FOLDER];
        const loadFavAction = new LoadFavoriteAction({
            type: favType,
            treeType: folder,
            displayName: 'What-if Portfolios',
            callback: (favId: number, _loadingMessage: string, _forceRefresh: boolean, _isGlobal: boolean, portNameAndTitle?: string, _presetId?, type?: string) => {
                const portNameAndTitleSubStr: string[] = portNameAndTitle.split(CompositionConstants.FAV_ID_DELIMITER);
                if (isArray(loadWhatIfPortCallbackChain)) {
                    loadWhatIfPortCallbackChain[0](new PortfolioSearchItem(portNameAndTitleSubStr[0], portNameAndTitleSubStr[1], undefined, undefined, type, favId), loadWhatIfPortCallbackChain[1]);
                } else {
                    loadWhatIfPortCallbackChain(new PortfolioSearchItem(portNameAndTitleSubStr[0], portNameAndTitleSubStr[1], undefined, undefined, type, favId));
                }
            },
            headerDisplayName: undefined,
            subCategoryData: ExploreSelectOptionGroup.createSimpleSelectOptionGroup(
                [
                    CompositionConstants.WHATIF_POS.TYPE,
                    CompositionConstants.WHATIF_RULES.TYPE
                ],
                [
                    'Point in Time',
                    'Through Time'
                ],
                CompositionConstants.WHATIF_POS.TYPE
            ),
            sourceUniqueId: sourceId,
            source
        });

        if (invokeModal) {
            this.appStore.openLoadFavoriteModal$.next(loadFavAction);
        }

        return loadFavAction;
    }
}

export type PortSearchItemCallback = ((item: PortfolioSearchItem, ...args) => void);
