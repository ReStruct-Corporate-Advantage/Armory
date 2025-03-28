import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {EfficientFrontierComponent} from './components/efficient-frontier/efficient-frontier.component';
import {EfficientFrontierChartComponent} from './components/efficient-frontier-chart/efficient-frontier-chart.component';
import { HighchartsChartModule } from 'highcharts-angular';

@NgModule({
    imports: [
        CommonModule,
        AladdinAngularComponentsModule,
        HighchartsChartModule
    ],
    declarations: [
        EfficientFrontierChartComponent,
        EfficientFrontierComponent
    ],
    exports: [
        EfficientFrontierChartComponent,
        EfficientFrontierComponent
    ]
})
export class ExploreEfficientFrontierModule {
}
