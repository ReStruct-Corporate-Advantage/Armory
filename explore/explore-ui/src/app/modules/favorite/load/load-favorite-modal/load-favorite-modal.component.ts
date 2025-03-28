import {Component, Input, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {CommonConstants} from '@constants/index';
import {AppStore} from '../../../../app.store';
import {LoadFavoriteAction} from '@models/favorite/load-favorite-action.model';
import {CoreFavoriteConstants, ModalDirective} from '@blk/explore-ui-core';
import {OptimizationDataService} from '../../../optimization/services/optimization-data.service';
import {FavoriteConstants} from '@constants/favorite.constants';
import {ModalStateActionInfo} from '@models/favorite/modal-state-action-info.interface';
import {takeUntil} from 'rxjs/operators';
import {ModalStateAction} from '@models/favorite/modal-state-action.enum';
import {ModalInvokeSource} from '@models/favorite/modal-invoke-source.enum';

/**
 * Load Favorite Modal Component
 */
@Component({
    selector: 'app-load-favorite-modal',
    templateUrl: './load-favorite-modal.component.html',
    styleUrls: ['./load-favorite-modal.component.scss']
})
export class LoadFavoriteModalComponent extends ModalDirective<ModalStateActionInfo> implements OnInit {

    @Input() optoSettings: boolean;
    favoriteSearchTermSubject$: Subject<string> = new Subject<string>();
    selectedFavoriteNode$: Subject<any> = new Subject<any>();
    loadFavoriteCallBack: Function;

    readonly CANCEL_TEXT = CommonConstants.BUTTON_TEXT.CANCEL;
    readonly OPTO_SETTINGS = FavoriteConstants.OPTO_SETTINGS;
    readonly OPTO_SETTINGS_FOLDER = FavoriteConstants.OPTO_SETTINGS_FOLDER;

    openLoadFavoriteModal$: BehaviorSubject<LoadFavoriteAction>;
    sourceUniqueId: string;
    favoriteType: string;
    source: ModalInvokeSource;
    showAladdinFavorites: boolean;

    readonly global$: Observable<string> = of(CoreFavoriteConstants.GLOBAL_USER);

    /**
     * constructor
     */
    constructor(private appStore: AppStore, private optimizationDataService: OptimizationDataService) {
        super();
        // create local openLoadFavoriteModal$ to pass favType and favTreeType down to favorite-tree
        this.openLoadFavoriteModal$ = this.appStore.openLoadFavoriteModal$;
    }

    ngOnInit(): void {
        this.loadFavoriteCallBack = this.loadFavoriteAndCloseModal;

        this.openLoadFavoriteModal$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(({type, source, sourceUniqueId, showAladdinFavorites}) => {
                this.sourceUniqueId = sourceUniqueId;
                this.favoriteType = type;
                this.source = source;
                this.showAladdinFavorites = showAladdinFavorites;
            });
    }

    /**
     * loads global fav and closes the modal
     */
    loadFavoriteAndCloseModal = (reportId: number|string, loadingMessage: string, forceRefresh?: boolean, isGlobalFavorite?: boolean): void => {
        this.optimizationDataService.loadFavoriteOptimzationSettings(reportId, loadingMessage, forceRefresh, isGlobalFavorite);
        this.closeModal();
    };

    onModalClosed(event?: ModalStateActionInfo) {
        this.closeModal(event ?? {
            reason: ModalStateAction.MODAL_CANCELED,
            sourceUniqueId: this.sourceUniqueId,
            favoriteType: this.favoriteType,
            source: this.source
        });
    }
}

