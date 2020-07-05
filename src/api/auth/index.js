import express from 'express';
import AuthController from "./AuthController";

const auth = express.Router();

auth.post('/login', AuthController.login);

export default auth;