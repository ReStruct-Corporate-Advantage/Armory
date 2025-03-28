/**
 * Interface implemented by those derived settings which need to reveal the source of the settings to the user
 */
export interface SupportsRevealSources {
    setSettingsSource(source: string);
}

/**
 * Utility method to check if the object is an instance of this.
 */
export function isSupportsRevealSources(object: any): object is SupportsRevealSources {
    return object && 'setSettingsSource' in object;
}
