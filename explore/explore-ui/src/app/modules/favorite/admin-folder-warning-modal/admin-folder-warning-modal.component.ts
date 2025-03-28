import {Component, Input} from '@angular/core';
import {CoreCommonConstants, CoreFavoriteConstants, FavoriteDisplayEnum, ModalDirective} from '@blk/explore-ui-core';
import {AuxButtonTypeEnum, AuxRadioInterface} from '@blk/aladdin-angular-components';
import { SavableFavoriteChange } from '@services/favorite-change-detection/favorite-change-detection.service';
import { SharedModalService } from '../service/shared-modal.service';

@Component({
    selector: 'app-admin-folder-warning-modal',
    templateUrl: './admin-folder-warning-modal.component.html',
    styleUrls: ['./admin-folder-warning-modal.component.scss']
})
export class AdminFolderWarningModalComponent extends ModalDirective<boolean> {
    
    readonly AuxButtonTypeEnum = AuxButtonTypeEnum;
    readonly CoreCommonConstants = CoreCommonConstants;
    readonly CoreFavoriteConstants = CoreFavoriteConstants;
    isFolderStructureModalOpen = false;
    // Favorite that is being saved
    @Input() favoriteChange: SavableFavoriteChange;
    saveOptions: AuxRadioInterface[];
    @Input()
    favoriteDisplayType: FavoriteDisplayEnum;

    constructor(private sharedModalService: SharedModalService) {
        super();
    }

    openFolderStructureModal(): void {
        this.sharedModalService.openFolderStructureModal(this);
    }
    
    closeFolderStructureModal(selectedSavingUser: string): void {
      this.sharedModalService.closeFolderStructureModal(this, selectedSavingUser);
    }
}
