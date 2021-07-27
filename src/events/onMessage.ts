import { cancelEmbed, embedHolder, requestColor, requestTitle, requestTargetChannel, sendEmbed, requestFieldName, requestAmountOfFields, requestFieldValue, requestFieldInline } from '../commands/embedMaker'
import * as Discord from 'discord.js'
import { EmbedBuilderState } from '../models/EmbedBuilder'
import { onCommand } from './onCommand';
import { client } from '../index';

export function onMessage(message : Discord.Message) {
	// remove pinned notices, if they come from this bot
	if(message.type === "PINS_ADD" && client.user && message.author.id === client.user.id) 
		message.delete();

	// if it's a command, throw it there
	if(message.content[0] == "!")
		return onCommand(message);

	// !embed related
	if(message.member && message.member.hasPermission("ADMINISTRATOR"))
	{
		if(embedHolder.has(message.member))
		{
			switch(embedHolder.get(message.member)?.state)
			{
				case EmbedBuilderState.REQUESTING_TITLE: {
					requestTitle(message)
					break;
				}

				case EmbedBuilderState.REQUESTING_COLOR: {
					requestColor(message)
					break;
				}

				case EmbedBuilderState.REQUESTING_AMOUNT_OF_FIELDS:{
					requestAmountOfFields(message)
					break;
				}

				case EmbedBuilderState.REQUESTING_FIELD_NAME:{
					requestFieldName(message)
					break;
				}

				case EmbedBuilderState.REQUESTING_FIELD_VALUE:{
					requestFieldValue(message)
					break;
				}

				case EmbedBuilderState.REQUESTING_FIELD_INLINE:{
					requestFieldInline(message)
					break;
				}

				case EmbedBuilderState.REQUESTING_TARGET_CHANNEL: {
					requestTargetChannel(message)
					break;
				}
				
				case EmbedBuilderState.READY: {
					if(message.content == "send")
					{
						sendEmbed(message)
						break;
					}
					else if(message.content == "cancel")
					{
						cancelEmbed(message)
						break;
					}
					break;
				}
			}
		}
	}
}