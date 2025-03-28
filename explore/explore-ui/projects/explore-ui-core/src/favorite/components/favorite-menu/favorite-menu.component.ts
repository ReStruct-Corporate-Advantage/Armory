import {Component, Input, OnInit} from '@angular/core';
import {AbstractFavoriteConfig} from '../../models/abstract-favorite-config.model';
import {CoreFavoriteStore} from '../../stores';
import {FavoriteStatus} from '../../constants';

@Component({
    selector: 'app-favorite-menu',
    templateUrl: './favorite-menu.component.html'
})
export class FavoriteMenuComponent implements OnInit {

    @Input()
    favorite: AbstractFavoriteConfig;

    @Input()
    favoriteType: string;

    @Input()
    statusUpdateCallback: (status: FavoriteStatus) => void;

    // aux-inline-menu data
    menuOptions: any;

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        this.updateMenuOptions();
    }

    /**
     * Method is triggered when any of menu is clicked/selected
     */
    onMenuClicked(): void {
        CoreFavoriteStore.favStatusUpdateAction$.next({favorite: this.favorite, favoriteType: this.favoriteType, statusUpdateCallback: this.statusUpdateCallback});
    }

    private updateMenuOptions(): void {
        this.menuOptions = [
            [
                {label: 'Update Status'}
            ]
        ];
    }
}

