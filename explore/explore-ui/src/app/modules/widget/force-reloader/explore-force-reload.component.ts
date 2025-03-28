import { Input, Component, TemplateRef, Optional, Injector } from "@angular/core";

@Component({
    selector: 'explore-force-reload',
    template: `
        <ng-container *ngIf="cycle === 0; else content">
            <ng-container *ngTemplateOutlet="content"></ng-container>
        </ng-container>
    `,
    styles: [`:host {height: 100%; width: 100%; display: block}`]
})
export class ExploreForceReloadComponent {
    /**
     * Force reinit of template component whenever the trigger changes.
     */
    @Input() set trigger(_: any) {
        this.cycle = (++this.cycle % 2);
    }

    @Input() content: TemplateRef<any>;

    public cycle = 0;
}
