const Transaction = require('../models/Transaction')
const Account = require('../models/Account')
const mongoose = require('mongoose')

const getDashboardSummary = async (req, res, next) => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    const userId = new mongoose.Types.ObjectId(req.userId)

    const [monthlySummary, categoryBreakdown, accounts, recentTransactions] = await Promise.all([
      // Monthly income vs expenses
      Transaction.aggregate([
        { $match: { user: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),

      // Category breakdown for expenses
      Transaction.aggregate([
        {
          $match: {
            user: userId,
            type: 'expense',
            date: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
      ]),

      // Account balances
      Account.find({ user: req.userId, isActive: true }).lean(),

      // Recent 5 transactions
      Transaction.find({ user: req.userId })
        .populate('account', 'name type color icon')
        .sort({ date: -1 })
        .limit(5)
        .lean(),
    ])

    const income = monthlySummary.find((s) => s._id === 'income')?.total || 0
    const expenses = monthlySummary.find((s) => s._id === 'expense')?.total || 0
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)

    res.json({
      summary: {
        income,
        expenses,
        netSavings: income - expenses,
        totalBalance,
        transactionCount:
          monthlySummary.reduce((sum, s) => sum + s.count, 0),
      },
      categoryBreakdown,
      accounts,
      recentTransactions,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    })
  } catch (err) {
    next(err)
  }
}

const getMonthlyTrends = async (req, res, next) => {
  try {
    const { year } = req.query
    const targetYear = Number(year) || new Date().getFullYear()
    const userId = new mongoose.Types.ObjectId(req.userId)

    const startDate = new Date(targetYear, 0, 1)
    const endDate = new Date(targetYear, 11, 31, 23, 59, 59)

    const trends = await Transaction.aggregate([
      { $match: { user: userId, date: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: { month: { $month: '$date' }, type: '$type' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.month': 1 } },
    ])

    // Format into monthly array
    const months = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1
      const income = trends.find((t) => t._id.month === month && t._id.type === 'income')?.total || 0
      const expenses = trends.find((t) => t._id.month === month && t._id.type === 'expense')?.total || 0
      return {
        month,
        monthName: new Date(targetYear, i).toLocaleString('default', { month: 'short' }),
        income,
        expenses,
        net: income - expenses,
      }
    })

    res.json({ trends: months, year: targetYear })
  } catch (err) {
    next(err)
  }
}

const getCategoryReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query
    const userId = new mongoose.Types.ObjectId(req.userId)

    const match = { user: userId, type: 'expense' }
    if (startDate || endDate) {
      match.date = {}
      if (startDate) match.date.$gte = new Date(startDate)
      if (endDate) match.date.$lte = new Date(endDate)
    }

    const report = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' },
        },
      },
      { $sort: { total: -1 } },
    ])

    const grandTotal = report.reduce((sum, r) => sum + r.total, 0)
    const enriched = report.map((r) => ({
      ...r,
      category: r._id,
      percentage: grandTotal > 0 ? Math.round((r.total / grandTotal) * 100) : 0,
    }))

    res.json({ report: enriched, grandTotal })
  } catch (err) {
    next(err)
  }
}

const exportTransactions = async (req, res, next) => {
  try {
    const { startDate, endDate, format = 'csv' } = req.query

    const query = { user: req.userId }
    if (startDate || endDate) {
      query.date = {}
      if (startDate) query.date.$gte = new Date(startDate)
      if (endDate) query.date.$lte = new Date(endDate)
    }

    const transactions = await Transaction.find(query)
      .populate('account', 'name type')
      .sort({ date: -1 })
      .lean()

    if (format === 'csv') {
      const headers = 'Date,Type,Category,Amount,Description,Account,Notes\n'
      const rows = transactions
        .map(
          (t) =>
            `${new Date(t.date).toISOString().split('T')[0]},${t.type},${t.category},${t.amount},"${t.description || ''}","${t.account?.name || ''}","${t.notes || ''}"`,
        )
        .join('\n')

      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv')
      return res.send(headers + rows)
    }

    // JSON export
    res.json({ transactions })
  } catch (err) {
    next(err)
  }
}

module.exports = { getDashboardSummary, getMonthlyTrends, getCategoryReport, exportTransactions }
