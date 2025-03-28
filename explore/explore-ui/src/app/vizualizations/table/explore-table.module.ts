import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ExploreTableComponent} from './explore-table/explore-table.component';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {BaseRightClickHandler} from './right-click-handler/base-right-click.handler';
import {SecurityBasedWidgetRightClickHandler} from './right-click-handler/security-based-widget-right-click.handler';
import {ReturnWidgetRightClickHandler} from './right-click-handler/return-widget-right-click.handler';
import {RightClickHandlerRegistry} from './right-click-handler/right-click-handler.registry';
import {ReturnSpriteletRightClickHandler} from './right-click-handler/return-spritelet-right-click.handler';
import {WIDGET_RIGHT_CLICK_HANDLER} from '../../modules/widget/widget.injectable.tokens';
import {PgsRightClickHandler} from './right-click-handler/pgs-right-click.handler';
import {ModellingSettingComponent} from './modelling-setting/modelling-setting.component';
import {CustomSectorModule} from '../../modules/custom-sector/custom-sector.module';
import {BreakdownModule} from '../../modules/breakdown/breakdown.module';
import {FactorWidgetRightClickHandler} from './right-click-handler/factor-widget-right-click.handler';
import {ExplorePivotTableComponent} from './explore-pivot-table/explore-pivot-table.component';
import {TableSearchComponent} from './table-search/table-search.component';
import { CommitmentRiskExcludedFundsTableComponent } from './commitment-risk-excluded-funds-table/commitment-risk-excluded-funds-table.component';

@NgModule({
    declarations: [
        ExploreTableComponent,
        ExplorePivotTableComponent,
        ModellingSettingComponent,
        TableSearchComponent,
        CommitmentRiskExcludedFundsTableComponent
    ],
    exports: [
        ExploreTableComponent,
        ExplorePivotTableComponent,
        ModellingSettingComponent,
        TableSearchComponent,
        CommitmentRiskExcludedFundsTableComponent
    ],
    imports: [
        CommonModule,
        AladdinAngularComponentsModule,
        CustomSectorModule,
        BreakdownModule
    ],
    providers: [
        {
            provide: WIDGET_RIGHT_CLICK_HANDLER, useValue: BaseRightClickHandler,
            multi: true
        },
        {
            provide: WIDGET_RIGHT_CLICK_HANDLER, useValue: SecurityBasedWidgetRightClickHandler,
            multi: true
        },
        {
            provide: WIDGET_RIGHT_CLICK_HANDLER, useValue: ReturnWidgetRightClickHandler,
            multi: true
        },
        {
            provide: WIDGET_RIGHT_CLICK_HANDLER, useValue: ReturnSpriteletRightClickHandler,
            multi: true
        },
        {
            provide: WIDGET_RIGHT_CLICK_HANDLER, useValue: PgsRightClickHandler,
            multi: true
        },
        {
            provide: WIDGET_RIGHT_CLICK_HANDLER, useValue: FactorWidgetRightClickHandler,
            multi: true
        },
        {
            provide: RightClickHandlerRegistry, useClass: RightClickHandlerRegistry,
        }
    ]
})
export class ExploreTableModule {
}
