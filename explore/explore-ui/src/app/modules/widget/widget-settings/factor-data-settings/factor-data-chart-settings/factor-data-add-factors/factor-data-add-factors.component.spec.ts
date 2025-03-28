import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FactorDataAddFactorsComponent} from './factor-data-add-factors.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {FactorDataChartSettingsStore} from '../stores/factor-data-chart-settings.store';
import {ColumnType} from '@blk/explore-ui-core';

describe('FactorDataAddFactorsComponent', () => {
    let component: FactorDataAddFactorsComponent;
    let fixture: ComponentFixture<FactorDataAddFactorsComponent>;

    /**
     * Performs required initialisation before each test is run
     */
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [FactorDataAddFactorsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(FactorDataAddFactorsComponent);
        component = fixture.componentInstance;
        FactorDataChartSettingsStore.init();
        component.columnType = ColumnType.COLUMNS;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it(' test onAddFactorsClicked', () => {
        component.onAddFactorsClicked();
        expect(FactorDataChartSettingsStore.getRefreshFactorSummaryGrid$(ColumnType.COLUMNS).getValue()).toBeFalsy();
        expect(component.isFactorDataColumnModalOpen).toBeTruthy();
    });

    it('test closeFactorDataColumnModal when Cancel button clicked on FactorDataColumnModal', () => {
        component.onFactorDataColumnModalClosed(false);
        expect(component.isFactorDataColumnModalOpen).toBeFalsy();
        expect(FactorDataChartSettingsStore.getRefreshFactorSummaryGrid$(ColumnType.COLUMNS).getValue()).toBeFalsy();
    });

    it('test closeFactorDataColumnModal when Done button clicked on FactorDataColumnModal', () => {
        component.onFactorDataColumnModalClosed(true);
        expect(component.isFactorDataColumnModalOpen).toBeFalsy();
        expect(FactorDataChartSettingsStore.getRefreshFactorSummaryGrid$(ColumnType.COLUMNS).getValue()).toBeTruthy();
    });

});
