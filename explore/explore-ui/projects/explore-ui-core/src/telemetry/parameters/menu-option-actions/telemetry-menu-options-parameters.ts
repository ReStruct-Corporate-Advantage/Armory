/**
 * MenuOptionsParameters serves to capture the data inputs needed when the user clicks 'Run all Reports', 'get workspace URL'
 * or 'set workspace date' in menu options
 */
export class MenuOptionsParameters {
    menuOption: string;
    workspaceID: number|string;
    workspaceTitle: string;
    workspaceOwner: string;

    constructor(menuOption: string, workspaceID: number|string, workspaceTitle: string, workspaceOwner: string) {
        this.menuOption = menuOption;
        this.workspaceID = workspaceID;
        this.workspaceTitle = workspaceTitle;
        this.workspaceOwner = workspaceOwner;
    }
}
