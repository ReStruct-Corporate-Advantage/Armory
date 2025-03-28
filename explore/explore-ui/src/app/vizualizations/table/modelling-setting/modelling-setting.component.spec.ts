import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ModellingSettingComponent} from './modelling-setting.component';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {CompositionSetting} from '@models/portfolio/composition/composition-setting.model';
import {Breakdown} from '@blk/explore-ui-breakdown';
import {ColumnConfig, ExploreSelectOption} from '@blk/explore-ui-core';
import {of} from 'rxjs';
import {ColumnOptionResponse, ColumnOptionService} from '@blk/explore-ui-column-option';

describe('what if modelling setting test cases', () => {
    let fixture: ComponentFixture<ModellingSettingComponent>;
    let component: ModellingSettingComponent;

    const columnOptionsServiceMock = {
        fetchColumnOptions$: jest.fn()
    };

    const columnOptionsSpy = jest.spyOn(columnOptionsServiceMock, 'fetchColumnOptions$');
    columnOptionsSpy.mockReturnValue(of(getResponse()));

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ModellingSettingComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {
                    provide: ColumnOptionService, useValue: columnOptionsServiceMock
                }
            ]
        });

        fixture = TestBed.createComponent(ModellingSettingComponent);
        component = fixture.componentInstance;

        component.portfolio = new WhatIfPortfolio();
        component.portfolio.compositionSetting = new CompositionSetting();
        component.portfolio.compositionSetting.breakdownTree = new Breakdown();
        component.portfolio.compositionSetting.selectedColumns = [
            new ColumnConfig({
                'columnTag': 'pct_notional_val',
                'positionColumnType': 'PORT',
                'columnKey': 'pct_notional_val'
            }),
            new ColumnConfig({
                'columnTag': 'pct_mv',
                'positionColumnType': 'PORT',
                'columnKey': 'pct_mv'
            })];

        component.ngOnInit();
    });

    it('component should be created', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize the available Columns for Modeling table', () => {
        expect(component.availableColumnsForModeling[0].values.length).toBe(10);
        expect(component.availableColumnsForModeling[0].values.filter(option => option.isSelected === true).length).toBe(2);
    });

    it('test onSelectedColumnsChanged', () => {
        const event = {detail: {value: [new ExploreSelectOption('Market Value %',
                    {columnTag: 'pct_mv', columnKey: 'pct_mv', columnTitle: 'Market Value %'})]}};
        component.onSelectedColumnsChanged(event as CustomEvent);
        expect(component.portfolio.compositionSetting.selectedColumns.length).toBe(1);
        expect(component.portfolio.compositionSetting.selectedColumns[0].columnKey).toBe('pct_mv');
    });

    it('Update applyFilterTo in portfolio test case', () => {
        const filter = 'PORTFOLIO';
        component.updateAppliedFilter(filter);
        expect(component.portfolio.applyFilterTo).toBe('PORTFOLIO');
    });

    it('Switching between tabs test case', () => {
        const event = {detail: {uid: '1'}};
        component.onTabSelected(event as CustomEvent);
        expect(component.selectedModellingOption).toBe('1');
    });

    /**
     * Function to get mock data returned by fetchColumnOptions$
     */
    function getResponse(): ColumnOptionResponse[] {
        return [{
            colTag: '',
            use: '',
            options: [
                null,
                null,
                {
                    columnOptionKey: '',
                    columnOptionTitle: '',
                    columnOptionConfigType: '',
                    columnOptionAttributes: [{
                        title: 'Type',
                        key: '',
                        dataType: '',
                        values: [
                            {value: 'BB_TICKER', label: 'Bloomberg'},
                            {value: 'NAME', label: 'Name'}]
                    }]
                }
            ]}];
    }
});
