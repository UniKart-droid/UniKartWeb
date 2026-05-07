import mongoose from 'mongoose';

const OpportunitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  type: { type: String, enum: ['Internship', 'Training'], default: 'Internship' },
  location: { type: String, required: true },
  duration: { type: String, required: true },
  stipend: { type: String, required: true },
  link: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Opportunity = mongoose.model('Opportunity', OpportunitySchema);
export default Opportunity;