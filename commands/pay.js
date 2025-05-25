import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getBalance, addBalance, removeBalance } from '../datasave.js';

export default {
  data: new SlashCommandBuilder()
    .setName('pay')
    .setDescription('Pay another user some Taka')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to pay')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Amount to pay')
        .setRequired(true)
    ),

  async execute(interaction) {
    const sender = interaction.user;
    const target = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    if (target.bot) {
      return await interaction.reply({ content: '🤖 You cannot pay bots.', ephemeral: true });
    }

    if (target.id === sender.id) {
      return await interaction.reply({ content: '❌ You cannot pay yourself.', ephemeral: true });
    }

    if (amount <= 0) {
      return await interaction.reply({ content: '❌ Enter an amount greater than 0.', ephemeral: true });
    }

    const senderBalance = await getBalance(sender.id);
    if (senderBalance < amount) {
      return await interaction.reply({
        content: `🚫 Insufficient funds. Your balance: ৳${senderBalance.toLocaleString()}`,
        ephemeral: true
      });
    }

    await removeBalance(sender.id, amount);
    await addBalance(target.id, amount);
    const newBalance = senderBalance - amount;

    const embed = new EmbedBuilder()
      .setColor('#00C896')
      .setTitle('💸 Payment Transferred')
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .setDescription([
        `📤 **From:** <@${sender.id}>`,
        `📥 **To:** <@${target.id}>`,
        `💰 **Amount:** \`৳${amount.toLocaleString()}\``,
        '',
        `🧾 **Your New Balance:** \`৳${newBalance.toLocaleString()}\``
      ].join('\n'))
      .setFooter({ text: '✅ Transaction complete', iconURL: sender.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
