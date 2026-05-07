const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * GET /api/compare?salaryId1=xxx&salaryId2=yyy
 * Returns side-by-side comparison of two salary records
 */
router.get('/compare', async (req, res) => {
  try {
    const { salaryId1, salaryId2 } = req.query;

    if (!salaryId1 || !salaryId2) {
      return res.status(400).json({
        error: 'Both salaryId1 and salaryId2 are required query parameters',
      });
    }

    if (salaryId1 === salaryId2) {
      return res.status(400).json({ error: 'Cannot compare a salary with itself' });
    }

    const [salary1, salary2] = await Promise.all([
      prisma.salary.findUnique({ where: { id: salaryId1 } }),
      prisma.salary.findUnique({ where: { id: salaryId2 } }),
    ]);

    if (!salary1) {
      return res.status(404).json({ error: `Salary with id ${salaryId1} not found` });
    }
    if (!salary2) {
      return res.status(404).json({ error: `Salary with id ${salaryId2} not found` });
    }

    const diff = (a, b) => ({
      absolute: a - b,
      percentage: b !== 0 ? Math.round(((a - b) / b) * 100) : null,
    });

    return res.json({
      salary1,
      salary2,
      comparison: {
        base_salary: diff(salary1.base_salary, salary2.base_salary),
        bonus: diff(salary1.bonus, salary2.bonus),
        stock: diff(salary1.stock, salary2.stock),
        total_compensation: diff(salary1.total_compensation, salary2.total_compensation),
        level_difference: salary1.level !== salary2.level
          ? `${salary1.level} vs ${salary2.level}`
          : 'Same level',
        experience_difference: diff(salary1.experience_years, salary2.experience_years),
      },
    });
  } catch (err) {
    console.error('Error comparing salaries:', err);
    return res.status(500).json({ error: 'Failed to compare salary records' });
  }
});

module.exports = router;
