import crypto from "crypto";
import { Quiz } from "../Quiz";
import { ParticipantAccess } from "../access/ParticipantAccess";
import { AllowedSubmissions } from "../types/types";
import { IoManager } from "./IoManager";

export class QuizManager {

    private quizes: Quiz[];


    constructor() {
        this.quizes = [];
    }

    public start(roomId: string) {
        const quiz = this.getQuiz(roomId);
        if (!quiz) {
            return;
        }
        quiz.start();
    }

    public addProblem(roomId: string, problem: {
        title: string;
        description: string;
        image?: string;
        options: {
            id: number;
            title: string;
        }[];
        answer: AllowedSubmissions;
    }) {
        const quiz = this.getQuiz(roomId);
        if (!quiz) {
            return;
        }
        // BUG FIX [8.12]: Use crypto.randomUUID() instead of globalProblemId counter
        quiz.addProblem({
            ...problem,
            id: crypto.randomUUID(),
            startTime: new Date().getTime(),
            submissions: []
        });
    }

    public next(roomId: string) {
        const quiz = this.getQuiz(roomId);
        if (!quiz) {
            return;
        }
        quiz.next();
    }

    addUser(roomId: string, access: ParticipantAccess) {
        return this.getQuiz(roomId)?.addUser(access);
    }

    submit(userId: string, roomId: string, problemId: string, submission: 0 | 1 | 2 | 3) {
        this.getQuiz(roomId)?.submit(userId, problemId, submission);
    }

    removeUser(roomId: string, userId: string) {
        this.getQuiz(roomId)?.removeUser(userId);
    }

    getQuiz(roomId: string) {
        return this.quizes.find(x => x.roomId === roomId) ?? null;
    }

    getCurrentState(roomId: string, includeAnswers = false) {
        const quiz = this.quizes.find(x => x.roomId === roomId);
        if (!quiz) {
            return null;
        }
        return quiz.getCurrentState(includeAnswers);
    }

    addQuiz(roomId: string) {
        if (this.getQuiz(roomId)) {
            return;
        }
        const quiz = new Quiz(roomId);
        this.quizes.push(quiz);
    }
}
