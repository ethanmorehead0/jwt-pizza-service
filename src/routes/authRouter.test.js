const request = require('supertest');
const app = require('../service');

const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };
let testUserAuthToken;

if (process.env.VSCODE_INSPECTOR_OPTIONS){
    jest.setTimeout(60 * 1000 * 5); // 10 minutes
}



function expectValidJwt(potentialJwt) {
    expect(potentialJwt).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);
  }
  function randomName() {
      return Math.random().toString(36).substring(2, 12);
  }
  const { Role, DB } = require('../database/database.js');
  
  async function createAdminUser() {
    let user = { password: 'toomanysecrets', roles: [{ role: Role.Admin }] };
    user.name = randomName();
    user.email = user.name + '@admin.com';
  
    user = await DB.addUser(user);
    return { ...user, password: 'toomanysecrets' };
  }


beforeAll(async () => {
  testUser.email = Math.random().toString(36).substring(2, 12) + '@test.com';
  const registerRes = await request(app).post('/api/auth').send(testUser);
  testUserAuthToken = registerRes.body.token;
  expectValidJwt(testUserAuthToken);
});


test('login', async () => {
  const loginRes = await request(app).put('/api/auth').send(testUser);
  expect(loginRes.status).toBe(200);
  expectValidJwt(loginRes.body.token);

  const expectedUser = { ...testUser, roles: [{ role: 'diner' }] };
  delete expectedUser.password;
  expect(loginRes.body.user).toMatchObject(expectedUser);
});

test('loginAdmin', async () => {
    const adminUser = await createAdminUser();
    const loginRes = await request(app).put('/api/auth').send({ email: adminUser.email, password: adminUser.password });
    expect(loginRes.status).toBe(200);
    expectValidJwt(loginRes.body.token);

    const expectedUser = { ...adminUser, roles: [{ role: 'admin' }] };
    delete expectedUser.password;
    expect(loginRes.body.user).toMatchObject(expectedUser);
});

test('login invalid username/password', async () => {
    const loginRes = await request(app).put('/api/auth').send({ email: testUser.email, password: 'wrong' });
    expect(loginRes.status).toBe(404);
    
    
    const loginRes2 = await request(app).put('/api/auth').send({ email: "wrong", password: 'wrong' });
    expect(loginRes2.status).toBe(404);
});




test('register', async () => {
    const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };
    const regRes = await request(app).post('/api/auth').send(testUser);
    expect(regRes.status).toBe(200);

    
    const expectedUser = { ...testUser, roles: [{ role: 'diner' }] };
    delete expectedUser.password;
    expect(regRes.body.user).toMatchObject(expectedUser);
});


test('register invalid request', async () => {
    const testUser1 = { name: 'pizza diner', email: 'reg@test.com'};
    const regRes = await request(app).post('/api/auth').send(testUser1);
    expect(regRes.status).toBe(400);
});


test('logout', async () => {
    await request(app).put('/api/auth').send({ email: testUser.email, password: 'wrong' });
    const logoutRes = await request(app).delete('/api/auth').set('Authorization', `Bearer ${testUserAuthToken}`).send();
    expect(logoutRes.status).toBe(200);
});


test('update user', async () => {
    const newUser = { name: 'new user', email: `${randomName()}@test.com`, password: 'password123' };
    const createRes = await request(app).post('/api/auth').send(newUser);
    const createdUser = createRes.body.user;

    const updatedUserData = { name: 'updated user', email: `${randomName()}@test.com`, password: 'newpassword123' };
    const updateRes = await request(app).put(`/api/auth/${createdUser.id}`).set('Authorization', `Bearer ${createRes.body.token}`).send(updatedUserData);
    expect(updateRes.status).toBe(200);
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
