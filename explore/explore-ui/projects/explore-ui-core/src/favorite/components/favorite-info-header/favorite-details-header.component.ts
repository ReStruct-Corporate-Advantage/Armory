import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {AuxValuePairLabelPositionEnum} from '@blk/aladdin-angular-components';
import {FavoriteOwnerEnum} from '../../enums';
import {CoreFavoriteUtils} from '../../utils';

@Component({
    selector: 'explore-core-favorite-details-header',
    templateUrl: './favorite-details-header.component.html',
    styleUrls: ['./favorite-details-header.component.scss']
})
export class FavoriteDetailsHeaderComponent implements OnInit, OnChanges {
    readonly AuxValuePairLabelPositionEnum = AuxValuePairLabelPositionEnum;
    readonly FavoriteOwnerEnum = FavoriteOwnerEnum;

    @Input() title: string;
    @Input() owner: string;
    @Input() displayType: string;

    ownerDisplayName: string;
    ownerType: FavoriteOwnerEnum;
    favoriteOwnerPrefix: {[key in FavoriteOwnerEnum]: string} = {
        [FavoriteOwnerEnum.SELF]: 'My',
        [FavoriteOwnerEnum.ADMIN]: 'Enterprise',
        [FavoriteOwnerEnum.GLOBAL]: 'Aladdin',
        [FavoriteOwnerEnum.TEAM]: 'Team',
        [FavoriteOwnerEnum.NONE]: ''
    };

    ngOnInit() {
        this.ownerDisplayName = CoreFavoriteUtils.getFavoriteOwnerDisplayName(this.owner);
        this.ownerType = CoreFavoriteUtils.getFavoriteOwnerType(this.owner);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.owner?.currentValue !== changes.owner?.previousValue) {
            this.ownerType = CoreFavoriteUtils.getFavoriteOwnerType(changes.owner?.currentValue);
            this.ownerDisplayName = CoreFavoriteUtils.getFavoriteOwnerDisplayName(changes.owner?.currentValue);
        }
    }
}
