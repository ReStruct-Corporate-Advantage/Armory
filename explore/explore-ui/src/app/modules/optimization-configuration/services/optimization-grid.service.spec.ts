import {TestBed} from '@angular/core/testing';
import {OptimizationGridService} from './optimization-grid.service';
import {AuxGridColumnType} from '@blk/aladdin-angular-components';

describe('OptimizationGridService', () => {
    let service: OptimizationGridService;

    beforeEach(() => {
        TestBed.configureTestingModule({});

        service = TestBed.inject(OptimizationGridService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('should process columns', () => {
        it('should transform checkbox columns', () => {
            expect(service.processColumns([{
                field: 'field',
                headerName: 'headerName'
            }])).toEqual([{
                field: 'field',
                headerName: 'headerName',
                suppressHeaderMenuButton: true,
                suppressFilter: true
            }]);
        });

        it('should process other columns', () => {
            expect(service.processColumns([{
                field: 'field',
                headerName: 'headerName',
                type: AuxGridColumnType.AUX_CHECKBOX_COLUMN
            }])).toEqual([{
                field: 'field',
                filter: 'auxTextFilter',
                headerName: 'headerName',
                type: AuxGridColumnType.AUX_TEXT_COLUMN,
                suppressHeaderMenuButton: true,
                suppressFilter: true
            }]);
        });
    });
});
