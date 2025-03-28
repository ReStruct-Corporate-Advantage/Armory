/**
 * MenuOptionWorkspaceDateChangedParameters serves to capture the date input when a user clicks
 * 'set workspace date' in menu options
 */
export class MenuOptionWorkspaceDateChangedParameters {
    date: string;

    constructor(date: string) {
        this.date = date;
    }
}
