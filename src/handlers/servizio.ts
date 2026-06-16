import {
  ButtonInteraction,
  EmbedBuilder,
  TextChannel,
} from "discord.js";
import {
  getServizi,
  setServizio,
  removeServizio,
  getSetup,
  getArresti,
  getMulte,
} from "../utils/db.js";

export async function handleServizioButton(interaction: ButtonInteraction) {
  const userId = interaction.user.id;
  const servizi = getServizi();

  if (interaction.customId === "servizio_inizia") {
    if (servizi[userId]) {
      await interaction.reply({
        content: "⚠️ Sei già in servizio! Clicca **Finisci Servizio** prima di iniziarne uno nuovo.",
        ephemeral: true,
      });
      return;
    }

    const inizio = new Date().toISOString();
    setServizio(userId, {
      agente_id: userId,
      agente_username: interaction.user.tag,
      inizio,
    });

    const embed = new EmbedBuilder()
      .setTitle("🟢 Servizio Iniziato")
      .setColor(0x57f287)
      .setThumbnail(interaction.user.displayAvatarURL())
      .addFields(
        { name: "👮 Agente", value: `<@${userId}>`, inline: true },
        { name: "🕐 Inizio", value: `<t:${Math.floor(Date.now() / 1000)}:T>`, inline: true }
      )
      .setFooter({ text: "Sistema FDO" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: false });

    const setup = getSetup();
    if (setup.log_channel_id && setup.log_channel_id !== interaction.channelId && interaction.guild) {
      try {
        const logChannel = interaction.guild.channels.cache.get(setup.log_channel_id) as TextChannel | undefined;
        if (logChannel) {
          await logChannel.send({ embeds: [embed] });
        }
      } catch {
      }
    }
  } else if (interaction.customId === "servizio_finisci") {
    const servizio = servizi[userId];

    if (!servizio) {
      await interaction.reply({
        content: "⚠️ Non sei attualmente in servizio.",
        ephemeral: true,
      });
      return;
    }

    const inizio = new Date(servizio.inizio);
    const fineMs = Date.now();
    const durataMs = fineMs - inizio.getTime();
    const ore = Math.floor(durataMs / 3600000);
    const minuti = Math.floor((durataMs % 3600000) / 60000);

    const arrestiTurno = getArresti().filter(
      (a) => a.agente_id === userId && new Date(a.timestamp) >= inizio
    ).length;

    const multeTurno = getMulte().filter(
      (m) => m.agente_id === userId && new Date(m.timestamp) >= inizio
    ).length;

    removeServizio(userId);

    const embed = new EmbedBuilder()
      .setTitle("🔴 Servizio Terminato")
      .setColor(0xed4245)
      .setThumbnail(interaction.user.displayAvatarURL())
      .addFields(
        { name: "👮 Agente", value: `<@${userId}>`, inline: true },
        { name: "⏱️ Durata", value: `**${ore}h ${minuti}m**`, inline: true },
        { name: "🕐 Inizio", value: `<t:${Math.floor(inizio.getTime() / 1000)}:T>`, inline: true },
        { name: "🕑 Fine", value: `<t:${Math.floor(fineMs / 1000)}:T>`, inline: true },
        { name: "📊 Riepilogo turno", value: `🚨 Arresti: **${arrestiTurno}**\n💰 Multe: **${multeTurno}**`, inline: false }
      )
      .setFooter({ text: "Sistema FDO" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: false });

    const setup = getSetup();
    if (setup.log_channel_id && setup.log_channel_id !== interaction.channelId && interaction.guild) {
      try {
        const logChannel = interaction.guild.channels.cache.get(setup.log_channel_id) as TextChannel | undefined;
        if (logChannel) {
          await logChannel.send({ embeds: [embed] });
        }
      } catch {
      }
    }
  }
}
