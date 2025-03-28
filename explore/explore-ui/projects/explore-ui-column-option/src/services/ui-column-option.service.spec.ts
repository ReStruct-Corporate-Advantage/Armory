import {TestBed} from '@angular/core/testing';
import {of} from 'rxjs';
import {UiColumnOptionService} from './ui-column-option.service';

describe('UiColumnOptionService', () => {
    const uiColumnOptionServiceStub = {
        getOverrideDateSelection$: jest.fn( () => of()),
        setCompareToCurrentOption: jest.fn()
    };

    beforeEach(() => TestBed.configureTestingModule({
        providers: [{provide: UiColumnOptionService, useValue: uiColumnOptionServiceStub}]
    }));

    it('setCompareToCurrentOption test case', () => {
        const service: UiColumnOptionService = TestBed.inject(UiColumnOptionService);
        service.setCompareToCurrentOption('PERCENT_COMPARE_TO_CURRENT');
        const sbsc = service.getOverrideDateSelection$().subscribe((override) => {
            expect(override).toBe('PERCENT_COMPARE_TO_CURRENT');
        });
        sbsc.unsubscribe();
    });
});
