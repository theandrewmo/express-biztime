process.env.NODE_ENV = 'test';

import request from 'supertest';
import app from '../app.js';
import db from '../db.js';

let testCompany

beforeEach(async function() {
    const result = await db.query(`
        INSERT INTO companies
        VALUES ('tc', 'testcompany', 'test description')
        RETURNING code, name, description
    `);
    testCompany = result.rows[0]
})

afterEach(async function() {
    await db.query("DELETE FROM companies")
})

afterAll(async function() {
    await db.end();
})

describe("GET /companies", function() {
    test("Gets a list of all companies", async function() {
        const resp = await request(app).get(`/companies`)
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({companies: [{code: 'tc', name: 'testcompany'}]})
    })
})

describe("GET /companies/code", function() {
    test("Gets a company with given code", async function() {
        const resp = await request(app).get(`/companies/${testCompany.code}`)
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({company: {code: 'tc', name: 'testcompany', description: 'test description'}})
    })
})

describe("POST /companies", function() {
    test("Adds a new company to database", async function() {
        const resp = await request(app).post(`/companies`)
        .send({code: 'tc2', name: 'testcompany2', description: 'test company 2'})
        expect(resp.statusCode).toBe(201);
        expect(resp.body).toEqual({company: {code: 'tc2', name: 'testcompany2', description: 'test company 2'}})
    })
})

describe("PATCH /companies/code", function() {
    test("Updates existing company in database", async function() {
        const resp = await request(app).patch(`/companies/${testCompany.code}`)
        .send({name: 'updatedtestcompany', description: 'updated test company'})
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({company: {code: 'tc', name: 'updatedtestcompany', description: 'updated test company'}})
    })
})

describe("DELETE /companies/code", function() {
    test("Deletes existing company from database", async function() {
        const resp = await request(app).delete(`/companies/${testCompany.code}`)
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({message: `${testCompany.code} deleted`})
    })
})



