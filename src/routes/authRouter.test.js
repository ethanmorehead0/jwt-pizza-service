const request = require('supertest');
const app = require('../service');
const jest = require('jest');


const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };

if (process.env.VSCODE_INSPECTOR_OPTIONS){
    jest.setTimeout(60 * 1000 * 10); // 10 minutes
}
beforeAll(async () => {
    testUser.email = Math.random().toString(36).substring(2, 12) + '@test.com';
    //const registerRes = await request(app).post('/api/auth').send(testUser);
    //let testUserAuthToken = registerRes.body.token;
});
test('login', async () => {
    const loginRes = await request(app).put('/api/auth').send(testUser);
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);

    //const { password, ...user } = { ...testUser, roles: [{ role: 'diner' }] };
    //expect(loginRes.body.user).toMatchObject(user);
});

/*
test('register', async () => {
    const user = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };
    user.email = Math.random().toString(36).substring(2, 12) + '@test.com';
    const regRes = await request(app).post('/api/auth').send(user);
    expect(regRes.status).toBe(200);
    //expect(loginRes.body.token).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);
  
    //const { password, ...user } = { ...testUser, roles: [{ role: 'diner' }] };
    //expect(loginRes.body.user).toMatchObject(user);
});

test('register without password', async () => {
    const user = { name: 'pizza diner', email: 'reg@test.com' };
    user.email = Math.random().toString(36).substring(2, 12) + '@test.com';
    const regRes = await request(app).post('/api/auth').send(user);
    expect(regRes.status).toBe(400);
    //expect(loginRes.body.token).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);
  
    //const { password, ...user } = { ...testUser, roles: [{ role: 'diner' }] };
    //expect(loginRes.body.user).toMatchObject(user);
});

test('login multiple', async () => {
    fail('not implemented');
});*/
