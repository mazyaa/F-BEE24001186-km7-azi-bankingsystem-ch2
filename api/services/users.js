const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient ();
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config({ path : '.env'});

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
        const encryptedPassword = await this.getPassword();
        const user = await prisma.user.create({
            data : {
                name : this.name,
                email : this.email,
                password : encryptedPassword,
            },
        });
        this.setID(user.id);  
        return user;
    }

    async login() {
        const user = await prisma.user.findUnique({
            where: { email: this.email },
        });
    
        if (!user) {
            throw new Error('User not found');
        }
    
        const isPasswordValid = await bcrypt.compare(this.password, user.password);
        if (!isPasswordValid) {
            throw new Error('Incorrect password');
        }
    
        const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET_KEY, {
            expiresIn: '1h', 
        });
    
        return { user, token };
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

    async getPassword() {
        const encryptedPassword = await bcrypt.hash(this.password, 10);
        return encryptedPassword;
    }
}

exports.User = User;
