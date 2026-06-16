import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "../../data");

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readJson<T>(filename: string, defaultValue: T): T {
  ensureDataDir();
  const filepath = join(DATA_DIR, filename);
  if (!existsSync(filepath)) {
    writeFileSync(filepath, JSON.stringify(defaultValue, null, 2), "utf-8");
    return defaultValue;
  }
  try {
    return JSON.parse(readFileSync(filepath, "utf-8")) as T;
  } catch {
    return defaultValue;
  }
}

export function writeJson<T>(filename: string, data: T): void {
  ensureDataDir();
  const filepath = join(DATA_DIR, filename);
  writeFileSync(filepath, JSON.stringify(data, null, 2), "utf-8");
}

export interface ArrestoRecord {
  id: string;
  agente_id: string;
  agente_username: string;
  roblox_username: string;
  motivazione: string;
  note: string;
  timestamp: string;
}

export interface MultaRecord {
  id: string;
  agente_id: string;
  agente_username: string;
  roblox_username: string;
  importo: number;
  motivazione: string;
  timestamp: string;
}

export interface ServizioRecord {
  agente_id: string;
  agente_username: string;
  inizio: string;
  message_id?: string;
  channel_id?: string;
}

export interface RapportoRecord {
  id: string;
  agente_id: string;
  agente_username: string;
  turno: string;
  interventi: string;
  multe_count: number;
  note_aggiuntive: string;
  timestamp: string;
}

export interface SetupConfig {
  servizio_channel_id: string | null;
  log_channel_id: string | null;
}

export function getArresti(): ArrestoRecord[] {
  return readJson<ArrestoRecord[]>("arresti.json", []);
}

export function saveArresto(record: ArrestoRecord): void {
  const arresti = getArresti();
  arresti.push(record);
  writeJson("arresti.json", arresti);
}

export function getMulte(): MultaRecord[] {
  return readJson<MultaRecord[]>("multe.json", []);
}

export function saveMulta(record: MultaRecord): void {
  const multe = getMulte();
  multe.push(record);
  writeJson("multe.json", multe);
}

export function getServizi(): Record<string, ServizioRecord> {
  return readJson<Record<string, ServizioRecord>>("servizi.json", {});
}

export function setServizio(agente_id: string, record: ServizioRecord): void {
  const servizi = getServizi();
  servizi[agente_id] = record;
  writeJson("servizi.json", servizi);
}

export function removeServizio(agente_id: string): void {
  const servizi = getServizi();
  delete servizi[agente_id];
  writeJson("servizi.json", servizi);
}

export function getRapporti(): RapportoRecord[] {
  return readJson<RapportoRecord[]>("rapporti.json", []);
}

export function saveRapporto(record: RapportoRecord): void {
  const rapporti = getRapporti();
  rapporti.push(record);
  writeJson("rapporti.json", rapporti);
}

export function getSetup(): SetupConfig {
  return readJson<SetupConfig>("setup.json", {
    servizio_channel_id: null,
    log_channel_id: null,
  });
}

export function saveSetup(config: SetupConfig): void {
  writeJson("setup.json", config);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7).toUpperCase();
}
