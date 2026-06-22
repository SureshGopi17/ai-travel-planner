import mongoose, { Schema, Document } from 'mongoose';

export interface IDayPlan {
  dayNumber: number;
  activities: string[];
}

export interface IEstimatedBudget {
  flights: number;
  accommodation: number;
  food: number;
  activities: number;
  total: number;
}

export interface ISuggestedHotel {
  name: string;
  rating: string;
  tier: string;
}

export interface IPackingItem {
  _id?: string;
  name: string;
  category: string;
  packed: boolean;
}

export interface IExpense {
  _id?: string;
  amount: number;
  category: 'Flights' | 'Accommodation' | 'Food' | 'Activities' | 'Other';
  description: string;
  date: Date;
}

export interface IItinerary extends Document {
  userId: mongoose.Types.ObjectId;
  destination: string;
  duration: number;
  budgetType: 'Low' | 'Medium' | 'High';
  interests: string[];
  days: IDayPlan[];
  estimatedBudget: IEstimatedBudget;
  suggestedHotels: ISuggestedHotel[];
  packingList: IPackingItem[];
  expenses: IExpense[];
  createdAt: Date;
  updatedAt: Date;
}

const DayPlanSchema = new Schema({
  dayNumber: { type: Number, required: true },
  activities: [{ type: String, required: true }]
});

const EstimatedBudgetSchema = new Schema({
  flights: { type: Number, required: true },
  accommodation: { type: Number, required: true },
  food: { type: Number, required: true },
  activities: { type: Number, required: true },
  total: { type: Number, required: true }
});

const SuggestedHotelSchema = new Schema({
  name: { type: String, required: true },
  rating: { type: String, required: true },
  tier: { type: String, required: true }
});

const PackingItemSchema = new Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  packed: { type: Boolean, default: false }
});

const ExpenseSchema = new Schema({
  amount: { type: Number, required: true },
  category: { 
    type: String, 
    enum: ['Flights', 'Accommodation', 'Food', 'Activities', 'Other'], 
    required: true 
  },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const ItinerarySchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  destination: { type: String, required: true },
  duration: { type: Number, required: true },
  budgetType: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
  interests: [{ type: String, required: true }],
  days: [DayPlanSchema],
  estimatedBudget: EstimatedBudgetSchema,
  suggestedHotels: [SuggestedHotelSchema],
  packingList: [PackingItemSchema],
  expenses: [ExpenseSchema]
}, {
  timestamps: true
});

export default mongoose.model<IItinerary>('Itinerary', ItinerarySchema);
