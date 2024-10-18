const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient ();

class User {
    id = null;
    name = null;
    email = null;
    password = null;

    constructor(name, email, password) {
        this.name = name;
        this.email = email;
        this.password = password;
    }

     async register() {
        const user = await prisma.user.create({
            data : {
                name : this.name,
                email : this.email,
                password : this.password,
            },
        });
        this.setID(user.id);  
    }

    static async getAllData(){
        return await prisma.user.findMany();   
    }

    static async getById(userId) {
        return await prisma.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                profile: true, 
            },
        });
    }

    static async updateUser(userId, data){
        return await prisma.user.update({
            where: {
                id : userId,
            },

            data : {
                name: data.name, 
                email: data.email, 
                password: data.password,
            },  
        });
    }

    static async deleteUser(userId){
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

        if (!user) {
            throw new Error(`User with ID ${userId} not found`);
        }

        // delete dulu profilenya
        await prisma.profile.deleteMany({
            where: {
                userId: userId,
            },
        });

        // baru delete usernya
        return await prisma.user.delete({
            where : {
                id : userId,
            },
        });
    }

    setID(id) {
        this.id = id;
    }

    getID() {
        return this.id;
    }

    getPassword() {
        return '********';
    }
}

exports.User = User;
