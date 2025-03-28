import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {ExploreUiCoreModule} from '@blk/explore-ui-core';
import {FavoriteTreeComponent} from './load/favorite-tree/favorite-tree.component';
import {FavoriteUserSearchComponent} from './load/favorite/favorite-user-search/favorite-user-search.component';
import {SaveFavoriteModalComponent} from './modify/save-favorite-modal/save-favorite-modal.component';
import {FavoriteComponent} from './load/favorite/favorite.component';
import {LoadFavoriteModalComponent} from './load/load-favorite-modal/load-favorite-modal.component';
import {FavoriteTreeSaveModeComponent} from './modify/save-favorite-modal/favorite-tree-save-mode/favorite-tree-save-mode.component';
import {DeleteFavoriteModalComponent} from './modify/delete-favorite-modal/delete-favorite-modal.component';
import {FavoriteTreeDeleteModeComponent} from './modify/delete-favorite-modal/favorite-tree-delete-mode/favorite-tree-delete-mode.component';
import { SaveReportModalComponent } from './save-report-modal/save-report-modal.component';
import { RootFavoriteItemComponent } from './nested-favorite-changes/root-favorite-item/root-favorite-item.component';
import { FavoriteChangesComponent } from './nested-favorite-changes/favorite-changes/favorite-changes.component';
import { SaveDetailComponent } from './nested-favorite-changes/save-detail/save-detail.component';
import { FavoriteChangeItemComponent } from './nested-favorite-changes/favorite-changes/favorite-change-item/favorite-change-item.component';
import { FolderStructureModalComponent } from './nested-favorite-changes/save-detail/folder-structure-modal/folder-structure-modal.component';
import {FolderFavoriteTreeComponent} from './nested-favorite-changes/save-detail/folder-structure-modal/folder-favorite-tree/folder-favorite-tree.component';
import { SaveWorkspaceModalComponent } from './save-workspace-modal/save-workspace-modal.component';
import { WorkpadChangeDetailComponent } from './save-workspace-modal/workpad-change-detail/workpad-change-detail.component';
import {FavoriteChangeDetectionService} from '@services/favorite-change-detection/favorite-change-detection.service';
import {FavoritePermissionComponent} from './nested-favorite-changes/save-detail/folder-structure-modal/favorite-permission/favorite-permission.component';
import {BulkSavingHandlerService} from './service/bulk-saving-handler.service';
import {ConflictingFavoritesWarningComponent} from './conflicting-favorites-warning/conflicting-favorites-warning.component';
import {LoadingModule} from '../loading/loading.module';
import { AdminOverwriteWarningModalComponent } from './admin-overwrite-warning-modal/admin-overwrite-warning-modal.component';
import { AdminFolderWarningModalComponent } from './admin-folder-warning-modal/admin-folder-warning-modal.component';
import { FavoriteVersionModule } from '../favorite-version/favorite-version.module';
import { FavoritePermissionGroupComponent } from './modify/favorite-permission-group/favorite-permission-group.component';
import {FavoriteStatusModalComponent} from './modify/favorite-status-modal/favorite-status-modal.component';
import { SharedFavoriteStatusBadgeComponent } from './shared-favorite-status-badge/shared-favorite-status-badge.component';

@NgModule({
    declarations: [
        FavoriteComponent,
        FavoriteTreeComponent,
        FavoriteTreeSaveModeComponent,
        FavoriteTreeDeleteModeComponent,
        FavoriteUserSearchComponent,
        SaveFavoriteModalComponent,
        FolderStructureModalComponent,
        FolderFavoriteTreeComponent,
        DeleteFavoriteModalComponent,
        LoadFavoriteModalComponent,
        FavoritePermissionComponent,
        SaveReportModalComponent,
        RootFavoriteItemComponent,
        FavoriteChangesComponent,
        SaveDetailComponent,
        FavoriteChangeItemComponent,
        SaveWorkspaceModalComponent,
        WorkpadChangeDetailComponent,
        ConflictingFavoritesWarningComponent,
        AdminOverwriteWarningModalComponent,
        AdminFolderWarningModalComponent,
        FavoritePermissionGroupComponent,
        FavoriteStatusModalComponent,
        SharedFavoriteStatusBadgeComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: [FavoriteChangeDetectionService, BulkSavingHandlerService],
    imports: [
        CommonModule,
        AladdinAngularComponentsModule,
        ExploreUiCoreModule,
        FavoriteVersionModule,
        LoadingModule
    ],
    exports: [
        FavoriteComponent,
        FavoriteTreeComponent,
        SaveFavoriteModalComponent,
        FolderStructureModalComponent,
        FolderFavoriteTreeComponent,
        DeleteFavoriteModalComponent,
        LoadFavoriteModalComponent,
        FavoriteUserSearchComponent,
        SaveReportModalComponent,
        SaveWorkspaceModalComponent,
        FavoriteStatusModalComponent,
        SharedFavoriteStatusBadgeComponent
    ]
})
export class FavoriteModule {
}
