const { PrismaClient } = require('@prisma/client');
const { normalizeCompany, computeTotal } = require('./utils/normalize');

const prisma = new PrismaClient();

const seed = [
  // Google
  { company: 'Google', role: 'Software Engineer', level: 'L3', location: 'Bangalore', experience_years: 2, base_salary: 2800000, bonus: 400000, stock: 600000 },
  { company: 'Google', role: 'Software Engineer', level: 'L4', location: 'Bangalore', experience_years: 4, base_salary: 4200000, bonus: 700000, stock: 1500000 },
  { company: 'Google', role: 'Software Engineer', level: 'L5', location: 'Bangalore', experience_years: 7, base_salary: 5800000, bonus: 1000000, stock: 3000000 },
  { company: 'Google', role: 'Software Engineer', level: 'L6', location: 'Hyderabad', experience_years: 10, base_salary: 8000000, bonus: 1500000, stock: 6000000 },
  { company: 'Google', role: 'Data Engineer', level: 'L4', location: 'Hyderabad', experience_years: 5, base_salary: 3800000, bonus: 600000, stock: 1200000 },
  { company: 'Google', role: 'Product Manager', level: 'L5', location: 'Bangalore', experience_years: 8, base_salary: 6000000, bonus: 1200000, stock: 2500000 },

  // Microsoft
  { company: 'Microsoft', role: 'Software Engineer', level: 'SDE1', location: 'Hyderabad', experience_years: 1, base_salary: 2200000, bonus: 300000, stock: 400000 },
  { company: 'Microsoft', role: 'Software Engineer', level: 'SDE2', location: 'Hyderabad', experience_years: 4, base_salary: 3500000, bonus: 600000, stock: 1000000 },
  { company: 'Microsoft', role: 'Software Engineer', level: 'Senior', location: 'Hyderabad', experience_years: 7, base_salary: 5000000, bonus: 900000, stock: 2000000 },
  { company: 'Microsoft', role: 'Software Engineer', level: 'Principal', location: 'Bangalore', experience_years: 12, base_salary: 7500000, bonus: 1400000, stock: 5000000 },
  { company: 'Microsoft', role: 'Program Manager', level: 'SDE2', location: 'Hyderabad', experience_years: 5, base_salary: 3200000, bonus: 500000, stock: 800000 },
  { company: 'Microsoft', role: 'Data Scientist', level: 'Senior', location: 'Hyderabad', experience_years: 6, base_salary: 4500000, bonus: 800000, stock: 1500000 },

  // Amazon
  { company: 'Amazon', role: 'Software Development Engineer', level: 'SDE1', location: 'Bangalore', experience_years: 2, base_salary: 2000000, bonus: 200000, stock: 800000 },
  { company: 'Amazon', role: 'Software Development Engineer', level: 'SDE2', location: 'Bangalore', experience_years: 5, base_salary: 3200000, bonus: 0, stock: 2500000 },
  { company: 'Amazon', role: 'Software Development Engineer', level: 'SDE3', location: 'Bangalore', experience_years: 8, base_salary: 4500000, bonus: 0, stock: 5000000 },
  { company: 'Amazon', role: 'Machine Learning Engineer', level: 'SDE2', location: 'Hyderabad', experience_years: 5, base_salary: 3500000, bonus: 0, stock: 3000000 },
  { company: 'Amazon', role: 'Product Manager', level: 'L5', location: 'Bangalore', experience_years: 7, base_salary: 4800000, bonus: 600000, stock: 3500000 },

  // Meta
  { company: 'Meta', role: 'Software Engineer', level: 'E3', location: 'Bangalore', experience_years: 1, base_salary: 3000000, bonus: 500000, stock: 1000000 },
  { company: 'Meta', role: 'Software Engineer', level: 'E4', location: 'Bangalore', experience_years: 3, base_salary: 4500000, bonus: 800000, stock: 2000000 },
  { company: 'Meta', role: 'Software Engineer', level: 'E5', location: 'Bangalore', experience_years: 6, base_salary: 6500000, bonus: 1200000, stock: 4000000 },
  { company: 'Meta', role: 'Research Scientist', level: 'IC4', location: 'Bangalore', experience_years: 5, base_salary: 5500000, bonus: 1000000, stock: 3500000 },

  // Flipkart
  { company: 'Flipkart', role: 'Software Engineer', level: 'L4', location: 'Bangalore', experience_years: 3, base_salary: 1800000, bonus: 200000, stock: 400000 },
  { company: 'Flipkart', role: 'Software Engineer', level: 'L5', location: 'Bangalore', experience_years: 6, base_salary: 2800000, bonus: 400000, stock: 800000 },
  { company: 'Flipkart', role: 'Engineering Manager', level: 'L6', location: 'Bangalore', experience_years: 10, base_salary: 4500000, bonus: 800000, stock: 2000000 },
  { company: 'Flipkart', role: 'Data Scientist', level: 'L4', location: 'Bangalore', experience_years: 4, base_salary: 2000000, bonus: 300000, stock: 500000 },

  // Swiggy
  { company: 'Swiggy', role: 'Software Engineer', level: 'SDE1', location: 'Bangalore', experience_years: 2, base_salary: 1400000, bonus: 150000, stock: 200000 },
  { company: 'Swiggy', role: 'Software Engineer', level: 'SDE2', location: 'Bangalore', experience_years: 5, base_salary: 2400000, bonus: 350000, stock: 600000 },
  { company: 'Swiggy', role: 'Staff Engineer', level: 'Staff', location: 'Bangalore', experience_years: 9, base_salary: 4000000, bonus: 700000, stock: 1500000 },

  // Razorpay
  { company: 'Razorpay', role: 'Software Engineer', level: 'SDE1', location: 'Bangalore', experience_years: 1, base_salary: 1600000, bonus: 200000, stock: 300000 },
  { company: 'Razorpay', role: 'Software Engineer', level: 'SDE2', location: 'Bangalore', experience_years: 4, base_salary: 2800000, bonus: 400000, stock: 800000 },
  { company: 'Razorpay', role: 'Senior Engineer', level: 'Senior', location: 'Bangalore', experience_years: 7, base_salary: 4000000, bonus: 700000, stock: 1800000 },

  // Zomato
  { company: 'Zomato', role: 'Software Engineer', level: 'SDE1', location: 'Gurgaon', experience_years: 2, base_salary: 1300000, bonus: 100000, stock: 250000 },
  { company: 'Zomato', role: 'Software Engineer', level: 'SDE2', location: 'Gurgaon', experience_years: 5, base_salary: 2200000, bonus: 300000, stock: 600000 },
  { company: 'Zomato', role: 'Principal Engineer', level: 'Principal', location: 'Gurgaon', experience_years: 11, base_salary: 5500000, bonus: 1000000, stock: 3000000 },

  // Atlassian
  { company: 'Atlassian', role: 'Software Engineer', level: 'L3', location: 'Bangalore', experience_years: 3, base_salary: 3000000, bonus: 400000, stock: 1000000 },
  { company: 'Atlassian', role: 'Software Engineer', level: 'L4', location: 'Bangalore', experience_years: 6, base_salary: 4500000, bonus: 700000, stock: 2000000 },
  { company: 'Atlassian', role: 'Senior Engineer', level: 'Senior', location: 'Bangalore', experience_years: 8, base_salary: 5800000, bonus: 1000000, stock: 3000000 },

  // Infosys
  { company: 'Infosys', role: 'Software Engineer', level: 'Junior', location: 'Pune', experience_years: 1, base_salary: 420000, bonus: 30000, stock: 0 },
  { company: 'Infosys', role: 'Software Engineer', level: 'Mid', location: 'Hyderabad', experience_years: 4, base_salary: 900000, bonus: 80000, stock: 0 },
  { company: 'Infosys', role: 'Senior Engineer', level: 'Senior', location: 'Bangalore', experience_years: 8, base_salary: 1600000, bonus: 200000, stock: 0 },

  // TCS
  { company: 'TCS', role: 'Software Engineer', level: 'Junior', location: 'Chennai', experience_years: 1, base_salary: 350000, bonus: 25000, stock: 0 },
  { company: 'TCS', role: 'Software Engineer', level: 'Mid', location: 'Hyderabad', experience_years: 5, base_salary: 750000, bonus: 60000, stock: 0 },
  { company: 'TCS', role: 'Technical Architect', level: 'Senior', location: 'Mumbai', experience_years: 10, base_salary: 2000000, bonus: 300000, stock: 0 },

  // Zepto
  { company: 'Zepto', role: 'Software Engineer', level: 'SDE1', location: 'Mumbai', experience_years: 2, base_salary: 1800000, bonus: 250000, stock: 400000 },
  { company: 'Zepto', role: 'Software Engineer', level: 'SDE2', location: 'Mumbai', experience_years: 5, base_salary: 3000000, bonus: 500000, stock: 1000000 },

  // CRED
  { company: 'CRED', role: 'Software Engineer', level: 'SDE2', location: 'Bangalore', experience_years: 4, base_salary: 3500000, bonus: 600000, stock: 1200000 },
  { company: 'CRED', role: 'Staff Engineer', level: 'Staff', location: 'Bangalore', experience_years: 9, base_salary: 6000000, bonus: 1200000, stock: 3000000 },

  // Paytm
  { company: 'Paytm', role: 'Software Engineer', level: 'SDE1', location: 'Noida', experience_years: 2, base_salary: 1000000, bonus: 100000, stock: 150000 },
  { company: 'Paytm', role: 'Software Engineer', level: 'SDE2', location: 'Noida', experience_years: 5, base_salary: 1800000, bonus: 200000, stock: 400000 },
];

async function main() {
  console.log('🌱 Seeding database...');

  await prisma.salary.deleteMany(); // Clear existing

  for (const record of seed) {
    const company = normalizeCompany(record.company);
    const total = computeTotal(record.base_salary, record.bonus, record.stock);
    await prisma.salary.create({
      data: {
        company,
        role: record.role,
        level: record.level,
        location: record.location,
        experience_years: record.experience_years,
        base_salary: record.base_salary,
        bonus: record.bonus || 0,
        stock: record.stock || 0,
        total_compensation: total,
        confidence_score: 0.95,
      },
    });
  }

  console.log(`✅ Seeded ${seed.length} salary records`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
