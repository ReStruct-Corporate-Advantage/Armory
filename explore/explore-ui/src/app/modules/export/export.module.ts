import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ExportOptionsModalComponent} from './export-options-modal/export-options-modal.component';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {ExportOptionsComponent} from './export-options-modal/export-options/export-options.component';
import {PdfExportOptionsComponent} from './export-options-modal/export-options/pdf-export-options/pdf-export-options.component';
import {ExportMenuComponent} from './export-menu/export-menu.component';
import {ExcelExportOptionsComponent} from './export-options/excel-export-options/excel-export-options.component';
import {SharedModule} from '../../shared/shared.module';
import {ApiRequestModalComponent} from './api-request-modal/api-request-modal.component';
import { WidgetServiceRegistry } from '@services/widget/widget-service-registry';

@NgModule({
    declarations: [ExportOptionsModalComponent, ExportOptionsComponent, PdfExportOptionsComponent, ExcelExportOptionsComponent, ExportMenuComponent, ApiRequestModalComponent],
    exports: [
        ExportOptionsModalComponent,
        ExportMenuComponent,
        ExportOptionsComponent,
        ApiRequestModalComponent
    ],
    imports: [
        CommonModule,
        AladdinAngularComponentsModule,
        SharedModule
    ],
    providers: [WidgetServiceRegistry]
})
export class ExportModule {
}
