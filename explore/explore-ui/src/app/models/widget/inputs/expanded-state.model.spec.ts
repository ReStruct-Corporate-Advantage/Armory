import {AbstractConfig, ConfigTypeFactory} from '@blk/explore-ui-core';
import {ConfigInitializer} from '../../../initializers/config.initializer';
import {ExpandedState} from './expanded-state.model';
import {cloneDeep} from 'lodash';

describe('Expanded state test case', () => {
    beforeAll(() => {
        ConfigInitializer.registerWidgetInputTypes();
    });

    /**
     * Tests that the updateItem function behaves as expected.
     */
    it('Test updateItem', function () {
        const expandedState: ExpandedState = new ExpandedState();

        // Add an item and make sure it is there.
        expandedState.updateItem([ExpandedState.ROOT_NODE_KEY], true);
        expect(expandedState.expandedPaths.length).toBe(1);

        // Add the same item and make sure we still only have 1.
        expandedState.updateItem([ExpandedState.ROOT_NODE_KEY], true);
        expect(expandedState.expandedPaths.length).toBe(1);

        // update the same item to not be expanded.
        expandedState.updateItem([ExpandedState.ROOT_NODE_KEY], false);
        expect(expandedState.expandedPaths.length).toBe(0);
    });

    /**
     * Tests that the updateItem function behaves as expected.
     */
    it('Test reset', function () {
        const expandedState: ExpandedState = new ExpandedState();

        // Add an item and make sure it is there.
        expandedState.updateItem([ExpandedState.ROOT_NODE_KEY], true);
        // Add the same item and make sure we still only have 1.
        expandedState.updateItem([ExpandedState.ROOT_NODE_KEY, 'Sector1'], true);
        expect(expandedState.expandedPaths.length).toBe(2);

        expandedState.reset([[ExpandedState.ROOT_NODE_KEY]]);
        expect(expandedState.expandedPaths.length).toBe(1);
        expect(expandedState.expandedPaths).toStrictEqual([[ExpandedState.ROOT_NODE_KEY]]);
    });

    /**
     * Tests that the updateItem function ignores any items added if expand all is set.
     */
    it('Test updateItem - All Expanded', function () {
        const expandedState: ExpandedState = new ExpandedState();
        expandedState.allExpanded = true;
        expandedState.updateItem([ExpandedState.ROOT_NODE_KEY], true);
        expect(expandedState.expandedPaths.length).toBe(0);
    });

    /**
     * Test that we can serialize the object with a list of expanded nodes.
     */
    it('Test serialize/deserialize', function () {
        const expandedState: ExpandedState = new ExpandedState();
        expandedState.updateItem([ExpandedState.ROOT_NODE_KEY], true);
        expandedState.updateItem([ExpandedState.ROOT_NODE_KEY, 'Sector1'], true);
        expandedState.updateItem([ExpandedState.ROOT_NODE_KEY, 'Sector2'], true);

        // Serialise the object to a string and create a new one from it.
        const json: string = JSON.stringify(expandedState.serialize(false));
        const newExpandedState: ExpandedState = new ExpandedState(JSON.parse(json));

        // Validate the expected results.
        expect(newExpandedState.allExpanded).toBeFalsy();
        const paths: string[][] = newExpandedState.expandedPaths;
        expect(paths).not.toBeUndefined();
        expect(paths).not.toBeNull();
        expect(paths.length).toBe(3);
    });

    /**
     * Test that we can serialize the object with it flagged as all nodes expanded.
     */
    it('Test serialize/deserialize - All Expanded', function () {
        const expandedState: ExpandedState = new ExpandedState();
        expandedState.allExpanded = true;

        // Serialise the object to a string and create a new one from it.
        const json: string = JSON.stringify(expandedState.serialize(false));
        const newExpandedState: ExpandedState = new ExpandedState(JSON.parse(json));

        // Validate the expected results.
        expect(newExpandedState.allExpanded).toBeTruthy();
        const paths: string[][] = newExpandedState.expandedPaths;
        expect(paths).not.toBeUndefined();
        expect(paths).not.toBeNull();
        expect(paths.length).toBe(0);
    });

    /**
     * Test that we can serialize the object with nothing in it we end up with undefined.
     */
    it('Test serialize/deserialize - No Settings', function () {
        const expandedState: ExpandedState = new ExpandedState();

        // Serialise the object.
        const data: any = expandedState.serialize(false);

        // Validate the expected results.
        expect(data).toBeDefined();
        expect(data.expandedPaths).toBeDefined();
        expect(data.expandedPaths.length).toBe(0);

        // Now also check that we can get a new one by passing in an undefined to deserialize.
        const newExpandedState: ExpandedState = new ExpandedState();
        newExpandedState.deserialize(data);

        // Validate that there are no expanded paths and the all flag is not set.
        expect(newExpandedState.allExpanded).toBeFalsy();
        const paths: string[][] = newExpandedState.expandedPaths;
        expect(paths).not.toBeUndefined();
        expect(paths).not.toBeNull();
        expect(paths.length).toBe(0);
    });

    /**
     * Validate that we can create the object from the ConfigFactory.
     */
    it('Test create from factory', function () {
        const model: AbstractConfig = ConfigTypeFactory.createConfig({}, ExpandedState.configType, true);
        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model instanceof ExpandedState).toBeTruthy();
    });

    /**
     * Test doing a clone of the object.
     * The reason we have added this test is because we had used a Map object withing the
     * class and it caused an issue with the call to cloneDeep.  This makes sure that if we
     * change the implementation the code path that needs this is ok.
     */
    it('Test deepClone', function () {
        const expandedState: ExpandedState = new ExpandedState();
        expandedState.updateItem([ExpandedState.ROOT_NODE_KEY], true);
        expandedState.updateItem([ExpandedState.ROOT_NODE_KEY, 'Sector1'], true);
        expandedState.updateItem([ExpandedState.ROOT_NODE_KEY, 'Sector2'], true);

        // Clone the item.
        const newExpandedState: ExpandedState = cloneDeep(expandedState);

        // Validate the expected results.
        expect(newExpandedState.allExpanded).toBeFalsy();
        const paths: string[][] = newExpandedState.expandedPaths;
        expect(paths).not.toBeUndefined();
        expect(paths).not.toBeNull();
        expect(paths.length).toBe(3);
    });

    it('Test shouldSkipSerialize', () => {
        const model = new ExpandedState();
        expect(model.shouldSkipSerialize()).toBeFalsy();
    });
});

