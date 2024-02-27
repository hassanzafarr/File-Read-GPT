import db from '../../utils/db'
import QuestionModel from 'model/questionModel'
import nc from 'next-connect'
import { NextApiRequest, NextApiResponse } from 'next'
import { onError } from '../../utils/error'

const handler = nc<NextApiRequest, NextApiResponse>({
  onError,
});

handler.get(async (req, res) => {
  try {
    await db.connect()
    const questions = await QuestionModel.find({})
    res.status(200).json(questions)
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    res.status(500).json({ message: errorMessage })
  }
})

handler.post(async (req, res) => {
  console.log(req.body, 'req.body')
  try {
    await db.connect()
    const question = await QuestionModel.create(req.body)
    res.status(201).json(question)
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    res.status(500).json({ message: errorMessage })
  }
})


export default handler