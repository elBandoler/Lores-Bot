import { GuildMember, Message, MessageEmbed, TextChannel } from 'discord.js';
import { EmbedBuilder, EmbedBuilderState } from '../models/EmbedBuilder';

export let embedHolder = new Map<GuildMember, EmbedBuilder>();

export function beginEmbedCreator(message : Message) : void
{
    if(message.member)
        embedHolder.set(message.member, new EmbedBuilder(message.channel.id, EmbedBuilderState.REQUESTING_TITLE))
    message.channel.send("**Embed creator started!**\nPlease type the title you want:")
}

export function requestTitle(message : Message) : void
{
    if(message.member)
    {
        // save title
        var embedBuilder = embedHolder.get(message.member);
        if(embedBuilder)
        {
            embedBuilder.title = message.content
            embedBuilder.state = EmbedBuilderState.REQUESTING_CONTENT
        }
    }
  
    message.channel.send("**Saved!**\nPlease type the content you want:")
}

export function requestContent(message : Message) : void
{
    if(message.member)
    {
        // save content
        var embedBuilder = embedHolder.get(message.member);
        if(embedBuilder)
        {
            embedBuilder.content = message.content
            embedBuilder.state = EmbedBuilderState.REQUESTING_FOOTER
        }
    }
  
    message.channel.send("**Saved!**\nPlease type the footer you want:")
}


export function requestFooter(message : Message) : void
{
    if(message.member)
    {
        // save footer
        var embedBuilder = embedHolder.get(message.member);
        if(embedBuilder)
        {
            embedBuilder.footer = message.content
            embedBuilder.state = EmbedBuilderState.REQUESTING_COLOR
        }
    }

    message.channel.send("**Saved!**\nPlease type the color you want in #RRGGBB format:")
}

export function requestColor(message : Message) : void
{
    if(!/^#[0-9A-F]{6}$/i.test(message.content))
    {
        message.channel.send("**Error!**\nPlease type the color you want in #RRGGBB format:")
        return;
    }

    if(message.member)
    {
        // save color
        var embedBuilder = embedHolder.get(message.member);
        if(embedBuilder)
        {
            embedBuilder.color = message.content
            embedBuilder.state = EmbedBuilderState.REQUESTING_TARGET_CHANNEL
        }
    }
    message.channel.send("**Saved!**\nPlease mention the channel you want to post in:")
}

export function requestTargetChannel(message : Message) : void
{
    if(message.member)
    {
        // save target channel
        var targetChannel = message.mentions.channels.first()
        if(targetChannel === undefined)
        {
            message.channel.send("**Error!**\nPlease mention the channel you want to post in:")
            return;
        }
        var embedBuilder = embedHolder.get(message.member);
        if(targetChannel && embedBuilder)
        {
            embedBuilder.targetChannelID = targetChannel.id
            embedBuilder.state = EmbedBuilderState.READY
        }

        // show preview
        var embed = embedHolder.get(message.member)
        if(embed)
        {
            var messageEmbed = new MessageEmbed()
            .setTitle(embed.title)
            .setFooter(embed.footer)
            .setDescription(embed.content)
            .setColor(embed.color)

            message.channel.send(messageEmbed)
            message.channel.send("**Saved!**\nTo send the embed, type \"send\", to cancel type \"cancel\":")
        }
    }
}

export function sendEmbed(message : Message)
{
    if(message.member)
    {
        var embed = embedHolder.get(message.member)
        if(embed)
        {
            if(message.guild)
            {
                var channel : TextChannel = message.guild.channels.cache.get(embed.targetChannelID) as TextChannel
                var messageEmbed : MessageEmbed = new MessageEmbed()
                .setTitle(embed.title)
                .setFooter(embed.footer)
                .setDescription(embed.content)
                .setColor(embed.color)

                channel.send(messageEmbed)
                message.channel.send("**Sent!**")
            }
        }
    }
}

export function cancelEmbed(message : Message)
{
    if(message.member && embedHolder.has(message.member))
    {
        embedHolder.delete(message.member)
        message.channel.send("**Cancelled!**")
    }
}