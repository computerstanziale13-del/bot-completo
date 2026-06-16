import {
  ModalSubmitInteraction,
  EmbedBuilder,
  TextChannel,
} from "discord.js";
import { saveRapporto, getSetup, generateId } from "../utils/db.js";

export async function handleRapportoModal(interaction: ModalSubmitInteraction) {
  const turno = interaction.fields.getTextInputValue("turno");
  const interventi = interaction.fields.getTextInputValue("interventi");
  const multeCountRaw = interaction.fields.getTextInputValue("multe_count");
  const noteAggiuntive = interaction.fields.getTextInputValue("note_aggiuntive") || "—";

  const multeCount = parseInt(multeCountRaw, 10);
  if (isNaN(multeCount) || multeCount < 0) {
    await interaction.reply({
      content: "❌ Il numero di multe deve essere un numero valido (es. 0, 3, 10).",
      ephemeral: true,
    });
    return;
  }

  const id = generateId();
  const timestamp = new Date().toISOString();

  saveRapporto({
    id,
    agente_id: interaction.user.id,
    agente_username: interaction.user.tag,
    turno,
    interventi,
    multe_count: multeCount,
    note_aggiuntive: noteAggiuntive,
    timestamp,
  });

  const embed = new EmbedBuilder()
    .setTitle("📋 Rapporto Fine Turno")
    .setColor(0x5865f2)
    .setThumbnail(interaction.user.displayAvatarURL())
    .addFields(
      { name: "👮 Agente", value: `<@${interaction.user.id}>`, inline: true },
      { name: "🆔 ID Rapporto", value: `\`${id}\``, inline: true },
      { name: "🕐 Turno", value: turno, inline: false },
      { name: "📝 Interventi effettuati", value: interventi, inline: false },
      { name: "💰 Multe staccate", value: `**${multeCount}**`, inline: true },
      { name: "📌 Note aggiuntive", value: noteAggiuntive, inline: false }
    )
    .setFooter({ text: "Sistema FDO · Rapporti" })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });

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
