import {ComponentFixture, TestBed} from '@angular/core/testing';
import {LibColumnUtils} from '@blk/explore-ui-column-option';

import {BreakdownOptionsComponent} from './breakdown-options.component';
import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange} from '@angular/core';
import {
    BreakdownBuilderSettings,
    BreakdownSectorSelectorOption,
    BreakdownTreeNode,
    ColumnSector,
    CustomSector,
    DateColumnSector,
    LinkedFavoriteSector,
    NumericColumnSector,
    SchemaSector,
    SectorConstants,
    SectorRuleBuilderConfig,
    TimeSpanColumnSector
} from '@blk/explore-ui-breakdown';
import {ColumnDefinition, CoreCommonConstants, WidgetConfigType} from '@blk/explore-ui-core';

describe('BreakdownOptionsComponent', () => {
    let component: BreakdownOptionsComponent;
    let fixture: ComponentFixture<BreakdownOptionsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [BreakdownOptionsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(BreakdownOptionsComponent);
        component = fixture.componentInstance;
        component.breakdownBuilderSettings = new BreakdownBuilderSettings();
        fixture.detectChanges();
    });

    it('Test Breakdown Tree change', () => {
        component.breakdownTree = new BreakdownTreeNode();
        component.ngOnChanges({
            breakdownTree: new SimpleChange(undefined, component.breakdownTree, false)
        });
        expect(component.sectorRuleBuilderConfig).toBeUndefined();
        component.sectorRuleBuilderConfig = new SectorRuleBuilderConfig([], new BreakdownTreeNode());
        component.ngOnChanges({
            breakdownTree: new SimpleChange(undefined, component.breakdownTree, false)
        });
        expect(component.sectorRuleBuilderConfig.breakdownTree).toBe(component.breakdownTree);
    });

    describe('Test Sector Type', () => {
        it('Custom Sector', () => {
            const linkedFavoriteSector = new LinkedFavoriteSector();
            linkedFavoriteSector.sector = new CustomSector();
            component.selectedNode = new BreakdownTreeNode();
            component.selectedNode.sectorModel = linkedFavoriteSector;
            jest.spyOn(LibColumnUtils, 'makeColumnTree').mockReturnValue(
                []
            );
            component.ngOnChanges({
                selectedNode: new SimpleChange(undefined, component.selectedNode, false)
            });
            expect(component.selectedNodeDataType).toEqual(SectorConstants.SECTOR_DATA_TYPE.CUSTOM);
            expect(LibColumnUtils.makeColumnTree).toHaveBeenCalled();
            expect(component.sectorRuleBuilderConfig).toBeDefined();
            expect(component.customSector).toEqual(linkedFavoriteSector.sector);
        });

        it('String Column Sector', () => {
            component.selectedNode = new BreakdownTreeNode();
            component.selectedNode.sectorModel = new ColumnSector();
            component.ngOnChanges({
                selectedNode: new SimpleChange(undefined, component.selectedNode, false)
            });
            expect(component.selectedNodeDataType).toEqual(SectorConstants.SECTOR_DATA_TYPE.STRING);
        });

        it('Numeric Column Sector', () => {
            component.selectedNode = new BreakdownTreeNode();
            component.selectedNode.sectorModel = new NumericColumnSector();
            component.ngOnChanges({
                selectedNode: new SimpleChange(undefined, component.selectedNode, false)
            });
            expect(component.selectedNodeDataType).toEqual(SectorConstants.SECTOR_DATA_TYPE.NUMERIC);
        });

        it('Time Span Column Sector', () => {
            component.selectedNode = new BreakdownTreeNode();
            component.selectedNode.sectorModel = new TimeSpanColumnSector();
            component.ngOnChanges({
                selectedNode: new SimpleChange(undefined, component.selectedNode, false)
            });
            expect(component.selectedNodeDataType).toEqual(SectorConstants.SECTOR_DATA_TYPE.TIME_SPAN);
        });

        it('Date Column Sector', () => {
            component.selectedNode = new BreakdownTreeNode();
            component.selectedNode.sectorModel = new DateColumnSector();
            component.ngOnChanges({
                selectedNode: new SimpleChange(undefined, component.selectedNode, false)
            });
            expect(component.selectedNodeDataType).toEqual(SectorConstants.SECTOR_DATA_TYPE.DATE);
        });

        it('Selected node undefined', () => {
            component.selectedNode = undefined;
            component.ngOnChanges({
                selectedNode: new SimpleChange(undefined, component.selectedNode, false)
            });
            expect(component.selectedNodeDataType).toEqual(CoreCommonConstants.EMPTY_STRING);
        });
    });

    it('should update userSpecifiedSchema in schema sector model', () => {
        component.selectedNode = new BreakdownTreeNode();
        component.selectedNode.sectorModel = new SchemaSector();
        expect((component.selectedNode.sectorModel as SchemaSector).userSpecifiedSchema).toBeUndefined();

        const event: any = {detail: {value: 'Test'}};
        component.onSchemaValueChanged(event);
        expect((component.selectedNode.sectorModel as SchemaSector).userSpecifiedSchema).toEqual('Test');
    });

    describe('Test setHideQuantile', () => {
        it('should not hide quantile', function () {
            component.breakdownBuilderSettings = new BreakdownBuilderSettings();
            component.widgetType = WidgetConfigType.RETURNS;
            const cd = new ColumnDefinition();
            cd.groups = ['ESG'];
            const selectedSector = new BreakdownSectorSelectorOption('label');
            selectedSector.eventData = cd;
            component.selectedSector = selectedSector;
            component.setHideQuantile();
            expect(component.hideQuantiles).toBeFalsy();

            cd.groups = ['Company Fundamentals'];
            selectedSector.eventData = cd;
            component.selectedSector = selectedSector;
            component.setHideQuantile();
            expect(component.hideQuantiles).toBeFalsy();
        });

        it('should hide quantile', function () {
            component.breakdownBuilderSettings = new BreakdownBuilderSettings();
            component.widgetType = WidgetConfigType.RETURNS;
            const cd = new ColumnDefinition();
            cd.groups = ['Position'];
            const selectedSector = new BreakdownSectorSelectorOption('label');
            selectedSector.eventData = cd;
            component.selectedSector = selectedSector;
            component.setHideQuantile();
            expect(component.hideQuantiles).toBeTruthy();
        });
    });
});
