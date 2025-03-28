import { ExploreForceReloadComponent } from './explore-force-reload.component';

describe('ExploreForceReload', () => {
    it('cycles when trigger changes', () => {
        const component = new ExploreForceReloadComponent();

        expect(component.cycle).toEqual(0);

        component.trigger = {};

        expect(component.cycle).toEqual(1);
    })
});
