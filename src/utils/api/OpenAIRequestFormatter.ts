
import Weaver from "main";
import { WeaverSettings } from "settings";
import { ChatMessage, Conversation } from "typings/weaver";

interface BodyParameters {
	messages: { role: string; content: string; }[];
	frequency_penalty: number;
	max_tokens: number;
	model: string;
	temperature: number;
	stream: boolean;
}

export default class OpenAIRequestFormatter {
	private readonly plugin: Weaver;
	private readonly requestUrlBase: string = "https://api.openai.com/v1";
	private readonly requestEndpoint: string = "/chat/completions";

	constructor(plugin: Weaver) {
		this.plugin = plugin;
	}

	prepareChatRequestParameters(
		parameters: WeaverSettings, 
		additionalParameters: {
			bodyParameters?: BodyParameters,
			requestParameters?: {
				url: string,
				method: string,
				body: string,
				headers: {
					[key: string]: string
				}
			}
		} = {}, conversation: Conversation, conversationHistory: ChatMessage[] = []
	) {
		const requestUrl = `${this.requestUrlBase}${this.requestEndpoint}`;
		const bodyParameters: BodyParameters = {
			frequency_penalty: parameters.frequencyPenalty,
			max_tokens: parameters.maxTokens,
			model: conversation.model ? conversation.model : parameters.engine,
			temperature: parameters.temperature,
			stream: true,
			messages: conversationHistory.map((message: ChatMessage) => {
				return { role: message.author.role, content: message.content.parts };
			})
		};

		const mergedBodyParameters = { ...bodyParameters, ...additionalParameters?.bodyParameters };
		const requestParameters = {
			url: requestUrl,
			method: "POST",
			body: JSON.stringify(mergedBodyParameters),
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${parameters.apiKey}`,
				...(process.env.OPENAI_ORGANIZATION && {
					'OpenAI-Organization': process.env.OPENAI_ORGANIZATION,
				})
			}
		};

		return { ...requestParameters, ...additionalParameters?.requestParameters };
	}
}

