import { Conversation } from "typings/weaver";
import Weaver from "main";
import React, { useEffect, useState } from "react";
import { ConversationDialogue } from "./ConversationDialogue";
import { ConversationHeader } from "./ConversationHeader";
import { ConversationInput } from "./ConversationInput";
import { ConversationSettings } from "./ConversationSettings";

interface ConversationProps {
	plugin: Weaver;
	onTabSwitch: (tabId: string) => void;
	conversation: Conversation | undefined;
	onConversationLoad: (conversation: Conversation) => void;
}

export const Conversation: React.FC<ConversationProps> = ({
	plugin,
	onTabSwitch,
	conversation,
	onConversationLoad
}) => {
	const [conversationSession, setConversationSession] = useState<Conversation | undefined>();
	const [showConversationSettings, setShowConversationSettings] = useState<boolean>(false);

	useEffect(() => {
		setConversationSession(conversation);
	}, []);

	return (
		<div className="ow-conversation">
			<ConversationHeader
				plugin={plugin}
				conversation={conversationSession || {} as Conversation}
				onTabSwitch={onTabSwitch}
				setConversationSession={setConversationSession}
				showConversationSettings={showConversationSettings}
				setShowConversationSettings={setShowConversationSettings}
			/>
			<ConversationDialogue
				plugin={plugin}
				conversation={conversationSession || {} as Conversation}
				setConversationSession={setConversationSession}
			/>
			<ConversationInput
				plugin={plugin}
				conversation={conversationSession || {} as Conversation}
				setConversationSession={setConversationSession}
				onConversationLoad={onConversationLoad}
				onTabSwitch={onTabSwitch}
			/>
			{showConversationSettings === true ? (
				<ConversationSettings 
					plugin={plugin} 
					conversation={conversation as Conversation}
				/>
			) : null}
		</div>
	);
}
