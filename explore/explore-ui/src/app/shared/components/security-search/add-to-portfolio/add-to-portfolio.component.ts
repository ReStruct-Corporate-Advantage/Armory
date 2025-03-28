import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AuxSelectOption, AuxSelectOptionGroup, AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {PortfolioCacheKey} from '@models/portfolio/portfolio-cache-key.model';
import {PortfolioStore} from '@stores/portfolio.store';
import {PortfolioSecuritiesHandlerService} from '../../../../modules/main/composition-modelling/services/portfolio-securities-handler.service';
import {SubscribableComponent} from '@blk/explore-ui-core';

@Component({
    selector: 'app-add-to-portfolio',
    templateUrl: './add-to-portfolio.component.html'
})
export class AddToPortfolioComponent extends SubscribableComponent implements OnInit {

    @Input() portfolio: WhatIfPortfolio;

    @Output() addToPortfolioChanged = new EventEmitter<string>();
    @Output() leafPortfoliosUpdated = new EventEmitter<Set<string>>();

    underlyingPortData: AuxSelectOptionGroup[] = [];

    constructor(private cdRef: ChangeDetectorRef, private portSecuritiesHandlerService: PortfolioSecuritiesHandlerService) {
        super();
    }

    /**
     * OnInit hook
     */
    ngOnInit() {

        // check if currentPortfolio is a portgroup but does not contain the underlying portfolios i.e. portfolio is light version
        if (this.portfolio.isPortfolioGroup && (!this.portfolio.portfolios || this.portfolio.portfolios.length === 0)) {
            // check if cache contains full portfolio details
            const mainPortCacheKey: PortfolioCacheKey = new PortfolioCacheKey(this.portfolio.portName.toUpperCase(), this.portfolio.datePicker.date, false, true);
            const mainPortInfoObject: any = PortfolioStore.getPortfolioInfoFromCache(mainPortCacheKey);

            // if full portfolio not found in cache then get the full portfolio and update cache
            if (!mainPortInfoObject) {
                this.portSecuritiesHandlerService.getPortData$(mainPortInfoObject, mainPortCacheKey, this.portfolio.portName, this.portfolio.datePicker.date, null, true).subscribe(
                    (portDataInfo: any) => this.updateUnderlyingPortfolios(portDataInfo[1].data)
                );
            } else { // found in cache, just update the data for add to portfolios dropdown
                this.updateUnderlyingPortfolios(mainPortInfoObject.data);
            }
        }
    }

    /**
     * update the data for underlying portfolios while adding security
     * @param data
     */
    updateUnderlyingPortfolios(data: any) {
        const underlyingPortNames = new Set<string>();
        underlyingPortNames.add(this.portfolio.portName);
        this.portSecuritiesHandlerService.getLeafLevelPortNamesForPortData([data], underlyingPortNames);
        this.leafPortfoliosUpdated.emit(underlyingPortNames);
        this.underlyingPortData = [{
            values: [...underlyingPortNames].map(portName => {
                return {
                    displayValue: portName,
                    value: portName,
                    isSelected: portName === this.portfolio.portName
                };
            })
        }];
        this.cdRef.detectChanges();
    }

    /**
     * Method called when addToPortfolio is changed
     */
    onAddToPortfolioChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.addToPortfolioChanged.emit((event.detail.value as AuxSelectOption).value);
    }
}
