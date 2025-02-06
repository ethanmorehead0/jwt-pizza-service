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

async function createFranUser() {
    let user = { password: 'toomanysecrets', roles: [{ role: Role.Diner}] };
    user.name = randomName();
    user.email = user.name + '@fran.com';

    user = await DB.addUser(user);
    return { ...user, password: 'toomanysecrets' };
}

beforeAll(async () => {
    testUser.email = Math.random().toString(36).substring(2, 12) + '@test.com';
    const registerRes = await request(app).post('/api/auth').send(testUser);
    testUserAuthToken = registerRes.body.token;
    expectValidJwt(testUserAuthToken);
});


test('user franchise list', async () => {
    const createRes = await request(app).post('/api/auth').send(testUser);

    const loginRes = await request(app).get('/api/franchise/${createdUser.id}').set('Authorization', `Bearer ${createRes.body.token}`).send(testUser);
    expect(loginRes.status).toBe(200);
});

test('franchise list', async () => {
    const loginRes = await request(app).get('/api/franchise').send(testUser);
    expect(loginRes.status).toBe(200);
    
});

test('create a new franchise', async () => {
    const adminUser = await createAdminUser();
    
    const createRes = await request(app).put('/api/auth').send({ email: adminUser.email, password: adminUser.password });
    expect(createRes.status).toBe(200);
    
    const franchiseData = {stores: [], id: "", name: randomName(), admins: [{email: adminUser.email, id: 2, name: adminUser.name}]};
    const createFranchiseRes = await request(app).post('/api/franchise').set('Authorization', `Bearer ${createRes.body.token}`).send(franchiseData);
    expect(createFranchiseRes.status).toBe(200);
});


test('delete a new franchise', async () => {
    const adminUser = await createAdminUser();
    const createRes = await request(app).put('/api/auth').send({ email: adminUser.email, password: adminUser.password });
    const franchiseData = {stores: [], id: 1, name: randomName(), admins: [{email: adminUser.email, id: 2, name: adminUser.name}]};
    await request(app).post('/api/franchise').set('Authorization', `Bearer ${createRes.body.token}`).send(franchiseData);
    const deleteFranchiseRes = await request(app).delete('/api/franchise/1').set('Authorization', `Bearer ${createRes.body.token}`);

    expect(deleteFranchiseRes.status).toBe(200);
    
});


test('create a new franchise store', async () => {
    const adminUser = await createAdminUser();
    const franUser = await createFranUser();
    const franchiseID = 45;
    const createRes = await request(app).put('/api/auth').send({ email: adminUser.email, password: adminUser.password });
    const franchiseData = {stores: [], id: franchiseID, name: randomName(), admins: [{email: franUser.email, id: franUser.id, name: franUser.name}]};
    await request(app).post('/api/franchise').set('Authorization', `Bearer ${createRes.body.token}`).send(franchiseData);

    await request(app).put('/api/auth').send({ email: franUser.email, password: franUser.password });
    const franchiseStoreData = {id: "", name: "f4"};
    const createFranchiseStoreRes = await request(app).post(`/api/franchise/${franchiseID}/store`).set('Authorization', `Bearer ${createRes.body.token}`).send(franchiseStoreData);
    //const createFranchiseStoreResFran = await request(app).post(`/api/franchise/${franchiseID}/store`).set('Authorization', `Bearer ${createRes.body.token}`).send(franchiseStoreData);
    //expect(createFranchiseStoreResFran.status).toBe(200);
    expect(createFranchiseStoreRes.status).toBe(200);
});

test('create a new franchise store', async () => {
    const adminUser = await createAdminUser();
    const franUser = await createFranUser();
    const franchiseID = 45;
    const createRes = await request(app).put('/api/auth').send({ email: adminUser.email, password: adminUser.password });
    const franchiseData = {stores: [], id: franchiseID, name: randomName(), admins: [{email: franUser.email, id: franUser.id, name: franUser.name}]};
    await request(app).post('/api/franchise').set('Authorization', `Bearer ${createRes.body.token}`).send(franchiseData);

    await request(app).put('/api/auth').send({ email: franUser.email, password: franUser.password });
    const franchiseStoreData = {id: "", name: "f4"};
    await request(app).post(`/api/franchise/${franchiseID}/store`).set('Authorization', `Bearer ${createRes.body.token}`).send(franchiseStoreData);
    //const createFranchiseStoreResFran = await request(app).post(`/api/franchise/${franchiseID}/store`).set('Authorization', `Bearer ${createRes.body.token}`).send(franchiseStoreData);
    //expect(createFranchiseStoreResFran.status).toBe(200);
    const deleteFranchiseStoreRes = await request(app).delete(`/api/franchise/${franchiseID}/store/1`).set('Authorization', `Bearer ${createRes.body.token}`);
    expect(deleteFranchiseStoreRes.status).toBe(200);
    
});

test('unauthorized ', async () => {
    const franUser = await createFranUser();
    const franchiseID = 45;
    const franchiseData = {stores: [], id: franchiseID, name: randomName(), admins: [{email: franUser.email, id: franUser.id, name: franUser.name}]};
   
    const logResFran = await request(app).put('/api/auth').send({ email: franUser.email, password: franUser.password });
    const franchiseCreationFail = await request(app).post('/api/franchise').set('Authorization', `Bearer ${logResFran.body.token}`).send(franchiseData);

    expect(franchiseCreationFail.status).toBe(403);
});
