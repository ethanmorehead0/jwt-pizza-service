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


test('get order menu', async () => {
    const loginRes = await request(app).get('/api/order/menu');
    expect(loginRes.status).toBe(200);
});

test('franchise list', async () => {
    let adminUser = await createAdminUser();
    const franUser = await createFranUser();
    const franchiseID = 45;
    let adminRes = await request(app).put('/api/auth').send({ email: adminUser.email, password: adminUser.password });
    const franchiseData = {stores: [], id: franchiseID, name: randomName(), admins: [{email: franUser.email, id: franUser.id, name: franUser.name}]};
    await request(app).post('/api/franchise').set('Authorization', `Bearer ${adminRes.body.token}`).send(franchiseData);

    await request(app).put('/api/auth').send({ email: franUser.email, password: franUser.password });
    const franchiseStoreData = {id: "", name: "f4"};
    await request(app).post(`/api/franchise/${franchiseID}/store`).set('Authorization', `Bearer ${adminRes.body.token}`).send(franchiseStoreData);

    const newItem= { "title":"Student", "description": "No topping, no sauce, just carbs", "image":"pizza9.png", "price": 0.0001 };
    const loginRes = await request(app).put('/api/order/menu').set('Authorization', `Bearer ${adminRes.body.token}`).send(newItem);
    expect(loginRes.status).toBe(200);
});

test('get orders', async () => {
    const loginRes = await request(app).get('/api/order').set('Authorization', `Bearer ${testUserAuthToken}`);
    expect(loginRes.status).toBe(200);
});

test('create order', async () => {
    const loginRes = await request(app).post('/api/order').set('Authorization', `Bearer ${testUserAuthToken}`).send({franchiseId: 1, storeId:1, items:[{menuId: 1, description: "Veggie", price: 0.05}]});
    expect(loginRes.status).toBe(200);
});