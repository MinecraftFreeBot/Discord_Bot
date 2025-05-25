import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { getBalance } from '../datasave.js';

export default {
  data: new SlashCommandBuilder()
    .setName('taka')
    .setDescription('Check your or someone else\'s balance')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to check balance for (admin only)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    const isSelf = target.id === interaction.user.id;
    const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);

    if (!isSelf && !isAdmin) {
      return await interaction.reply({
        content: '❌ You are not allowed to check other users’ balance.',
        ephemeral: true
      });
    }

    const balance = await getBalance(target.id);
    const balanceDisplay = `৳${balance.toLocaleString()}`;

    const embed = new EmbedBuilder()
      .setColor('#FFB600')
      .setTitle('💵 Personal Balance')
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .setDescription([
        `**👤 User:** <@${target.id}>`,
        '',
        `💰 **Balance**`,
        `\`\`\`ansi\n\u001b[1;33m${balanceDisplay}\u001b[0m\`\`\``
      ].join('\n'))
      .setFooter({
        text: `💳 Wallet ID: ${target.username}`,
        iconURL: target.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      ephemeral: isSelf // 👈 Only hide if viewing own balance
    });
  }
};
