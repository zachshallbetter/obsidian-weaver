export interface IChatMessage {
	content: string;
	creationDate: string;
	isLoading?: boolean;
	role: string;
}

export interface IChatSession {
	color: string;
	context: true;
	creationDate: string;
	icon: string;
	id: number;
	lastModified: string;
	messages: IChatMessage[];
	messagesCount: number;
	model: string;
	path: string;
	tags: string[];
	title: string;
	tokens: number;
}
