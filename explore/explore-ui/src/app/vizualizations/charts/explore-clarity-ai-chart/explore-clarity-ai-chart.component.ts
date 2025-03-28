import * as clarityWidget from '@clarity-ai/widget';
import {AfterViewInit, Component, ElementRef, Input, OnChanges, ViewChild} from '@angular/core';
import {Widget} from '@models/widget/widget.model';
import {WidgetPayload} from '../../../models/widget/widget-payload.model';
import {Notification} from '@models/widget/notification.model';
import {ErrorTypeConstants, UIErrorParameters} from "@blk/explore-ui-core";

@Component({
    selector: 'app-explore-clarity-ai-chart',
    templateUrl: './explore-clarity-ai-chart.component.html',
    styleUrls: ['./explore-clarity-ai-chart.component.scss'],
})
export class ExploreClarityAiChartComponent implements AfterViewInit, OnChanges {
  @ViewChild('ref', {static: false}) widgetComponentRef!: ElementRef;

  @Input() widget: Widget;

  @Input() widgetPayload: WidgetPayload;

  isDarkMode = true;
  widgetOriginDomain = 'https://go.clarity.ai';
  customizationObject = {
    baseFontSize: '12px',
    fontColor: 'var(--primary-text__color)',
    dataLabelFontColor: 'var(--primary-text__color)'
  };


  styleJSON = JSON.stringify(this.customizationObject);

  errorCallback(message: any) {
    console.error(message);
  }

  async ngAfterViewInit() {
    await this.urlExists(this.widgetOriginDomain).then((exist: boolean) => {
        if (!exist) {
            this.widgetPayload.notification = Notification.createErrorNotification('Error connecting to Clarity AI', ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_LAUNCH_APP_CLARITY_AI_ERROR);
            this.widget.dataStore.data = this.widgetPayload;
        } else {
            clarityWidget.load(this.widgetOriginDomain);
            clarityWidget.refresh(this.widgetComponentRef.nativeElement, this.errorCallback);
            clarityWidget.setData(this.widgetComponentRef.nativeElement, {data: this.widgetPayload.widgetSpecificData});
        }
    });
  }

  ngOnChanges(): void {
    if (this.widgetComponentRef !== undefined) {
        clarityWidget.refresh(this.widgetComponentRef.nativeElement, this.errorCallback);
    }
  }

  async urlExists(url) {
    return fetch(url, {mode: 'no-cors'})
      .then(res => true)
      .catch(err => false);
  }

}
