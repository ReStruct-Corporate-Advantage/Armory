import {ChangeDetectorRef, Component, EventEmitter, Input, Output} from '@angular/core';
import {
    ClickElemConstants,
    CoreWidgetConstants,
    WidgetConfig
} from '@blk/explore-ui-core';
import {TelemetryClickService} from '@services/telemetry/telemetry-click.service';
import {AuxNotificationStyleEnum} from '@blk/aladdin-angular-components';

@Component({
    selector: 'app-widget-gallery-cards',
    templateUrl: './widget-gallery-cards.component.html',
    styleUrls: ['./widget-gallery-cards.component.scss']
})

/**
 * Component for Widget Gallery Cards
 */
export class WidgetGalleryCardsComponent {
    private readonly TOAST_TIMEOUT = 2000;
    private readonly SUCCESS_MESSAGE = 'Widget added!';
    private readonly ERROR_MESSAGE = 'Error!';

    @Input() widgets: Array<WidgetConfig>;
    @Output() widgetCreate = new EventEmitter<string>();
    @Output() openMoreView = new EventEmitter<WidgetConfig>();

    showToastNotificationForWidget: { [widgetId: string]: boolean } = {};
    showErrorToast = false;
    // Configuration for the success notification when a widget is added
    public successNotificationToastConfig = [{
        id: 1,
        message: this.SUCCESS_MESSAGE,
        toastTimeout: this.TOAST_TIMEOUT,
        notificationStyle: AuxNotificationStyleEnum.SUCCESS,
    }];
    // Configuration for the error notification when a widget is added
    public errorNotificationToastConfig = [{
        id: 2 ,
        message: this.ERROR_MESSAGE,
        toastTimeout: this.TOAST_TIMEOUT,
        notificationStyle: AuxNotificationStyleEnum.ERROR,
    }];

    constructor(private telemetryClickService: TelemetryClickService, private changeDetectorRef: ChangeDetectorRef) {
    }

    chartWidget(widget: WidgetConfig): boolean {
        return widget.chartingLib === CoreWidgetConstants.CHARTING_LIB.HIGHCHART;
    }

    /**
     * Add a widget using the 'add' button.
     * Show a "Widget added!" toaster notification for 2 seconds  if there is success
     * Show an "Error!" toaster notification for 2 seconds if there is an error encountered
     * @param widget: WidgetConfig
     */
    createWidget(widget: WidgetConfig): void {
        try {
            this.widgetCreate.emit(widget.configType);
            this.showErrorToast = false;
        } catch (error) {
            this.showErrorToast = true;
        }
        this.showToastNotificationForWidget[widget.configType] = true;
        setTimeout(() => {
            this.showToastNotificationForWidget[widget.configType] = false;
            this.changeDetectorRef.detectChanges();
        }, this.TOAST_TIMEOUT);
    }

    /**
     * Turn the more view on from the widget gallery
     * @param widgetConfig: WidgetConfig
     */
    moreViewOn(widgetConfig: WidgetConfig): void {
        this.telemetryClickService.reportBarTabPlusWidgetIconClick(widgetConfig.title, ClickElemConstants.CONTEXT_PATH.PLUS_WIDGET.MORE_LINK_CLICK);
        this.openMoreView.emit(widgetConfig);
    }

}
