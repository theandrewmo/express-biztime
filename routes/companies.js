import express from 'express';
import { Router } from 'express';
import db from "../db.js";
import ExpressError from '../expressError.js';

const router = Router();

router.get('/', async function(req, res, next) {
    try {
        const result = await db.query(`SELECT code, name FROM companies`);
        return res.json({ companies: result.rows})
    } catch(e) {
        return next(e)
    }
})

router.get('/:code', async function(req, res, next) {
    try {
        const result = await db.query(`SELECT * FROM companies WHERE code=$1`, [req.params.code]);
        if (result.rows.length === 0) {
            const notFound = new ExpressError(`There is no company with code ${req.params.code}`, 404);
            return next(notFound)
        }
        return res.json({ company: result.rows})
    } catch(e) {
        return next(e)
    }
})

router.post('/', async function(req, res, next) {
    try {
        const result = await db.query(`INSERT INTO companies 
                                        VALUES($1, $2, $3) 
                                        RETURNING code, name, description`, 
                                       [req.body.code, req.body.name, req.body.description]);
        return res.status(201).json({ company: result.rows[0]})
    } catch(e) {
        return next(e)
    }
})

router.patch('/:code', async function(req, res, next) {
    try {
        if ("code" in req.body) {
            const notAllowed = new ExpressError("Not allowed", 400)
            return next(notAllowed)
        }
        const result = await db.query(`UPDATE companies 
                                        SET name=$1, description=$2
                                        WHERE code=$3
                                        RETURNING code, name, description`, 
                                       [req.body.name, req.body.description, req.params.code]);
        return res.json({ company: result.rows[0]})
    } catch(e) {
        return next(e)
    }
})

router.delete('/:code', async function(req, res, next) {
    try {
        const result = await db.query(`DELETE FROM companies
                                        WHERE code=$1
                                        RETURNING code`, 
                                       [req.params.code]);
        if (result.rows.length === 0) {
            const notFound = new ExpressError(`There is no company with code ${req.params.code}`, 404);
            return next(notFound)
        }
        return res.json({ message: `${result.rows[0].code} deleted`})
    } catch(e) {
        return next(e)
    }
})

export default router