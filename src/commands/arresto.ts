import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  TextChannel,
} from "discord.js";
import { getRobloxUser } from "../utils/roblox.js";
import { saveArresto, getSetup, generateId } from "../utils/db.js";

export const data = new SlashCommandBuilder()
  .setName("arresto")
  .setDescription("Registra un arresto con avatar Roblox")
  .addStringOption((opt) =>
    opt
      .setName("roblox_username")
      .setDescription("Username Roblox del soggetto arrestato")
      .setRequired(true)
  )
  .addStringOption((opt) =>
    opt
      .setName("motivazione")
      .setDescription("Motivazione dell'arresto")
      .setRequired(true)
  )
  .addStringOption((opt) =>
    opt
      .setName("note")
      .setDescription("Note aggiuntive (optional)")
      .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const robloxUsername = interaction.options.getString("roblox_username", true);
  const motivazione = interaction.options.getString("motivazione", true);
  const note = interaction.options.getString("note") ?? "—";

  const robloxUser = await getRobloxUser(robloxUsername);

  if (!robloxUser) {
    await interaction.editReply({
      content: `❌ Utente Roblox \`${robloxUsername}\` non trovato. Controlla lo username e riprova.`,
    });
    return;
  }

  const id = generateId();
  const timestamp = new Date().toISOString();

  saveArresto({
    id,
    agente_id: interaction.user.id,
    agente_username: interaction.user.tag,
    roblox_username: robloxUser.name,
    motivazione,
    note,
    timestamp,
  });

  const embed = new EmbedBuilder()
    .setTitle("🚨 ARRESTO EFFETTUATO")
    .setColor(0xed4245)
    .setThumbnail(robloxUser.avatarUrl)
    .addFields(
      { name: "👤 Soggetto", value: `**${robloxUser.displayName}** (@${robloxUser.name})`, inline: false },
      { name: "⚖️ Motivazione", value: motivazione, inline: false },
      { name: "📝 Note", value: note, inline: false },
      { name: "🪪 Agente", value: `<@${interaction.user.id}>`, inline: true },
      { name: "🆔 ID Caso", value: `\`${id}\``, inline: true }
    )
    .setFooter({ text: "Sistema FDO · Arresti" })
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
