import {Component, Inject, ViewChild, ViewContainerRef} from '@angular/core';
import {PORTFOLIO_SEARCH_SERVICE_TOKEN} from '@blk/explore-ui-risk';
import {PortfolioSearchItem, PortfolioSearchServiceInterface} from '@blk/explore-ui-portfolio-search';
import {ICellEditorAngularComp} from 'ag-grid-angular';
import {ICellEditorParams} from 'ag-grid-community';

@Component({
    selector: 'app-port-search-renderer-comp',
    templateUrl: './port-search-editor.component.html',
    styleUrls: ['./port-search-editor.component.scss']
})
export class PortSearchEditorComponent implements ICellEditorAngularComp {

    private params: ICellEditorParams;

    @ViewChild('container', {read: ViewContainerRef}) public container!: ViewContainerRef;

    ticker: string;

    constructor(@Inject(PORTFOLIO_SEARCH_SERVICE_TOKEN) public portfolioSearchService: PortfolioSearchServiceInterface) {
    }

    agInit(params: ICellEditorParams): void {
        this.params = params;
        this.params.onKeyDown = (event: KeyboardEvent) => event.stopPropagation();
    }

    getValue(): string {
        return this.ticker;
    }

    handlePortSearchItem($event: PortfolioSearchItem) {
        this.ticker = $event.ticker;
        this.params.stopEditing();
    }

    isPopup(): boolean {
        return true;
    }

    getPopupPosition(): 'over' | 'under' | undefined {
        return 'over';
    }

    afterGuiAttached() {
        this.container.element.nativeElement.tabIndex = 0;
        this.container.element.nativeElement.focus();
    }
}
