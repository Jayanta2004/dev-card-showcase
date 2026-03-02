const Transaction = require('../models/Transaction')
const Account = require('../models/Account')
const Budget = require('../models/Budget')

const getTransactions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      type,
      account,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      sort = '-date',
      search,
    } = req.query

    const query = { user: req.userId }

    if (category) query.category = category
    if (type) query.type = type
    if (account) query.account = account
    if (startDate || endDate) {
      query.date = {}
      if (startDate) query.date.$gte = new Date(startDate)
      if (endDate) query.date.$lte = new Date(endDate)
    }
    if (minAmount || maxAmount) {
      query.amount = {}
      if (minAmount) query.amount.$gte = Number(minAmount)
      if (maxAmount) query.amount.$lte = Number(maxAmount)
    }
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ]
    }

    const skip = (Number(page) - 1) * Number(limit)

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .populate('account', 'name type color icon')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Transaction.countDocuments(query),
    ])

    res.json({
      transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    })
  } catch (err) {
    next(err)
  }
}

const getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.userId,
    }).populate('account', 'name type color icon')

    if (!transaction) return res.status(404).json({ message: 'Transaction not found' })
    res.json({ transaction })
  } catch (err) {
    next(err)
  }
}

const createTransaction = async (req, res, next) => {
  try {
    const { type, amount, category, account: accountId, date, description, notes, isRecurring, recurringInterval, tags } = req.body

    if (!type || !amount || !category || !accountId) {
      return res.status(400).json({ message: 'Type, amount, category, and account are required' })
    }

    const account = await Account.findOne({ _id: accountId, user: req.userId })
    if (!account) return res.status(404).json({ message: 'Account not found' })

    // Calculate next recurring date
    let nextRecurringDate = null
    if (isRecurring && recurringInterval) {
      nextRecurringDate = calculateNextRecurringDate(date || new Date(), recurringInterval)
    }

    const transaction = await Transaction.create({
      user: req.userId,
      account: accountId,
      type,
      amount,
      category,
      description,
      notes,
      date: date || new Date(),
      isRecurring: isRecurring || false,
      recurringInterval: recurringInterval || null,
      nextRecurringDate,
      tags: tags || [],
    })

    // Update account balance
    if (type === 'income') {
      account.balance += amount
    } else if (type === 'expense') {
      account.balance -= amount
    }
    await account.save()

    // Update budget spent amount
    if (type === 'expense') {
      const txDate = new Date(date || Date.now())
      await Budget.findOneAndUpdate(
        {
          user: req.userId,
          category,
          month: txDate.getMonth() + 1,
          year: txDate.getFullYear(),
        },
        { $inc: { spent: amount } },
      )
    }

    const populated = await transaction.populate('account', 'name type color icon')
    res.status(201).json({ transaction: populated })
  } catch (err) {
    next(err)
  }
}

const updateTransaction = async (req, res, next) => {
  try {
    const existing = await Transaction.findOne({ _id: req.params.id, user: req.userId })
    if (!existing) return res.status(404).json({ message: 'Transaction not found' })

    // Reverse old balance effect
    const oldAccount = await Account.findById(existing.account)
    if (oldAccount) {
      if (existing.type === 'income') oldAccount.balance -= existing.amount
      else if (existing.type === 'expense') oldAccount.balance += existing.amount
      await oldAccount.save()
    }

    // Reverse old budget effect
    if (existing.type === 'expense') {
      await Budget.findOneAndUpdate(
        {
          user: req.userId,
          category: existing.category,
          month: existing.date.getMonth() + 1,
          year: existing.date.getFullYear(),
        },
        { $inc: { spent: -existing.amount } },
      )
    }

    // Apply updates
    const updates = req.body
    if (updates.isRecurring && updates.recurringInterval) {
      updates.nextRecurringDate = calculateNextRecurringDate(
        updates.date || existing.date,
        updates.recurringInterval,
      )
    }

    Object.assign(existing, updates)
    await existing.save()

    // Apply new balance effect
    const newAccount = await Account.findById(existing.account)
    if (newAccount) {
      if (existing.type === 'income') newAccount.balance += existing.amount
      else if (existing.type === 'expense') newAccount.balance -= existing.amount
      await newAccount.save()
    }

    // Apply new budget effect
    if (existing.type === 'expense') {
      await Budget.findOneAndUpdate(
        {
          user: req.userId,
          category: existing.category,
          month: existing.date.getMonth() + 1,
          year: existing.date.getFullYear(),
        },
        { $inc: { spent: existing.amount } },
      )
    }

    const populated = await existing.populate('account', 'name type color icon')
    res.json({ transaction: populated })
  } catch (err) {
    next(err)
  }
}

const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.userId })
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' })

    // Reverse balance effect
    const account = await Account.findById(transaction.account)
    if (account) {
      if (transaction.type === 'income') account.balance -= transaction.amount
      else if (transaction.type === 'expense') account.balance += transaction.amount
      await account.save()
    }

    // Reverse budget effect
    if (transaction.type === 'expense') {
      await Budget.findOneAndUpdate(
        {
          user: req.userId,
          category: transaction.category,
          month: transaction.date.getMonth() + 1,
          year: transaction.date.getFullYear(),
        },
        { $inc: { spent: -transaction.amount } },
      )
    }

    await transaction.deleteOne()
    res.json({ message: 'Transaction deleted' })
  } catch (err) {
    next(err)
  }
}

function calculateNextRecurringDate(fromDate, interval) {
  const date = new Date(fromDate)
  switch (interval) {
    case 'daily':
      date.setDate(date.getDate() + 1)
      break
    case 'weekly':
      date.setDate(date.getDate() + 7)
      break
    case 'biweekly':
      date.setDate(date.getDate() + 14)
      break
    case 'monthly':
      date.setMonth(date.getMonth() + 1)
      break
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1)
      break
  }
  return date
}

module.exports = { getTransactions, getTransaction, createTransaction, updateTransaction, deleteTransaction }
