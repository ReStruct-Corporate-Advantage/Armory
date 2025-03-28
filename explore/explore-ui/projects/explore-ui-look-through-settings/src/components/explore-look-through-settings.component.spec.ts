import { ComponentFixture, TestBed } from '@angular/core/testing';
import {LookThroughSettingsComponent} from './explore-look-through-settings.component';
import {LtSecurityTypes} from '../models/lt-security-types/lt-security-types.model';
import {LtSecurityProxyTypes} from '../models/lt-security-types/lt-security-proxy-types.model';
import {LookThroughSettings} from '../models/lookthrough-settings/look-through-settings.model';


describe('LookthroughSettingsComponent', () => {
  let component: LookThroughSettingsComponent;
  let fixture: ComponentFixture<LookThroughSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LookThroughSettingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LookThroughSettingsComponent);
    component = fixture.componentInstance;
    component.availableSecurityTypes = [
        new LtSecurityTypes({
            'description': 'Funds',
            'name': 'FUND',
            'selected': true,
            'varEquivalent': 'FUND.OPEN_END FUND.CLOSED_END FUND.STIF FUND.PRIVATE'
        }),
        new LtSecurityTypes({
            'description': 'ETFs',
            'name': 'ETF',
            'selected': true,
            'varEquivalent': 'ETF'
        }),
        new LtSecurityTypes({
            'description': 'Index Futures',
            'name': 'FUTURE_INDEX',
            'selected': true,
            'varEquivalent': 'FUTURE.INDEX'
        }),
            new LtSecurityTypes({
            'description': 'Synthetic Instruments',
            'name': 'SYNTH_CAP',
            'selected': false,
            'varEquivalent': 'SYNTH.CAP SYNTH.INDEX'
        }),
                new LtSecurityTypes({
            'description': 'Bond Forward',
            'name': 'BND_FWD',
            'selected': false,
            'varEquivalent': 'BNDFWD'
        }),
        new LtSecurityTypes({
            'description': 'Equity Forward',
            'name': 'EQ_FWD',
            'selected': false,
            'varEquivalent': 'EQFWD'
        }),
        new LtSecurityTypes({
            'description': 'Equity Option',
            'name': 'EQ_OPTION',
            'selected': false,
            'varEquivalent': 'OPTION'
        })
    ];
    component.availableProxyTypes = [
        new LtSecurityProxyTypes({
            'description': 'Look-Through Proxy',
            'name': 'LOOKTHROUGH_PROXY',
            'selected': false
        }),
        new LtSecurityProxyTypes({
            'description': 'Underlying Fund Benchmark',
            'name': 'PRIMARY_BENCHMARK',
            'selected': false
        }),
        new LtSecurityProxyTypes({
            'description': 'Underlying Fund',
            'name': 'RISK_PROXY',
            'selected': true
        }),
        new LtSecurityProxyTypes({
            'description': 'Fund',
            'name': 'FUND',
            'selected': true
        })
    ];

    component.lookthroughSettings = new LookThroughSettings({
        'isLookThroughEnabled': true,
        'isBenchLookThroughEnabled': true,
        'ltSecurityTypes': 'FUND,ETF,BND_FWD,EQ_FWD,EQ_OPTION',
        'ltProxies': 'LOOKTHROUGH_PROXY,RISK_PROXY,PRIMARY_BENCHMARK',
        'isLookThroughInheritanceEnabled': true,
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

    it('should change look-through group', () => {
        component.onLookthroughEnableGroupChanged({ 'detail': {'value': {'uid': 0}}});
        expect(component.lookthroughSettings.isLookThroughEnabled).toBeTruthy();
        expect(component.lookthroughSettings.isBenchLookThroughEnabled).toBeFalsy();
        expect(component.enabledElements).toBeTruthy();

        component.onLookthroughEnableGroupChanged({ 'detail': {'value': {'uid': 1}}});
        expect(component.lookthroughSettings.isLookThroughEnabled).toBeTruthy();
        expect(component.lookthroughSettings.isBenchLookThroughEnabled).toBeTruthy();
        expect(component.enabledElements).toBeTruthy();

        component.onLookthroughEnableGroupChanged({ 'detail': {'value': {'uid': 2}}});
        expect(component.lookthroughSettings.isLookThroughEnabled).toBeFalsy();
        expect(component.lookthroughSettings.isBenchLookThroughEnabled).toBeTruthy();
        expect(component.enabledElements).toBeTruthy();
    });

    it('should enable look-through', () => {
        component.radioGroup.data = [{'checked': true, 'label': 'Portfolio'}];
        component.onLookThroughEnabled({ 'detail': {'value': {'checked': true}}});
        expect(component.lookthroughSettings.isLookThroughEnabled).toBeTruthy();
        expect(component.lookthroughSettings.isBenchLookThroughEnabled).toBeFalsy();
        expect(component.enabledElements).toBeTruthy();
        expect(component.lookThroughEnabled).toBeTruthy();

        component.onLookThroughEnabled({ 'detail': {'value': {'checked': false}}});
        expect(component.lookthroughSettings.isLookThroughEnabled).toBeFalsy();
        expect(component.lookthroughSettings.isBenchLookThroughEnabled).toBeFalsy();
        expect(component.enabledElements).toBeFalsy();
        expect(component.lookThroughEnabled).toBeFalsy();
    });

    it('should change security type group', () => {
        component.onSecurityTypeGroupChanged({ 'detail': {'value': [{'checked': true, 'label': 'ETFs'},
                    {'checked': true, 'label': 'Funds'},
                    {'checked': false, 'label': 'Index Futures'},
                    {'checked': false, 'label': 'Bond Forward'}]}});
        expect(component.lookthroughSettings.ltSecurityTypes.length).toBe(2);
    });

    it('should change inheritance', () => {
        component.onLookthroughInheritanceChanged({ 'detail': {'value': {'checked': true}}});
        expect(component.lookthroughSettings.isLookThroughInheritanceEnabled).toBeTruthy();

        component.onLookthroughInheritanceChanged({ 'detail': {'value': {'checked': false}}});
        expect(component.lookthroughSettings.isLookThroughInheritanceEnabled).toBeFalsy();
    });

    it('should create LT Proxies if null', () => {
        component.lookthroughSettings.ltProxies = null;
        component.ngOnInit();
        expect(component.availableProxies.length).toBe(2);
        expect(component.selectedProxies.length).toBe(2);
    });
});
