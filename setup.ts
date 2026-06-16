import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  ChannelType,
  TextChannel,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { getSetup, saveSetup } from "../utils/db.js";

export const data = new SlashCommandBuilder()
  .setName("setup")
  .setDescription("Configura i canali del sistema FDO")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addChannelOption((opt) =>
    opt
      .setName("canale_servizio")
      .setDescription("Canale dove appare il pannello servizio (Inizia/Finisci)")
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(true)
  )
  .addChannelOption((opt) =>
    opt
      .setName("canale_log")
      .setDescription("Canale dove vengono inviati i log (arresti, multe, rapporti)")
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const servizioChannel = interaction.options.getChannel("canale_servizio", true) as TextChannel;
  const logChannel = interaction.options.getChannel("canale_log", true) as TextChannel;

  saveSetup({
    servizio_channel_id: servizioChannel.id,
    log_channel_id: logChannel.id,
  });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("servizio_inizia")
      .setLabel("🟢 Inizia Servizio")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("servizio_finisci")
      .setLabel("🔴 Finisci Servizio")
      .setStyle(ButtonStyle.Danger)
  );

  const embed = new EmbedBuilder()
    .setTitle("🚔 Pannello Servizio — Forze dell'Ordine")
    .setDescription(
      "Clicca **Inizia Servizio** quando entri in servizio.\nClicca **Finisci Servizio** quando termini il turno."
    )
    .setColor(0x2b6eff)
    .setFooter({ text: "Sistema FDO" })
    .setTimestamp();

  await servizioChannel.send({ embeds: [embed], components: [row] });

  const confirmEmbed = new EmbedBuilder()
    .setTitle("✅ Setup completato")
    .setColor(0x57f287)
    .addFields(
      { name: "Canale Servizio", value: `<#${servizioChannel.id}>`, inline: true },
      { name: "Canale Log", value: `<#${logChannel.id}>`, inline: true }
    );

  await interaction.editReply({ embeds: [confirmEmbed] });
}
