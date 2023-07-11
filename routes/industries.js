import express from 'express';
import { Router } from 'express';
import db from "../db.js";
import ExpressError from '../expressError.js';
import { convertResponseData } from '../helpers/helpers.js'

const router = Router();

router.get('/', async function(req, res, next) {
    try {
        const result = await db.query(`SELECT i.industry_code, i.industry, c.code FROM industries AS i
                                       LEFT JOIN companies_industries AS ci
                                       ON ci.industry_code = i.industry_code
                                       LEFT JOIN companies AS c
                                       ON c.code = ci.company_code
                                       `);
        const convertedData = convertResponseData(result.rows);
        return res.json(convertedData)
    } catch(e) {
        return next(e)
    }
})

router.post('/', async function(req, res, next) {
    try {
        const result = await db.query(`INSERT INTO industries 
                                        VALUES($1, $2) 
                                        RETURNING industry_code, industry`, 
                                       [req.body.industry_code, req.body.industry]);
        return res.status(201).json({ industry : result.rows[0]})
    } catch(e) {
        return next(e)
    }
})

router.post('/:code', async function(req, res, next) {
    try {
        const result = await db.query(`INSERT INTO companies_industries 
                                        VALUES($1, $2) 
                                        RETURNING company_code, industry_code`, 
                                       [req.params.code, req.body.industry_code]);
        return res.status(201).json({ companies_industries : result.rows[0]})
    } catch(e) {
        return next(e)
    }
})


export default router