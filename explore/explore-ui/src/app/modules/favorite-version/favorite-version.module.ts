import {CommonModule} from '@angular/common';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {LoadingModule} from '../loading/loading.module';
import {ExploreUiCoreModule} from '@blk/explore-ui-core';
import {FavoriteVersionLogModalComponent} from './favorite-version-log-modal/favorite-version-log-modal.component';
import {ViewUsageModalComponent} from './view-usage-modal/view-usage-modal.component';
import {ViewUsageCustomOverlayComponent} from './view-usage-modal/view-usage-custom-overlay/view-usage-custom-overlay.component';
import {SaveSummaryModule} from './save-summary/save-summary.module';

@NgModule({
    declarations: [
        FavoriteVersionLogModalComponent,
        ViewUsageModalComponent,
        ViewUsageCustomOverlayComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        CommonModule,
        AladdinAngularComponentsModule,
        ExploreUiCoreModule,
        LoadingModule,
        SaveSummaryModule
    ],
    exports: [
        SaveSummaryModule,
        FavoriteVersionLogModalComponent,
        ViewUsageModalComponent
    ]
})
export class FavoriteVersionModule {
}
