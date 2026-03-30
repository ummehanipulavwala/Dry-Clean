import { Server } from "socket.io";

const socketIO = (server, app) => {
    const io = new Server(server, {
        pingTimeout: 60000,
        cors: {
            origin: "*", // Adjust as needed for production
        },
    });

    // Make io accessible in controllers via req.app.get("io")
    if (app) {
        app.set("io", io);
    }
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

        socket.on("edit message", (editedMessageRecieved) => {
            var chat = editedMessageRecieved.chat;

            if (!chat || !chat.members) return console.log("chat.members not defined for edit message");

            chat.members.forEach((user) => {
                if (user._id == editedMessageRecieved.sender._id) return;

                socket.in(user._id).emit("message edited", editedMessageRecieved);
            });
        });

        socket.on("delete message", (deletedMessageRecieved) => {
            var chat = deletedMessageRecieved.chat;

            if (!chat || !chat.members) return console.log("chat.members not defined for delete message");

            chat.members.forEach((user) => {
                if (deletedMessageRecieved.sender && user._id == deletedMessageRecieved.sender._id) return;

                socket.in(user._id).emit("message deleted", deletedMessageRecieved);
            });
        });

        socket.on("messages read", (readData) => {
            // readData should contain { chatId, readerId, members: [...] }
            if (!readData || !readData.members) return console.log("members not defined for messages read event");

            readData.members.forEach((memberId) => {
                if (memberId == readData.readerId) return;

                socket.in(memberId).emit("messages seen", {
                    chatId: readData.chatId,
                    readerId: readData.readerId
                });
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
