import fs from "fs";
import path from "path";

const FREE_ACCESS_NPM = "2317041013";
const PARTICIPANT_FILE_NAME = "PESERTA(1).md";
const FALLBACK_DURATION_MINUTES = 20;
const JAKARTA_TIME_ZONE = "Asia/Jakarta";

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

function findParticipantFile() {
    const candidates = [
        path.resolve(process.cwd(), PARTICIPANT_FILE_NAME),
        path.resolve(process.cwd(), "..", PARTICIPANT_FILE_NAME),
        path.resolve(__dirname, "..", "..", "..", PARTICIPANT_FILE_NAME),
    ];

    return candidates.find((candidate) => fs.existsSync(candidate));
}

function parseClockToMinutes(clock: string) {
    const [hour, minute] = clock.split(".").map(Number);
    return (hour * 60) + minute;
}

function parseDurationMinutes(markdown: string) {
    const match = markdown.match(/Durasi:\*\*\s*(\d+)\s*menit/i);
    return match ? Number(match[1]) : FALLBACK_DURATION_MINUTES;
}

function loadParticipantSlots() {
    if (participantSlotsByNpm) {
        return participantSlotsByNpm;
    }

    const participantFile = findParticipantFile();
    participantSlotsByNpm = new Map();

    if (!participantFile) {
        configuredDurationMinutes = FALLBACK_DURATION_MINUTES;
        console.warn(`${PARTICIPANT_FILE_NAME} not found. Only free access NPM can join.`);
        return participantSlotsByNpm;
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

        const existingSlots = participantSlotsByNpm.get(npm) ?? [];
        existingSlots.push(slot);
        participantSlotsByNpm.set(npm, existingSlots);
    }

    console.log(`Loaded ${participantSlotsByNpm.size} participant NPM entries from ${participantFile}`);
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

export function getParticipantAccess(npm: string, now = new Date()): AccessResult {
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

    const slotsByNpm = loadParticipantSlots();
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
