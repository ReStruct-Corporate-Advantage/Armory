import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {AuxAdvancedTreeListInterface} from '@blk/aladdin-angular-components';
import {concatMap, filter, map, takeUntil} from 'rxjs/operators';
import {FavoriteTreeService} from '../../../../../favorite/service/favorite-tree.service';
import {BaseBreakdownSectorTree} from '../../base-breakdown-sector-tree';
import {FavoriteTreeGenerationUtils} from '../../../../../favorite/utils/favorite-tree-generation.utils';
import {isNil} from 'lodash';
import { FavoriteConstants } from '@constants/favorite.constants';

/**
 * Component to show custom sector favorites as sector selections for particular user
 */
@Component({
    selector: 'app-breakdown-custom-sector-tree',
    templateUrl: './breakdown-custom-sector-tree.component.html',
    styleUrls: []
})
export class BreakdownCustomSectorTreeComponent extends BaseBreakdownSectorTree implements OnInit {

    @Input()
    owner$: Observable<string>;

    @Input()
    favType: string;

    @Input()
    folderType: string;

    sectorSelections: AuxAdvancedTreeListInterface[] = [];

    showStatusBadge: boolean = false;

    constructor(private favoriteTreeService: FavoriteTreeService, protected changeDetectorRef: ChangeDetectorRef) {
        super(changeDetectorRef);
    }

    ngOnInit() {
        this.owner$
            .pipe(
                takeUntil(this.ngUnsubscribe),
                filter((favoriteTreeOwner) => !isNil(favoriteTreeOwner)),
                concatMap((favoriteTreeOwner: string) => this.createFavoriteTree$(favoriteTreeOwner))
            )
            .subscribe((treeData: AuxAdvancedTreeListInterface[]) => {
                if (treeData) {
                    this.sectorSelections = treeData;
                } else {
                    this.sectorSelections = [];
                }
                this.changeDetectorRef.markForCheck();
            });
    }

    createFavoriteTree$(favoriteTreeOwner: string): Observable<AuxAdvancedTreeListInterface[]> {
        if (favoriteTreeOwner === FavoriteConstants.ADMIN_USER) {
            this.showStatusBadge = true;
        }
        return this.favoriteTreeService.getFullFavoriteTreeData$(favoriteTreeOwner, this.favType, this.folderType, false)
            .pipe(
                map(([favoriteFolder, slimFavorites, adhocPorts]) => {
                    return FavoriteTreeGenerationUtils.createFavoriteTree(favoriteFolder, favoriteTreeOwner, this.favType, this.folderType, null, slimFavorites, false, false);
                })
            );
    }

    /**
     * @inheritDoc
     */
    getSourceData(): AuxAdvancedTreeListInterface[] {
        return this.sectorSelections;
    }

}
