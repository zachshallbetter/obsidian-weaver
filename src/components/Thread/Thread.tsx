import Weaver from "main";
import React, { useEffect, useState, useMemo } from "react";

import { ThreadHeader } from "./ThreadHeader";
import { ThreadConversationList } from "./ThreadConversationList";
import { Conversation } from "typings/weaver";
import { filterConversations } from 'helpers/ThreadHelperFunctions';
import { ThreadManager } from "utils/ThreadManager";

interface ThreadProps {
	plugin: Weaver;
	onTabSwitch: (tabId: string) => void;
	onConversationLoad: (conversation: Conversation) => void;
}

export const Thread: React.FC<ThreadProps> = ({ 
	plugin,
	onTabSwitch,
	onConversationLoad
}) => {
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		(async () => {
			try {
				const conversationData = await ThreadManager.getAllConversations(plugin, `${plugin.settings.weaverFolderPath}/threads/base`);
				setConversations(conversationData);
			} catch (error) {
				console.error(error);
			}
		})();
	}, []);

	const handleConversationDeleted = (id: string) => {
		setConversations(conversations.filter(conversation => conversation.id !== id));
	};

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(event.target.value);
	};

	const filteredConversations = useMemo(
		() => filterConversations(conversations, searchTerm),
		[conversations, searchTerm]
	);

	return (
		<div className="ow-thread">
			<ThreadHeader
				plugin={plugin}
				messagesCount={filteredConversations.length}
				searchTerm={searchTerm}
				onSearchChange={handleSearchChange}
				onTabSwitch={onTabSwitch}
				onConversationLoad={onConversationLoad}
			/>
			<ThreadConversationList
				plugin={plugin}
				conversations={filteredConversations}
				onConversationDeleted={handleConversationDeleted}
				searchTerm={searchTerm}
				onTabSwitch={onTabSwitch}
				onConversationLoad={onConversationLoad}
			/>
		</div>
	);
};
