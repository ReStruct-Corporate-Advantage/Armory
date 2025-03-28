import {Component, Input} from '@angular/core';

/**
 * Factor Attribution Details Factor Proxying Component
 */
@Component({
    selector: 'app-factor-attribution-details-factor-proxying',
    templateUrl: './factor-attribution-details-factor-proxying.component.html',
    styleUrls: ['../../foot-notes.component.scss']

})
export class FactorAttributionDetailsFactorProxyingComponent {
    @Input() proxyInfo: {cusips: string[], overrides: string[], endDates: string[]};

    readonly headerTitles = ['Security', 'Proxied to', 'For dates Earlier than'];
}
