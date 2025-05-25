import { Client, Collection, GatewayIntentBits } from 'discord.js';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { token, clientId, guildId } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = (await fs.readdir(commandsPath)).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  client.commands.set(command.default.data.name, command.default);
}

// Register slash commands on bot ready
client.once('ready', async () => {
  const guild = client.guilds.cache.get(guildId);
  if (guild) {
    await guild.commands.set(client.commands.map(cmd => cmd.data));
    console.log(`✅ Commands registered in guild: ${guild.name}`);
  }
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

// Handle slash commands
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: '⚠️ Error executing command.', ephemeral: true });
  }
});

client.login(token);
