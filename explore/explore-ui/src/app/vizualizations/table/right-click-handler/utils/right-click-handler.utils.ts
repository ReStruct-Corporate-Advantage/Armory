import {MenuItemDef} from 'ag-grid-community';

export class RightClickHandlerUtils {

    public static readonly PLOT_FACTOR_DATA: string = 'Plot factor data';
    public static readonly TABLE: string = 'Open Table';
    public static readonly CHART: string = 'Open Chart';
    public static readonly LAUNCH: string = 'Launch';

    /**
     * Returns Main Menu with appended child menu if valid
     */
    public static addToSubMenu(mainMenuItem: any, type: string, childMenuItems: MenuItemDef[]): any {
        if (this.isValidMenuWithChildSubMenu(mainMenuItem, childMenuItems)) {
            const subMenuItem = this.getSubMenu(mainMenuItem, type);
            childMenuItems.forEach((childMenu) => (subMenuItem.subMenu as MenuItemDef[]).push(childMenu));
        }
        return mainMenuItem;
    }

    /**
     * Returns Sub menu by Type attached to main menu
     */
    public static getSubMenu(mainMenuItem: any, type: string): MenuItemDef {
        let subMenuItem: MenuItemDef = mainMenuItem.find((item) => item.name === type);
        if (!subMenuItem) {
            subMenuItem = {
                name: type,
                subMenu: []
            };
            mainMenuItem.push(subMenuItem);
        }
        return subMenuItem;
    }

    /**
     * Check if Main menu and child menu are ok to append
     */
    private static isValidMenuWithChildSubMenu(mainMenuItem: any, childMenuItems: MenuItemDef[]) {
        return !(!childMenuItems || childMenuItems.length === 0 || !mainMenuItem);
    }
}
