import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SecuritySelectionModalComponent} from './security-selection-modal.component';
import {Security} from '@interfaces/security.interface';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('SecuritySelectionModalComponent', () => {
  let component: SecuritySelectionModalComponent;
  let fixture: ComponentFixture<SecuritySelectionModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ SecuritySelectionModalComponent ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });

    fixture = TestBed.createComponent(SecuritySelectionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('test onChanges', () => {
      const map = new Map<string, Security>();
      map.set('US2567461080', undefined);
      component.securityIdentifiers = map.keys();
      const security = {};
      security.isin = 'US2567461080';
      security.cusip = 'CUSIP 1';
      const security2 = {};
      security2.isin = 'US2567461080';
      security2.cusip = 'CUSIP 2';
      component.searchResults = [security, security2];
      component.ngOnChanges();
      expect(component.ISINKeys.length).toBe(1);
      expect(component.mapForISINKeys.size).toBe(1);
      expect(component.mapForSelectOptions.size).toBe(1);
      expect(component.selectedSecuritiesForISIN.size).toBe(1);
  });

  it('test onSelectionChanged', () => {
      component.selectedSecuritiesForISIN.set('US2567461080', {isin: 'US2567461080', cusip: 'Cusip1'});
      component.onSelectionChanged({isin: 'US2567461080', cusip: 'Cusip2'});
      expect(component.selectedSecuritiesForISIN.get('US2567461080')).toStrictEqual({isin: 'US2567461080', cusip: 'Cusip2'});
  });

  it('test on done clicked', () => {
      component.selectedSecuritiesForISIN.set('US2567461080', {isin: 'US2567461080', cusip: 'Cusip1'});
      component.closeModal(true);
      expect(component.selectedSecuritiesForISIN.size).toBe(1);

      component.closeModal(false);
      expect(component.selectedSecuritiesForISIN.size).toBe(0);
  });
});
