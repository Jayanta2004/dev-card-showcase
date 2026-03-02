const Account = require('../models/Account')

const getAccounts = async (req, res, next) => {
  try {
    const accounts = await Account.find({ user: req.userId }).sort({ createdAt: -1 }).lean()
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)
    res.json({ accounts, totalBalance })
  } catch (err) {
    next(err)
  }
}

const getAccount = async (req, res, next) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, user: req.userId })
    if (!account) return res.status(404).json({ message: 'Account not found' })
    res.json({ account })
  } catch (err) {
    next(err)
  }
}

const createAccount = async (req, res, next) => {
  try {
    const { name, type, balance, currency, color, icon } = req.body

    if (!name || !type) {
      return res.status(400).json({ message: 'Name and type are required' })
    }

    const account = await Account.create({
      user: req.userId,
      name,
      type,
      balance: balance || 0,
      currency: currency || 'USD',
      color: color || '#6366f1',
      icon: icon || 'wallet',
    })

    res.status(201).json({ account })
  } catch (err) {
    next(err)
  }
}

const updateAccount = async (req, res, next) => {
  try {
    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true, runValidators: true },
    )

    if (!account) return res.status(404).json({ message: 'Account not found' })
    res.json({ account })
  } catch (err) {
    next(err)
  }
}

const deleteAccount = async (req, res, next) => {
  try {
    const account = await Account.findOneAndDelete({ _id: req.params.id, user: req.userId })
    if (!account) return res.status(404).json({ message: 'Account not found' })
    res.json({ message: 'Account deleted' })
  } catch (err) {
    next(err)
  }
}

module.exports = { getAccounts, getAccount, createAccount, updateAccount, deleteAccount }
