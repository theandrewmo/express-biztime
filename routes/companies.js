import express from 'express';
import { Router } from 'express';
import db from "../db.js";
import ExpressError from '../expressError.js';
import slugify from 'slugify';

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
        const result = await db.query(`SELECT c.code, c.name, c.description, i.industry
                                       FROM companies AS c 
                                       LEFT JOIN companies_industries AS ci
                                       ON c.code = ci.company_code
                                       LEFT JOIN industries AS i
                                       ON ci.industry_code = i.industry_code
                                       WHERE c.code = $1`, [req.params.code]);
        if (result.rows.length === 0) {
            const notFound = new ExpressError(`There is no company with code ${req.params.code}`, 404);
            return next(notFound)
        }
        const { code , name, description } = result.rows[0]
        const industries = result.rows.map( r => r.industry)
        return res.json({ company : {code,
                                    name,
                                    description,
                                    industries }})
    } catch(e) {
        return next(e)
    }  
})

router.post('/', async function(req, res, next) {
    const slugified = slugify(req.body.name, '_')
    try {
        const result = await db.query(`INSERT INTO companies 
                                        VALUES($1, $2, $3) 
                                        RETURNING code, name, description`, 
                                       [slugified, req.body.name, req.body.description]);
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