import { Server } from "socket.io";

const socketIO = (server) => {
    const io = new Server(server, {
        pingTimeout: 60000,
        cors: {
            origin: "*", // Adjust as needed for production
        },
    });

    io.on("connection", (socket) => {
        console.log("Connected to socket.io");

        socket.on("setup", (userData) => {
            socket.join(userData._id);
            console.log(`User joined room: ${userData._id}`);
            socket.emit("connected");
        });

        socket.on("join chat", (room) => {
            socket.join(room);
            console.log("User Joined Room: " + room);
        });

        socket.on("new message", (newMessageRecieved) => {
            var chat = newMessageRecieved.chat;

            if (!chat.members) return console.log("chat.members not defined");

            chat.members.forEach((user) => {
                if (user._id == newMessageRecieved.sender._id) return;

                socket.in(user._id).emit("message recieved", newMessageRecieved);
            });
        });

        socket.off("setup", () => {
            console.log("USER DISCONNECTED");
            socket.leave(userData._id);
        });
    });

    return io;
};

export default socketIO;
