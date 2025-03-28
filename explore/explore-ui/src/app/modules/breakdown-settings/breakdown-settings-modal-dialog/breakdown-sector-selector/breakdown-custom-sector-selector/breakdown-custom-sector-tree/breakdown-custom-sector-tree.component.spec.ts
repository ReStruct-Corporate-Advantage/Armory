import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BreakdownCustomSectorTreeComponent} from './breakdown-custom-sector-tree.component';
import {BehaviorSubject, of} from 'rxjs';
import {FavoriteTreeService} from '../../../../../favorite/service/favorite-tree.service';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { FavoriteConstants } from '@constants/favorite.constants';
import { FavoriteTreeGenerationUtils } from '../../../../../favorite/utils/favorite-tree-generation.utils';

describe('BreakdownCustomSectorTreeComponent', () => {
    let component: BreakdownCustomSectorTreeComponent;
    let fixture: ComponentFixture<BreakdownCustomSectorTreeComponent>;
    const ownerSubject$ = new BehaviorSubject<string>(null);
    const favoriteTreeServiceMock = {
        getFullFavoriteTreeData$: jest.fn()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [BreakdownCustomSectorTreeComponent],
            providers: [{provide: FavoriteTreeService, useValue: favoriteTreeServiceMock}],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(BreakdownCustomSectorTreeComponent);
        component = fixture.componentInstance;
        component.owner$ = ownerSubject$;
        fixture.detectChanges();
    });

    it('Test generate selections', () => {
        jest.spyOn(component, 'createFavoriteTree$' as any).mockReturnValue(
            of([{label: 'Test Node'}, {label: 'Test Node 2'}])
        );
        ownerSubject$.next('simsingh');
        expect(component.sectorSelections).toEqual([{label: 'Test Node'}, {label: 'Test Node 2'}]);
        jest.spyOn(component, 'createFavoriteTree$' as any).mockReturnValue(
            of([])
        );
        ownerSubject$.next('');
        expect(component.sectorSelections).toEqual([]);
    });

    it('should set showStatusBadge to true if favoriteTreeOwner is ADMIN_USER', () => {
        jest.spyOn(favoriteTreeServiceMock, 'getFullFavoriteTreeData$').mockReturnValue(of([{}, [], []]));
        ownerSubject$.next(FavoriteConstants.ADMIN_USER);
    
        component.createFavoriteTree$(FavoriteConstants.ADMIN_USER).subscribe();
    
        expect(component.showStatusBadge).toBe(true);
    });
    
    it('should call getFullFavoriteTreeData$ with correct parameters', () => {
        const favoriteTreeOwner = 'testOwner';
        const favType = 'testFavType';
        const folderType = 'testFolderType';
        component.favType = favType;
        component.folderType = folderType;
    
        const getFullFavoriteTreeDataSpy = jest.spyOn(favoriteTreeServiceMock, 'getFullFavoriteTreeData$').mockReturnValue(of([{}, [], []]));
    
        component.createFavoriteTree$(favoriteTreeOwner).subscribe();
    
        expect(getFullFavoriteTreeDataSpy).toHaveBeenCalledWith(favoriteTreeOwner, favType, folderType, false);
    });
    
    it('should return the correct tree data', () => {
        const favoriteTreeOwner = 'testOwner';
        const favType = 'testFavType';
        const folderType = 'testFolderType';
        component.favType = favType;
        component.folderType = folderType;
    
        const mockTreeData = [{ label: 'Test Node' }, { label: 'Test Node 2' }];
        jest.spyOn(favoriteTreeServiceMock, 'getFullFavoriteTreeData$').mockReturnValue(of([{}, [], []]));
        jest.spyOn(FavoriteTreeGenerationUtils, 'createFavoriteTree').mockReturnValue(mockTreeData);
    
        component.createFavoriteTree$(favoriteTreeOwner).subscribe((treeData) => {
            expect(treeData).toEqual(mockTreeData);
        });
    });
});
