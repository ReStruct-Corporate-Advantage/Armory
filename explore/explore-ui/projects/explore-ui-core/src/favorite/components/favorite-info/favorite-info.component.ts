import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {AbstractFavoriteConfig} from '../../models/abstract-favorite-config.model';
import {CoreFavoriteConstants} from '../../constants';
import {CoreFavoriteUtils} from '../../utils';
import {CoreUserMetaDataStore} from '../../../user-meta-data/core-user-meta-data.store';
import {isNil} from 'lodash';
import {SubscribableComponent} from '../../../core/components/subscribable.component';
import {takeUntil} from 'rxjs/operators';
import {CoreFavoriteStore} from '../../stores';

@Component({
    selector: 'explore-favorite-info',
    templateUrl: './favorite-info.component.html',
    styleUrls: ['./favorite-info.component.scss']
})
export class FavoriteInfoComponent extends SubscribableComponent implements OnInit, OnChanges {

    @Input() favoriteConfig: AbstractFavoriteConfig;
    @Input() favoriteConfigType: string;
    @Input() loadFavoriteCallBack: (favId: number, loadingMessage: string, forceRefresh?: boolean, isGlobalFavorite?: boolean, versionId?: string) => void;

    favoriteLabel: string;
    isWorkspaceFavorite = false;

    ngOnInit() {
        CoreFavoriteStore.favSavedNotifier$
            .pipe(
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe({
                next: () => {
                    this.onFavoriteConfigUpdated();
                }
            });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.favoriteConfig) {
            this.onFavoriteConfigUpdated();
        }
    }

    onFavoriteConfigUpdated(): void {
        let favoriteOwnerType: string;
        if (CoreFavoriteUtils.isAdminOrGlobalFavorite(this.favoriteConfig.owner)) {
            favoriteOwnerType = CoreFavoriteConstants.ENTERPRISE;
        } else if (!isNil(this.favoriteConfig.owner) && this.favoriteConfig.owner !== CoreUserMetaDataStore.userMetaData.login) {
            favoriteOwnerType = 'Team';
        } else {
            favoriteOwnerType = 'My';
        }

        this.isWorkspaceFavorite = this.favoriteConfigType === CoreFavoriteConstants.FAVORITE_DISPLAY_TITLE.WORKSPACE;
        this.favoriteLabel = `${favoriteOwnerType} ${this.favoriteConfigType}`;
    }
}
