import { Request, Response } from "express";
import AuthService from "../services/auth.service";

export const register = async (req: Request, res: Response) => {
  const { email, password, fullName } = req.body;

  if (!email || !password || !fullName) {
    return res
      .status(400)
      .json({ error: "Email, password, and full name are required" });
  }
  const result = await AuthService.register(email, password, fullName);
  res.status(201).json(result);
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  const result = await AuthService.login(email, password);
  res.status(200).json({ success: true, ...result });
};
