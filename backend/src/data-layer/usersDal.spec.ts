import * as chai from 'chai';
import { assert, expect } from 'chai';
import { IDataIO, Session } from '../models/backendInterfaces';
import { User } from '../models/sharedInterfaces';
import { logger } from '../utilities/logger';
import { UsersDal } from './usersDal';

class DataIOMock implements IDataIO {

    public mockData: User[] = [
        {
            email: 'aa@bb.com',
            firstName: 'firstName1',
            ignoreTfa: true,
            password: '1234',
            sessionTimeOutMS: 123454321,
        },
        {
            email: 'aa@bbb.com',
            firstName: 'firstName2',
            ignoreTfa: true,
            password: 'password',
            sessionTimeOutMS: 765432,
        },
        {
            email: 'aaa@bb.com',
            firstName: 'firstName3',
            ignoreTfa: false,
            password: 'password',
            sessionTimeOutMS: 845646,
        },
        {
            email: 'aaa@bbb.com',
            firstName: 'firstName4',
            ignoreTfa: true,
            password: '1234321',
            sessionTimeOutMS: 123454321,
        },
    ];

    public getDataSync(): any[] {
        return this.mockData;
    }

    public async getData(): Promise<any[]> {
        return this.mockData;
    }

    public async setData(data: any[]): Promise<void> {
        this.mockData = data;
    }
}

const dataMock = new DataIOMock();
const usersDal = new UsersDal(dataMock);

describe('Users DAL tests', () => {

    describe('Get Users', () => {
        it('it should get users succsessfully', async () => {

            const users = await usersDal.getUsers();

            expect(users).to.deep.equal(dataMock.mockData);
            return;
        });
    });

    describe('Get User by email', () => {
        it('it should get user succsessfully', async () => {

            const user = await usersDal.getUser(dataMock.mockData[2].email);

            expect(user).to.deep.equal(dataMock.mockData[2]);
            return;
        });
    });

    const additionalUser: User = {
        email: 'abc@dd.com',
        ignoreTfa: false,
        password: '876',
        sessionTimeOutMS: 456544355,
    };

    describe('Create new user', () => {
        it('it should create user succsessfully', async () => {

            await usersDal.createUser(additionalUser);

            const users = await usersDal.getUser(additionalUser.email);

            expect(users).to.deep.equal(additionalUser);
            return;
        });
    });

    describe('Delete user', () => {
        it('it should delete user succsessfully', async () => {

            await usersDal.deleteUser(additionalUser);

            const users = await usersDal.getUsers();

            expect(users).to.have.length(dataMock.mockData.length);
            return;
        });
    });
});
