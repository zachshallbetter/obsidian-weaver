
import { IChatMessage } from 'typings/IThread';

class OpenAIMessageDispatcher {
    private apiEndpoint: string = "https://api.openai.com";
    private openAIParameters: any = {
        model: "text-davinci-002",
        temperature: 0.7,
        maxTokens: 150
    };
    private responseTimeout: number = 5000; // in milliseconds
    private userMessage: IChatMessage | null = null;
    private assistantMessage: IChatMessage | null = null;

    private handleSSEError(error: Event) {
        console.error("SSE Error:", error);
        this.addInfoMessageToConversation("An error occurred while streaming the response. Please try again.");
    }

    private handleOpenAIError(error: any) {
        console.error("OpenAI Error:", error);
        this.addInfoMessageToConversation("An error occurred with the OpenAI service. Please try again.");
    }

    public addInfoMessageToConversation(messageContent: string) {
        const infoMessage: IChatMessage = {
            content: messageContent,
            sender: "info",
            timestamp: new Date().toISOString()
        };
        this.addMessageToConversation(infoMessage);
    }

    private formatMessageForSSE(userMessageContent: string): string {
        return JSON.stringify({ content: userMessageContent });
    }

    private displayLoadingIndicator() {
        const loadingMessage: IChatMessage = {
            content: "Assistant is thinking...",
            sender: "info",
            timestamp: new Date().toISOString()
        };
        this.addMessageToConversation(loadingMessage);
    }

    private hideLoadingIndicator() {
        // Logic to hide the loading indicator once a response is received or if an error occurs
    }

    private interpretOpenAIResponse(response: any) {
        if (response.error) {
            this.handleOpenAIError(response.error);
        } else {
            const assistantMessage: IChatMessage = {
                content: response.choices[0].text.trim(),
                sender: "assistant",
                timestamp: new Date().toISOString()
            };
            this.addMessageToConversation(assistantMessage);
        }
    }

    public addMessageToConversation(message: IChatMessage) {
        // Logic to add the message to the conversation
    }
}

export default OpenAIMessageDispatcher;
