
import { OpenAIMessageDispatcher } from '../utils/api/OpenAIMessageDispatcher';

class SSEService {
    private sseEndpoint: string = "https://sse.openai.com/endpoint"; // Default endpoint
    private eventSource: EventSource | null = null;
    private dispatcher: OpenAIMessageDispatcher;

    constructor(dispatcher: OpenAIMessageDispatcher) {
        this.dispatcher = dispatcher;
    }

    public connectSSE(endpoint?: string) {
        if (endpoint) {
            this.sseEndpoint = endpoint;
        }
        if (this.eventSource) {
            this.eventSource.close();
        }
        this.eventSource = new EventSource(this.sseEndpoint);
        
        this.eventSource.onmessage = this.handleSSEMessage;
        this.eventSource.onerror = this.handleSSEError;
    }

    private handleSSEMessage(event: MessageEvent) {
        try {
            const data = JSON.parse(event.data);
            this.dispatcher.addMessageToConversation(data);
        } catch (error) {
            console.error("Error parsing SSE message:", error);
            this.dispatcher.addInfoMessageToConversation("Received malformed data from the server.");
        }
    }

    private handleSSEError(error: Event) {
        console.error("SSE Error:", error);
        this.dispatcher.addInfoMessageToConversation("An error occurred while streaming. Trying to reconnect...");
        this.reconnectSSE();
    }

    private reconnectSSE() {
        if (this.eventSource) {
            this.eventSource.close();
            setTimeout(() => {
                this.connectSSE();
            }, 5000);  // Wait for 5 seconds before attempting to reconnect
        }
    }

    public closeSSE() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
            this.dispatcher.addInfoMessageToConversation("SSE connection closed.");
        }
    }
}

export default SSEService;
