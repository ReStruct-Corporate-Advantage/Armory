import {MenuItemDef} from 'ag-grid-community';
import {RightClickHandlerUtils} from './right-click-handler.utils';

describe('RightClickHandlerUtils', () => {
    describe('Test addToSubMenu', () => {
        let mainMenuItem: any;
        const type = RightClickHandlerUtils.TABLE;
        let childMenuItems: MenuItemDef[];

        it('Test addToSubMenu with no main menu', () => {
            expect(RightClickHandlerUtils.addToSubMenu(mainMenuItem, type, childMenuItems)).toBeUndefined();
        });

        it('Test addToSubMenu with no child menu passed', () => {
            mainMenuItem = [{
                name: 'First Menu Item'
            }];
            const modifiedMainMenu = RightClickHandlerUtils.addToSubMenu(mainMenuItem, type, childMenuItems);
            expect(modifiedMainMenu.length).toBe(1);
            expect(modifiedMainMenu[0].name).toBe('First Menu Item');
        });

        it('Test addToSubMenu with one child menu with Widget type Table', () => {
            childMenuItems = [{
                name: 'First Table Child Item'
            }];
            const modifiedMainMenu =  RightClickHandlerUtils.addToSubMenu(mainMenuItem, type, childMenuItems);
            expect(modifiedMainMenu.length).toBe(2);
            expect(modifiedMainMenu[0].name).toBe('First Menu Item');
            expect(modifiedMainMenu[1].name).toBe('Open Table');
            expect(modifiedMainMenu[1].subMenu[0].name).toBe('First Table Child Item');
        });
    });
});
