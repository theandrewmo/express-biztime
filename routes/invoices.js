import express from 'express';
import { Router } from 'express';
import db from "../db.js";
import ExpressError from '../expressError.js';

const router = Router();

router.get('/', async function(req, res, next) {
    try {
        const result = await db.query(`SELECT id, comp_code FROM invoices`);
        return res.json({ invoices: result.rows})
    } catch(e) {
        return next(e)
    }
})

router.get('/:id', async function(req, res, next) {
    try {
        const result = await db.query(`SELECT * FROM invoices JOIN companies ON companies.code = invoices.comp_code WHERE id=$1`, [req.params.id]);
        if (result.rows.length === 0) {
            const notFound = new ExpressError(`There is no invoice with id ${req.params.code}`, 404);
            return next(notFound)
        }
        const data = result.rows[0]
        const invoice = {
            id: data.id,
            amt: data.amt,
            paid: data.paid,
            add_date: data.add_date,
            paid_date: data.paid_date,
            company: {
                code: data.code,
                name: data.name,
                description: data.description
            }
        }
        return res.json({ invoice })
    } catch(e) {
        return next(e)
    }  
})

router.post('/', async function(req, res, next) {
    try {
        const result = await db.query(`INSERT INTO invoices (comp_code, amt)
                                        VALUES ($1, $2) 
                                        RETURNING *`, 
                                       [req.body.comp_code, req.body.amt]);
        return res.status(201).json({ invoice : result.rows[0]})
    } catch(e) {
        return next(e)
    }
})

router.patch('/:id', async function(req, res, next) {
    try {
        if ("id" in req.body) {
            const notAllowed = new ExpressError("Not allowed", 400)
            return next(notAllowed)
        }
        const { amt, paid } = req.body;
        const id = req.params.id;
        let paidDate = null;

        const currResult = await db.query(`
            SELECT paid 
            FROM invoices
            WHERE id = $1`, [id])

        if (currResult.rows.length === 0) {
            throw new ExpressError(`No such invoice: ${id}`, 404)
        }

        const currPaidDate = currResult.rows[0].paid_date;

        if (!currPaidDate && paid) {
            paidDate = new Date();
        } else if (!paid) {
            paidDate = null;
        } else {
            paidDate = currPaidDate;
        }

        const result = await db.query(`UPDATE invoices 
            SET amt=$1, paid=$2, paid_date=$3
            WHERE id=$4
            RETURNING *`, 
            [amt, paid, paidDate, id]);
        return res.json({ invoice: result.rows[0]})
    } catch(e) {
        return next(e)
    }
})

router.delete('/:id', async function(req, res, next) {
    try {
        const result = await db.query(`DELETE FROM invoices
                                        WHERE id=$1
                                        RETURNING *`, 
                                       [req.params.id]);
        if (result.rows.length === 0) {
            const notFound = new ExpressError(`There is no invoice with id ${req.params.id}`, 404);
            return next(notFound)
        }
        return res.json({ message: `${result.rows[0].id} deleted`})
    } catch(e) {
        return next(e)
    }
})

export default router