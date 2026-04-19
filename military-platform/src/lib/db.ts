import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { parseExcelBuffer } from "./excel";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "platform.db");
const DEFAULT_XLSX_PATH = path.join(DB_DIR, "default.xlsx");

function getDb(): Database.Database {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  return db;
}

export function initializeDatabase() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS key_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      capability_code TEXT NOT NULL,
      path TEXT DEFAULT '',
      capability TEXT DEFAULT '',
      sub_capability TEXT DEFAULT '',
      type TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS special_requirements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      capability_code TEXT NOT NULL,
      type TEXT DEFAULT '',
      definition TEXT DEFAULT '',
      operational_requirements TEXT DEFAULT '',
      scenarios TEXT DEFAULT '',
      sub_elements TEXT DEFAULT '',
      units_used TEXT DEFAULT '',
      local_entities TEXT DEFAULT '',
      manufacturers TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS general_requirements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      capability_code TEXT NOT NULL,
      type TEXT DEFAULT '',
      capability_name TEXT DEFAULT '',
      company_name TEXT DEFAULT '',
      company_info TEXT DEFAULT '',
      scope_definition TEXT DEFAULT '',
      development_history TEXT DEFAULT '',
      armament TEXT DEFAULT '',
      cost TEXT DEFAULT '',
      family TEXT DEFAULT '',
      technical_specs TEXT DEFAULT '',
      countries_used TEXT DEFAULT '',
      training_requirements TEXT DEFAULT '',
      localization_status TEXT DEFAULT '',
      system_formation TEXT DEFAULT '',
      factory_tests TEXT DEFAULT '',
      storage_requirements TEXT DEFAULT '',
      sub_systems TEXT DEFAULT '',
      conflict_participation TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      action TEXT NOT NULL,
      details TEXT DEFAULT '',
      ip TEXT DEFAULT 'local'
    );

    CREATE TABLE IF NOT EXISTS data_source (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      source TEXT NOT NULL,
      filename TEXT DEFAULT '',
      loaded_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING fts5(
      capability_code,
      capability,
      sub_capability,
      type,
      path,
      definition,
      company_name,
      capability_name,
      technical_specs,
      tokenize='unicode61'
    );
  `);

  db.close();

  trySeedFromDefault();
}

function trySeedFromDefault() {
  if (!fs.existsSync(DEFAULT_XLSX_PATH)) return;

  const db = getDb();
  const row = db
    .prepare("SELECT COUNT(*) as c FROM key_data")
    .get() as { c: number };
  db.close();

  if (row.c > 0) return;

  try {
    const buffer = fs.readFileSync(DEFAULT_XLSX_PATH);
    const { keyData, specialData, generalData } = parseExcelBuffer(buffer);

    if (keyData.length > 0) insertKeyData(keyData);
    if (specialData.length > 0) insertSpecialRequirements(specialData);
    if (generalData.length > 0) insertGeneralRequirements(generalData);

    rebuildSearchIndex();

    setDataSource("default", "default.xlsx");

    addLog(
      "تحميل تلقائي",
      `تم تحميل الملف الافتراضي default.xlsx — البيانات الأساسية: ${keyData.length} صف، المتطلبات الخاصة: ${specialData.length} صف، المتطلبات العامة: ${generalData.length} صف`
    );
  } catch (error) {
    console.error("Failed to seed from default xlsx:", error);
  }
}

export function setDataSource(source: "default" | "upload", filename: string) {
  const db = getDb();
  db.prepare(
    `INSERT INTO data_source (id, source, filename, loaded_at)
     VALUES (1, ?, ?, datetime('now', 'localtime'))
     ON CONFLICT(id) DO UPDATE SET
       source = excluded.source,
       filename = excluded.filename,
       loaded_at = excluded.loaded_at`
  ).run(source, filename);
  db.close();
}

export function getDataSource(): {
  source: string;
  filename: string;
  loaded_at: string;
} | null {
  const db = getDb();
  const row = db
    .prepare("SELECT source, filename, loaded_at FROM data_source WHERE id = 1")
    .get() as { source: string; filename: string; loaded_at: string } | undefined;
  db.close();
  return row || null;
}

export function clearData() {
  const db = getDb();
  db.exec("DELETE FROM key_data");
  db.exec("DELETE FROM special_requirements");
  db.exec("DELETE FROM general_requirements");
  db.exec("DROP TABLE IF EXISTS search_index");
  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING fts5(
      capability_code,
      capability,
      sub_capability,
      type,
      path,
      definition,
      company_name,
      capability_name,
      technical_specs,
      tokenize='unicode61'
    )
  `);
  db.close();
}

export function insertKeyData(rows: Record<string, string>[]) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO key_data (capability_code, path, capability, sub_capability, type)
    VALUES (@capability_code, @path, @capability, @sub_capability, @type)
  `);
  const insertMany = db.transaction((items: Record<string, string>[]) => {
    for (const item of items) {
      stmt.run(item);
    }
  });
  insertMany(rows);
  db.close();
}

export function insertSpecialRequirements(rows: Record<string, string>[]) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO special_requirements (capability_code, type, definition, operational_requirements, scenarios, sub_elements, units_used, local_entities, manufacturers)
    VALUES (@capability_code, @type, @definition, @operational_requirements, @scenarios, @sub_elements, @units_used, @local_entities, @manufacturers)
  `);
  const insertMany = db.transaction((items: Record<string, string>[]) => {
    for (const item of items) {
      stmt.run(item);
    }
  });
  insertMany(rows);
  db.close();
}

export function insertGeneralRequirements(rows: Record<string, string>[]) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO general_requirements (capability_code, type, capability_name, company_name, company_info, scope_definition, development_history, armament, cost, family, technical_specs, countries_used, training_requirements, localization_status, system_formation, factory_tests, storage_requirements, sub_systems, conflict_participation)
    VALUES (@capability_code, @type, @capability_name, @company_name, @company_info, @scope_definition, @development_history, @armament, @cost, @family, @technical_specs, @countries_used, @training_requirements, @localization_status, @system_formation, @factory_tests, @storage_requirements, @sub_systems, @conflict_participation)
  `);
  const insertMany = db.transaction((items: Record<string, string>[]) => {
    for (const item of items) {
      stmt.run(item);
    }
  });
  insertMany(rows);
  db.close();
}

export function rebuildSearchIndex() {
  const db = getDb();
  db.exec("DELETE FROM search_index");

  const keys = db.prepare("SELECT * FROM key_data").all() as Record<string, string>[];
  const specials = db.prepare("SELECT * FROM special_requirements").all() as Record<string, string>[];
  const generals = db.prepare("SELECT * FROM general_requirements").all() as Record<string, string>[];

  const specialMap = new Map(specials.map((s) => [s.capability_code, s]));
  const generalMap = new Map(generals.map((g) => [g.capability_code, g]));

  const insertSearch = db.prepare(`
    INSERT INTO search_index (capability_code, capability, sub_capability, type, path, definition, company_name, capability_name, technical_specs)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const buildIndex = db.transaction(() => {
    for (const key of keys) {
      const special = specialMap.get(key.capability_code) || {};
      const general = generalMap.get(key.capability_code) || {};
      insertSearch.run(
        key.capability_code || "",
        key.capability || "",
        key.sub_capability || "",
        key.type || "",
        key.path || "",
        (special as Record<string, string>).definition || "",
        (general as Record<string, string>).company_name || "",
        (general as Record<string, string>).capability_name || "",
        (general as Record<string, string>).technical_specs || ""
      );
    }
  });

  buildIndex();
  db.close();
}

export function searchCapabilities(query: string, limit = 50) {
  const db = getDb();

  if (!query.trim()) {
    const results = db
      .prepare(
        `SELECT k.*, s.definition, s.operational_requirements, s.manufacturers,
                g.capability_name, g.company_name, g.cost, g.technical_specs, g.localization_status
         FROM key_data k
         LEFT JOIN special_requirements s ON k.capability_code = s.capability_code
         LEFT JOIN general_requirements g ON k.capability_code = g.capability_code
         LIMIT ?`
      )
      .all(limit);
    db.close();
    return results;
  }

  const likeQuery = `%${query}%`;
  try {
    const ftsQuery = query
      .trim()
      .split(/\s+/)
      .map((t) => `"${t}"*`)
      .join(" OR ");

    const ftsResults = db
      .prepare(`SELECT capability_code FROM search_index WHERE search_index MATCH ? ORDER BY rank LIMIT ?`)
      .all(ftsQuery, limit) as { capability_code: string }[];

    if (ftsResults.length > 0) {
      const codes = ftsResults.map((r) => r.capability_code);
      const placeholders = codes.map(() => "?").join(",");
      const results = db
        .prepare(
          `SELECT k.*, s.definition, s.operational_requirements, s.manufacturers,
                  g.capability_name, g.company_name, g.cost, g.technical_specs, g.localization_status
           FROM key_data k
           LEFT JOIN special_requirements s ON k.capability_code = s.capability_code
           LEFT JOIN general_requirements g ON k.capability_code = g.capability_code
           WHERE k.capability_code IN (${placeholders})`
        )
        .all(...codes);
      db.close();
      return results;
    }
  } catch {
    // FTS failed, fall through to LIKE search
  }

  const results = db
    .prepare(
      `SELECT k.*, s.definition, s.operational_requirements, s.manufacturers,
              g.capability_name, g.company_name, g.cost, g.technical_specs, g.localization_status
       FROM key_data k
       LEFT JOIN special_requirements s ON k.capability_code = s.capability_code
       LEFT JOIN general_requirements g ON k.capability_code = g.capability_code
       WHERE k.capability_code LIKE ? OR k.capability LIKE ? OR k.sub_capability LIKE ?
          OR k.type LIKE ? OR k.path LIKE ?
       LIMIT ?`
    )
    .all(likeQuery, likeQuery, likeQuery, likeQuery, likeQuery, limit);
  db.close();
  return results;
}

export function getCapabilityDetails(capabilityCode: string) {
  const db = getDb();
  const key = db.prepare("SELECT * FROM key_data WHERE capability_code = ?").get(capabilityCode);
  const special = db.prepare("SELECT * FROM special_requirements WHERE capability_code = ?").get(capabilityCode);
  const general = db.prepare("SELECT * FROM general_requirements WHERE capability_code = ?").get(capabilityCode);
  db.close();
  return { key, special, general };
}

export function getFilteredData(filters: Record<string, string>) {
  const db = getDb();
  const conditions: string[] = [];
  const params: string[] = [];

  if (filters.path) {
    conditions.push("k.path = ?");
    params.push(filters.path);
  }
  if (filters.capability) {
    conditions.push("k.capability = ?");
    params.push(filters.capability);
  }
  if (filters.type) {
    conditions.push("k.type = ?");
    params.push(filters.type);
  }
  if (filters.sub_capability) {
    conditions.push("k.sub_capability = ?");
    params.push(filters.sub_capability);
  }
  if (filters.localization_status) {
    conditions.push("g.localization_status = ?");
    params.push(filters.localization_status);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const results = db
    .prepare(
      `SELECT k.*, s.definition, s.operational_requirements, s.manufacturers,
              g.capability_name, g.company_name, g.cost, g.technical_specs, g.localization_status
       FROM key_data k
       LEFT JOIN special_requirements s ON k.capability_code = s.capability_code
       LEFT JOIN general_requirements g ON k.capability_code = g.capability_code
       ${whereClause}`
    )
    .all(...params);
  db.close();
  return results;
}

export function getFilterOptions() {
  const db = getDb();
  const paths = db.prepare("SELECT DISTINCT path FROM key_data WHERE path != '' ORDER BY path").all() as { path: string }[];
  const capabilities = db.prepare("SELECT DISTINCT capability FROM key_data WHERE capability != '' ORDER BY capability").all() as { capability: string }[];
  const types = db.prepare("SELECT DISTINCT type FROM key_data WHERE type != '' ORDER BY type").all() as { type: string }[];
  const subCapabilities = db.prepare("SELECT DISTINCT sub_capability FROM key_data WHERE sub_capability != '' ORDER BY sub_capability").all() as { sub_capability: string }[];
  db.close();
  return {
    paths: paths.map((p) => p.path),
    capabilities: capabilities.map((c) => c.capability),
    types: types.map((t) => t.type),
    subCapabilities: subCapabilities.map((s) => s.sub_capability),
  };
}

export function getStats() {
  const db = getDb();
  const totalCapabilities = (db.prepare("SELECT COUNT(*) as count FROM key_data").get() as { count: number }).count;
  const totalTypes = (db.prepare("SELECT COUNT(DISTINCT type) as count FROM key_data WHERE type != ''").get() as { count: number }).count;
  const totalPaths = (db.prepare("SELECT COUNT(DISTINCT path) as count FROM key_data WHERE path != ''").get() as { count: number }).count;
  const totalCompanies = (db.prepare("SELECT COUNT(DISTINCT company_name) as count FROM general_requirements WHERE company_name != ''").get() as { count: number }).count;

  const byPath = db.prepare("SELECT path, COUNT(*) as count FROM key_data WHERE path != '' GROUP BY path ORDER BY count DESC").all();
  const byType = db.prepare("SELECT type, COUNT(*) as count FROM key_data WHERE type != '' GROUP BY type ORDER BY count DESC").all();
  const byCapability = db.prepare("SELECT capability, COUNT(*) as count FROM key_data WHERE capability != '' GROUP BY capability ORDER BY count DESC LIMIT 10").all();

  db.close();
  return {
    totalCapabilities,
    totalTypes,
    totalPaths,
    totalCompanies,
    byPath,
    byType,
    byCapability,
  };
}

export function getComparisonData(codes: string[]) {
  const db = getDb();
  const placeholders = codes.map(() => "?").join(",");
  const results = db
    .prepare(
      `SELECT k.*, s.definition, s.operational_requirements, s.scenarios, s.sub_elements, s.units_used, s.local_entities, s.manufacturers,
              g.capability_name, g.company_name, g.company_info, g.scope_definition, g.development_history, g.armament, g.cost, g.family, g.technical_specs, g.countries_used, g.training_requirements, g.localization_status, g.system_formation, g.factory_tests, g.storage_requirements, g.sub_systems, g.conflict_participation
       FROM key_data k
       LEFT JOIN special_requirements s ON k.capability_code = s.capability_code
       LEFT JOIN general_requirements g ON k.capability_code = g.capability_code
       WHERE k.capability_code IN (${placeholders})`
    )
    .all(...codes);
  db.close();
  return results;
}

export function addLog(action: string, details: string) {
  const db = getDb();
  db.prepare("INSERT INTO logs (action, details) VALUES (?, ?)").run(action, details);
  db.close();
}

export function getLogs(limit = 100, offset = 0) {
  const db = getDb();
  const logs = db.prepare("SELECT * FROM logs ORDER BY id DESC LIMIT ? OFFSET ?").all(limit, offset);
  const total = (db.prepare("SELECT COUNT(*) as count FROM logs").get() as { count: number }).count;
  db.close();
  return { logs, total };
}

export function getAllCapabilityCodes() {
  const db = getDb();
  const codes = db.prepare("SELECT capability_code, capability, type FROM key_data ORDER BY capability_code").all();
  db.close();
  return codes;
}

export function getPathsWithCounts() {
  const db = getDb();
  const paths = db
    .prepare(
      `SELECT path, COUNT(DISTINCT capability) as capability_count, COUNT(*) as total_count
       FROM key_data WHERE path != ''
       GROUP BY path ORDER BY path`
    )
    .all() as { path: string; capability_count: number; total_count: number }[];
  db.close();
  return paths;
}

export function getCapabilitiesByPath(pathName: string) {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT k.id, k.capability_code, k.capability, k.sub_capability, k.type,
              s.definition
       FROM key_data k
       LEFT JOIN special_requirements s ON k.capability_code = s.capability_code
       WHERE k.path = ?
       ORDER BY k.id`
    )
    .all(pathName) as {
    id: number;
    capability_code: string;
    capability: string;
    sub_capability: string;
    type: string;
    definition: string;
  }[];
  db.close();

  type TypeItem = {
    capability_code: string;
    type: string;
    definition: string;
  };
  type SubCapability = {
    sub_capability: string;
    types: TypeItem[];
  };
  type CapabilityGroup = {
    capability: string;
    subCapabilities: SubCapability[];
    typesCount: number;
  };

  const capMap = new Map<string, CapabilityGroup>();
  const subMap = new Map<string, SubCapability>();

  for (const row of rows) {
    if (!capMap.has(row.capability)) {
      capMap.set(row.capability, {
        capability: row.capability,
        subCapabilities: [],
        typesCount: 0,
      });
    }
    const cap = capMap.get(row.capability)!;

    const subKey = `${row.capability}|||${row.sub_capability}`;
    if (!subMap.has(subKey)) {
      const sub: SubCapability = {
        sub_capability: row.sub_capability,
        types: [],
      };
      subMap.set(subKey, sub);
      cap.subCapabilities.push(sub);
    }
    const sub = subMap.get(subKey)!;

    sub.types.push({
      capability_code: row.capability_code,
      type: row.type,
      definition: row.definition,
    });
    cap.typesCount++;
  }

  return Array.from(capMap.values());
}

export function getCodesWithGeneralData() {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT k.capability_code, k.path, k.capability, k.sub_capability, k.type,
              COUNT(DISTINCT g.company_name) as company_count
       FROM key_data k
       INNER JOIN general_requirements g ON k.capability_code = g.capability_code
       WHERE g.company_name != ''
       GROUP BY k.capability_code, k.path, k.capability, k.sub_capability, k.type
       ORDER BY k.capability_code`
    )
    .all() as Array<{
    capability_code: string;
    path: string;
    capability: string;
    sub_capability: string;
    type: string;
    company_count: number;
  }>;
  db.close();
  return rows;
}

export function getCompaniesForCode(capabilityCode: string) {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT DISTINCT company_name
       FROM general_requirements
       WHERE capability_code = ? AND company_name != ''
       ORDER BY company_name`
    )
    .all(capabilityCode) as Array<{ company_name: string }>;
  db.close();
  return rows.map((r) => r.company_name);
}

export function getCodeAggregate(capabilityCode: string) {
  const db = getDb();
  const key = db
    .prepare(
      `SELECT capability_code, path, capability, sub_capability, type
       FROM key_data WHERE capability_code = ?`
    )
    .get(capabilityCode) as Record<string, string> | undefined;

  const rows = db
    .prepare(
      `SELECT * FROM general_requirements WHERE capability_code = ? ORDER BY id`
    )
    .all(capabilityCode) as Record<string, string>[];
  db.close();

  if (!key) return null;

  const companyRows = rows.filter((r) => (r.company_name || "").trim() !== "");

  return {
    key,
    company_count: companyRows.length,
    companies: companyRows.map((r) => r.company_name),
    companyRows,
  };
}

export function getCompanyRow(capabilityCode: string, companyName: string) {
  const db = getDb();
  const key = db
    .prepare(
      `SELECT capability_code, path, capability, sub_capability, type
       FROM key_data WHERE capability_code = ?`
    )
    .get(capabilityCode) as Record<string, string> | undefined;

  const row = db
    .prepare(
      `SELECT * FROM general_requirements
       WHERE capability_code = ? AND company_name = ?
       LIMIT 1`
    )
    .get(capabilityCode, companyName) as Record<string, string> | undefined;
  db.close();

  if (!key || !row) return null;
  return { key, ...row };
}

export function getTypeDetails(capabilityCode: string) {
  const db = getDb();
  const key = db.prepare("SELECT * FROM key_data WHERE capability_code = ?").get(capabilityCode) as Record<string, string> | undefined;
  const special = db.prepare("SELECT * FROM special_requirements WHERE capability_code = ?").get(capabilityCode) as Record<string, string> | undefined;
  const general = db.prepare("SELECT * FROM general_requirements WHERE capability_code = ?").get(capabilityCode) as Record<string, string> | undefined;
  db.close();
  return { key: key || null, special: special || null, general: general || null };
}
