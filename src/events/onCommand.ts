import { beginEmbedCreator } from "../commands/embedMaker";
import { Message } from "discord.js";
import { setTicketCategory, setTicketChannel } from "../commands/ticket";

export function onCommand(message : Message)
{
    if(message.content.startsWith("!embed"))
        return beginEmbedCreator(message)
    else if(message.content.startsWith("!setTicketChannel"))
        return setTicketChannel(message)
    else if(message.content.startsWith("!setTicketCategory"))
        return setTicketCategory(message)
}