import {AdvancedTreeListComponent} from './advanced-tree-list.component';

describe('AdvancedTreeListComponent', () => {
    const component: AdvancedTreeListComponent = new AdvancedTreeListComponent();

    const selectedItem = [{
        'label': 'FX Contribution',
        'isNested': 0,
        'isExpanded': true,
        'key': 0,
        'uid': '487a9510-8002-4d93-b31f-fc6975f4967c',
        'isHidden': false,
        'isSelected': true
    }];

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('check functions', () => {
        expect(typeof component.moveTo).toBe('function');
        expect(typeof component.moveToSource).toBe('function');
        expect(typeof component.moveToTarget).toBe('function');
        expect(typeof component.uncheckAll).toBe('function');
        expect(typeof component.targetSelectionChanged).toBe('function');
        expect(typeof component.sourceSelectionChanged).toBe('function');
    });

    it('test moveToSource', () => {
        component.sourceData = [];
        component.targetData = [{
        'label': 'FX Contribution',
        'isExpanded': false,
        'uid': '487a9510-8002-4d93-b31f-fc6975f4967c',
        'isSelected': true
    }];

    let response: Promise<any> = null;
    component.targetTreeList = {
        getSourceSelection: function () {
            response = Promise.resolve(selectedItem);
            return response;
        }
    };

    component.moveToSource();

    response.then(() => {
        expect(component.sourceData.length).toEqual(1);
        expect(component.sourceData).toEqual(selectedItem);
        expect(component.sourceData[0].isSelected).toBeFalsy();
        expect(component.targetData.length).toEqual(0);
    });
});

    it('test moveToTarget', () => {
        component.targetData = [];
        component.sourceData = [{
            'label': 'FX Contribution',
            'isExpanded': false,
            'uid': '487a9510-8002-4d93-b31f-fc6975f4967c',
            'isSelected': true
        }];

        let response: Promise<any> = null;
        component.sourceTreeList = {
            getSourceSelection: function () {
                response = Promise.resolve(selectedItem);
                return response;
            }
        };

        component.moveToTarget();

        response.then(() => {
            expect(component.targetData.length).toEqual(1);
            expect(component.targetData).toEqual(selectedItem);
            expect(component.targetData[0].isSelected).toBeFalsy();
            expect(component.sourceData.length).toEqual(0);
        });
    });

    it('test onReorder', () => {
        component.targetData = [{
            'label': 'Underlying Fund',
            'isExpanded': false,
            'uid': '487a9510-8002-4d93-b31f-fc6975f4967c',
            'isSelected': true
        }, {
            'label': 'FX Contribution',
            'isExpanded': false,
            'uid': '487a9510-8002-4d93-b31f-fc6975f4967c',
            'isSelected': true
        }];

        const event = {
            detail: {
                value: [
                    {
                        'label': 'FX Contribution',
                        'isExpanded': false,
                        'uid': '487a9510-8002-4d93-b31f-fc6975f4967c',
                        'isSelected': true
                    }, {
                        'label': 'Underlying Fund',
                        'isExpanded': false,
                        'uid': '487a9510-8002-4d93-b31f-fc6975f4967c',
                        'isSelected': true
                    }
                ]
            }
        };
        component.onReorder(event);

        expect(component.targetData.length).toEqual(2);
        expect(component.targetData[1].label).toEqual('Underlying Fund');
    });

});
