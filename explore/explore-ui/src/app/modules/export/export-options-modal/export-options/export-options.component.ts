import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {ExportConfig} from '@interfaces/export-config.interface';
import {PDFExportConfig} from '@models/export/pdf-export-config.model';
import {ExcelExportConfig} from '@models/export/excel-export-config.model';
import {ExportComposite} from '@models/export/export-composite/export-composite.model';

/**
 * Export Options Component
 *
 * @example
 *  <app-export-options [exportConfig]="exportConfig"></app-export-options>
 */
@Component({
    selector: 'app-export-options',
    templateUrl: './export-options.component.html'
})
export class ExportOptionsComponent implements OnInit, OnChanges {
    @Input() exportConfig: ExportConfig;
    @Input() horizontalView = false;
    @Input() exportComposite: ExportComposite;
    isPDFExportConfig = false;
    isExcelExportConfig = false;

    /**
     * Init hook
     */
    ngOnInit(): void {
        this.setExportConfigFlags();
    }


    ngOnChanges(changes: SimpleChanges): void {
        // If there's a change to the exportConfig passed in and they're not the same configType, then change the flags to show the correct options
        if (changes.exportConfig && changes.exportConfig.previousValue && (changes.exportConfig.previousValue.configType !== changes.exportConfig.currentValue.configType)) {
            this.setExportConfigFlags();
        }
    }

    setExportConfigFlags(): void {
        this.isPDFExportConfig = this.exportConfig instanceof PDFExportConfig;
        this.isExcelExportConfig = this.exportConfig instanceof ExcelExportConfig;
    }
}
