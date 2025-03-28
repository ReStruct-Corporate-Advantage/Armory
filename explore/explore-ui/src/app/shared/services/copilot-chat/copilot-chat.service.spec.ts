import { TestBed } from '@angular/core/testing';
import {CopilotChatService} from '@services/copilot-chat/copilot-chat.service.';

describe('CopilotChatService', () => {
    let service: CopilotChatService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CopilotChatService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // Add more tests here for other methods in the CopilotChatService class
});
