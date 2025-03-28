import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FetchSecuritiesDataService} from '@services/widget/fetch-securities-data-service';
import {WorkspaceStore} from '@stores/workspace.store';
import {ExploreSelectOption, SubscribableComponent} from '@blk/explore-ui-core';
import {takeUntil} from 'rxjs/operators';
import {AuxSelectOptionGroup, AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {Portfolio} from '@models/portfolio/portfolio.model';

/**
 * Component to show dropdown with security description and cusip
 * Inputs : Feed Security Group and Security Type
 */

/**
 * To use : <app-security-selector-dropdown-legacy [securityGroup]="'FUND'"
 *                                 [securityType]="'PRIVATE'">
 * </app-security-selector-dropdown-legacy>
 */
@Component({
    selector: 'app-security-selector-dropdown-legacy',
    templateUrl: './security-selector-dropdown-legacy.component.html',
    styleUrls: ['./security-selector-dropdown-legacy.component.scss']
})
export class SecuritySelectorDropdownLegacyComponent extends SubscribableComponent implements OnInit {
    @Input() securityType: string;
    @Input() securityGroup: string;
    @Input() label: string;
    @Input() selectedSecurity: string;
    @Output() securitySelected = new EventEmitter();
    securityOptions: AuxSelectOptionGroup[];

    constructor(private fetchSecuritiesDataService: FetchSecuritiesDataService, private changeDetectorRef: ChangeDetectorRef) {
        super();
    }

    /**
     * initialize the security list
     */
    ngOnInit(): void {
        WorkspaceStore.getCurrentPortfolio$()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((portfolio: Portfolio) => {
                this.fetchSecuritiesDataService.fetchPortfolioSecurities(portfolio, this.securityType, this.securityGroup).subscribe(
                    response => {
                        this.securityOptions = this.createSecuritySelections(response);
                        this.changeDetectorRef.markForCheck();
                    }
                );
            });
    }

    /**
     * selection changed event handler
     * @param event
     */
    onSecuritySelection(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        if (event?.detail?.value) {
            this.securitySelected.emit(event?.detail?.value['value']);        }
    }

    /**
     * Create security selections for selector
     * @param data
     */
    private createSecuritySelections(data: { secDesc: any; cusip: any; }[]): AuxSelectOptionGroup[] {
        const options = [];
        if (data) {
            data.forEach(node => {
                const isSelected = this.selectedSecurity && this.selectedSecurity === node.cusip;
                options.push({values: [new ExploreSelectOption(node.secDesc + ' | ' + node.cusip, node.cusip, isSelected)]});
            });
        }
        return  options;
    }
}
