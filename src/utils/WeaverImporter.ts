import Weaver from 'main';
import { FileSystemAdapter, normalizePath } from 'obsidian';
import { IConversation, IChatMessage } from '../interfaces/IThread';
import { FileIOManager } from './FileIOManager';
import { ThreadManager } from './ThreadManager';
import { eventEmitter } from './EventEmitter';

export class WeaverImporter {
	static sanitizeTitle(title: string): string {
		return title.replace(/[^a-zA-Z0-9\s]/g, '').trim();
	}

	static async generateUniqueTitle(adapter: FileSystemAdapter, conversationFolder: string, title: string): Promise<string> {
		let uniqueTitle = title;
		let counter = 1;

		while (await adapter.exists(`${conversationFolder}/${uniqueTitle}.json`)) {
			uniqueTitle = `${title}-${counter}`;
			counter++;
		}

		return uniqueTitle;
	}

	static async importConversations(plugin: Weaver, exportPath: string, conversationsFolderPath: string): Promise<void> {
		try {
			const adapter = plugin.app.vault.adapter as FileSystemAdapter;
			const rawExportData = await adapter.read(normalizePath(exportPath));
			const conversationsData = JSON.parse(rawExportData);
	
			if (conversationsData.identifier === "obsidian-weaver") {
				return;
			}
	
			const existingConversations = await ThreadManager.getAllConversations(plugin, conversationsFolderPath);
	
			for (const conversation of conversationsData) {
				const conversationFolder = normalizePath(`${conversationsFolderPath}`);
	
				let conversationTitle = this.sanitizeTitle(conversation.title);
				conversationTitle = await this.generateUniqueTitle(adapter, conversationFolder, conversationTitle);
	
				const conversationPath = `${conversationFolder}/${conversationTitle}.json`;
	
				if (existingConversations.some(existingConversation => existingConversation.id === conversation.id)) {
					continue;
				}
	
				const messages: IChatMessage[] = [];
	
				for (const nodeId in conversation.mapping) {
					const node = conversation.mapping[nodeId];
					const messageData = node.message;
				
					if (messageData) {
						const contentParts = messageData.content?.parts;
						const content = Array.isArray(contentParts) ? contentParts.join(' ') : '';
	
						messages.push({
							id: messageData.id,
							parent: node.parent,
							children: node.children,
							message_type: 'chat',
							status: 'sent', // set this to the appropriate status
							context: false,
							is_loading: false, // set this to the appropriate loading state
							create_time: new Date(messageData.create_time * 1000).toISOString(),
							update_time: new Date(messageData.update_time * 1000).toISOString(), // set this to the appropriate update time
							author: {
								role: messageData.author.role,
								ai_model: plugin.settings.engine,
								mode: 'balanced' // set this to the appropriate mode
							},
							content: {
								content_type: 'text', // set this to the appropriate content type
								parts: contentParts || []
							}
						});
					}
				}
				
				const conversationData: IConversation = {
					context: true,
					creationDate: new Date(conversation.create_time * 1000).toISOString(),
					currentNode: conversation.current_node,
					id: conversation.id,
					identifier: 'obsidian-weaver',
					lastModified: new Date(conversation.update_time * 1000).toISOString(),
					title: conversationTitle,
					messages: messages,
					mode: 'balanced',
					model: plugin.settings.engine
				};
	
				await FileIOManager.ensureFolderPathExists(plugin, "threads/base");
				await adapter.write(conversationPath, JSON.stringify(conversationData, null, 4));
			}
	
			eventEmitter.emit('reloadThreadViewEvent');
		} catch (error) {
			console.error('Error importing conversations:', error);
		}
	}	
}
