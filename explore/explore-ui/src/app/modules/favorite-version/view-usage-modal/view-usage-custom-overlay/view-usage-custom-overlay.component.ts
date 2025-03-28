import {Component} from '@angular/core';
import type {INoRowsOverlayAngularComp} from 'ag-grid-angular';
import type {INoRowsOverlayParams} from 'ag-grid-community';

type CustomNoRowsOverlayParams = INoRowsOverlayParams & { noRowsMessageFunc: () => string };

@Component({
    selector: 'app-view-usage-custom-overlay',
    templateUrl: './view-usage-custom-overlay.component.html'
})
export class ViewUsageCustomOverlayComponent implements INoRowsOverlayAngularComp {
    public params!: CustomNoRowsOverlayParams;

    agInit(params: CustomNoRowsOverlayParams): void {
      this.refresh(params);
    }

    refresh?(params: CustomNoRowsOverlayParams): void {
      this.params = params;
    }
}
