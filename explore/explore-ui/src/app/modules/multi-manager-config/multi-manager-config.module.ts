import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {MultiManagerConfigComponent} from "./multi-manager-config.component";
import {ExploreTableModule} from "../../vizualizations/table";
import {LoadingModule} from "../loading/loading.module";
import {DecisionBenchmarkService} from "@services/widget/decision-benchmark-service";
import { PortSearchEditorComponent } from './port-search-editor-comp/port-search-editor.component';
import {PortfolioSearchModule} from "@blk/explore-ui-portfolio-search";
import {DialogModule} from "@blk/explore-ui-core";

@NgModule({
    declarations: [MultiManagerConfigComponent, PortSearchEditorComponent],
    imports: [
        CommonModule,
        AladdinAngularComponentsModule,
        ExploreTableModule,
        LoadingModule,
        PortfolioSearchModule,
        DialogModule
    ],
    exports: [
        MultiManagerConfigComponent,
    ],
    providers: [DecisionBenchmarkService]
})
export class MultiManagerConfigModule {
}
