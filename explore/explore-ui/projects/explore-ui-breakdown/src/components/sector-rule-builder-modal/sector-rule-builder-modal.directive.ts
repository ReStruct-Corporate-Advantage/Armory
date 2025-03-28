import {Directive, ViewContainerRef} from '@angular/core';

@Directive ({
  selector: '[exploreSectorRuleBuilderModal]' ,
})
export class SectorRuleBuilderModalDirective {
    constructor(public viewContainerRef: ViewContainerRef) {}
}
