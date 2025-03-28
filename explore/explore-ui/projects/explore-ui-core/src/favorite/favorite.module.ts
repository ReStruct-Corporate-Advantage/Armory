import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {UiModule} from '../ui/ui.module';
import {FavoriteLabelComponent} from './components/favorite-label/favorite-label.component';
import {LoadSaveFavoriteButtonsComponent} from './components/load-save-favorite-buttons/load-save-favorite-buttons.component';
import {FavoriteTitlePipe} from './pipes/favorite-title.pipe';
import {FavoriteDetailsHeaderComponent} from './components/favorite-info-header/favorite-details-header.component';
import {LoadNewFavoriteButtonsComponent} from './components/load-new-favorite-buttons/load-new-favorite-buttons.component';
import {FavoriteVersionLogLinkComponent} from './components/favorite-version-log-link/favorite-version-log-link.component';
import { FavoriteInfoPopoverComponent } from './components/favorite-info/favorite-info-popover/favorite-info-popover.component';
import { FavoriteInfoComponent } from './components/favorite-info/favorite-info.component';
import { PreviousFavoriteVersionBannerComponent } from './components/previous-favorite-version-banner/previous-favorite-version-banner.component';
import { FavoriteMenuComponent } from './components/favorite-menu/favorite-menu.component';
import {FavoriteStatusBadgeComponent} from './components/favorite-info/favorite-status-badge/favorite-status-badge.component';

@NgModule({
    imports: [
        CommonModule,
        UiModule
    ],
    declarations: [
        FavoriteTitlePipe,
        LoadSaveFavoriteButtonsComponent,
        FavoriteLabelComponent,
        FavoriteDetailsHeaderComponent,
        LoadNewFavoriteButtonsComponent,
        FavoriteVersionLogLinkComponent,
        FavoriteInfoPopoverComponent,
        FavoriteInfoComponent,
        PreviousFavoriteVersionBannerComponent,
        FavoriteMenuComponent,
        FavoriteStatusBadgeComponent
    ],
    exports: [
        FavoriteTitlePipe,
        FavoriteDetailsHeaderComponent,
        LoadNewFavoriteButtonsComponent,
        FavoriteVersionLogLinkComponent,
        FavoriteInfoComponent,
        FavoriteMenuComponent,
        FavoriteStatusBadgeComponent,
        PreviousFavoriteVersionBannerComponent
    ]
})
export class FavoriteModule {
}
