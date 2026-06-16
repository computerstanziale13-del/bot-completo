import { createServer } from "http";
import {
  Client,
  GatewayIntentBits,
  Collection,
  Events,
  ChatInputCommandInteraction,
  ButtonInteraction,
  ModalSubmitInteraction,
} from "discord.js";
import * as setup from "./commands/setup.js";
import * as arresto from "./commands/arresto.js";
import * as multa from "./commands/multa.js";
import * as rapporto from "./commands/rapporto.js";
import * as stato from "./commands/stato.js";
import { handleServizioButton } from "./handlers/servizio.js";
import { handleRapportoModal } from "./handlers/rapportoModal.js";

// Server HTTP per UptimeRobot
createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Il bot è online!");
}).listen(process.env.PORT || 3000);

const token = process.env["DISCORD_TOKEN"];

if (!token) {
  console.error("❌ Variabile d'ambiente DISCORD_TOKEN mancante!");
  process.exit(1);
}

interface Command {
  data: { name: string; toJSON: () => unknown };
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

const commands = new Collection<string, Command>();
for (const cmd of [setup, arresto, multa, rapporto, stato] as Command[]) {
  commands.set(cmd.data.name, cmd);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`✅ Bot FDO avviato come: ${readyClient.user.tag}`);
  console.log(`📡 Connesso a ${readyClient.guilds.cache.size} server`);

  readyClient.user.setActivity("🚔 Forze dell'Ordine FDO");
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction as ChatInputCommandInteraction);
    } catch (err) {
      console.error(`Errore nel comando /${interaction.commandName}:`, err);
      const errorMsg = { content: "❌ Errore interno durante l'esecuzione del comando.", ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMsg);
      } else {
        await interaction.reply(errorMsg);
      }
    }
    return;
  }

  if (interaction.isButton()) {
    const btn = interaction as ButtonInteraction;
    if (btn.customId === "servizio_inizia" || btn.customId === "servizio_finisci") {
      try {
        await handleServizioButton(btn);
      } catch (err) {
        console.error("Errore nel bottone servizio:", err);
        if (!btn.replied && !btn.deferred) {
          await btn.reply({ content: "❌ Errore interno.", ephemeral: true });
        }
      }
    }
    return;
  }

  if (interaction.isModalSubmit()) {
    const modal = interaction as ModalSubmitInteraction;
    if (modal.customId === "rapporto_modal") {
      try {
        await handleRapportoModal(modal);
      } catch (err) {
        console.error("Errore nel modal rapporto:", err);
        if (!modal.replied && !modal.deferred) {
          await modal.reply({ content: "❌ Errore interno.", ephemeral: true });
        }
      }
    }
    return;
  }
});

client.login(token);
