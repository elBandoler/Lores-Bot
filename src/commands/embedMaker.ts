import { GuildMember, Message, MessageEmbed, TextChannel } from 'discord.js';
import { formatCurrentDateTime } from '../utils/date';
import { EmbedBuilder, EmbedBuilderState } from '../models/EmbedBuilder';

export let embedHolder = new Map<GuildMember, EmbedBuilder>();
let iconURL = "https://cdn.discordapp.com/attachments/481596110146633738/868969721280733235/lbookicon.png"

/**
 * The !embed command handler, initiatlizes everything we need for making embeds
 */
export function beginEmbedCreator(message : Message) : void
{
    if(message.member)
        embedHolder.set(message.member, new EmbedBuilder(message.channel.id, EmbedBuilderState.REQUESTING_TITLE))
    message.channel.send("**Embed creator started!**\nPlease type the title you want:")
}

/**
 * saves the title and requests the next thing
 */
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

/**
 * saves the content and requests the next thing
 */
export function requestContent(message : Message) : void
{
    if(message.member)
    {
        // save content
        var embedBuilder = embedHolder.get(message.member);
        if(embedBuilder)
        {
            embedBuilder.content = message.content
            embedBuilder.state = EmbedBuilderState.REQUESTING_COLOR // EmbedBuilderState.REQUESTING_FOOTER
        }
    }
  
    //message.channel.send("**Saved!**\nPlease type the footer you want:")
    message.channel.send("**Saved!**\nPlease type the color you want in #RRGGBB format:")
}

/**
 * saves the color and requests the next thing
 */
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

/**
 * saves the target channel, shows a preview and waits for confirmation
 */
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
            .setFooter(`Lore Network - ${formatCurrentDateTime()}`, iconURL)
            .setDescription(embed.content)
            .setColor(embed.color)

            message.channel.send(messageEmbed)
            message.channel.send("**Saved!**\nTo send the embed, type \"send\", to cancel type \"cancel\":")
        }
    }
}

/**
 * sends the embed and removes everything
 */
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
                .setFooter(`Lore Network - ${formatCurrentDateTime()}`, iconURL)
                .setDescription(embed.content)
                .setColor(embed.color)

                channel.send(messageEmbed)
                message.channel.send("**Sent!**")
                embedHolder.delete(message.member)
            }
        }
    }
}

/**
 * cancels the embed and removes everything
 */
export function cancelEmbed(message : Message)
{
    if(message.member && embedHolder.has(message.member))
    {
        embedHolder.delete(message.member)
        message.channel.send("**Cancelled!**")
    }
}