import {UserMetaDataStore} from './user-meta-data.store';
import {UserPreference} from '../constants';
import {CoreUserMetaDataStore, UserMetaData} from '@blk/explore-ui-core';

/**
 * Tests for the user meta data store.
 */
describe('User Meta Data tests', () => {

    /**
     * Initialise the store for tests.
     */
    beforeEach(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.preferences.set(UserPreference.NAVIGATION_DRAWER_OPEN.name, 'true');
        CoreUserMetaDataStore.userMetaData.preferences.set(UserPreference.DEFAULT_WORKSPACE.name, '123');
    });

    /**
     * Validates that the get preference value works as expected.
     */
    it('Test getting a user preference value', () => {
        const prefValue = UserMetaDataStore.getPreferenceValue(UserPreference.NAVIGATION_DRAWER_OPEN);
        expect(prefValue).toBe('true');
    });

    /**
     * Validates that the get preference value returns the default when there is no setting.
     */
    it('Test getting a user preference value with default', () => {
        const prefValue = UserMetaDataStore.getPreferenceValue(UserPreference.THEME);
        expect(prefValue).toBe(UserPreference.THEME.defaultValue);
    });

    /**
     * Validates that the subscription to a preference changing fires the event.
     * NOTE:  In this test there are multiple subscriptions to ensure that they all get triggered.
     */
    it('Get an observable of the preference value', async() => {
        // subscribe to the preference being updated.
        let updatedValue = UserMetaDataStore.getPreferenceValue(UserPreference.NAVIGATION_DRAWER_OPEN);
        let updatedValue2 = updatedValue;
        UserMetaDataStore.getPreferenceSubject(UserPreference.NAVIGATION_DRAWER_OPEN).subscribe(value => {
            updatedValue = value;
        });
        UserMetaDataStore.getPreferenceSubject(UserPreference.NAVIGATION_DRAWER_OPEN).subscribe(value => {
            updatedValue2 = value;
        });

        // Validate that the existing value is correct.
        expect(updatedValue).toBe('true');

        // Change the value.
        UserMetaDataStore.setPreferenceValue(UserPreference.NAVIGATION_DRAWER_OPEN, 'false');

        // Wait for the value to be changed.
        await expect(updatedValue).toBe('false');
        await expect(updatedValue2).toBe('false');
    });

    /**
     * Validates that updating a preference to the same value does not trigger the subscription..
     */
    it('Get an observable of the preference value', () => {
        // subscribe to the preference being updated.
        const subject = UserMetaDataStore.getPreferenceSubject(UserPreference.DEFAULT_WORKSPACE);

        // Put a spy on the next function so we can see if it was called.
        jest.spyOn(subject, 'next');

        // Get the current value and set the value to the current value.
        const prefValue = UserMetaDataStore.getPreferenceValue(UserPreference.DEFAULT_WORKSPACE);
        UserMetaDataStore.setPreferenceValue(UserPreference.NAVIGATION_DRAWER_OPEN, prefValue);

        // Validate that the next of the subject was not called.
        expect(subject.next).not.toHaveBeenCalled();
    });
});
