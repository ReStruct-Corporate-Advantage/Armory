export interface SettingsTab {
    name: string;
    type: string;
    subTypeInput?: string;
    component: any;
    inputs?: Map<string, any>;
}
