import {Directive, ElementRef, Input, ViewChild} from '@angular/core';
import {ExploreResponseConfig, RequestAdapterConfig} from '../interfaces';
import {SimpleCube} from '@qbstr/data-cube-reactive';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {SubscribableComponent} from '@blk/explore-ui-core';
import {TreeCube} from '@utils/qbstr/tree-cube';

@Directive()
export abstract class Vizualization extends SubscribableComponent {
    @Input() abstract widgetPayload: WidgetPayload;
    requestConfig: RequestAdapterConfig;
    responseConfig: ExploreResponseConfig;
    cube: SimpleCube<any> | TreeCube;
    breakdownLevels: string[];

    @Input() isBatchExport: boolean;

    // ViewChild to gain access to inner grid/highchart component for PDF export flow
    widgetRender: ElementRef;
    @ViewChild('widgetRender', {static: false}) set content(content: ElementRef) {
        if (this.isBatchExport) {
            this.widgetRender = content;
        }
    }
}
