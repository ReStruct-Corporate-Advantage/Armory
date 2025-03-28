import {AfterViewInit, ChangeDetectorRef, Component, Input, ViewChild} from '@angular/core';
import {Security} from '@interfaces/security.interface';
import {SecuritySearchComponent} from '../security-search.component';

@Component({
    selector: 'app-security-search-with-custom-col-def',
    templateUrl: './security-search-with-custom-col-def.component.html',
    styleUrls: ['./security-search-with-custom-col-def.component.scss']
})
/**
 * security search bar with custom coldef. used in upload alpha and security constraints for absolute risk budgeting.
 */
export class SecuritySearchWithCustomColDefComponent implements AfterViewInit {

    @Input()
    selectedSecurities: Map<string, Security>;
    @Input()
    customColConfig: any;
    @ViewChild('securitySearchComp', {static: false})
    securitySearchComp: SecuritySearchComponent;

    constructor(private changeDetectorRef: ChangeDetectorRef) {
    }

    /**
     * AfterViewInit
     */
    ngAfterViewInit() {
        this.securitySearchComp.validateAndAddSecurities(this.selectedSecurities);
    }

    onSecuritiesUpdated() {
        this.changeDetectorRef.detectChanges();
    }
}
