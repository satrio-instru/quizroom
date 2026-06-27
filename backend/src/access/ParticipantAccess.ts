import fs from "fs";
import path from "path";
import { getSupabase } from "../supabase";

const FREE_ACCESS_NPM = "2317041013";
const PARTICIPANT_FILE_NAME = "PESERTA(1).md";
const FALLBACK_DURATION_MINUTES = 20;
const JAKARTA_TIME_ZONE = "Asia/Jakarta";
const CACHE_TTL_MS = 30_000; // 30 seconds

export interface ParticipantAccess {
    npm: string;
    name: string;
    unlimited: boolean;
    expiresAt: number | null;
    schedule: string | null;
}

interface ParticipantSlot {
    npm: string;
    name: string;
    day: string;
    rawTime: string;
    startMinutes: number;
    endMinutes: number;
}

interface AccessResult {
    allowed: boolean;
    message?: string;
    access?: ParticipantAccess;
}

let participantSlotsByNpm: Map<string, ParticipantSlot[]> | null = null;
let configuredDurationMinutes: number | null = null;
let lastLoadTime = 0;
let dataSource: 'supabase' | 'file' | 'none' = 'none';

function findParticipantFile() {
    const candidates = [
        path.resolve(process.cwd(), PARTICIPANT_FILE_NAME),
        path.resolve(process.cwd(), "..", PARTICIPANT_FILE_NAME),
        path.resolve(__dirname, "..", "..", "..", PARTICIPANT_FILE_NAME),
    ];

    return candidates.find((candidate) => fs.existsSync(candidate));
}

function parseClockToMinutes(clock: string) {
    // Support both "15.00" (file format) and "15:00" (Supabase format)
    const separator = clock.includes(":") ? ":" : ".";
    const [hour, minute] = clock.split(separator).map(Number);
    return (hour * 60) + minute;
}

function parseDurationMinutes(markdown: string) {
    const match = markdown.match(/Durasi:\*\*\s*(\d+)\s*menit/i);
    return match ? Number(match[1]) : FALLBACK_DURATION_MINUTES;
}

// Load participant slots from Supabase
async function loadFromSupabase(): Promise<Map<string, ParticipantSlot[]>> {
    const supabase = getSupabase();
    const slotsByNpm = new Map<string, ParticipantSlot[]>();

    if (!supabase) {
        return slotsByNpm;
    }

    try {
        const { data, error } = await supabase
            .from('participants')
            .select('*')
            .order('id', { ascending: true });

        if (error) {
            console.error('Supabase query error:', error.message);
            return slotsByNpm;
        }

        if (!data || data.length === 0) {
            return slotsByNpm;
        }

        // Use duration from the first row, or fallback
        configuredDurationMinutes = FALLBACK_DURATION_MINUTES;

        for (const row of data) {
            const npm = String(row.npm ?? "").trim();
            const name = String(row.name ?? "").trim();
            const day = String(row.day ?? "").trim();
            const startTime = String(row.start_time ?? "").trim();
            const endTime = String(row.end_time ?? "").trim();

            if (!npm || !startTime || !endTime) continue;

            const startMinutes = parseClockToMinutes(startTime);
            const endMinutes = parseClockToMinutes(endTime);
            const rawTime = `${startTime.replace(":", ".")}-${endTime.replace(":", ".")}`;

            const slot: ParticipantSlot = {
                npm,
                name,
                day,
                rawTime,
                startMinutes,
                endMinutes,
            };

            const existingSlots = slotsByNpm.get(npm) ?? [];
            existingSlots.push(slot);
            slotsByNpm.set(npm, existingSlots);
        }

        // Try to get duration from the data
        if (data[0]?.duration_minutes) {
            const parsed = Number(data[0].duration_minutes);
            if (!isNaN(parsed) && parsed > 0) {
                configuredDurationMinutes = parsed;
            }
        }

        return slotsByNpm;
    } catch (err) {
        console.error('Error loading from Supabase:', err);
        return slotsByNpm;
    }
}

// Load participant slots from local file (fallback)
function loadFromFile(): Map<string, ParticipantSlot[]> {
    const participantFile = findParticipantFile();
    const slotsByNpm = new Map<string, ParticipantSlot[]>();

    if (!participantFile) {
        configuredDurationMinutes = FALLBACK_DURATION_MINUTES;
        return slotsByNpm;
    }

    const markdown = fs.readFileSync(participantFile, "utf8");
    configuredDurationMinutes = parseDurationMinutes(markdown);
    const rowPattern = /^\|\s*\d+\s*\|\s*(Hari\s+\d+)\s*\|\s*(\d{2}\.\d{2})\D+(\d{2}\.\d{2})\s*\|\s*`?(\d+)`?\s*\|\s*([^|]+?)\s*\|/gm;
    let match: RegExpExecArray | null;

    while ((match = rowPattern.exec(markdown)) !== null) {
        const [, day, startClock, endClock, npm, name] = match;
        const slot: ParticipantSlot = {
            npm,
            name: name.trim(),
            day,
            rawTime: `${startClock}-${endClock}`,
            startMinutes: parseClockToMinutes(startClock),
            endMinutes: parseClockToMinutes(endClock),
        };

        const existingSlots = slotsByNpm.get(npm) ?? [];
        existingSlots.push(slot);
        slotsByNpm.set(npm, existingSlots);
    }

    return slotsByNpm;
}

// Invalidate cache (call after saving new data to Supabase)
export function invalidateParticipantCache() {
    participantSlotsByNpm = null;
    lastLoadTime = 0;
}

// Main loading function: try Supabase first, fall back to file
async function loadParticipantSlots(): Promise<Map<string, ParticipantSlot[]>> {
    const now = Date.now();

    // Return cached data if still valid
    if (participantSlotsByNpm && (now - lastLoadTime) < CACHE_TTL_MS) {
        return participantSlotsByNpm;
    }

    // Try Supabase first
    const supabaseSlots = await loadFromSupabase();
    if (supabaseSlots.size > 0) {
        participantSlotsByNpm = supabaseSlots;
        lastLoadTime = now;
        dataSource = 'supabase';
        console.log(`Loaded ${supabaseSlots.size} participant NPM entries from Supabase`);
        return participantSlotsByNpm;
    }

    // Fallback to local file
    const fileSlots = loadFromFile();
    participantSlotsByNpm = fileSlots;
    lastLoadTime = now;

    if (fileSlots.size > 0) {
        dataSource = 'file';
        console.log(`Loaded ${fileSlots.size} participant NPM entries from local file`);
    } else {
        dataSource = 'none';
        console.warn(`No participant data found in Supabase or local file. Only free access NPM can join.`);
    }

    return participantSlotsByNpm;
}

function getJakartaMinuteOfDay(now = new Date()) {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: JAKARTA_TIME_ZONE,
        hourCycle: "h23",
        hour: "2-digit",
        minute: "2-digit",
    }).formatToParts(now);

    const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
    const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");
    return (hour * 60) + minute;
}

function getRemainingMinutesInSlot(slot: ParticipantSlot, currentMinutes: number) {
    const crossesMidnight = slot.endMinutes <= slot.startMinutes;
    const normalizedEnd = crossesMidnight ? slot.endMinutes + 1440 : slot.endMinutes;
    const normalizedCurrent = crossesMidnight && currentMinutes < slot.startMinutes
        ? currentMinutes + 1440
        : currentMinutes;

    if (normalizedCurrent < slot.startMinutes || normalizedCurrent >= normalizedEnd) {
        return null;
    }

    return normalizedEnd - normalizedCurrent;
}

function formatSchedules(slots: ParticipantSlot[]) {
    return slots.map((slot) => `${slot.day} ${slot.rawTime}`).join(", ");
}

export async function getParticipantAccess(npm: string, now = new Date()): Promise<AccessResult> {
    if (!/^\d+$/.test(npm)) {
        return {
            allowed: false,
            message: "NPM wajib berupa angka.",
        };
    }

    if (npm === FREE_ACCESS_NPM) {
        return {
            allowed: true,
            access: {
                npm,
                name: npm,
                unlimited: true,
                expiresAt: null,
                schedule: "Bebas akses",
            },
        };
    }

    const slotsByNpm = await loadParticipantSlots();
    const slots = slotsByNpm.get(npm);

    if (!slots || slots.length === 0) {
        return {
            allowed: false,
            message: "NPM tidak terdaftar sebagai peserta.",
        };
    }

    const currentMinutes = getJakartaMinuteOfDay(now);
    const activeSlot = slots
        .map((slot) => ({
            slot,
            remainingMinutes: getRemainingMinutesInSlot(slot, currentMinutes),
        }))
        .find((entry) => entry.remainingMinutes !== null);

    if (!activeSlot || activeSlot.remainingMinutes === null) {
        return {
            allowed: false,
            message: `NPM ini hanya bisa masuk pada jadwal: ${formatSchedules(slots)}.`,
        };
    }

    const durationMinutes = configuredDurationMinutes ?? FALLBACK_DURATION_MINUTES;
    const remainingMinutes = Math.min(activeSlot.remainingMinutes, durationMinutes);

    return {
        allowed: true,
        access: {
            npm,
            name: activeSlot.slot.name,
            unlimited: false,
            expiresAt: now.getTime() + (remainingMinutes * 60 * 1000),
            schedule: `${activeSlot.slot.day} ${activeSlot.slot.rawTime}`,
        },
    };
}

export function isAccessExpired(accessExpiresAt?: number | null) {
    return typeof accessExpiresAt === "number" && Date.now() >= accessExpiresAt;
}
