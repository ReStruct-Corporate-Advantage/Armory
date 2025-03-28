/**
 * Enum for publish state codes
 */
export enum PublishStateCode {
    UNPUBLISHED = 0, // Newly defined here. The Prism server only send back a number for published ones.
    UNLOCKED_PUBLISHED = -1,
    PRE_PUBLISHED = -2,
    LOCK_PUBLISHED = 1,
}
