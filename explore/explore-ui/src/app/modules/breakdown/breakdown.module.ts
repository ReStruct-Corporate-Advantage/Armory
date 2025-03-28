import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {SharedModule} from '../../shared/shared.module';
import {CustomSectorModule} from '../custom-sector/custom-sector.module';
import {FavoriteModule} from '../favorite/favorite.module';
import {BreakdownPreviewComponent} from './breakdown-preview/breakdown-preview.component';
import {MultiLevelBreakdownComponent} from './breakdown-preview/multi-level-breakdown/multi-level-breakdown.component';
import {SingleLevelBreakdownComponent} from './breakdown-preview/single-level-breakdown/single-level-breakdown.component';
import {FavoriteVersionModule} from '../favorite-version/favorite-version.module';

@NgModule({
    declarations: [BreakdownPreviewComponent, SingleLevelBreakdownComponent, MultiLevelBreakdownComponent],
    exports: [BreakdownPreviewComponent],
    imports: [CommonModule, AladdinAngularComponentsModule, CustomSectorModule, FavoriteModule, SharedModule, FavoriteVersionModule]
})
export class BreakdownModule {
}
