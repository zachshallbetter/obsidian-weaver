
import OpenAIMessageDispatcher from './OpenAIMessageDispatcher';

class OpenAIRequestManager {
    private apiEndpoint: string = "https://api.openai.com";
    private headers: any = {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    };
    private dispatcher: OpenAIMessageDispatcher;
    private requestStartTime: number = 0;
    private requestEndTime: number = 0;

    constructor(dispatcher: OpenAIMessageDispatcher, config?: { endpoint?: string, headers?: any }) {
        if (config?.endpoint) {
            this.apiEndpoint = config.endpoint;
        }
        if (config?.headers) {
            this.headers = { ...this.headers, ...config.headers };
        }
        this.dispatcher = dispatcher;
    }

    public async sendRequest(payload: any, advancedConfig?: { model?: string, temperature?: number, maxTokens?: number }) {
        this.requestStartTime = Date.now();

        if (advancedConfig) {
            payload = { ...payload, ...advancedConfig };
        }

        try {
            const controller = new AbortController();
            const response = await fetch(this.apiEndpoint, { 
                method: 'POST', 
                body: JSON.stringify(payload), 
                headers: this.headers, 
                signal: controller.signal 
            });

            this.requestEndTime = Date.now();
            this.logPerformanceMetrics();

            if (response.status !== 200) {
                throw new Error(`Received status code ${response.status}: ${response.statusText}`);
            }

            const responseData = await response.json();
            
            if (!responseData) {
                throw new Error("Empty response from OpenAI.");
            }

            this.dispatcher.addMessageToConversation(responseData);

            return responseData;
        } catch (error) {
            console.error("Error sending request to OpenAI:", error);

            if (error.response && error.response.status === 429) {
                console.error("Rate limit exceeded for OpenAI API.");
            } else if (!navigator.onLine) {
                console.error("Network error. Please check your internet connection.");
            }

            this.dispatcher.addInfoMessageToConversation("An error occurred while sending the request. Please try again.");
        }
    }

    private logPerformanceMetrics() {
        const requestDuration = this.requestEndTime - this.requestStartTime;
        console.log("Request duration (ms):", requestDuration);
    }
}

export default OpenAIRequestManager;
