export interface RestrictedOption {
    section: string;
    options: string[];
}

export type RestrictedSections = string[];

export interface RestrictedOptionInterface {
    sections: RestrictedSections;
    options?: RestrictedOption[];
}
