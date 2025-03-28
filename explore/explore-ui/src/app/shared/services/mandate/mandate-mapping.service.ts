import {Injectable} from '@angular/core';
import {HttpParams} from '@angular/common/http';
import {FavoriteConstants} from '@constants/favorite.constants';
import {FavoriteUtils} from '@utils/favorite.utils';
import {forkJoin, Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {sortBy} from 'lodash';
import {AuxSelectOptionGroup} from '@blk/aladdin-angular-components';

import {MandateSettings} from '@models/mandate/mandate-settings.model';
import {RequestConstants, StatusConstants} from '../../../constants';
import {Widget} from '@models/widget/widget.model';
import {MandateStore} from '@stores/mandate.store';
import {WorkspaceStore} from '@stores/workspace.store';
import {HttpUtils} from '@utils/http.utils';
import {FavoriteService} from '@services/favorite';
import {Http2BmsService} from '@services/bms';
import {
    AbstractConfig,
    AbstractFavoriteConfig,
    ColumnConstants,
    CoreFavoriteConstants,
    CoreFavoriteUtils,
    Favorite,
    SaveFavoriteResult,
    WidgetConfigInput
} from '@blk/explore-ui-core';
import {BreakdownFavoriteConstants} from '@blk/explore-ui-breakdown';

/**
 * Mandate Mapping Service
 */
@Injectable({
    providedIn: 'root'
})
export class MandateMappingService {
    private mandateSettingsFavorite: Favorite;

    constructor(private httpService: Http2BmsService, private favoriteService: FavoriteService) {
    }

    /**
     * initialize$
     */
    initialize$(): Observable<void[]> {
        const mandateQueue: Array<Observable<void>> = [this.loadMandates$(), this.loadMandateSettings$()];
        for (const key in ColumnConstants.MANDATE_MAP_ATTRIBUTES) {
            if (ColumnConstants.MANDATE_MAP_ATTRIBUTES[key]) {
                mandateQueue.push(this.loadMandateTypeFavorites$(key, FavoriteConstants.ADMIN_USER));
            }
        }
        mandateQueue.push(this.loadMandateTypeFavorites$(FavoriteConstants.WIDGETS_REPORT, CoreFavoriteConstants.GLOBAL_USER));

        return forkJoin(mandateQueue);
    }

    /**
     * This function saves the mandate map information back into the database
     */
    saveMandateSettings$(mandateSettingsList: MandateSettings[]): Observable<void> {
        if (!this.mandateSettingsFavorite || !this.mandateSettingsFavorite.id || !this.mandateSettingsFavorite.type || !this.mandateSettingsFavorite.title) {
            // If the fav does not already exist then we need to create a new one.
            // mandate owner should be saved as _ADMIN instead of _GLOBAL
            this.mandateSettingsFavorite = new Favorite();
            this.mandateSettingsFavorite.type = FavoriteConstants.MANDATE_MAP;
            this.mandateSettingsFavorite.owner = FavoriteConstants.ADMIN_USER;
            this.mandateSettingsFavorite.title = FavoriteConstants.MANDATE_MAP;
        }

        // Now generate the favorite data to save.
        const data: any = [];
        for (const mandateSettings of mandateSettingsList) {
            data.push(mandateSettings.serialize());
        }

        this.mandateSettingsFavorite.data = JSON.stringify(data);

        return this.favoriteService.saveFavorite$(this.mandateSettingsFavorite, FavoriteConstants.ADMIN_USER).pipe(
            map((payload: SaveFavoriteResult) => {
                if (payload && payload.favoriteId) {
                    // Update the favorite info.
                    this.mandateSettingsFavorite.id = payload.favoriteId;
                    MandateStore.mandateSettingsList = mandateSettingsList;
                }
            }),
            catchError((error: Error) => {
                console.error('Failed to save mandate settings.', error);
                return throwError(error);
            }));
    }

    /**
     * Loads the mandate settings that have been configured.
     */
    loadMandateSettings$(): Observable<void> {
        return this.favoriteService.getFavoriteByTypeAndUser$(FavoriteConstants.MANDATE_MAP, FavoriteConstants.ADMIN_USER, StatusConstants.LOADING_MANDATE_SETTINGS).pipe(
            map((payload: Favorite) => {
                if (!payload || !payload.data) {
                    return;
                }
                this.mandateSettingsFavorite = payload;

                // Now process the favorite data into the mandate settings.
                const mandateSettingsList = [];

                const favData = JSON.parse(decodeURI(payload.data));

                for (const item of favData) {
                    const mandateSettings = new MandateSettings(item);
                    mandateSettingsList.push(mandateSettings);
                }

                MandateStore.mandateSettingsList = mandateSettingsList;
            }),
            catchError(error => {
                console.error('Failed to load the mandate settings', error);
                return throwError(error);
            }));
    }

    /**
     * This method sends the request to load all the mandates from the middleware
     */
    loadMandates$(): Observable<void> {
        const loadingParams = HttpUtils.getCopiedParamWithLoadingKeyAndMessage(new HttpParams(), StatusConstants.LOADING_MANDATES);
        return this.httpService.get$(RequestConstants.LOAD_MANDATES, loadingParams).pipe(
            map((payload: any) => {
                // For each entry, create a auxMandateGroup object and update auxMandateOptions in MandateStore
                for (const mandateGroup of payload.data) {
                    const auxMandateGroup: AuxSelectOptionGroup = {label: mandateGroup.label, values: []};
                    auxMandateGroup.values.push({displayValue: mandateGroup.label, value: mandateGroup.value});
                    for (const mandate of mandateGroup.mandates) {
                        auxMandateGroup.values.push({displayValue: mandate.label, value: mandate.value});
                    }
                    sortBy(auxMandateGroup.values, 'displayValue');

                    MandateStore.auxMandateOptions.push(auxMandateGroup);
                }
            }),
            catchError(error => {
                return throwError(error);
            }));
    }

    loadMandateTypeFavorites$(key: string, user: string): Observable<void> {
        let favType;

        switch (key) {
            case FavoriteConstants.PERFORMANCE_BREAKDOWN:
                // For Performance Breakdown column, populate it with Sector Breakdowns
                favType = BreakdownFavoriteConstants.BREAKDOWN;
                break;
            case FavoriteConstants.WIDGETS_REPORT:
                // For reports, grab the LAYOUT favorite
                favType = FavoriteConstants.LAYOUT;
                break;
            case FavoriteConstants.COLUMN_SET:
                // For column sets, grab the REPORT favorite
                favType = FavoriteConstants.REPORT;
                break;
            default:
                favType = key;
        }

        return this.favoriteService.getSlimFavorites$(user, favType, StatusConstants.LOADING_MANDATE_OPTIONS).pipe(
            map((payload: Favorite[]) => {
                const existingFavs = MandateStore.mandateTypeFavorites.get(key) ? MandateStore.mandateTypeFavorites.get(key) : [];
                MandateStore.mandateTypeFavorites.set(key, [...existingFavs, ...payload]);
            }),
            catchError(error => {
                return throwError(error);
            }));
    }

    /**
     * This function is used to set the default input values for the widget based on the portfolio
     */
    setWidgetDefaultsAsPerMandate(widget: Widget): Observable<AbstractConfig>[] {
        const observableQueue: Observable<AbstractConfig>[] = [];
        const port = WorkspaceStore.getCurrentPortfolio();
        const widgetInputs = widget.getCombinedInputs();
        widget.widgetConfigInputs.forEach( (inputDef: WidgetConfigInput) => {
            // iterate on the input template defn and if the portfolio default is not required, skill changing input
            if (port.mandateSettings && inputDef.mandateSettingType) {
                const input = widgetInputs.get(inputDef.inputName);
                // Figure out the input type.
                const favSetting = port.mandateSettings.settings.get(inputDef.mandateSettingType);
                if (!favSetting) {
                    return;
                }
                const flagId = FavoriteUtils.splitFlagIdForFavorite(favSetting.toString());
                if (flagId) {
                    // Depending on the type of favorite we need to load this in different ways.
                    // NOTE:  When all favorite objects are converted to the new model this will go away.
                    let observable;
                    if (input instanceof AbstractFavoriteConfig) {
                        observable = this.favoriteService.getFavorite$(flagId.id, null, CoreFavoriteUtils.isGlobalFavorite(flagId.owner))
                            .pipe(
                                map((config: AbstractFavoriteConfig) => {
                                input.copyFrom(config);
                            }));
                    }
                    if (observable) {
                        observableQueue.push(observable);
                    }
                }
            }
        });

        return observableQueue;
    }
}
