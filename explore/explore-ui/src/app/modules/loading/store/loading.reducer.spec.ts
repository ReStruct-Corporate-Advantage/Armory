import {initialLoadingState, loadingReducer} from './loading.reducer';
import {LoadingMessage} from '../../../models/loading-message.model';
import * as LoadingActions from './loading.actions';
import {LoadingMessageInfo} from '@models/loading-message-info.model';

describe('Loading Reducer', () => {
    describe('an unknown action', () => {
        it('should return the previous state', () => {
            const action = {} as any;
            const result = loadingReducer(initialLoadingState, action);

            expect(result).toBe(initialLoadingState);
        });
    });

    describe('loadingReducer Test', () => {
        const loadingMessage = new LoadingMessage('ld_1234567', new LoadingMessageInfo({message: 'Checking Access', enableClickOnBackground: true}));

        it('should update the state with addLoadingMessage', () => {
            const action1 = new LoadingActions.AddLoadingMessage({key: loadingMessage.key, messageInfo: loadingMessage.messageInfo});
            const expectedResult = {
                ids: ['ld_1234567'],
                entities: {
                    ld_1234567: loadingMessage
                }
            };

            expect(loadingReducer(initialLoadingState, action1)).toEqual(expectedResult);
        });

        it('should update the state with removeLoadingMessage', () => {
            const action1 = new LoadingActions.AddLoadingMessage({key: 'ld_1234567', messageInfo: new LoadingMessageInfo({message: 'Checking Access'})});
            const action2 = new LoadingActions.RemoveLoadingMessage({key: 'ld_1234567'});

            const expectedResult = {
                ids: [],
                entities: {
                }
            };
            loadingReducer(initialLoadingState, action1);

            expect(loadingReducer(initialLoadingState, action2)).toEqual(expectedResult);
        });
    });
});
