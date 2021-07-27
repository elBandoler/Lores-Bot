import { EmbedFieldData, Message, MessageEmbed, TextChannel } from "discord.js";

export class EmbedBuilder {
    /** not for actual Embed */
    creationChannelID : string 
    state : EmbedBuilderState
    fields : number

    /** actual Embed stuff */
    title : string
    color : string
    content : EmbedFieldData[]
    targetChannelID : string

    constructor(creationChannelID : string, state : EmbedBuilderState)
    {
        this.creationChannelID = creationChannelID;
        this.state = state;
        this.fields = 0;

        this.title = "";
        this.color = "";
        this.content = new Array<EmbedFieldData>();
        this.targetChannelID = "";
    }
}

export enum EmbedBuilderState {
    REQUESTING_TITLE,
    REQUESTING_AMOUNT_OF_FIELDS,
    REQUESTING_FIELD_NAME,
    REQUESTING_FIELD_VALUE,
    REQUESTING_FIELD_INLINE,
    REQUESTING_COLOR,
    REQUESTING_TARGET_CHANNEL,
    READY
}