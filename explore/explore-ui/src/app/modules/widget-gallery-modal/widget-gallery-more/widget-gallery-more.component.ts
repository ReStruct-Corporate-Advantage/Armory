import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ClickElemConstants, CoreWidgetConstants, WidgetConfig} from '@blk/explore-ui-core';
import {TelemetryClickService} from '@services/telemetry/telemetry-click.service';

@Component({
    selector: 'app-widget-gallery-more',
    templateUrl: './widget-gallery-more.component.html',
    styleUrls: ['./widget-gallery-more.component.scss']
})

/**
 * Component for Widget Gallery More View
 */
export class WidgetGalleryMoreComponent implements OnInit {

    isChartWidget: boolean;
    @Input() widgetMore: WidgetConfig;
    @Output() widgetMoreCreate = new EventEmitter<string>();
    @Output() closeMoreView = new EventEmitter<boolean>();

    constructor(private telemetryClickService: TelemetryClickService) {
    }

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        this.isChartWidget = this.widgetMore.chartingLib === CoreWidgetConstants.CHARTING_LIB.HIGHCHART;
    }

    createWidget(): void {
        this.telemetryClickService.reportBarTabPlusWidgetIconClick(this.widgetMore.title, ClickElemConstants.CONTEXT_PATH.PLUS_WIDGET.ADD_WIDGET_BUTTON_CLICK);
        this.widgetMoreCreate.emit(this.widgetMore.configType);
        this.moreViewOff(true);
    }

    moreViewOff(widgetAdded: boolean): void {
        this.closeMoreView.emit(widgetAdded);
    }

}
