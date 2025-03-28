import {Component} from '@angular/core';
import {ReportContainerComponent} from '../../main/report-container/report-container.component';

/**
 * Report Floating Toolbar Component
 *
 * @example
 *  <app-reports-floating-toolbar *ngIf="scrollPastReportSection"></app-reports-floating-toolbar>
 */
@Component({
    selector: 'app-reports-floating-toolbar',
    templateUrl: './reports-floating-toolbar.component.html',
    styleUrls: ['./reports-floating-toolbar.component.scss']
})
export class ReportsFloatingToolbarComponent extends ReportContainerComponent {
}
