import {AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {SecuritySearchComponent} from '../../../../../shared/components';
import {Security} from '@interfaces/security.interface';
import {InvestmentUniverseSecurity} from '@models/portfolio/investmentUniverse/investment-universe-security.model';

@Component({
    selector: 'app-security-search-modal',
    templateUrl: './security-search-modal.component.html',
    styleUrls: ['./security-search-modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SecuritySearchModalComponent implements OnInit, AfterViewInit {
    @Input() investmentUniverseSetting: InvestmentUniverseSecurity;

    @Input() isOpen: boolean;

    @Output() securityModalClosed = new EventEmitter<any>();

    @ViewChild('securitySearchComp', {static: false}) securitySearchComp: SecuritySearchComponent;

    selectedSecurities = new Map<string, Security>();

    constructor() {}

    ngOnInit() {
        const securities = this.investmentUniverseSetting.securities;
        securities.forEach((security) =>
            this.selectedSecurities.set(security, {
                error: undefined,
                cusip: security,
                description: undefined,
                securityGroup: undefined,
                currentValue: undefined,
                newValue: undefined
            })
        );
    }

    ngAfterViewInit() {
        this.securitySearchComp.validateAndAddSecurities(this.selectedSecurities);
    }

    onClosed(isSave: boolean) {
        if (isSave) {
            this.investmentUniverseSetting.securities = Array.from(this.selectedSecurities.keys());
        }
        this.isOpen = false;
        this.securityModalClosed.emit();
    }
}
