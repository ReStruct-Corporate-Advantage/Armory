import {SubscribableComponent} from '@blk/explore-ui-core';
import {ComponentFactoryResolver, Directive, OnInit, ViewChild} from '@angular/core';
import {SectorRuleBuilderDialogProvider} from '../../token';
import {SectorRuleBuilderModalDirective} from '../sector-rule-builder-modal/sector-rule-builder-modal.directive';
import {SectorRuleBuilderModalDynamicComponent} from '../sector-rule-builder-modal/sector-rule-builder-modal-dynamic.component';

@Directive()
export abstract class SectorRuleBuilderModalResolver extends SubscribableComponent implements OnInit {

    @ViewChild(SectorRuleBuilderModalDirective, {static: true})
    sectorRuleBuilderModalDialogComponentHost!: SectorRuleBuilderModalDirective;

    sectorRuleBuilderModalDialogComponent: SectorRuleBuilderModalDynamicComponent;

    constructor(private sectorRuleBuilderDialogProvider: SectorRuleBuilderDialogProvider, private componentFactoryResolver: ComponentFactoryResolver) {
        super();
    }

    ngOnInit(): void {
        this.loadComponent();
    }

    loadComponent() {
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.sectorRuleBuilderDialogProvider.component);
        const viewContainerRef = this.sectorRuleBuilderModalDialogComponentHost.viewContainerRef;
        this.sectorRuleBuilderModalDialogComponent = viewContainerRef.createComponent<SectorRuleBuilderModalDynamicComponent>(componentFactory).instance;
    }

}
