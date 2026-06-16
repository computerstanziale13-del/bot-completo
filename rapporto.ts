import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("rapporto")
  .setDescription("Compila il rapporto di fine turno");

export async function execute(interaction: ChatInputCommandInteraction) {
  const modal = new ModalBuilder()
    .setCustomId("rapporto_modal")
    .setTitle("📋 Rapporto Fine Turno — FDO");

  const turnoInput = new TextInputBuilder()
    .setCustomId("turno")
    .setLabel("Turno (es. Pomeriggio 16:00 – 20:00)")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Mattina / Pomeriggio / Sera / Notte")
    .setRequired(true)
    .setMaxLength(100);

  const interventiInput = new TextInputBuilder()
    .setCustomId("interventi")
    .setLabel("Interventi effettuati")
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder("Descrivi gli interventi: pattugliamenti, inseguimenti, fermi...")
    .setRequired(true)
    .setMaxLength(1000);

  const multeCountInput = new TextInputBuilder()
    .setCustomId("multe_count")
    .setLabel("Numero di multe staccate")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Es: 3")
    .setRequired(true)
    .setMaxLength(5);

  const noteInput = new TextInputBuilder()
    .setCustomId("note_aggiuntive")
    .setLabel("Note aggiuntive (opzionale)")
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder("Eventuali segnalazioni, situazioni particolari...")
    .setRequired(false)
    .setMaxLength(500);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(turnoInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(interventiInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(multeCountInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(noteInput)
  );

  await interaction.showModal(modal);
}
