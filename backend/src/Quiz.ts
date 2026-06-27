import crypto from "crypto";
import { IoManager } from "./managers/IoManager";
import { AllowedSubmissions, Problem, User } from "./types/types";
import { ParticipantAccess, isAccessExpired } from "./access/ParticipantAccess";

const PROBLEM_TIME_S = 20;
const LEADERBOARD_SHOW_S = 3; // Show leaderboard for 3 seconds before auto-advancing


export class Quiz {

    public roomId: string;
    private hasStarted: boolean;
    private problems: Problem[];
    private activeProblem: number;
    private users: User[];
    private currentState: "leaderboard" | "question" | "not_started" | "ended";
    private leaderboardTimeout: ReturnType<typeof setTimeout> | null = null;

    /*
    Constructor for the Quiz class.
    Initializes the quiz with a room ID, sets the quiz state to not started,
    initializes the problems array, sets the active problem index to 0,
    initializes the users array, and sets the current state to "not_started".

    @param {string} roomId - The unique identifier for the quiz room.
    @returns {void}

    */
    constructor(roomId: string) {
        this.roomId = roomId;
        this.hasStarted = false;
        this.problems = []
        this.activeProblem = 0;
        this.users = [];
        this.currentState = "not_started";
    }

    /*
    Adds a problem to the quiz.

    @param {Problem} problem - The problem to add.

    @returns {void}
    */

    addProblem(problem: Problem) {
        if (this.hasStarted) {
            throw new Error("Cannot add problems after quiz has started");
        }
        this.problems.push(problem);
    }

    /*
    Starts the quiz by setting the hasStarted flag to true and setting the first problem as the active problem.
    It emits the "problem" event to the room with the first problem.

    @returns {void}
    */

    start() {
        if (this.problems.length === 0) {
            throw new Error("Cannot start quiz without problems");
        }
        this.hasStarted = true;
        this.setActiveProblem(this.problems[0]);
    }

    /*
    Sets the active problem for the quiz.

    @param {Problem} problem - The problem to set as active.
    @returns {void}
    */

    setActiveProblem(problem: Problem) {
        // BUG FIX [8.3]: Clear previous timeout to prevent stacking
        if (this.leaderboardTimeout) {
            clearTimeout(this.leaderboardTimeout);
            this.leaderboardTimeout = null;
        }

        this.currentState = "question"
        problem.startTime = new Date().getTime();
        problem.submissions = [];
        IoManager.getIo().to(this.roomId).emit("problem", {
            problem: this.sanitizeProblemForClient(problem)
        })
        this.leaderboardTimeout = setTimeout(() => {
            this.sendLeaderboard();
            // Auto-advance to next question after showing leaderboard
            this.leaderboardTimeout = setTimeout(() => {
                this.next();
                this.leaderboardTimeout = null;
            }, LEADERBOARD_SHOW_S * 1000);
        }, PROBLEM_TIME_S * 1000);
    }

    /*

    Sends the leaderboard to the room and updates the current state to "leaderboard".
    @returns {void}

    */


    sendLeaderboard() {
        this.currentState = "leaderboard"
        const leaderboard = this.getLeaderboard();
        IoManager.getIo().to(this.roomId).emit("leaderboard", {
            leaderboard
        })
    }

    /*
    Moves to the next problem in the quiz.

    @returns {void}
    */

    next() {
        this.activeProblem++;
        const problem = this.problems[this.activeProblem];
        if (problem) {
            this.setActiveProblem(problem);
        } else {
            // BUG FIX [8.2]: Set ended state and emit quizEnd event
            this.activeProblem--;
            this.currentState = "ended";

            // Clear any pending leaderboard timeout
            if (this.leaderboardTimeout) {
                clearTimeout(this.leaderboardTimeout);
                this.leaderboardTimeout = null;
            }

            IoManager.getIo().to(this.roomId).emit("quizEnd", {
                leaderboard: this.getLeaderboard()
            });
        }
    }

    /*
    Generates a cryptographically secure random string.

    @param {number} length - The length of the random string to generate.
    @returns {string} - The generated random string.
    */

    genRandomString(length: number) {
        return crypto.randomBytes(length).toString("base64url").slice(0, length);
    }

    /*
    Adds a user to the quiz.

    @param {ParticipantAccess} access - The access info of the user to add.
    @returns {string} - The ID of the added user.
    */

    addUser(access: ParticipantAccess) {
        const existingUser = this.users.find(x => x.npm === access.npm);
        if (existingUser) {
            existingUser.name = access.name;
            existingUser.accessExpiresAt = access.expiresAt;
            existingUser.unlimitedAccess = access.unlimited;
            return existingUser.id;
        }

        const id = this.genRandomString(7);
        this.users.push({
            id,
            name: access.name,
            npm: access.npm,
            points: 0,
            accessExpiresAt: access.expiresAt,
            unlimitedAccess: access.unlimited,
        })
        return id;
    }

    removeUser(userId: string) {
        const index = this.users.findIndex(x => x.id === userId);
        if (index !== -1) {
            this.users.splice(index, 1);
        }
    }

    /*
    Submits a user's answer to a problem in the quiz.
    @param {string} userId - The ID of the user submitting the answer.
    @param {string} roomId - The ID of the room where the quiz is taking place.
    @param {string} problemId - The ID of the problem being answered.
    @param {AllowedSubmissions} submission - The user's submission.

    @returns {void}
    */

    submit(userId: string, problemId: string, submission: AllowedSubmissions) {
        // FIX: Validate that the submitted problem is the active one
        const activeProblem = this.problems[this.activeProblem];
        if (!activeProblem || activeProblem.id !== problemId) {
            return;
        }

        const user = this.users.find(x => x.id === userId);
        if (!user) {
            return;
        }
        if (isAccessExpired(user.accessExpiresAt)) {
            return;
        }

        const existingSubmission = activeProblem.submissions.find(x => x.userId === userId);
        if (existingSubmission) {
            return;
        }

        const isCorrect = activeProblem.answer === submission;
        activeProblem.submissions.push({
            problemId,
            userId,
            isCorrect,
            optionSelected: submission
        });

        // FIX: Only award points if the answer is CORRECT
        if (isCorrect) {
            const elapsed = new Date().getTime() - activeProblem.startTime;
            const maxTime = PROBLEM_TIME_S * 1000;
            const timeRatio = Math.min(elapsed / maxTime, 1);
            const points = Math.max(0, Math.round(1000 - (500 * timeRatio)));
            user.points += points;
        }

        // Check if all users have answered → auto-advance
        this.checkAllAnswered();
    }

    // Check if all connected users have submitted for the current problem
    private checkAllAnswered() {
        const activeProblem = this.problems[this.activeProblem];
        if (!activeProblem || this.users.length === 0) return;

        const allAnswered = this.users.every(user =>
            activeProblem.submissions.some(s => s.userId === user.id)
        );

        if (allAnswered) {
            // Clear the timer
            if (this.leaderboardTimeout) {
                clearTimeout(this.leaderboardTimeout);
                this.leaderboardTimeout = null;
            }
            // Show leaderboard, then auto-advance after 3 seconds
            this.sendLeaderboard();
            this.leaderboardTimeout = setTimeout(() => {
                this.next();
                this.leaderboardTimeout = null;
            }, LEADERBOARD_SHOW_S * 1000);
        }
    }

    /*
    Gets the leaderboard of the quiz, sorted by user points in descending order.

    @returns {Array} - The leaderboard of the quiz.
    */

    getLeaderboard() {
        return [...this.users].sort((a, b) => b.points - a.points).slice(0, 20);
    }

    private sanitizeProblemForClient(problem: Problem) {
        const { answer, submissions, ...safeProblem } = problem;
        return safeProblem;
    }

    /*
    Gets the current state of the quiz.

    @returns {Object} - The current state of the quiz.
    */

    // Restore state from Supabase
    restoreState(status: string, currentProblem: number) {
        this.currentState = status as any;
        this.activeProblem = currentProblem;
        if (status !== 'not_started') {
            this.hasStarted = true;
        }
    }

    // Restore a user with their score from Supabase
    restoreUser(userId: string, npm: string, name: string, points: number) {
        const existing = this.users.find(x => x.id === userId);
        if (!existing) {
            this.users.push({ id: userId, name, npm, points });
        }
    }

    // Get a user by ID
    getUser(userId: string) {
        return this.users.find(x => x.id === userId) ?? null;
    }

    // Get current problem index
    getActiveProblemIndex() {
        return this.activeProblem;
    }

    // Get total problem count
    getProblemCount() {
        return this.problems.length;
    }

    // Get all questions (without answers for security)
    getAllQuestions() {
        return this.problems.map((p, i) => ({
            number: i + 1,
            title: p.title,
            description: p.description,
            options: p.options,
        }));
    }

    getCurrentState(includeAnswers = false) {
        if (this.currentState === "not_started") {
            return {
                type: "not_started"
            }
        }
        if (this.currentState === "ended") {
            return {
                type: "ended",
                leaderboard: this.getLeaderboard()
            }
        }
        if (this.currentState === "leaderboard") {
            return {
                type: "leaderboard",
                leaderboard: this.getLeaderboard()
            }
        }
        if (this.currentState === "question") {
            const problem = this.problems[this.activeProblem];
            return {
                type: "question",
                problem: includeAnswers ? problem : this.sanitizeProblemForClient(problem)
            }
        }
    }



}
