import { Socket } from "socket.io";
import { config } from "../config";
import { getParticipantAccess, invalidateParticipantCache } from "../access/ParticipantAccess";
import { QuizManager } from "./QuizManager";
import { loadAllRooms } from "../supabase";

export class UserManager {

    // This class manages user interactions with the quiz system.
    // It handles user connections, quiz creation, problem submission, and state management.
    private quizManager;

    /*
    This constructor initializes the UserManager with a QuizManager instance.
    */
    constructor() {
        this.quizManager = new QuizManager
    }

    addUser(socket: Socket) {
        this.createHandlers(socket);
    }

    private createHandlers(socket: Socket) {
        // ─── Participant join ───
        socket.on("join", async (data) => {
            const npm = String(data.npm ?? data.name ?? "").trim();
            const roomId = String(data.roomId ?? "").trim();

            if (!roomId) {
                socket.emit("joinRejected", {
                    message: "Room ID wajib diisi."
                });
                return;
            }

            const accessResult = await getParticipantAccess(npm);

            if (!accessResult.allowed || !accessResult.access) {
                socket.emit("joinRejected", {
                    message: accessResult.message ?? "NPM tidak diizinkan masuk."
                });
                return;
            }

            // Leave previous room if any
            if (socket.data.roomId && socket.data.roomId !== roomId) {
                socket.leave(socket.data.roomId);
            }

            const userId = this.quizManager.addUser(roomId, accessResult.access)
            if (userId) {
                socket.data.userId = userId;
                socket.data.roomId = roomId;
                socket.data.npm = npm;
            }

            socket.emit("init", {
                userId,
                npm,
                roomId,
                access: accessResult.access,
                state: this.quizManager.getCurrentState(roomId)
            });
            if (userId) {
                socket.join(roomId);
            }
        });

        // ─── Leave handler ───
        socket.on("leave", (data) => {
            const roomId = data?.roomId || socket.data.roomId;
            const userId = socket.data.userId;
            if (roomId && userId) {
                this.quizManager.removeUser(roomId, userId);
                socket.leave(roomId);
            }
            socket.data.userId = undefined;
            socket.data.roomId = undefined;
            socket.data.npm = undefined;
            socket.data.isAdmin = undefined;
        });

        // ─── Admin authentication ───
        socket.on("joinAdmin", (data) => {
            if (data.password !== config.adminPassword) {
                socket.emit("adminAuth", { success: false });
                return;
            }
            socket.data.isAdmin = true;
            socket.emit("adminAuth", { success: true });
        });

        // ─── BUG FIX [8.7]: Admin events — always registered, auth checked per call ───

        socket.on("createQuiz", async (data) => {
            if (!socket.data.isAdmin) {
                socket.emit("error", { message: "Not authenticated as admin." });
                return;
            }
            try {
                await this.quizManager.addQuiz(data.roomId);
                const quiz = this.quizManager.getQuiz(data.roomId);
                const questionCount = quiz ? quiz.getProblemCount() : 0;
                socket.emit("quizCreated", { roomId: data.roomId, questionCount });
            } catch (error) {
                socket.emit("error", { message: "Failed to create quiz" });
            }
        });

        // ─── Get all rooms from Supabase ───
        socket.on("getRooms", async () => {
            if (!socket.data.isAdmin) {
                socket.emit("error", { message: "Not authenticated as admin." });
                return;
            }
            try {
                const rooms = await loadAllRooms();
                socket.emit("roomsList", rooms);
            } catch (error) {
                socket.emit("error", { message: "Failed to get rooms" });
            }
        });

        socket.on("createProblem", (data) => {
            if (!socket.data.isAdmin) {
                socket.emit("error", { message: "Not authenticated as admin." });
                return;
            }
            try {
                this.quizManager.addProblem(data.roomId, data.problem);
                socket.emit("problemAdded", { roomId: data.roomId });
            } catch (error) {
                socket.emit("error", { message: "Failed to add problem" });
            }
        });

        socket.on("next", (data) => {
            if (!socket.data.isAdmin) {
                socket.emit("error", { message: "Not authenticated as admin." });
                return;
            }
            try {
                this.quizManager.next(data.roomId);
            } catch (error) {
                socket.emit("error", { message: "Failed to proceed to next question" });
            }
        });

        socket.on("start", (data) => {
            if (!socket.data.isAdmin) {
                socket.emit("error", { message: "Not authenticated as admin." });
                return;
            }
            try {
                this.quizManager.start(data.roomId);
            } catch (error) {
                socket.emit("error", { message: "Failed to start quiz" });
            }
        });

        socket.on("getQuizState", (data) => {
            if (!socket.data.isAdmin) {
                socket.emit("error", { message: "Not authenticated as admin." });
                return;
            }
            try {
                const state = this.quizManager.getCurrentState(data.roomId, true);
                socket.emit("quizStateUpdate", state);
            } catch (error) {
                socket.emit("error", { message: "Failed to get quiz state" });
            }
        });

        // ─── Refresh participant cache (after saving to Supabase) ───
        socket.on("refreshParticipants", () => {
            if (!socket.data.isAdmin) {
                socket.emit("error", { message: "Not authenticated as admin." });
                return;
            }
            invalidateParticipantCache();
            socket.emit("participantsRefreshed", { success: true });
        });

        // ─── Participant submit ───
        socket.on("submit", (data) => {
            const userId = socket.data.userId;
            const roomId = socket.data.roomId;
            const problemId = data.problemId;
            const submission = data.submission;
            if (!userId || !roomId) {
                socket.emit("error", { message: "Please join the room before submitting." });
                return;
            }
            if (submission != 0 && submission != 1 && submission != 2 && submission != 3) {
                socket.emit("error", { message: "Invalid answer option." });
                return;
            }
            this.quizManager.submit(userId, roomId, problemId, submission)
        });
    }


}
