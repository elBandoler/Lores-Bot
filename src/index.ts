import * as Discord from 'discord.js'
import * as dotenv from 'dotenv'
import { onMessage } from './events/onMessage'
import { InitializeTickets } from './commands/ticket'
import { onReact } from './events/onReact'

dotenv.config()

export const client = new Discord.Client()

client.once('ready', () => {
	InitializeTickets()
	console.log('Ready!')
	console.log('Available commands: !embed !setTicketChannel !setTicketCategory')
});

client.on('message', onMessage)

client.on('messageReactionAdd', onReact)


client.login(process.env.TOKEN)

