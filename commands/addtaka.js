import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { addBalance, getBalance } from '../datasave.js';

export default {
  data: new SlashCommandBuilder()
    .setName('addtaka')
    .setDescription('Add taka to a user (admin only)')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to give Taka')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Amount to add')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const admin = interaction.user;
    const target = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    if (amount <= 0) {
      return await interaction.reply({
        content: '❌ Please enter a valid amount greater than 0.',
        ephemeral: true
      });
    }

    await addBalance(target.id, amount);
    const newBalance = await getBalance(target.id);

    const embed = new EmbedBuilder()
      .setColor('#1E90FF') // Dodger Blue
      .setTitle('💎 Taka Added Successfully')
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .setDescription([
        `👤 **User:** <@${target.id}>`,
        `💰 **Amount Added:** \`৳${amount.toLocaleString()}\``,
        `📊 **New Balance:** \`৳${newBalance.toLocaleString()}\``
      ].join('\n'))
      .setFooter({ text: `Admin: ${admin.tag}`, iconURL: admin.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};
