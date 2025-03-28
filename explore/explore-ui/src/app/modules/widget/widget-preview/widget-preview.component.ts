import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Widget} from '@models/widget/widget.model';
import {Report} from '@models/workspace/report.model';
import {Portfolio} from '@models/portfolio/portfolio.model';

/**
 * Component to preview widget, to verify the changes made in widget settings
 */
@Component({
    selector: 'app-widget-preview',
    templateUrl: './widget-preview.component.html',
    styleUrls: ['./widget-preview.component.scss']
})
export class WidgetPreviewComponent {

    @Input() widget: Widget;

    @Input() portfolio: Portfolio;

    @Input() report: Report;

    @Output()
    updateWidget = new EventEmitter();
}
