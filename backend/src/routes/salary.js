const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { normalizeCompany, parseNumber, isValidLevel, computeTotal } = require('../utils/normalize');

const prisma = new PrismaClient();

/**
 * POST /api/ingest-salary
 * Ingest a single salary record with validation and normalization
 */
router.post('/ingest-salary', async (req, res) => {
  try {
    const {
      company,
      role,
      level,
      location,
      experience_years,
      base_salary,
      bonus,
      stock,
      confidence_score,
    } = req.body;

    // --- VALIDATION ---
    const errors = [];

    if (!company || typeof company !== 'string' || company.trim().length === 0) {
      errors.push('company is required and must be a non-empty string');
    }

    if (!role || typeof role !== 'string' || role.trim().length === 0) {
      errors.push('role is required and must be a non-empty string');
    }

    if (!level || !isValidLevel(level)) {
      errors.push('level is required and must be a valid standardized level (e.g. L3, L4, SDE1)');
    }

    if (!location || typeof location !== 'string' || location.trim().length === 0) {
      errors.push('location is required');
    }

    const parsedExperience = parseNumber(experience_years);
    if (parsedExperience === null || parsedExperience < 0) {
      errors.push('experience_years must be a non-negative number');
    }

    const parsedBase = parseNumber(base_salary);
    if (parsedBase === null || parsedBase <= 0) {
      errors.push('base_salary is required and must be a positive number');
    }

    const parsedBonus = parseNumber(bonus, 0);
    if (parsedBonus === null) {
      errors.push('bonus must be a non-negative number or omitted');
    }

    const parsedStock = parseNumber(stock, 0);
    if (parsedStock === null) {
      errors.push('stock must be a non-negative number or omitted');
    }

    const parsedConfidence = parseNumber(confidence_score, 1.0);
    if (parsedConfidence === null || parsedConfidence < 0 || parsedConfidence > 1) {
      errors.push('confidence_score must be between 0 and 1');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors,
      });
    }

    // --- NORMALIZATION ---
    const normalizedCompany = normalizeCompany(company);
    const totalCompensation = computeTotal(parsedBase, parsedBonus, parsedStock);

    // --- STORE ---
    const salary = await prisma.salary.create({
      data: {
        company: normalizedCompany,
        role: role.trim(),
        level: level.trim(),
        location: location.trim(),
        experience_years: parsedExperience,
        base_salary: parsedBase,
        bonus: parsedBonus,
        stock: parsedStock,
        total_compensation: totalCompensation,
        confidence_score: parsedConfidence,
      },
    });

    return res.status(201).json({
      message: 'Salary record ingested successfully',
      data: salary,
    });
  } catch (err) {
    console.error('Error ingesting salary:', err);
    return res.status(500).json({ error: 'Failed to ingest salary record' });
  }
});

/**
 * GET /api/salaries
 * Query params: company, role, level, location, sort (asc|desc), page, limit
 */
router.get('/salaries', async (req, res) => {
  try {
    const {
      company,
      role,
      level,
      location,
      sort = 'desc',
      page = 1,
      limit = 50,
    } = req.query;

    const where = {};

    if (company) {
      where.company = { contains: company.toLowerCase().trim(), mode: 'insensitive' };
    }
    if (role) {
      where.role = { contains: role.trim(), mode: 'insensitive' };
    }
    if (level) {
      where.level = { equals: level.trim(), mode: 'insensitive' };
    }
    if (location) {
      where.location = { contains: location.trim(), mode: 'insensitive' };
    }

    const orderBy = { total_compensation: sort === 'asc' ? 'asc' : 'desc' };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [total, salaries] = await Promise.all([
      prisma.salary.count({ where }),
      prisma.salary.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
      }),
    ]);

    // Get distinct filter options
    const [companies, roles, levels, locations] = await Promise.all([
      prisma.salary.findMany({ select: { company: true }, distinct: ['company'], orderBy: { company: 'asc' } }),
      prisma.salary.findMany({ select: { role: true }, distinct: ['role'], orderBy: { role: 'asc' } }),
      prisma.salary.findMany({ select: { level: true }, distinct: ['level'], orderBy: { level: 'asc' } }),
      prisma.salary.findMany({ select: { location: true }, distinct: ['location'], orderBy: { location: 'asc' } }),
    ]);

    return res.json({
      data: salaries,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
      filters: {
        companies: companies.map(c => c.company),
        roles: roles.map(r => r.role),
        levels: levels.map(l => l.level),
        locations: locations.map(l => l.location),
      },
    });
  } catch (err) {
    console.error('Error fetching salaries:', err);
    return res.status(500).json({ error: 'Failed to fetch salaries' });
  }
});

/**
 * GET /api/salaries/:id
 */
router.get('/salaries/:id', async (req, res) => {
  try {
    const salary = await prisma.salary.findUnique({
      where: { id: req.params.id },
    });
    if (!salary) {
      return res.status(404).json({ error: 'Salary record not found' });
    }
    return res.json({ data: salary });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch salary' });
  }
});

module.exports = router;
