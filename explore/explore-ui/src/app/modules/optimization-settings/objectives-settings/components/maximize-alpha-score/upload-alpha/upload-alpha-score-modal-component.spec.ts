import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {Component, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {UploadAlphaScoreModalComponent} from '@optimization-settings/objectives-settings/components/maximize-alpha-score/upload-alpha/upload-alpha-score-modal.component';
import {AlphaScorePortfolioObjective} from '@models/portfolio/objectives/alpha-score-portfolio-objective.model';
import {SecuritySearchComponent} from '../../../../../../shared/components';
import {Security} from '@interfaces/security.interface';
import {NotificationService} from '@services/notification';
import {of} from 'rxjs';
import {ColumnConfig} from '@blk/explore-ui-core';

@Component({
    selector: 'app-security-search',
    template: ''
})
export class MockSecuritySearchComponent {
    validateAndAddSecurities(securities: Map<string, Security>) {
    }
}

describe('upload-alpha-score-modal.component.ts', () => {
    let component: UploadAlphaScoreModalComponent;
    let fixture: ComponentFixture<UploadAlphaScoreModalComponent>;

    const notificationServiceStub = {
        warning: jest.fn(),
        showDialog$: jest.fn(() => of(undefined)),
        showToastr$: jest.fn(() => of(undefined)),
        openDialog: jest.fn(),
        success: jest.fn(),
        error: jest.fn(),
        showUserSessionInfoMap$: jest.fn(() => of(undefined))
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [ReactiveFormsModule],
            declarations: [UploadAlphaScoreModalComponent, MockSecuritySearchComponent],
            providers: [
                {provide: NotificationService, useValue: notificationServiceStub}
            ]
        }).compileComponents();
    }));

    beforeEach(async () => {
        fixture = TestBed.createComponent(UploadAlphaScoreModalComponent);
        component = fixture.componentInstance;
        component.portfolioObjective = new AlphaScorePortfolioObjective();
        component.selectedSecurities.set('abc', {
            error: undefined,
            cusip: 'abc',
            description: undefined,
            securityGroup: undefined,
            currentValue: undefined,
            newValue: undefined,
            alpha: 2.0
        }).set('xyz', {
            error: undefined,
            cusip: 'xyz',
            description: undefined,
            securityGroup: undefined,
            currentValue: undefined,
            newValue: undefined,
            alpha: 3.0
        });

        (component.portfolioObjective as AlphaScorePortfolioObjective).alphaScoreMeasure = new ColumnConfig({columnTitle: 'x', columnTag: 'x'});
        component.securitySearchComp = TestBed.createComponent(MockSecuritySearchComponent).componentInstance as SecuritySearchComponent;
        fixture.detectChanges();
        await component.ngOnInit();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.selectedSecurities.size).toBe(2);
    });

    test('close Modal save true', () => {
        component.onClosed(true);
        expect((component.portfolioObjective as AlphaScorePortfolioObjective).uploadedAlpha.size).toEqual(2);
        expect((component.portfolioObjective as AlphaScorePortfolioObjective).alphaScoreMeasure).toBeUndefined();
    });


    test('close Modal save false', () => {
        component.onClosed(false);
        expect((component.portfolioObjective as AlphaScorePortfolioObjective).uploadedAlpha.size).toEqual(0);
        expect((component.portfolioObjective as AlphaScorePortfolioObjective).alphaScoreMeasure).toBeDefined();
    });

});
