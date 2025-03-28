import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {BreakdownSectorTreeComponent} from './breakdown-sector-tree.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {BreakdownSectorSelectorOption} from '@blk/explore-ui-breakdown';
import {BehaviorSubject} from 'rxjs';
import {AuxAdvancedTreeListInterface} from '@blk/aladdin-angular-components';

describe('BreakdownSectorTreeComponent', () => {
    let component: BreakdownSectorTreeComponent;
    let fixture: ComponentFixture<BreakdownSectorTreeComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [BreakdownSectorTreeComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        setup();
    });

    const setup = () => {
        fixture = TestBed.createComponent(BreakdownSectorTreeComponent);
        component = fixture.componentInstance;
        component.addSectorSubject$ = new BehaviorSubject<AuxAdvancedTreeListInterface>(null);
        component.draggedNodeSubject$ = new BehaviorSubject<AuxAdvancedTreeListInterface>(null);
        component.searchTermSubject$ = new BehaviorSubject<string>(null);
        component.selectedNodeSubject$ = new BehaviorSubject<AuxAdvancedTreeListInterface>(null);
        component.sectorTreeData = [new BreakdownSectorSelectorOption('Test'), new BreakdownSectorSelectorOption('Test_GROUP', undefined, [new BreakdownSectorSelectorOption('Test1')])];
        fixture.detectChanges();
    }

    it('Test onNodeDoubleClick', () => {
        component.sectorTreeData = [new BreakdownSectorSelectorOption('Test'), new BreakdownSectorSelectorOption('Test_GROUP', undefined, [new BreakdownSectorSelectorOption('Test1')])];
        let event = {detail: {value: {label: 'Test', isSelected: false, children: undefined}}};
        component.onNodeDoubleClick(event as any);
        expect(component.addSectorSubject$.getValue()).toEqual({label: 'Test', isSelected: true});
        expect(component.selectedNodeSubject$.getValue()).toEqual({label: 'Test', isSelected: true});
        expect(component.selectedNode).toEqual({label: 'Test', isSelected: true});
        const selectedNode = component.selectedNode;
        event = {detail: {value: {label: 'Test', isSelected: false, children: [{label: 'Test1', isSelected: false}]}}};
        component.onNodeDoubleClick(event as any);
        expect(component.addSectorSubject$.getValue()).toEqual({label: 'Test', isSelected: false});
        expect(component.selectedNodeSubject$.getValue()).toEqual({
            label: 'Test',
            isSelected: true,
            children: [{label: 'Test1', isSelected: false}]
        });
        expect(component.selectedNode).toEqual({
            label: 'Test',
            isSelected: true,
            children: [{label: 'Test1', isSelected: false}]
        });
        expect(selectedNode.isSelected).toBeFalsy();
    });

    it('Test searchTermSubject$', fakeAsync(() => {
        setup();
        component.searchTermSubject$.next('Test Search');
        tick(300);
        expect(component.searchString).toEqual('Test Search');
        component.searchTermSubject$.next('MA');
        tick(300);
        expect(component.searchString).toEqual('');
        component.searchTermSubject$.next('MAR');
        tick(300);
        expect(component.searchString).toEqual('MAR');
        component.searchTermSubject$.next('ma');
        tick(300);
        expect(component.searchString).toEqual('');
        component.searchTermSubject$.next('%M');
        tick(300);
        expect(component.searchString).toEqual('%M');
        component.searchTermSubject$.next('%MR');
        tick(300);
        expect(component.searchString).toEqual('%MR');
        component.searchTermSubject$.next('%');
        tick(300);
        expect(component.searchString).toEqual('%');
    }));

    it('Test onDragNode', () => {
        let event = {detail: {value: [new BreakdownSectorSelectorOption('Test')]}};
        component.onDragNode(event as any);
        expect(component.draggedNodeSubject$.getValue()).toEqual(new BreakdownSectorSelectorOption('Test'));
        event = {detail: {value: [new BreakdownSectorSelectorOption('Test1'), new BreakdownSectorSelectorOption('Test2')]}};
        component.onDragNode(event as any);
        expect(component.draggedNodeSubject$.getValue()).toEqual(new BreakdownSectorSelectorOption('Test'));
    });

    it('Test onSelectionChanged', () => {
        const event = {detail: {value: [new BreakdownSectorSelectorOption('Test')]}};
        jest.spyOn(component.selectedNodeSubject$, 'next');
        component.onSelectionChanged(event as any);
        expect(component.selectedNodeSubject$.next).toHaveBeenCalledWith(new BreakdownSectorSelectorOption('Test'));
        event.detail = {value: []} as any;
        component.onSelectionChanged(event as any);
        expect(component.selectedNodeSubject$.next).toHaveBeenCalledTimes(1);
    });

    it('Test unSelectSelection', () => {
        component.sectorTreeData = [new BreakdownSectorSelectorOption('Test'), new BreakdownSectorSelectorOption('Test_GROUP', undefined, [new BreakdownSectorSelectorOption('Test1')])];
        component.selectedNode = new BreakdownSectorSelectorOption('Test1');
        component['unSelectSelection']();
        expect(component.selectedNode).toBeUndefined();
        component['unSelectSelection']();
        expect(component.selectedNode).toBeUndefined();
    });
});
