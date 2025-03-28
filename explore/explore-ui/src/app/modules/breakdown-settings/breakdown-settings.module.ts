import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {BreakdownSettingsModalDialogComponent} from './breakdown-settings-modal-dialog/breakdown-settings-modal-dialog.component';
import {BreakdownSectorSelectorComponent} from './breakdown-settings-modal-dialog/breakdown-sector-selector/breakdown-sector-selector.component';
import {BreakdownTreeComponent} from './breakdown-settings-modal-dialog/breakdown-tree/breakdown-tree.component';
import {BreakdownOptionsComponent} from './breakdown-settings-modal-dialog/breakdown-options/breakdown-options.component';
import {NumericSectorOptionsComponent} from './breakdown-settings-modal-dialog/breakdown-options/numeric-sector-options/numeric-sector-options.component';
import {DateSectorOptionsComponent} from './breakdown-settings-modal-dialog/breakdown-options/date-sector-options/date-sector-options.component';
import {TimeSpanSectorOptionsComponent} from './breakdown-settings-modal-dialog/breakdown-options/time-span-sector-options/time-span-sector-options.component';
import {BreakdownSectorTreeComponent} from './breakdown-settings-modal-dialog/breakdown-sector-selector/breakdown-sector-tree/breakdown-sector-tree.component';
import {BreakdownCustomSectorSelectorComponent} from './breakdown-settings-modal-dialog/breakdown-sector-selector/breakdown-custom-sector-selector/breakdown-custom-sector-selector.component';
import {BreakdownCustomSectorTreeComponent} from './breakdown-settings-modal-dialog/breakdown-sector-selector/breakdown-custom-sector-selector/breakdown-custom-sector-tree/breakdown-custom-sector-tree.component';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {CustomSectorModule} from '../custom-sector/custom-sector.module';
import {FavoriteModule} from '../favorite/favorite.module';
import {WidgetModule} from '../widget/widget.module';
import {SharedModule} from '../../shared/shared.module';
import {FavoriteVersionModule} from '../favorite-version/favorite-version.module';

@NgModule({
    declarations: [BreakdownSettingsModalDialogComponent, BreakdownSectorSelectorComponent, BreakdownTreeComponent, BreakdownOptionsComponent, NumericSectorOptionsComponent, DateSectorOptionsComponent, TimeSpanSectorOptionsComponent, BreakdownSectorTreeComponent, BreakdownCustomSectorSelectorComponent, BreakdownCustomSectorTreeComponent],
    exports: [
        BreakdownSettingsModalDialogComponent
    ],
    imports: [
        CommonModule,
        AladdinAngularComponentsModule,
        CustomSectorModule,
        FavoriteModule,
        SharedModule,
        WidgetModule,
        FavoriteVersionModule
    ]
})
export class BreakdownSettingsModule {
}
