import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { getBalance, addBalance, removeBalance } from '../datasave.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setaka')
    .setDescription('Set a user’s Taka balance (admin only, 0 to 10,000,000)')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to set balance for')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Amount to set (0 - 10,000,000)')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(10000000)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const admin = interaction.user;
    const target = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    if (amount < 0 || amount > 10000000) {
      return interaction.reply({
        content: '❌ Amount must be between 0 and 10,000,000.',
        ephemeral: true
      });
    }

    const currentBalance = await getBalance(target.id);

    if (currentBalance === amount) {
      return interaction.reply({
        content: `ℹ️ ${target.username} already has a balance of ৳${amount.toLocaleString()}.`,
        ephemeral: true
      });
    }

    // Calculate difference
    if (currentBalance > amount) {
      await removeBalance(target.id, currentBalance - amount);
    } else {
      await addBalance(target.id, amount - currentBalance);
    }

    const embed = new EmbedBuilder()
      .setColor('#9B59B6') // Purple-ish
      .setTitle('🔧 Balance Set')
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .setDescription([
        `👤 **User:** <@${target.id}>`,
        `💰 **New Balance:** \`৳${amount.toLocaleString()}\``
      ].join('\n'))
      .setFooter({ text: `Set by ${admin.tag}`, iconURL: admin.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};
