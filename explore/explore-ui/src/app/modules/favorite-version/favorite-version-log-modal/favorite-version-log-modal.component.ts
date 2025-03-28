import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {CoreFavoriteConstants, CoreFavoriteVersioningStore, SubscribableComponent} from '@blk/explore-ui-core';
import {FavoriteVersionLogDetails} from '@models/favorite-version/favorite-version-log.interface';
import {FavoriteService} from '@services/favorite';
import moment from 'moment';
import {takeUntil} from 'rxjs';
import {AuxProgressIndicatorSizeEnum} from '@blk/aladdin-angular-components';

@Component({
    selector: 'app-favorite-version-log-modal',
    templateUrl: './favorite-version-log-modal.component.html',
    styleUrls: ['./favorite-version-log-modal.component.scss']
})
export class FavoriteVersionLogModalComponent extends SubscribableComponent implements OnInit {
    protected readonly AuxProgressIndicatorSizeEnum = AuxProgressIndicatorSizeEnum;

    @Input() favDisplayName: string;
    @Input() favoriteId: number;
    @Input() isOpen: boolean;
    @Input() loadFavoriteCallBack: Function;

    // all favorite versions, each element is a row in the table
    favoriteVersions: FavoriteVersionLogDetails[] = [];
    // version row clicked on by user
    selectedRow!: FavoriteVersionLogDetails;
    // enabled when a user clicks "...more>" to see the detailed summary
    showDetailedSummary = false;

    // set to true while fetching favorite versions
    isLoading = true;


    constructor(private favoriteService: FavoriteService, private changeDetector: ChangeDetectorRef) {
        super();
    }

    ngOnInit(): void {
        this.favoriteService.getFavoriteVersion$(this.favoriteId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((response: any) => {
            this.isLoading = false;
            if (response) {
                this.createFavoriteVersionData(response.data);
            } else {
                this.favoriteVersions = [];
            }
            this.changeDetector.markForCheck();
        });
    }

    createFavoriteVersionData(data: any[]): any[] {
        data.forEach((element) => {
            const favoriteVersion: FavoriteVersionLogDetails = {
                version: element.versionNumber,
                id: element.id,
                owner: element.owner,
                modifiedOn: element.creationTime ? moment(element.creationTime).local().tz(moment.tz.guess()).format('MM/DD/YYYY [at] HH:mm zz') : '',
                modifiedBy: element.creator,
                saveSummaryOnChanges: {
                    changeSummaryDetails: element.changeSummaryDetail,
                    changeSummary: element.changeSummary
                },
                versionId: element.currentFavoriteVersion
            };
            this.favoriteVersions.push(favoriteVersion);
        });
        return this.favoriteVersions.sort((a, b) => b.version - a.version);
    }

    closeModal(): void {
        CoreFavoriteVersioningStore.favoriteVersionLogAction$.next({id: null, type: null, isOpen: false});
    }

    showSaveSummary(data: FavoriteVersionLogDetails): void {
        this.selectedRow = data;
        this.showDetailedSummary = !this.showDetailedSummary;
        this.changeDetector.markForCheck();
    }

    hideSummary(): void {
        this.showDetailedSummary = !this.showDetailedSummary;
    }

    loadSelectedFavoriteVersion() {
        this.loadFavoriteCallBack(this.selectedRow.id, 'Loading Favorite ' + this.favDisplayName, false, this.selectedRow.owner === CoreFavoriteConstants.GLOBAL_USER, this.selectedRow.versionId);
        this.closeModal();
    }

    selectRow(data: FavoriteVersionLogDetails) {
        this.selectedRow = data;
    }
}
