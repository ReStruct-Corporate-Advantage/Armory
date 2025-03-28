/**
 * Enum used to track the state of configs
 */
export enum ConfigState {
    // config is new and loaded with defaults
    NEW,
    // config was previously saved and loaded with saved value
    EXISTING,
    // config has been modified ("touched") from the original
    MODIFIED
}
