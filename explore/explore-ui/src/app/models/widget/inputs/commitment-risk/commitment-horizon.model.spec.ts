import {ConfigInitializer} from '../../../../initializers/config.initializer';
import {ConfigTypeFactory} from '@blk/explore-ui-core';
import {CommitmentHorizon} from '@models/widget/inputs/commitment-risk/commitment-horizon.model';
import {FootnoteState} from '@models/widget/inputs/footnote-state.model';

describe('FactorBlockInput Tests', () => {
    beforeAll(() => {
        ConfigInitializer.registerWidgetInputTypes();
    });

    it('should test configType', () => {
        expect(new CommitmentHorizon().getConfigType()).toBe('commitmentHorizon');
    });

    it('should serialize/deserialize', () => {
        const commitmentHorizon: CommitmentHorizon = new CommitmentHorizon();
        commitmentHorizon.horizon = 3;
        // Convert the object to string and then back to json again.
        const serializedData: any = commitmentHorizon.serialize();
        const deserializedCommitmentHorizon: CommitmentHorizon = ConfigTypeFactory.createConfig(serializedData, CommitmentHorizon.configType, false);
        // Validate that the before and after are the same.
        expect(deserializedCommitmentHorizon.horizon).toBe(3);
    });

    it('should test equals', () => {
        const input1 = new CommitmentHorizon();
        const input2 = new FootnoteState();
        expect(input1.equals(input2)).toBeFalsy();

        const input3 = new CommitmentHorizon();
        input1.horizon = 3;
        input3.horizon = 5;
        expect(input1.equals(input3)).toBe(false);

        input1.horizon = 6;
        input3.horizon = 6;
        expect(input1.equals(input3)).toBe(true);
    });

    it('Test shouldSkipSerialize', () => {
        const commitmentHorizon: CommitmentHorizon = new CommitmentHorizon();
        expect(commitmentHorizon.shouldSkipSerialize()).toBeFalsy();
    });
});
