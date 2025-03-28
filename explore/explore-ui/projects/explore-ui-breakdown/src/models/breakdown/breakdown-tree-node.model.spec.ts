import {BreakdownTreeNode} from './breakdown-tree-node.model';
import {ColumnSector} from '../sector/column-sector/column-sector.model';
import {CustomSector} from '../sector/custom-sector/custom-sector.model';
import {LinkedFavoriteSector} from '../sector/linked-favorite-sector.model';

/**
 * Test cases for BreakdownTreeNode model class
 */
describe('BreakdownTreeNode', () => {

    it('Test isEmpty', () => {
        const breakdownTreeNode = new BreakdownTreeNode();
        expect(breakdownTreeNode.isEmpty()).toBeTruthy();
        breakdownTreeNode.children = [];
        expect(breakdownTreeNode.isEmpty()).toBeTruthy();
        breakdownTreeNode.children = [new BreakdownTreeNode()];
        expect(breakdownTreeNode.isEmpty()).toBeFalsy();
    });

    it('Test removeChildren', () => {
        const breakdownTreeNode = new BreakdownTreeNode();
        breakdownTreeNode.children = [new BreakdownTreeNode()];
        const sector = new ColumnSector();
        sector.children = [new ColumnSector()];
        breakdownTreeNode.sectorModel = sector;
        breakdownTreeNode.removeChildren();
        expect(breakdownTreeNode.isEmpty()).toBeTruthy();
        expect(breakdownTreeNode.sectorModel.children.length === 0).toBeTruthy();
    });

    it('Test removeChild', () => {
        const rootNode = new BreakdownTreeNode();
        const rootNodeSector = new ColumnSector();
        rootNode.sectorModel = rootNodeSector;
        const childNode1 = new BreakdownTreeNode();
        const childNode1Sector = new ColumnSector();
        childNode1.sectorModel = childNode1Sector;
        const childNode2 = new BreakdownTreeNode();
        const childNode2Sector = new ColumnSector();
        childNode2.sectorModel = childNode2Sector;
        rootNode.children = [childNode1, childNode2];
        rootNode.sectorModel.children = [childNode1Sector, childNode2Sector];
        rootNode.removeChild(childNode1);
        expect(rootNode.children).toEqual([childNode2]);
        expect(rootNode.sectorModel.children).toEqual([childNode2Sector]);
    });

    it('Test removeChild linkedFavoriteSector', () => {
        const rootNode = new BreakdownTreeNode();
        const linkedFavoriteSector = new LinkedFavoriteSector();
        const linkedFavoriteSectorUnderlyingSector = new CustomSector();
        linkedFavoriteSector.sector = linkedFavoriteSectorUnderlyingSector;
        rootNode.sectorModel = linkedFavoriteSector;
        const childNode1 = new BreakdownTreeNode();
        const childNode1Sector = new ColumnSector();
        childNode1.sectorModel = childNode1Sector;
        const childNode2 = new BreakdownTreeNode();
        const childNode2Sector = new ColumnSector();
        childNode2.sectorModel = childNode2Sector;
        rootNode.children = [childNode1, childNode2];
        rootNode.sectorModel.children = [childNode1Sector, childNode2Sector];
        linkedFavoriteSectorUnderlyingSector.children = [childNode1Sector, childNode2Sector];
        rootNode.removeChild(childNode1);
        expect(rootNode.children).toEqual([childNode2]);
        expect(rootNode.sectorModel.children).toEqual([childNode2Sector]);
        expect(linkedFavoriteSectorUnderlyingSector.children).toEqual([childNode2Sector]);
    });

    it('Test getCustomSectorNodeWithLabel', () => {
        const rootNode = new BreakdownTreeNode();
        const rootNodeSector = new ColumnSector();
        rootNode.sectorModel = rootNodeSector;
        const childNode1 = new BreakdownTreeNode();
        const childNode1Sector = new ColumnSector();
        childNode1.sectorModel = childNode1Sector;
        const customSectorNode1 = new BreakdownTreeNode();
        const linkedSector1 = new LinkedFavoriteSector();
        linkedSector1.sector = new CustomSector();
        customSectorNode1.label = 'Custom Sector1';
        customSectorNode1.sectorModel = linkedSector1;
        const customSectorNode2 = new BreakdownTreeNode();
        const linkedSector2 = new LinkedFavoriteSector();
        linkedSector2.sector = new CustomSector();
        customSectorNode2.label = 'Custom Sector2';
        customSectorNode2.sectorModel = linkedSector2;
        const customSectorNode3 = new BreakdownTreeNode();
        const linkedSector3 = new LinkedFavoriteSector();
        linkedSector3.sector = new CustomSector();
        customSectorNode3.label = 'Custom Sector3';
        customSectorNode3.sectorModel = linkedSector3;
        customSectorNode1.children = [customSectorNode3];
        childNode1.children = [customSectorNode2, customSectorNode1];
        rootNode.children = [childNode1];
        expect(rootNode.getCustomSectorNodeWithLabel('Custom Sector3')).toBe(customSectorNode3);
    });

    it('Test hasColumnSectorChild', () => {
        const rootNode = new BreakdownTreeNode();
        const rootNodeSector = new ColumnSector();
        rootNode.sectorModel = rootNodeSector;
        expect(rootNode.hasColumnSectorChild()).toBeFalsy();
        const childNode1 = new BreakdownTreeNode();
        const childNode1Sector = new CustomSector();
        childNode1.sectorModel = childNode1Sector;
        rootNode.sectorModel.children = [childNode1Sector];
        expect(rootNode.hasColumnSectorChild()).toBeFalsy();
        const childNode2 = new BreakdownTreeNode();
        const childNode2Sector = new ColumnSector();
        childNode2.sectorModel = childNode2Sector;
        rootNode.children = [childNode1, childNode2];
        rootNode.sectorModel.children = [childNode1Sector, childNode2Sector];
        expect(rootNode.hasColumnSectorChild()).toBeTruthy();
    });

    it('Test isMultiLevel', () => {
        const rootNode = new BreakdownTreeNode();

        // Try with null.
        rootNode.children = null;
        expect(rootNode.isMultiLevel()).toBeFalsy();

        // Try with undefined.
        rootNode.children = undefined;
        expect(rootNode.isMultiLevel()).toBeFalsy();

        // Try with empty.
        rootNode.children = [];
        expect(rootNode.isMultiLevel()).toBeFalsy();

        // Try with a child sector.
        rootNode.children.push(new BreakdownTreeNode());
        expect(rootNode.isMultiLevel()).toBeFalsy();

        // Try with 2 child sectors.
        rootNode.children.push(new BreakdownTreeNode());
        expect(rootNode.isMultiLevel()).toBeFalsy();

        // Try with a child with a child sector.
        rootNode.children[1].children = [];
        rootNode.children[1].children.push(new BreakdownTreeNode());
        expect(rootNode.isMultiLevel()).toBeTruthy();
    });

});

