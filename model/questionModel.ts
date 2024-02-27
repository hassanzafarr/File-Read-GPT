import mongoose, { Model, Document } from 'mongoose'

interface Question extends Document {
  question: string
  answer: string
}

const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
})

const QuestionModel: Model<Question> = mongoose.models.Question || mongoose.model<Question>('Question', QuestionSchema)

export default QuestionModel