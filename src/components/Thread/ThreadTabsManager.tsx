import Weaver from "main"
import React, { useEffect, useState } from "react"

import { Thread } from "./Thread"

import { eventEmitter } from 'utils/EventEmitter';
import { Conversation } from "components/Conversation/Conversation";
import { IConversation } from "typings/IThread";
import { ThreadManager } from "utils/ThreadManager";

interface ThreadTabsManagerProps {
	plugin: Weaver,
}

export const ThreadTabsManager: React.FC<ThreadTabsManagerProps> = ({ plugin }) => {
	const [activeTab, setActiveTab] = useState("thread-page");
	const [reloadTrigger, setReloadTrigger] = React.useState<number>(0);
	const [conversation, setConversation] = useState<IConversation | undefined>();

	useEffect(() => {
		const handleReload = async () => {
			setActiveTab("thread-page");
			setReloadTrigger((prevTrigger) => prevTrigger + 1);
		};

		eventEmitter.on('reloadThreadViewEvent', handleReload);

		return () => {
			eventEmitter.off('reloadThreadViewEvent', handleReload);
		};
	}, []);

	const handleTabSwitch = (tabId: string) => {
		setActiveTab(tabId);
	}

	const handleConversationLoad = async (conversation: IConversation) => {
		setConversation(conversation);
		plugin.settings.lastConversationId = conversation.id;
		plugin.settings.loadLastConversationState = true;
		await plugin.saveSettings();
	};

	useEffect(() => {
		(async () => {
			if (plugin.settings.loadLastConversation && plugin.settings.loadLastConversationState && plugin.settings.lastConversationId !== "") {
				// Add a timeout of 500 milliseconds (0.5 seconds)
				const timeout = setTimeout(async () => {
					const conversationData = await ThreadManager.getAllConversations(plugin, `${plugin.settings.weaverFolderPath}/threads/base`);
					const conversationToLoad = conversationData.find(conversation => conversation.id === plugin.settings.lastConversationId);
					handleTabSwitch("conversation-page");
					handleConversationLoad(conversationToLoad as IConversation);
				}, 500);

				// Clean up the timeout if the component unmounts before it expires
				return () => clearTimeout(timeout);
			}
		})();
	}, []);

	return (
		<div className="ow-thread-tabs-manager" key={reloadTrigger}>
			{activeTab === "thread-page" ? (
				<Thread
					plugin={plugin}
					onTabSwitch={handleTabSwitch}
					onConversationLoad={handleConversationLoad}
				/>
			) : (
				<Conversation
					plugin={plugin}
					onTabSwitch={handleTabSwitch}
					conversation={conversation}
					onConversationLoad={handleConversationLoad}
				/>
			)}
		</div>
	)
}
