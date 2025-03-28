import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoriteMenuComponent } from './favorite-menu.component';
import {AbstractFavoriteConfig} from '../../models/abstract-favorite-config.model';
import {CoreFavoriteStore} from '../../stores';

describe('FavoriteMenuComponent', () => {
  let component: FavoriteMenuComponent;
  let fixture: ComponentFixture<FavoriteMenuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FavoriteMenuComponent]
    });
    fixture = TestBed.createComponent(FavoriteMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

    it('should call CoreFavoriteStore.favStatusUpdateAction$.next with correct parameters on menu click', () => {
        const favorite: AbstractFavoriteConfig = { id: 1, title: 'Test Favorite' } as AbstractFavoriteConfig;
        const favoriteType = 'testType';
        const statusUpdateCallback = jest.fn();

        component.favorite = favorite;
        component.favoriteType = favoriteType;
        component.statusUpdateCallback = statusUpdateCallback;

        const spy = jest.spyOn(CoreFavoriteStore.favStatusUpdateAction$, 'next');

        component.onMenuClicked();

        expect(spy).toHaveBeenCalledWith({ favorite, favoriteType, statusUpdateCallback });
    });
});
