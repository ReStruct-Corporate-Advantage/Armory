import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TelemetryService} from './telemetry.service';

/**
 * Module for all the meta data which includes user meta data, column definitions, mandate mapping
 */
@NgModule({
    declarations: [],
    imports: [CommonModule],
    providers: [TelemetryService],
    exports: []
})
export class TelemetryModule { }
