import { IoManager } from './managers/IoManager';
import { UserManager } from './managers/UserManager';
import { config } from './config';

const io = IoManager.getIo();

IoManager.listen(config.port);

const userManager = new UserManager();

io.on('connection', (socket) => {

    userManager.addUser(socket);

});

const shutdown = () => {
    io.close(() => {
        process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
