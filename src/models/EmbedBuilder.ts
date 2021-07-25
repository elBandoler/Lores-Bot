import { Message, MessageEmbed, TextChannel } from "discord.js";

export class EmbedBuilder {
    /** not for actual Embed */
    creationChannelID : string 
    state : EmbedBuilderState

    /** actual Embed stuff */
    title : string
    color : string
    content : string
    targetChannelID : string

    constructor(creationChannelID : string, state : EmbedBuilderState)
    {
        this.creationChannelID = creationChannelID;
        this.state = state;

        this.title = "";
        this.color = "";
        this.content = "";
        this.targetChannelID = "";
    }
}

export enum EmbedBuilderState {
    REQUESTING_TITLE,
    REQUESTING_CONTENT,
    REQUESTING_COLOR,
    REQUESTING_TARGET_CHANNEL,
    READY
}