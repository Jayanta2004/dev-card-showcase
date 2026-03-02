const jwt = require('jsonwebtoken')
const User = require('../models/User')

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' })
    }

    const user = await User.create({ name, email, password })
    const token = generateToken(user._id)

    res.status(201).json({ user, token })
  } catch (err) {
    next(err)
  }
}

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' })
    }

    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = generateToken(user._id)
    res.json({ user, token })
  } catch (err) {
    next(err)
  }
}

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user })
  } catch (err) {
    next(err)
  }
}

const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar, currency, theme, notifications } = req.body
    const updates = {}

    if (name) updates.name = name
    if (avatar !== undefined) updates.avatar = avatar
    if (currency) updates.currency = currency
    if (theme) updates.theme = theme
    if (notifications) updates.notifications = notifications

    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
      runValidators: true,
    })

    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user })
  } catch (err) {
    next(err)
  }
}

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Provide current and new password' })
    }

    const user = await User.findById(req.userId).select('+password')
    if (!user) return res.status(404).json({ message: 'User not found' })

    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' })

    user.password = newPassword
    await user.save()

    const token = generateToken(user._id)
    res.json({ message: 'Password updated successfully', token })
  } catch (err) {
    next(err)
  }
}

module.exports = { register, login, getMe, updateProfile, changePassword }
