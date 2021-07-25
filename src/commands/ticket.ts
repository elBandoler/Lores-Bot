import { Channel, Guild, GuildChannel, Message, MessageReaction, PartialUser, TextChannel, User } from "discord.js"
import * as fs from 'fs';
import {client} from '../index'

const configPath = __dirname+'/../ticketConfig.json'
let data = JSON.parse(fs.readFileSync(configPath,'utf8')) as TicketConfig

/**
 * sets the ticket channel, in which the bot will send a message and listen to that exact message
 * @param message the command received as a message
 */
export function setTicketChannel(message:Message) {
    // block if not admin
    if(!message.member || !message.member.hasPermission("ADMINISTRATOR")) 
        return;

    // the actual stuff
    var mentionedChannel = message.mentions.channels.first();
    if(mentionedChannel !== undefined)
    {
        data.ticketChannel = mentionedChannel.id
        mentionedChannel.send("To open a new ticket, click on the :ticket: reaction!").then(
            (m : Message) => {
                data.ticketMessage = m.id
                fs.writeFileSync(configPath, JSON.stringify(data), 'utf8')
                m.react('🎫')
                m.pin().then((pinmessage:Message) => pinmessage.delete())
                InitializeTickets()
            }
        ).catch((reason:any) => console.log(`sending a message to the channel was unsuccessful. Reason: ${reason}`))
    }
    else
    {
        message.channel.send("**Usage:** !setTicketChannel #mention_channel")
    }
}

/**
 * sets the ticket category, in which the bot will open new tickets
 * @param message the command received as a message
 */
export function setTicketCategory(message:Message) {
    if(message.channel && message.channel.isText())
    {
        var channel = (message.channel as TextChannel)
        var parentId = channel.parentID
        if(parentId)
        {
            data.ticketCategory = parentId
            fs.writeFileSync(configPath, JSON.stringify(data), 'utf8')
            channel.send("Category set successfully.")
        }
    }
    else {
        console.log("Could not set the category using the channel specified.")
    }
}

/**
 * 
 * @returns the ID of the ticket channel if there is one, undefined if none
 */
export function getTicketChannel() : string | undefined {
    return data.ticketChannel
}

/**
 * 
 * @returns the ID of the ticket category if there is one, undefined if none
 */
export function getTicketCategory() : string | undefined {
    return data.ticketCategory
}

/**
 * 
 * @returns the ID of the ticket message if there is one, undefined if none
 */
export function getTicketMessage() : string | undefined {
    return data.ticketMessage
}


/**
 * Checks if there's a ticket channel & message to listen to.
 * If there isn't a channel, says so in console.log.
 * If there isn't a message but the channel exists, sends such a message.
 * @returns void
 */
export function InitializeTickets() {
    if(data.ticketChannel === "")
    {
        console.log("Note: no ticket channel set. Use !setTicketChannel to set one.")
        return
    }
    else {
        client.channels.fetch(data.ticketChannel).then((c: Channel) => 
            { 
                (c as TextChannel).messages.fetch(data.ticketMessage).catch(() => 
                    {
                        (c as TextChannel).send("To open a new ticket, click on the 🎫 reaction!").then(
                            (m : Message) => {
                                data.ticketMessage = m.id
                                fs.writeFileSync(configPath, JSON.stringify(data), 'utf8')
                                m.react('🎫')
                                m.pin()
                                return
                            }
                        ).catch((reason:any) => console.log(`sending a message to the channel was unsuccessful. Reason: ${reason}`))
                    }
                )
            }
        )
        .catch(() => {
                console.log("Note: no ticket channel set. Use !setTicketChannel to set one.")
                return
            }
        )

    }
}

/**
 * creates a new ticket in the set category
 * @param user the user who asked for a ticket
 */
export function ticketCreate(user : User | PartialUser, server : Guild, reaction: MessageReaction)
{
    // checks if the user already has an open ticket
    for(var c of server.channels.cache.filter(c => c.parentID == data.ticketCategory).array())
    {
        if(c.isText() && c.permissionsFor(user.id)?.has(['VIEW_CHANNEL', 'ADD_REACTIONS', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES', 'ATTACH_FILES', 'EMBED_LINKS']))
        {
            c.send(`Hey <@${user.id}>, you cannot open a new ticket while this one is still open. Use it instead.`)
            reaction.users.remove(user.id)
            return
        }
    }

    // otherwise, generates a name
    var channelName = `ticket-${Date.now().toString(16)}`
    while(server.channels.cache.find(c => c.name === channelName))
        channelName = `ticket-${Date.now().toString(16)}`

    // after a name was generated, creates it
    server.channels.create(channelName,
        { 
            type: 'text', 
            topic: `Ticket created by ${user.username}#${user.discriminator}`, 
            parent: data.ticketCategory,
            
            permissionOverwrites: [
                { id: user.id, allow: ['VIEW_CHANNEL', 'ADD_REACTIONS', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES', 'ATTACH_FILES', 'EMBED_LINKS'] },
                { id: server.id, deny: ['VIEW_CHANNEL']}
            ]
        }
    )
    .then((ch : TextChannel) => 
        {
            ch.send(`Hey, <@${user.id}>, this is your ticket! Please describe your issue.`)
            reaction.users.remove(user.id)
        }
    )
    .catch((reason:any) => console.log(`Could not create a ticket channel for ${user.username}#${user.discriminator}. Reason: ${reason}`))
}

type TicketConfig = {
    ticketMessage: string
    ticketChannel: string
    ticketCategory: string
}