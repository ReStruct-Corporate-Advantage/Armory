import {NgModule} from '@angular/core';
import {ColumnSetSettingsComponent} from './column-set-settings.component';
import {FactorBasedColumnSetSettingsComponent} from './factor-based-column-set-settings.component';
import {ExploreUiColumnOptionModule} from '@blk/explore-ui-column-option';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {ExploreUiCoreModule} from '@blk/explore-ui-core';
import {CommonModule} from '@angular/common';
import {LoadingModule} from '../../../modules/loading/loading.module';

@NgModule({
    declarations: [
        ColumnSetSettingsComponent,
        FactorBasedColumnSetSettingsComponent
    ],
    imports: [
        AladdinAngularComponentsModule,
        ExploreUiColumnOptionModule,
        ExploreUiCoreModule,
        CommonModule,
        LoadingModule
    ],
    exports: [
        ColumnSetSettingsComponent,
        FactorBasedColumnSetSettingsComponent
    ]
})
export class ColumnSetSettingsModule {}
