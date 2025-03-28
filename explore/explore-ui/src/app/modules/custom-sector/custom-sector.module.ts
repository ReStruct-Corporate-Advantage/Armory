import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CustomSectorBuilderComponent} from './custom-sector-builder/custom-sector-builder.component';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {SectorRuleBuilderModalComponent} from './sector-rule-builder-modal-dialog/sector-rule-builder-modal.component';
import {SharedModule} from '../../shared/shared.module';
import {CustomFilterComponent} from './custom-filter/custom-filter.component';
import {FavoriteModule} from '../favorite/favorite.module';
import {FundSectoringRuleBuilderComponent} from './sector-rule-builder-modal-dialog/fund-sectoring-rule-builder/fund-sectoring-rule-builder.component';
import {FundSectoringRuleTableComponent} from './sector-rule-builder-modal-dialog/fund-sectoring-rule-builder/fund-sectoring-rule-table/fund-sectoring-rule-table.component';
import {FundSectoringUploadCusipsComponent} from './sector-rule-builder-modal-dialog/fund-sectoring-rule-builder/fund-sectoring-upload-cusips/fund-sectoring-upload-cusips.component';
import {ExploreUiBreakdownModule} from '@blk/explore-ui-breakdown';
import {DialogModule, FAVORITE_SERVICE_TOKEN} from '@blk/explore-ui-core';
import {FavoriteService} from '@services/favorite';
import {LoadingModule} from '../loading/loading.module';
import { FavoriteVersionModule } from '../favorite-version/favorite-version.module';

@NgModule({
    declarations: [
        CustomSectorBuilderComponent,
        SectorRuleBuilderModalComponent,
        CustomFilterComponent,
        FundSectoringRuleBuilderComponent,
        FundSectoringRuleTableComponent,
        FundSectoringUploadCusipsComponent
    ],
    imports: [
        CommonModule,
        AladdinAngularComponentsModule,
        DialogModule,
        SharedModule,
        FavoriteModule,
        FavoriteVersionModule,
        ExploreUiBreakdownModule,
        LoadingModule,
        FavoriteVersionModule
    ],
    providers: [
        {provide: FAVORITE_SERVICE_TOKEN, useClass: FavoriteService}
    ],
    exports: [CustomSectorBuilderComponent, CustomFilterComponent]
})
export class CustomSectorModule {
}
