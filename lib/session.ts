export type User = { name: string };

export type SavedScore = {
  game: string;
  score: number;
  name: string;
  at: number;
};

const USER_KEY = "av_user";
const SCORES_KEY = "av_scores";

/** Cadena cruda de localStorage: identidad estable, apta para useSyncExternalStore. */
export function readUserRaw(): string | null {
  try {
    return localStorage.getItem(USER_KEY);
  } catch {
    return null;
  }
}

export function parseUser(raw: string | null): User | null {
  try {
    return JSON.parse(raw || "null");
  } catch {
    return null;
  }
}

export function writeUser(user: User): void {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // localStorage no disponible: la sesión vive solo en memoria.
  }
}

export function clearUser(): void {
  try {
    localStorage.removeItem(USER_KEY);
  } catch {
    // sin nada que limpiar
  }
}

export function saveScore(entry: Omit<SavedScore, "at">): void {
  try {
    const all: SavedScore[] = JSON.parse(
      localStorage.getItem(SCORES_KEY) || "[]",
    );
    all.push({ ...entry, at: Date.now() });
    localStorage.setItem(SCORES_KEY, JSON.stringify(all));
  } catch {
    // la partida no se guarda; la interfaz sigue igual
  }
}
