import {
    DependentConstraintsMetaData
} from '@optimization-settings/constraints-settings/models/dependent-constraints-meta-data.model';

describe('DependentConstraintsMetaData tests', () => {
    it('test serialize/deserialize', () => {
        let serializedMetaData: any = {dependentConstraintTags: ['abc', 'def', 'ghi'], notification: 'This test checks serialization / deserialization.'};
        expect(serializedMetaData).toEqual(new DependentConstraintsMetaData(serializedMetaData).serialize());

        serializedMetaData = {dependentConstraintTags: ['abc', 'def', 'ghi']};
        expect(serializedMetaData).toEqual(new DependentConstraintsMetaData(serializedMetaData).serialize());

        serializedMetaData = {notification: 'This test checks serialization / deserialization.'};
        expect({dependentConstraintTags: [], notification: 'This test checks serialization / deserialization.'})
            .toEqual(DependentConstraintsMetaData.createDependentConstraintsMetaData([], 'This test checks serialization / deserialization.')
                .serialize());

        try {
            serializedMetaData = {};
            new DependentConstraintsMetaData(serializedMetaData).serialize();
        } catch (e) {
            expect(e).toHaveProperty('message', 'Found dependentConstraintTags and notification as empty.');
        }
    });
});
