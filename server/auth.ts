import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { loginSchema, signupSchema, type LoginData, type SignupData, type User } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";

export interface AuthUser {
  id: number;
  username: string;
  name: string;
  email?: string;
  phone?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function authenticateUser(data: LoginData): Promise<{ user: AuthUser; token: string } | null> {
  const { identifier, password } = loginSchema.parse(data);
  
  // Try to find user by email or phone
  let user: User | undefined;
  
  // Check if identifier looks like an email
  if (identifier.includes("@")) {
    user = await storage.getUserByEmail(identifier);
  } else {
    user = await storage.getUserByPhone(identifier);
  }
  
  if (!user) {
    return null;
  }
  
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    return null;
  }
  
  const authUser: AuthUser = {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email || undefined,
    phone: user.phone || undefined,
  };
  
  const token = generateToken(authUser);
  
  return { user: authUser, token };
}

export async function createUser(data: SignupData): Promise<{ user: AuthUser; token: string }> {
  const validatedData = signupSchema.parse(data);
  
  // Generate username from email or phone
  const username = validatedData.email || validatedData.phone || `user_${Date.now()}`;
  
  // Hash password
  const hashedPassword = await hashPassword(validatedData.password);
  
  // Create user
  const newUser = await storage.createUser({
    username,
    password: hashedPassword,
    name: validatedData.name,
    email: validatedData.email || null,
    phone: validatedData.phone || null,
  });
  
  const authUser: AuthUser = {
    id: newUser.id,
    username: newUser.username,
    name: newUser.name,
    email: newUser.email || undefined,
    phone: newUser.phone || undefined,
  };
  
  const token = generateToken(authUser);
  
  return { user: authUser, token };
} 