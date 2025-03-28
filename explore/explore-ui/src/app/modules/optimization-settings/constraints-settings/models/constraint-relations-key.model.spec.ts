import {
    ConstraintRelationsKey
} from "@optimization-settings/constraints-settings/models/constraint-relations-key.model";

describe('ConstraintRelationsKey tests', () => {
    it('test serialize/deserialize', () => {
        let serializedRelationsKey: any = {constraintTag: 'abc', constraintField: 'def'};
        expect(serializedRelationsKey).toEqual(new ConstraintRelationsKey(serializedRelationsKey).serialize());

        try {
            serializedRelationsKey = {constraintTag: 'abc'};
            new ConstraintRelationsKey(serializedRelationsKey).serialize()
        } catch (e) {
            expect(e).toHaveProperty('message', 'Found constraintTag or constraintField as empty');
        }

        try {
            serializedRelationsKey = {constraintField: 'def'};
            new ConstraintRelationsKey(serializedRelationsKey).serialize()
        } catch (e) {
            expect(e).toHaveProperty('message', 'Found constraintTag or constraintField as empty');
        }

        try {
            serializedRelationsKey = {};
            new ConstraintRelationsKey(serializedRelationsKey).serialize()
        } catch (e) {
            expect(e).toHaveProperty('message', 'Found constraintTag or constraintField as empty');
        }
    });
});
