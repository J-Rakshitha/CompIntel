const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * GET /api/company/:company
 * Returns all salaries for a company + stats
 */
router.get('/company/:company', async (req, res) => {
  try {
    const company = req.params.company.toLowerCase().trim();

    const salaries = await prisma.salary.findMany({
      where: {
        company: { contains: company, mode: 'insensitive' },
      },
      orderBy: { total_compensation: 'desc' },
    });

    if (salaries.length === 0) {
      return res.status(404).json({ error: 'No salary data found for this company' });
    }

    // Compute median total compensation
    const sorted = [...salaries].sort((a, b) => a.total_compensation - b.total_compensation);
    const mid = Math.floor(sorted.length / 2);
    const median =
      sorted.length % 2 === 0
        ? (sorted[mid - 1].total_compensation + sorted[mid].total_compensation) / 2
        : sorted[mid].total_compensation;

    // Level distribution
    const levelMap = {};
    for (const s of salaries) {
      levelMap[s.level] = (levelMap[s.level] || 0) + 1;
    }
    const levelDistribution = Object.entries(levelMap)
      .map(([level, count]) => ({ level, count }))
      .sort((a, b) => b.count - a.count);

    // Role distribution
    const roleMap = {};
    for (const s of salaries) {
      roleMap[s.role] = (roleMap[s.role] || 0) + 1;
    }
    const roleDistribution = Object.entries(roleMap)
      .map(([role, count]) => ({ role, count }))
      .sort((a, b) => b.count - a.count);

    // Avg base, bonus, stock
    const avgBase = salaries.reduce((s, r) => s + r.base_salary, 0) / salaries.length;
    const avgBonus = salaries.reduce((s, r) => s + r.bonus, 0) / salaries.length;
    const avgStock = salaries.reduce((s, r) => s + r.stock, 0) / salaries.length;

    return res.json({
      company,
      salaries,
      stats: {
        count: salaries.length,
        median_total_compensation: Math.round(median),
        avg_base_salary: Math.round(avgBase),
        avg_bonus: Math.round(avgBonus),
        avg_stock: Math.round(avgStock),
        min_total: sorted[0].total_compensation,
        max_total: sorted[sorted.length - 1].total_compensation,
      },
      level_distribution: levelDistribution,
      role_distribution: roleDistribution,
    });
  } catch (err) {
    console.error('Error fetching company data:', err);
    return res.status(500).json({ error: 'Failed to fetch company data' });
  }
});

/**
 * GET /api/companies
 * Returns all unique companies with basic stats
 */
router.get('/companies', async (req, res) => {
  try {
    const companies = await prisma.salary.groupBy({
      by: ['company'],
      _count: { id: true },
      _avg: { total_compensation: true },
      orderBy: { _avg: { total_compensation: 'desc' } },
    });

    return res.json({
      data: companies.map(c => ({
        company: c.company,
        count: c._count.id,
        avg_total_compensation: Math.round(c._avg.total_compensation || 0),
      })),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

module.exports = router;
