/**
 * Interface implemented by all the risk settings to copy their respective risk settings
 */
export interface CopySettings<T> {
    /**
     * Copies settings properties to the current settings object
     */
    copySettings(settings: T);
}
