import {Component, Input, OnInit} from '@angular/core';
import {
    AuxButtonTypeEnum,
    AuxTextAreaValueChangedDetailInterface,
    AuxTextInputValueChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {CommonUtils, CoreCommonConstants, ModalDirective} from '@blk/explore-ui-core';
import {SaveFavoriteVersionDetailsAndSummary} from '@models/favorite-version/favorite-version-log.interface';
import {isNil} from 'lodash';
import {BehaviorSubject} from 'rxjs';
import {FavoriteVersionConstants} from '../../favorite-version.constants';
import {SavableFavoriteChange} from '@services/favorite-change-detection/favorite-change-detection.service';

@Component({
    selector: 'app-single-layer-save-summary-modal',
    templateUrl: './single-layer-save-summary-modal.component.html',
    styleUrls: ['./single-layer-save-summary-modal.component.scss']
})
/**
 * SingleLayerSaveSummaryModalComponent is common component used for saving the reason for new versions of Favorite.
 */
export class SingleLayerSaveSummaryModalComponent extends ModalDirective<boolean> implements OnInit {
    readonly AuxButtonTypeEnum = AuxButtonTypeEnum;
    readonly CoreCommonConstants = CoreCommonConstants;
    readonly FavoriteVersionConstants = FavoriteVersionConstants;

    @Input() favType: string;

    // For bulk saving, we get favoritesTree passed in.
    // For individual saving, we get saveSummary passed in.
    @Input() favoritesTree: SavableFavoriteChange;
    @Input() saveSummary: SaveFavoriteVersionDetailsAndSummary;

    saveVersion: SaveFavoriteVersionDetailsAndSummary = {changeSummaryDetails: undefined, changeSummary: undefined};
    saveButtonDisabled$ = new BehaviorSubject(true);

    ngOnInit(): void {
        // Convert the favorite into titlecase.
        if (this.favType) {
            this.favType = CommonUtils.getInSentenceCase(this.favType);
        }
    }

    /**
     * Updates the save Details of Version
     */
    saveSummaryDetailsUpdated(event: CustomEvent<AuxTextInputValueChangedDetailInterface>): void {
        if (isNil(event)) {
            return;
        }
        this.saveVersion.changeSummaryDetails = String(event.detail.value);
    }

    /**
     * Updates the save summary of Version
     */
    saveSummaryUpdated(event: CustomEvent<AuxTextAreaValueChangedDetailInterface>): void {
        if (isNil(event)) {
            return;
        }
        this.saveVersion.changeSummary = String(event.detail.value);
        this.saveButtonDisabled$.next(!this.saveVersion.changeSummary);
    }

    updateFavoritesTreeWithSaveSummary(): void {
        // saveSummary does not exist for bulk saving eg> workspace/report saving.
        if (this.saveSummary) {
            this.saveSummary.changeSummary = this.saveVersion.changeSummary;
            this.saveSummary.changeSummaryDetails = this.saveVersion.changeSummaryDetails;
        } else {
            this.favoritesTree.changeSummary = this.saveVersion.changeSummary;
            this.favoritesTree.changeSummaryDetails = this.saveVersion.changeSummaryDetails;
        }

        this.closeModal(true);
    }

    cancelSaveSummaryInput(): void {
        this.closeModal(false);
    }

}
