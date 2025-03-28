import {CoreFavoriteConstants, SubscribableComponent} from '@blk/explore-ui-core';
import {
    ChangeDetectorRef,
    Directive,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges
} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {FavoriteCallback} from '@models/favorite/load-favorite-action.model';
import {AuxAdvancedTreeListInterface, AuxAdvancedTreeListSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {FavoriteTreeService} from './service/favorite-tree.service';
import {concatMap, filter, map, takeUntil} from 'rxjs/operators';
import {AppUtils} from '@utils/app.utils';
import {FavoriteConstants} from '@constants/favorite.constants';
import {CompositionConstants} from '@constants/composition.constants';
import {FavoriteUtils} from '@utils/favorite.utils';
import {FavoriteTreeGenerationUtils} from './utils/favorite-tree-generation.utils';
import {cloneDeep, isEmpty, isNil} from 'lodash';
import {FavoriteTreeUtils} from './utils/favorite-tree.utils';
import {TooltipUtils} from '@utils/tooltip.utils';

@Directive()
export class FavoriteTreeDirective extends SubscribableComponent implements OnInit, OnChanges {

    favoriteStatusConstants = CoreFavoriteConstants.FAVORITE_STATUS;

    @Input() protected favType: string;
    @Input() protected favTreeType: string;
    @Input() protected favDisplayName: string;
    protected readonly TooltipUtils = TooltipUtils;

    readonly advanceTreeCustomStyle = FavoriteTreeUtils.advanceTreeCustomStyle;

    // to enableSaveButton in save-favorite-modal (on save mode)
    protected isFolderTreeLoaded = false
    @Output() folderTreeLoaded = new EventEmitter<boolean>();

    // to update the tree dynamically based on owner
    @Input() protected favoriteTreeOwner$: Observable<string>;
    protected favoriteTreeOwner: string;

    // to update selectedFavoriteNode in the parent component (on save mode)
    @Input() protected selectedFavoriteNode$: Subject<AuxAdvancedTreeListInterface>;

    // true for save favorite tree
    protected saveMode: boolean;
    // if tree should be on expanded mode
    protected isExpanded: boolean;

    /** only for load favorite */
    @Input() protected favoriteSearchTermSubject$?: Observable<string>;
    @Input() protected loadFavoriteCallBack?: FavoriteCallback;

    /** variables for aux-tree data */
        // cloned allFavoriteTreeData for filter
    filteredFavoriteTreeData: AuxAdvancedTreeListInterface[] = [];
    // default tree data without filter
    allFavoriteTreeData: AuxAdvancedTreeListInterface[] = [];
    // if selectedOwner is global
    isOwnerGlobal: boolean;

    /**
     * constructor
     */
    constructor(protected favoriteTreeService: FavoriteTreeService, protected changeDetectorRef: ChangeDetectorRef) {
        super();
    }

    /**
     * on changes hook
     */
    ngOnChanges(changes: SimpleChanges) {
        // NOTE: Adding the check for 'firstChange'; so to avoid unnecessary calls to backend
        if (!this.saveMode && !changes.favType?.firstChange && changes.favType?.currentValue !== changes.favType?.previousValue) {
            // refresh favorite tree in load modal if the fav type gets changed
            // applies to what-if portfolio favorite types
            this.generateFavTreeForOwner();
        }
    }

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        // subscribe to favoriteSearchTerm$ and feed the filtered data to aux-tree-list
        if (this.favoriteSearchTermSubject$) {
            this.favoriteSearchTermSubject$
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe((favoriteSearchTerm: string) => {
                    if (favoriteSearchTerm) {
                        this.filteredFavoriteTreeData = this.createFilteredTreeData(cloneDeep(this.allFavoriteTreeData), favoriteSearchTerm);
                    } else {
                        this.filteredFavoriteTreeData = this.allFavoriteTreeData;
                    }
                    this.changeDetectorRef.markForCheck();
                });
        }

        // subscribe to favoriteTreeOwner$ and generate tree with the username from the response
        this.generateFavTreeForOwner();
    }

    /**
     * create filtered tree data list
     */
    private createFilteredTreeData(treeDataList: AuxAdvancedTreeListInterface[], searchTerm: string): AuxAdvancedTreeListInterface[] {
        const filteredTreeDataList = [];

        for (const treeData of treeDataList) {
            if (!treeData.children && treeData.label.toLowerCase().includes(searchTerm)) {
                filteredTreeDataList.push(treeData);
            } else if (treeData.children) {
                const childrenOfTheTreeData = this.createFilteredTreeData(treeData.children, searchTerm);
                if (childrenOfTheTreeData && !isEmpty(childrenOfTheTreeData)) {
                    filteredTreeDataList.push(Object.assign({}, treeData, {
                        children: childrenOfTheTreeData,
                        isExpanded: true
                    }));
                }
            }
        }
        return filteredTreeDataList;
    }

    /**
     * exposed method to generate favorite tree for the owner
     */
    generateFavTreeForOwner(): void {
        this.favoriteTreeOwner$
            .pipe(
                takeUntil(this.ngUnsubscribe),
                filter((favoriteTreeOwner) => !isNil(favoriteTreeOwner)),
                concatMap((favoriteTreeOwner: string) => {
                    this.favoriteTreeOwner = favoriteTreeOwner;
                    if (this.saveMode) {
                        // Guardrail to prevent saving favorite on faulty state; disable save buttons until the favorite tree data is loaded.
                        this.isFolderTreeLoaded = false;
                        this.folderTreeLoaded.emit(false);
                    }
                    // Clear out filteredFavoriteTreeData to remove the stale favorite tree data.
                    this.filteredFavoriteTreeData = [];
                    this.changeDetectorRef.markForCheck();

                    this.isOwnerGlobal = favoriteTreeOwner === CoreFavoriteConstants.GLOBAL_USER;
                    const isAladdinTemplate = FavoriteUtils.isAladdinTemplate(this.saveMode, this.isOwnerGlobal, this.favType);

                    return this.createFavoriteTree$(favoriteTreeOwner, isAladdinTemplate);
                })
            )
            .subscribe((treeData: AuxAdvancedTreeListInterface[]) => {
                if (!treeData) {
                    return;
                }
                this.filteredFavoriteTreeData = this.allFavoriteTreeData = treeData;
                if (this.saveMode) {
                    this.isFolderTreeLoaded = true;
                    this.folderTreeLoaded.emit(true);
                }
                this.changeDetectorRef.markForCheck();
            });
    }

    private createFavoriteTree$(favoriteTreeOwner: string, isAladdinTemplate: boolean): Observable<AuxAdvancedTreeListInterface[]> {
        return this.favoriteTreeService.getFullFavoriteTreeData$(favoriteTreeOwner, this.favType, this.favTreeType, isAladdinTemplate)
            .pipe(
                map(([favoriteFolder, slimFavorites]) => {
                    return FavoriteTreeGenerationUtils.createFavoriteTree(favoriteFolder, favoriteTreeOwner, this.favType, this.favTreeType, this.favDisplayName, slimFavorites, this.saveMode, this.isExpanded);
                })
            );
    }

    /**
     * On favorite Selected
     */
    onFavoriteSelected(event: CustomEvent<AuxAdvancedTreeListSelectionChangedDetailInterface>): void {
        const node = event.detail.value[0];
        const isForceRefresh = AppUtils.isCtrlPressed(event);
        if (node.eventData.type !== FavoriteConstants.FOLDER && node.eventData.favoriteId) {
            // we need port name and title in case it's a what-if favorite
            const title = CompositionConstants.WHAT_IF_FAVORITE_TYPES.has(node.eventData.type)
                ? node.eventData.description + CompositionConstants.FAV_ID_DELIMITER + (node.eventData.originalLabel || node.label)
                : undefined;
            // load favorite on favorite node click
            this.loadFavoriteCallBack(node.eventData.favoriteId, 'Loading Favorite ' + this.favDisplayName, isForceRefresh, this.isOwnerGlobal, title, undefined, node.eventData.type);

            this.selectedFavoriteNode$.next(undefined);
        } else if (node.eventData.type === FavoriteConstants.BREAKDOWN_PRESET) {
            // specific case when a preset (portfolio-specific) breakdown is selected.  This is not an actual favorite but rather a placeholder
            this.loadFavoriteCallBack(undefined, 'Selected Preset Breakdown: ' + node.label, isForceRefresh, this.isOwnerGlobal, node.label, node.eventData.presetBreakdownId);

            this.selectedFavoriteNode$.next(undefined);
        }
    }
}
