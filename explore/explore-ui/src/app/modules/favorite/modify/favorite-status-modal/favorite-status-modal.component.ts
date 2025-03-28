import {Component, Input, OnInit} from '@angular/core';
import {AbstractFavoriteConfig, CoreFavoriteConstants, FavoriteStatus, ModalDirective} from '@blk/explore-ui-core';
import {CommonConstants} from '@constants/common.constants';
import {AuxRadioInterface} from '@blk/aladdin-angular-components';
import {FavoriteService} from '@services/favorite';
import {NotificationService} from '@services/notification';
import {takeUntil} from 'rxjs/operators';

@Component({
    selector: 'app-favorite-status-modal',
    templateUrl: './favorite-status-modal.component.html',
    styleUrls: ['./favorite-status-modal.component.scss']
})
export class FavoriteStatusModalComponent extends ModalDirective implements OnInit {

    readonly UPDATE_TEXT: string = CommonConstants.BUTTON_TEXT.UPDATE;
    readonly CANCEL_TEXT: string = CommonConstants.BUTTON_TEXT.CANCEL;

    @Input()
    favorite: AbstractFavoriteConfig;

    @Input()
    favoriteType: string;

    @Input()
    statusUpdateCallback: (status: FavoriteStatus) => void;

    selectedStatus: FavoriteStatus;

    statusOptions: AuxRadioInterface[];

    constructor(private favoriteService: FavoriteService, private notificationService: NotificationService) {
        super();
    }

    ngOnInit() {
        this.selectedStatus = this.favorite?.statusTag || CoreFavoriteConstants.FAVORITE_STATUS.MATURE;
        this.createStatusRadioGrpOptions();
    }

    /**
     * Create the options for the status radio group
     * @private
     */
    private createStatusRadioGrpOptions() {
        this.statusOptions = [
            {
                label: 'Mature',
                eventData: CoreFavoriteConstants.FAVORITE_STATUS.MATURE,
                checked: this.selectedStatus?.toLowerCase() === CoreFavoriteConstants.FAVORITE_STATUS.MATURE
            },
            {
                label: 'Under Review',
                eventData: CoreFavoriteConstants.FAVORITE_STATUS.UNDER_REVIEW,
                checked: this.selectedStatus?.toLowerCase() === CoreFavoriteConstants.FAVORITE_STATUS.UNDER_REVIEW
            },
            {
                label: 'Decommissioned',
                eventData: CoreFavoriteConstants.FAVORITE_STATUS.DECOMMISSIONED,
                checked: this.selectedStatus?.toLowerCase() === CoreFavoriteConstants.FAVORITE_STATUS.DECOMMISSIONED
            }
        ];
    }

    updateButtonClicked() {
        this.favoriteService.updateFavorite$(this.favorite, this.selectedStatus, this.favoriteType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
            () => {
                if (this.statusUpdateCallback) {
                    this.statusUpdateCallback(this.selectedStatus);
                }
                this.closeModal();
                this.notificationService.success('Favorite status updated successfully');
            },
            (error) => {
                this.notificationService.error('Favorite status update failed: ' + error);
            }
        );
    }

    statusChanged(option: AuxRadioInterface): void {
        this.selectedStatus = option.eventData;
    }

}
