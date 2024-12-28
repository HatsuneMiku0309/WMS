import { JwtPayload } from "jsonwebtoken";
import { ILoginBody } from "../login/login.interface";

export type TTokenType = 'Basic' | 'Bearer';

export interface ISignupData extends Omit<ILoginBody, 'password'> {
  id: string
}

export interface IJWTPayload extends ISignupData, JwtPayload {}