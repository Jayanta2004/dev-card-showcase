const Budget = require('../models/Budget')
const Transaction = require('../models/Transaction')

const getBudgets = async (req, res, next) => {
  try {
    const { month, year } = req.query
    const now = new Date()
    const targetMonth = Number(month) || now.getMonth() + 1
    const targetYear = Number(year) || now.getFullYear()

    const budgets = await Budget.find({
      user: req.userId,
      month: targetMonth,
      year: targetYear,
    }).lean({ virtuals: true })

    // Recalculate spent from actual transactions for accuracy
    const startDate = new Date(targetYear, targetMonth - 1, 1)
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59)

    const spentAgg = await Transaction.aggregate([
      {
        $match: {
          user: req.userId,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate },
        },
      },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
    ])

    const spentMap = {}
    spentAgg.forEach((item) => {
      spentMap[item._id] = item.total
    })

    const enriched = budgets.map((b) => ({
      ...b,
      spent: spentMap[b.category] || b.spent,
      percentage: b.limit > 0 ? Math.round(((spentMap[b.category] || b.spent) / b.limit) * 100) : 0,
      remaining: Math.max(0, b.limit - (spentMap[b.category] || b.spent)),
      isOverBudget: (spentMap[b.category] || b.spent) > b.limit,
      isNearLimit:
        b.limit > 0 &&
        Math.round(((spentMap[b.category] || b.spent) / b.limit) * 100) >= b.alertThreshold &&
        (spentMap[b.category] || b.spent) <= b.limit,
    }))

    res.json({ budgets: enriched, month: targetMonth, year: targetYear })
  } catch (err) {
    next(err)
  }
}

const createBudget = async (req, res, next) => {
  try {
    const { category, limit, month, year, alertThreshold, color } = req.body

    if (!category || limit == null || !month || !year) {
      return res.status(400).json({ message: 'Category, limit, month, and year are required' })
    }

    const existing = await Budget.findOne({
      user: req.userId,
      category,
      month,
      year,
    })

    if (existing) {
      return res.status(409).json({ message: 'Budget for this category/month already exists' })
    }

    const budget = await Budget.create({
      user: req.userId,
      category,
      limit,
      month,
      year,
      alertThreshold: alertThreshold || 80,
      color: color || '#6366f1',
    })

    res.status(201).json({ budget })
  } catch (err) {
    next(err)
  }
}

const updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true, runValidators: true },
    )

    if (!budget) return res.status(404).json({ message: 'Budget not found' })
    res.json({ budget })
  } catch (err) {
    next(err)
  }
}

const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.userId })
    if (!budget) return res.status(404).json({ message: 'Budget not found' })
    res.json({ message: 'Budget deleted' })
  } catch (err) {
    next(err)
  }
}

module.exports = { getBudgets, createBudget, updateBudget, deleteBudget }
