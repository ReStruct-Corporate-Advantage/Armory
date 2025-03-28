import {TestBed} from '@angular/core/testing';
import {SaveSummariesStateValidationHandler} from './save-summaries-state-validation.handler';
import {SaveSummariesDisplayInfo} from './save-summaries-display-info.interface';

describe('SaveSummariesStateValidationHandler', () => {
    let handler: SaveSummariesStateValidationHandler;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [SaveSummariesStateValidationHandler]
        });
        handler = TestBed.inject(SaveSummariesStateValidationHandler);
    });

    describe('initializeChangeDetailsValidation', () => {
        it('should initialize emptySummariesCount correctly', () => {
            const displayInfo: SaveSummariesDisplayInfo = {
                title: 'Test',
                nestedChanges: []
            };
            jest.spyOn(handler, 'countEmptySummaries' as any).mockReturnValue(2);

            handler.initializeChangeDetailsValidation(displayInfo);

            expect(handler['emptySummariesCount']).toBe(2);
        });
    });

    describe('countEmptySummaries', () => {
        it('should count empty summaries correctly', () => {
            const displayInfo: SaveSummariesDisplayInfo = {
                title: 'Test',
                shouldShowSaveSummary: true,
                changeSummary: '',
                nestedChanges: []
            };

            const count = handler['countEmptySummaries'](displayInfo);

            expect(count).toBe(1);
        });

        it('should count nested empty summaries correctly', () => {
            const displayInfo: SaveSummariesDisplayInfo = {
                title: 'Test',
                shouldShowSaveSummary: true,
                changeSummary: '1',
                nestedChanges: [
                    {
                        title: 'Nested',
                        shouldShowSaveSummary: true,
                        changeSummary: '2',
                        nestedChanges: []
                    }
                ]
            };

            const count = handler['countEmptySummaries'](displayInfo);

            expect(count).toBe(0);
        });
    });

    describe('isSavable', () => {
        it('should return true if all fields are valid', () => {
            const displayInfo: SaveSummariesDisplayInfo = {
                title: 'Test',
                shouldShowSaveSummary: true,
                changeSummary: '',
                nestedChanges: []
            };
            handler['emptySummariesCount'] = 1;

            const result = handler.isSavable(displayInfo, 'New Summary');

            expect(handler['emptySummariesCount']).toBe(0);
            expect(result).toBe(true);
        });

        it('should return false if any field is invalid', () => {
            const displayInfo: SaveSummariesDisplayInfo = {
                title: 'Test',
                shouldShowSaveSummary: true,
                changeSummary: 'Existing Summary',
                nestedChanges: []
            };
            handler['emptySummariesCount'] = 0;

            const result = handler.isSavable(displayInfo, '');

            expect(handler['emptySummariesCount']).toBe(1);
            expect(result).toBe(false);
        });
    });

    describe('isChangeSummaryEmpty', () => {
        it('should return true if change summary is empty', () => {
            const displayInfo: SaveSummariesDisplayInfo = {
                title: 'Test',
                shouldShowSaveSummary: true,
                changeSummary: '',
                nestedChanges: []
            };

            const result = handler['isChangeSummaryEmpty'](displayInfo);

            expect(result).toBe(true);
        });

        it('should return false if change summary is not empty', () => {
            const displayInfo: SaveSummariesDisplayInfo = {
                title: 'Test',
                shouldShowSaveSummary: true,
                changeSummary: 'Summary',
                nestedChanges: []
            };

            const result = handler['isChangeSummaryEmpty'](displayInfo);

            expect(result).toBe(false);
        });
    });
});
