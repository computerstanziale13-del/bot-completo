import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  TextChannel,
} from "discord.js";
import { getRobloxUser } from "../utils/roblox.js";
import { saveMulta, getSetup, generateId } from "../utils/db.js";

export const data = new SlashCommandBuilder()
  .setName("multa")
  .setDescription("Registra una multa con avatar Roblox")
  .addStringOption((opt) =>
    opt
      .setName("roblox_username")
      .setDescription("Username Roblox del multato")
      .setRequired(true)
  )
  .addIntegerOption((opt) =>
    opt
      .setName("importo")
      .setDescription("Importo della multa (es. 500)")
      .setRequired(true)
      .setMinValue(1)
  )
  .addStringOption((opt) =>
    opt
      .setName("motivazione")
      .setDescription("Motivazione della multa")
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const robloxUsername = interaction.options.getString("roblox_username", true);
  const importo = interaction.options.getInteger("importo", true);
  const motivazione = interaction.options.getString("motivazione", true);

  const robloxUser = await getRobloxUser(robloxUsername);

  if (!robloxUser) {
    await interaction.editReply({
      content: `❌ Utente Roblox \`${robloxUsername}\` non trovato. Controlla lo username e riprova.`,
    });
    return;
  }

  const id = generateId();
  const timestamp = new Date().toISOString();

  saveMulta({
    id,
    agente_id: interaction.user.id,
    agente_username: interaction.user.tag,
    roblox_username: robloxUser.name,
    importo,
    motivazione,
    timestamp,
  });

  const embed = new EmbedBuilder()
    .setTitle("💰 MULTA EMESSA")
    .setColor(0xfee75c)
    .setThumbnail(robloxUser.avatarUrl)
    .addFields(
      { name: "👤 Soggetto", value: `**${robloxUser.displayName}** (@${robloxUser.name})`, inline: false },
      { name: "💵 Importo", value: `**$${importo.toLocaleString()}**`, inline: true },
      { name: "⚖️ Motivazione", value: motivazione, inline: false },
      { name: "🪪 Agente", value: `<@${interaction.user.id}>`, inline: true },
      { name: "🆔 ID Multa", value: `\`${id}\``, inline: true }
    )
    .setFooter({ text: "Sistema FDO · Multe" })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });

  const setup = getSetup();
  if (setup.log_channel_id && interaction.guild) {
    try {
      const logChannel = interaction.guild.channels.cache.get(setup.log_channel_id) as TextChannel | undefined;
      if (logChannel) {
        await logChannel.send({ embeds: [embed] });
      }
    } catch {
    }
  }
}
