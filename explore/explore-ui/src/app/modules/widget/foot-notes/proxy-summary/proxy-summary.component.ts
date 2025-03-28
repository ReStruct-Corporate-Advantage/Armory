import {Component, Input} from '@angular/core';

/**
 * Proxy Summary Component
 */
@Component({
    selector: 'app-proxy-summary',
    templateUrl: './proxy-summary.component.html',
    styleUrls: ['../foot-notes.component.scss']
})
export class ProxySummaryComponent {
    @Input() lookThroughProxyDetails: string[];
}
