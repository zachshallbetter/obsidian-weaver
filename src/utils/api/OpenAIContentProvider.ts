
import Weaver from "main";
import OpenAIRequestFormatter from "./OpenAIRequestFormatter";
import { IChatMessage, IConversation } from "interfaces/IThread";
import OpenAIRequestManager from "./OpenAIRequestManager";

export default class OpenAIContentProvider {
	private readonly plugin: Weaver;
	private requestFormatter: OpenAIRequestFormatter;
	private streamManager: OpenAIRequestManager;

	constructor(plugin: Weaver) {
		this.plugin = plugin;
		this.requestFormatter = new OpenAIRequestFormatter(this.plugin);
		this.streamManager = new OpenAIRequestManager(plugin);
	}

	public async generateResponse(
		parameters: any = this.plugin.settings,
		additionalParameters: any = {},
		conversation: IConversation,
		conversationContext: IChatMessage[],
		userMessage: IChatMessage,
		addMessage: (message: IChatMessage) => void,
		updateCurrentAssistantMessageContent: (content: string) => void,
	): Promise<boolean> {
		const requestParameters = this.requestFormatter.prepareChatRequestParameters(parameters, additionalParameters, conversation, conversationContext);
		try {
			await this.streamManager.handleOpenAIStreamSSE(
				requestParameters,
				userMessage,
				addMessage,
				updateCurrentAssistantMessageContent,
				conversation
			);
			return true;
		} catch (error) {
			console.error('Error in handleOpenAIStreamSSE:', error.data);
			addMessage({ content: "Sorry, an error occurred while processing your request.", type: "error" });
			return false;
		}
	}

	public async stopStreaming() {
		this.streamManager.stopStreaming();
	}
}
