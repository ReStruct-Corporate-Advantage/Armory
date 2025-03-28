import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CommitmentRiskWarningBannerComponent} from './commitment-risk-warning-banner.component';
import {SpriteletLauncherServiceRegistry} from '@services/spritelet-launcher/spritelet-launcher-service.registry';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('CommitmentRiskWarningBannerComponent', () => {
    let component: CommitmentRiskWarningBannerComponent;
    let fixture: ComponentFixture<CommitmentRiskWarningBannerComponent>;

    let spriteletLauncherServiceRegistryMock;

    beforeEach(async () => {
        spriteletLauncherServiceRegistryMock = {
            launchSpritelet: jest.fn()
        };

        await TestBed.configureTestingModule({
            declarations: [CommitmentRiskWarningBannerComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{provide: SpriteletLauncherServiceRegistry, useValue: spriteletLauncherServiceRegistryMock}]
        })
            .compileComponents();

        fixture = TestBed.createComponent(CommitmentRiskWarningBannerComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set warningMsg correctly on ngOnInit', () => {
        const warningData = {};
        warningData['excluded_funds_number'] = 2;
        warningData['all_funds_number'] = 4;
        warningData['excluded_commitment_percentage'] = 45.79;
        warningData['excluded_nav_percentage'] = 34.36;
        component.warningData = warningData;
        component.ngOnInit();

        let expectedWarningMsg = '2 out of 4 funds in the portfolio are excluded; this amounts to 34% of the total market value and 46% of the total commitment of the portfolio.';
        expect(component.warningMsg).toEqual(expectedWarningMsg);
        warningData['excluded_funds_number'] = undefined;
        warningData['all_funds_number'] = undefined;
        warningData['excluded_commitment_percentage'] = undefined;
        warningData['excluded_nav_percentage'] = undefined;
        component.ngOnInit();
        expectedWarningMsg = '0 out of 0 funds in the portfolio are excluded; this amounts to 0% of the total market value and 0% of the total commitment of the portfolio.';
        expect(component.warningMsg).toEqual(expectedWarningMsg);
    });
});
