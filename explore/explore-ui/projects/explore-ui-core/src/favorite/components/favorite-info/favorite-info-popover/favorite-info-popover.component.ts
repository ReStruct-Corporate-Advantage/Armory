import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {CoreFavoriteUtils} from '../../../utils';
import {AbstractFavoriteConfig} from '../../../models/abstract-favorite-config.model';
import {CoreFavoriteConstants} from '../../../constants';
import {CoreFavoriteStore, CoreFavoriteVersioningStore} from '../../../stores';
import {TokenUtils} from '../../../../definition/token/token.utils';
import {TokenConstants} from '../../../../definition/token/token.constants';
import {takeUntil} from 'rxjs';
import {SubscribableComponent} from '../../../../core/components/subscribable.component';
import {isNil} from 'lodash';

@Component({
    selector: 'app-favorite-info-popover',
    templateUrl: './favorite-info-popover.component.html',
    styleUrls: ['./favorite-info-popover.component.scss']
})
export class FavoriteInfoPopoverComponent extends SubscribableComponent implements OnInit, OnChanges {

    @Input() favoriteConfig: AbstractFavoriteConfig;
    @Input() favoriteConfigType: string;
    @Input() loadFavoriteCallBack: (favId: number, loadingMessage: string, forceRefresh?: boolean, isGlobalFavorite?: boolean) => void;

    ownerName: string;

    ownerType: string;

    enterpriseDescription: string;

    showVersionLogLink: boolean;

    ngOnInit(): void {
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
        this.ownerType = CoreFavoriteUtils.isAdminOrGlobalFavorite(this.favoriteConfig.owner) ? CoreFavoriteConstants.ENTERPRISE : CoreFavoriteConstants.PERSONAL;
        this.ownerName = CoreFavoriteUtils.getFavoriteOwnerDisplayName(this.favoriteConfig.owner, this.favoriteConfig.userPermGrps);
        this.showVersionLogLink = this.setShowVersionLogLink();
        this.enterpriseDescription = this.favoriteConfig.owner === CoreFavoriteConstants.ADMIN ? this.favoriteConfig.enterpriseDescription : '';
    }

    onViewVersionLogClick(): void {
      CoreFavoriteVersioningStore.favoriteVersionLogAction$.next({id: this.favoriteConfig.aliasId ? this.favoriteConfig.aliasId : this.favoriteConfig.id, type: this.favoriteConfigType, isOpen: true, loadFavoriteCallBack: this.loadFavoriteCallBack});
    }

    /**
     * Returns true if we should show the version log link for the given favorite
     */
    setShowVersionLogLink(): boolean {
        return TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_ENTERPRISE_VERSIONS)
            && this.favoriteConfig.owner === CoreFavoriteConstants.ADMIN
            && (this.favoriteConfig.isADLFavorite() || !isNil(this.favoriteConfig.aliasId));
    }
}
