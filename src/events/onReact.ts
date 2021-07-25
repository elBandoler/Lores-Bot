import { getTicketMessage, ticketCreate } from "../commands/ticket";
import { MessageReaction, PartialUser, User } from "discord.js";

export function onReact(reaction: MessageReaction, user : User | PartialUser) {
    if(user.bot) return
    switch(reaction.emoji.name)
    {
        case '🎫': {
            if(reaction.message.id == getTicketMessage() && reaction.message.guild) {
                return ticketCreate(user, reaction.message.guild, reaction)
            }
            break;
        }
    }
	return
}
