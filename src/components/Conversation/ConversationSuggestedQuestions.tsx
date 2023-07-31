import { Conversation } from "typings/weaver";
import Weaver from "main";
import React, { useEffect } from "react";

interface ConversationSuggestedQuestionsProps {
	plugin: Weaver;
	conversation: Conversation | undefined;
	onSubmit: (event: React.FormEvent, overrideText?: string) => Promise<void>;
}

export const ConversationSuggestedQuestions: React.FC<ConversationSuggestedQuestionsProps> = ({
	conversation,
	onSubmit
}) => {
	useEffect(() => {
	}, [])

	const questions = ['How can you help me?', 'What can you do?', 'What are your functions?'];
	const operations = ['Explain', 'Revise', 'Sumarize', 'Expand'];

	// Find the last assistant message
	const lastAssistantMessage = (conversation?.messages || []).slice().reverse().find(message => message.author && message.author.role === 'assistant');


	const handleOperation = (operation: string) => {
		// Create a fake event
		const fakeEvent = {
			preventDefault: () => { },
		} as React.FormEvent;

		onSubmit(fakeEvent, operation);
	}

	return (
		conversation!?.messages?.length < 2 ? (
			<div className="ow-conversation-questions">
				<div className="ow-conversation-questions-inner">
					{questions.map((question, index) =>
						<div
							key={index}
							className="ow-question"
							onClick={() => handleOperation(question)}
						>
							{question}
						</div>
					)}
				</div>
			</div>
		) : (
			lastAssistantMessage && lastAssistantMessage.content.content_type === 'question' ? (
				<div className="ow-conversation-questions">
					<div className="ow-conversation-questions-inner">
						{operations.map((operation, index) =>
							<div
								key={index}
								className="ow-question"
								onClick={() => handleOperation(operation)}
							>
								{operation}
							</div>
						)}
					</div>
				</div>
			) : null
		)
	)
}
