import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

class AuthService {
  register = async (email: string, password: string, fullName: string) => {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        role: Role.USER,
      },
    });
    console.log("Registered user:", { email, fullName });
    return { message: "User registered successfully" };
  };

  login = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      throw new Error("Invalid email or password");
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1h",
      },
    );
    console.log("Logging in user:", { email });
    return { message: "User logged in successfully", token };
  };
}

export default new AuthService();
