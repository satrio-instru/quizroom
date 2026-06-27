import crypto from "crypto";
import { Quiz } from "../Quiz";
import { ParticipantAccess } from "../access/ParticipantAccess";
import { AllowedSubmissions } from "../types/types";
import { IoManager } from "./IoManager";
import { saveRoom, loadRoom, loadAllRooms, updateRoomStatus, loadQuestions, questionSetExists, upsertScore, loadScores, type QuestionRow } from "../supabase";

export class QuizManager {

    private quizes: Quiz[];

    constructor() {
        this.quizes = [];
        this.restoreRoomsFromSupabase();
    }

    // Restore rooms from Supabase on startup
    private async restoreRoomsFromSupabase() {
        try {
            const rooms = await loadAllRooms();
            for (const room of rooms) {
                if (this.getQuiz(room.room_id)) continue;

                const questions = await loadQuestions(room.question_set);
                if (questions.length === 0) continue;

                const quiz = new Quiz(room.room_id);
                for (const q of questions) {
                    quiz.addProblem({
                        id: crypto.randomUUID(),
                        title: q.title,
                        description: q.description,
                        startTime: 0,
                        answer: q.correct_answer as AllowedSubmissions,
                        options: [
                            { id: 0, title: q.option_a },
                            { id: 1, title: q.option_b },
                            { id: 2, title: q.option_c },
                            { id: 3, title: q.option_d },
                        ],
                        submissions: [],
                    });
                }

                // Restore state
                quiz.restoreState(room.status, room.current_problem);

                // Restore scores
                const scores = await loadScores(room.room_id);
                for (const s of scores) {
                    quiz.restoreUser(s.user_id, s.npm, s.name, s.points);
                }

                this.quizes.push(quiz);
                console.log(`Restored room "${room.room_id}" (${room.question_set}, ${questions.length} questions, status: ${room.status})`);
            }
            if (rooms.length > 0) {
                console.log(`Restored ${rooms.length} room(s) from Supabase`);
            }
        } catch (err) {
            console.error('Failed to restore rooms from Supabase:', err);
        }
    }

    public start(roomId: string) {
        const quiz = this.getQuiz(roomId);
        if (!quiz) return;
        quiz.start();
        updateRoomStatus(roomId, 'question', 0);
    }

    public addProblem(roomId: string, problem: {
        title: string;
        description: string;
        image?: string;
        options: { id: number; title: string; }[];
        answer: AllowedSubmissions;
    }) {
        const quiz = this.getQuiz(roomId);
        if (!quiz) return;
        quiz.addProblem({
            ...problem,
            id: crypto.randomUUID(),
            startTime: new Date().getTime(),
            submissions: []
        });
    }

    public next(roomId: string) {
        const quiz = this.getQuiz(roomId);
        if (!quiz) return;
        quiz.next();
        const state = quiz.getCurrentState(true);
        const status = state?.type ?? 'ended';
        const problemIdx = quiz.getActiveProblemIndex();
        updateRoomStatus(roomId, status, problemIdx);
    }

    addUser(roomId: string, access: ParticipantAccess) {
        return this.getQuiz(roomId)?.addUser(access);
    }

    submit(userId: string, roomId: string, problemId: string, submission: 0 | 1 | 2 | 3) {
        const quiz = this.getQuiz(roomId);
        if (!quiz) return;
        quiz.submit(userId, problemId, submission);

        // Persist score to Supabase
        const user = quiz.getUser(userId);
        if (user) {
            upsertScore({
                room_id: roomId,
                user_id: userId,
                npm: user.npm,
                name: user.name,
                points: user.points,
            });
        }
    }

    removeUser(roomId: string, userId: string) {
        this.getQuiz(roomId)?.removeUser(userId);
    }

    getQuiz(roomId: string) {
        return this.quizes.find(x => x.roomId === roomId) ?? null;
    }

    getCurrentState(roomId: string, includeAnswers = false) {
        const quiz = this.quizes.find(x => x.roomId === roomId);
        if (!quiz) return null;
        return quiz.getCurrentState(includeAnswers);
    }

    // Create quiz room — auto-import from Supabase question set if matching
    async addQuiz(roomId: string) {
        if (this.getQuiz(roomId)) return;

        const quiz = new Quiz(roomId);

        // Try to find matching question set (e.g., room "UAP-PTI-2025" matches set "UAP")
        const setName = await this.findMatchingQuestionSet(roomId);
        let questionCount = 0;

        if (setName) {
            const questions = await loadQuestions(setName);
            for (const q of questions) {
                quiz.addProblem({
                    id: crypto.randomUUID(),
                    title: q.title,
                    description: q.description,
                    startTime: 0,
                    answer: q.correct_answer as AllowedSubmissions,
                    options: [
                        { id: 0, title: q.option_a },
                        { id: 1, title: q.option_b },
                        { id: 2, title: q.option_c },
                        { id: 3, title: q.option_d },
                    ],
                    submissions: [],
                });
            }
            questionCount = questions.length;
            console.log(`Auto-imported ${questions.length} questions from set "${setName}" for room "${roomId}"`);
        } else {
            console.log(`No matching question set found for room "${roomId}"`);
        }

        this.quizes.push(quiz);

        // Only persist to Supabase if we have a valid question set
        // (rooms table has FK constraint on question_set)
        if (setName) {
            await saveRoom({
                room_id: roomId,
                question_set: setName,
                current_problem: 0,
                status: 'not_started',
            });
        }
    }

    // Find matching question set for a room ID
    // e.g., "UAP-PTI-2025" → checks "UAP-PTI-2025", "UAP-PTI", "UAP"
    private async findMatchingQuestionSet(roomId: string): Promise<string | null> {
        const parts = roomId.split(/[-_]/);
        // Try progressively shorter prefixes
        for (let i = parts.length; i > 0; i--) {
            const candidate = parts.slice(0, i).join('-');
            if (await questionSetExists(candidate)) return candidate;
        }
        // Also try with underscore
        for (let i = parts.length; i > 0; i--) {
            const candidate = parts.slice(0, i).join('_');
            if (await questionSetExists(candidate)) return candidate;
        }
        return null;
    }

    // Get all active quizzes
    getActiveQuizIds(): string[] {
        return this.quizes.map(q => q.roomId);
    }
}
