import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SecuritySearchModalComponent} from './security-search-modal.component';
import {Component, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {getInvestmentUniverseSettingSecurity} from '../../../constants/test-data.testutils';
import {Security} from '@interfaces/security.interface';
import {SecuritySearchComponent} from '../../../../../shared/components';

@Component({
    selector: 'app-security-search',
    template: ''
})
export class MockSecuritySearchComponent {
    validateAndAddSecurities(securities: Map<string, Security>) {}
}

describe('SecuritySearchModalComponent', () => {
    let component: SecuritySearchModalComponent;
    let fixture: ComponentFixture<SecuritySearchModalComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [SecuritySearchModalComponent, MockSecuritySearchComponent]
        });

        fixture = TestBed.createComponent(SecuritySearchModalComponent);
        component = fixture.componentInstance;
        component.investmentUniverseSetting = getInvestmentUniverseSettingSecurity();
        component.securitySearchComp = TestBed.createComponent(MockSecuritySearchComponent).componentInstance as SecuritySearchComponent;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    test('close Modal save true', () => {
        component.selectedSecurities.set('S3', {} as Security);
        component.onClosed(true);
        expect(component.investmentUniverseSetting.securities.length).toEqual(3);
    });

    test('close Modal save false', () => {
        component.selectedSecurities.set('S3', {} as Security);
        component.onClosed(false);
        expect(component.investmentUniverseSetting.securities.length).toEqual(2);
    });
});
