import http from "http";
import { Server } from "socket.io";
import { config } from "../config";

const server = http.createServer((req, res) => {
    if (req.url === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok", uptime: process.uptime() }));
        return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "not_found" }));
});

export class IoManager {
    private static io: Server;

    public static getIo() {
        if (!this.io) {
            this.io = new Server(server, {
                cors: {
                    origin: config.corsOrigins,
                    methods: ["GET", "POST"],
                    credentials: true,
                },
            });
        }

        return this.io;
    }

    public static listen(port: number) {
        server.listen(port);
    }
}
