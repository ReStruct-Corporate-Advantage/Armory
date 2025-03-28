import {TestBed} from '@angular/core/testing';
import {CustomSectorEventsService} from './custom-sector-events.service';

describe('CustomSectorEventsService', () => {
    beforeEach(() => TestBed.configureTestingModule({
        providers: [CustomSectorEventsService]
    }));

    it('should be created', () => {
        const service: CustomSectorEventsService = TestBed.inject(CustomSectorEventsService);
        expect(service).toBeTruthy();
    });
});
