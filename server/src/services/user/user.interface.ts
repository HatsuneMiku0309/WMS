export interface IUserRow {
    id: string;
    account: string;
    password: string;
    create_time: Date;
    update_time: Date;
    email: string;
}

export type TRepassBody = Pick<IUserRow, 'password'>;

export interface IUserService {
    repass(id: string, body: TRepassBody): Promise<void>;
}