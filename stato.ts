import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { getServizi, getArresti, getMulte, getRapporti } from "../utils/db.js";

export const data = new SlashCommandBuilder()
  .setName("stato")
  .setDescription("Mostra lo stato attuale degli agenti in servizio e le statistiche");

export async function execute(interaction: ChatInputCommandInteraction) {
  const servizi = getServizi();
  const arresti = getArresti();
  const multe = getMulte();
  const rapporti = getRapporti();

  const agentiInServizio = Object.values(servizi);

  const embed = new EmbedBuilder()
    .setTitle("📊 Stato FDO — Pannello Operativo")
    .setColor(0x2b6eff)
    .setTimestamp()
    .setFooter({ text: "Sistema FDO" });

  if (agentiInServizio.length === 0) {
    embed.addFields({ name: "🟢 Agenti in servizio", value: "_Nessun agente in servizio al momento._" });
  } else {
    const lista = agentiInServizio
      .map((s) => {
        const inizio = new Date(s.inizio);
        const ore = Math.floor((Date.now() - inizio.getTime()) / 3600000);
        const minuti = Math.floor(((Date.now() - inizio.getTime()) % 3600000) / 60000);
        return `• <@${s.agente_id}> — in servizio da **${ore}h ${minuti}m**`;
      })
      .join("\n");
    embed.addFields({ name: `🟢 Agenti in servizio (${agentiInServizio.length})`, value: lista });
  }

  const oggi = new Date();
  oggi.setHours(0, 0, 0, 0);

  const arrestiOggi = arresti.filter((a) => new Date(a.timestamp) >= oggi).length;
  const multeOggi = multe.filter((m) => new Date(m.timestamp) >= oggi).length;

  embed.addFields(
    { name: "📈 Statistiche di oggi", value: `🚨 Arresti: **${arrestiOggi}**\n💰 Multe: **${multeOggi}**`, inline: true },
    { name: "📁 Totali storici", value: `🚨 Arresti: **${arresti.length}**\n💰 Multe: **${multe.length}**\n📋 Rapporti: **${rapporti.length}**`, inline: true }
  );

  await interaction.reply({ embeds: [embed] });
}
