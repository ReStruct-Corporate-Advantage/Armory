import {CommonModule} from '@angular/common';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {ExploreUiCoreModule} from '@blk/explore-ui-core';
import {SingleLayerSaveSummaryModalComponent} from './single-layer-save-summary-modal/single-layer-save-summary-modal.component';
import {MultiLayerSaveSummaryModalComponent} from './multi-layer-save-summary-modal/multi-layer-save-summary-modal.component';

@NgModule({
    declarations: [
        SingleLayerSaveSummaryModalComponent,
        MultiLayerSaveSummaryModalComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        CommonModule,
        AladdinAngularComponentsModule,
        ExploreUiCoreModule
    ],
    exports: [
        SingleLayerSaveSummaryModalComponent,
        MultiLayerSaveSummaryModalComponent
    ]
})
export class SaveSummaryModule {
}
