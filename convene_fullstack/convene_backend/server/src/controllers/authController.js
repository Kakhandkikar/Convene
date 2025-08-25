import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';

export const validateRegister = [
  body('fullName').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
}

function sign(user) {
  return jwt.sign({ id: user._id, email: user.email }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export async function register(req, res) {
  const bad = handleValidation(req, res);
  if (bad) return;
  const { fullName, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ error: 'Email already registered' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ fullName, email, passwordHash });
  const token = sign(user);
  res.status(201).json({ token, user: { id: user._id, fullName, email } });
}

export async function login(req, res) {
  const bad = handleValidation(req, res);
  if (bad) return;
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = sign(user);
  res.json({ token, user: { id: user._id, fullName: user.fullName, email: user.email } });
}

export async function me(req, res) {
  const user = await User.findById(req.user.id).select('fullName email');
  res.json({ user: { id: user._id, fullName: user.fullName, email: user.email } });
}
