import { REST, Routes } from "discord.js";
import * as setup from "./commands/setup.js";
import * as arresto from "./commands/arresto.js";
import * as multa from "./commands/multa.js";
import * as rapporto from "./commands/rapporto.js";
import * as stato from "./commands/stato.js";

const token = process.env["DISCORD_TOKEN"];
const clientId = process.env["DISCORD_CLIENT_ID"];

if (!token || !clientId) {
  console.error("❌ Mancano le variabili d'ambiente: DISCORD_TOKEN, DISCORD_CLIENT_ID");
  process.exit(1);
}

const commands = [
  setup.data.toJSON(),
  arresto.data.toJSON(),
  multa.data.toJSON(),
  rapporto.data.toJSON(),
  stato.data.toJSON(),
];

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log(`🔄 Registrazione di ${commands.length} comandi slash sul server...`);

    const data = await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    ) as unknown[];

    console.log(`✅ ${data.length} comandi registrati con successo!`);
  } catch (err) {
    console.error("❌ Errore durante la registrazione dei comandi:", err);
    process.exit(1);
  }
})();
