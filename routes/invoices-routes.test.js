process.env.NODE_ENV = 'test';

import request from 'supertest';
import app from '../app.js';
import db from '../db.js';

let testInvoice
let testCompany

beforeAll(async function() {
    const companiesResult = await db.query(`
    INSERT INTO companies
    VALUES ('tc', 'testcompany', 'test description')
    RETURNING code, name, description
    `);
    testCompany = companiesResult.rows[0]
})

beforeEach(async function() {
    const invoicesResult = await db.query(`
        INSERT INTO invoices (comp_code, amt)
        VALUES ('tc', 500)
        RETURNING id, comp_code, amt
    `);
    testInvoice = invoicesResult.rows[0]
})

afterEach(async function() {
    await db.query("DELETE FROM invoices")
})

afterAll(async function() {
    await db.query("DELETE FROM companies")
    await db.end();
})

describe("GET /invoices", function() {
    test("Gets a list of all invoices", async function() {
        const resp = await request(app).get(`/invoices`)
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({invoices: [{id: expect.any(Number), comp_code: 'tc'}]})
    })
})

describe("GET /invoices/id", function() {
    test("Gets an invoice with given id", async function() {
        const resp = await request(app).get(`/invoices/${testInvoice.id}`)
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({invoice: {id: testInvoice.id,
            amt: 500,
            paid: false,
            add_date: expect.any(String),
            paid_date: null,
            company: {
                code: testCompany.code,
                name: testCompany.name,
                description: testCompany.description
            }}})
    })
})

describe("POST /invoices", function() {
    test("Adds a new invoice to database", async function() {
        const resp = await request(app).post(`/invoices`)
        .send({comp_code: 'tc', amt: 300})
        expect(resp.statusCode).toBe(201);
        expect(resp.body).toEqual({invoice: {id: expect.any(Number),
            comp_code: 'tc',
            amt: 300,
            paid: false,
            add_date: expect.any(String),
            paid_date: null
        }})
    })
})

describe("PATCH /invoices/id", function() {
    test("Updates existing invoice in database", async function() {
        const resp = await request(app).patch(`/invoices/${testInvoice.id}`)
        .send({amt: 1000, paid: false})
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({invoice: {id: expect.any(Number),
            comp_code: 'tc',
            amt: 1000,
            paid: false,
            add_date: expect.any(String),
            paid_date: null
        }})    
    })
})

describe("DELETE /invoices/id", function() {
    test("Deletes existing invoice from database", async function() {
        const resp = await request(app).delete(`/invoices/${testInvoice.id}`)
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({message: `${testInvoice.id} deleted`})
    })
})

