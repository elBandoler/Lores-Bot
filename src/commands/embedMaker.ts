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
            embedBuilder.state = EmbedBuilderState.REQUESTING_AMOUNT_OF_FIELDS
        }
    }
  
    message.channel.send("**Saved!**\nPlease type the amount of fields you want:")
}

/**
 * saves the amount of fields required and requests the next thing
 */
export function requestAmountOfFields(message : Message) : void
{
    if(message.member)
    {
        var embedBuilder = embedHolder.get(message.member);
        if(embedBuilder)
        {
            if(isNaN(Number(message.content)))
            {
                message.channel.send("**Error!**\nPlease type the amount of fields you want:")
                return 
            }
            embedBuilder.fields = Number.parseInt(message.content)
            embedBuilder.state = EmbedBuilderState.REQUESTING_FIELD_NAME
            message.channel.send(`**Okay, so ${embedBuilder.fields} fields.**\nPlease type the field name you want:`)
        }
    }
}

/**
 * saves the field name and requests the next thing
 */
export function requestFieldName(message : Message)
{
    if(message.member)
    {
        // save content
        var embedBuilder = embedHolder.get(message.member);
        if(embedBuilder)
        {
            embedBuilder.content.push({name: message.content, value: "", inline: false})
            embedBuilder.state = EmbedBuilderState.REQUESTING_FIELD_VALUE
            message.channel.send("**Saved!**\nPlease type the field value you want:")
        }
    }
}

/**
 * saves the field value and requests the next thing
 */
 export function requestFieldValue(message : Message)
 {
     if(message.member)
     {
         // save content
         var embedBuilder = embedHolder.get(message.member);
         if(embedBuilder)
         {
             embedBuilder.content[embedBuilder.content.length-1].value = message.content
             embedBuilder.state = EmbedBuilderState.REQUESTING_FIELD_INLINE
             message.channel.send("**Field Saved!**\nPlease type \"yes\" or \"true\" if the field should be inline.\nOtherwise, just type anything you want:")
         }
     }
 }

 /**
 * saves the field inline and requests the next thing
 */
  export function requestFieldInline(message : Message)
  {
      if(message.member)
      {
        // save content
        var embedBuilder = embedHolder.get(message.member);
        if(embedBuilder)
        {
            if(message.content.startsWith("yes") || message.content.startsWith("true"))
            {
                embedBuilder.content[embedBuilder.content.length-1].inline = true;
            }
            embedBuilder.fields--;
            if(embedBuilder.fields <= 0)
            {
               embedBuilder.state = EmbedBuilderState.REQUESTING_COLOR 
               message.channel.send("**Saved!**\nPlease type the color you want in #RRGGBB format:")
            }
            else {
                embedBuilder.state = EmbedBuilderState.REQUESTING_FIELD_NAME
                message.channel.send("**Field Saved!**\nPlease type the next field name you want:")
            }
        }
      }
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
            message.channel.send("**Saved!**\nPlease mention the channel you want to post in:")
        }
    }

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
            .setFooter(`Lore Network`/* - ${formatCurrentDateTime()}`*/, iconURL)
            .setColor(embed.color)
            .addFields(embed.content)
            .setTimestamp()

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
                .setFooter(`Lore Network`/* - ${formatCurrentDateTime()}`*/, iconURL)
                .setColor(embed.color)
                .addFields(embed.content)
                .setTimestamp()

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