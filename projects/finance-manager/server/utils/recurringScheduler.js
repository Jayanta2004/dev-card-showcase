const cron = require('node-cron')
const Transaction = require('../models/Transaction')
const Account = require('../models/Account')
const logger = require('./logger')

/**
 * Runs every day at midnight to process recurring transactions.
 * Finds transactions with nextRecurringDate <= now, clones them, and
 * updates the original's nextRecurringDate.
 */
const startRecurringScheduler = () => {
  cron.schedule('0 0 * * *', async () => {
    logger.info('Running recurring transaction scheduler...')

    try {
      const now = new Date()
      const dueTransactions = await Transaction.find({
        isRecurring: true,
        nextRecurringDate: { $lte: now },
      })

      for (const tx of dueTransactions) {
        // Create the new transaction
        const newTx = await Transaction.create({
          user: tx.user,
          account: tx.account,
          type: tx.type,
          amount: tx.amount,
          category: tx.category,
          description: tx.description,
          notes: `[Recurring] ${tx.notes || ''}`.trim(),
          date: tx.nextRecurringDate,
          isRecurring: false,
          tags: tx.tags,
        })

        // Update account balance
        const account = await Account.findById(tx.account)
        if (account) {
          if (tx.type === 'income') account.balance += tx.amount
          else if (tx.type === 'expense') account.balance -= tx.amount
          await account.save()
        }

        // Advance the next recurring date
        tx.nextRecurringDate = calculateNext(tx.nextRecurringDate, tx.recurringInterval)
        await tx.save()

        logger.info(`Processed recurring tx ${tx._id} → new tx ${newTx._id}`)
      }

      logger.info(`Recurring scheduler done: ${dueTransactions.length} transactions processed`)
    } catch (err) {
      logger.error(`Recurring scheduler error: ${err.message}`)
    }
  })

  logger.info('Recurring transaction scheduler registered (daily at midnight)')
}

function calculateNext(fromDate, interval) {
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

module.exports = startRecurringScheduler
