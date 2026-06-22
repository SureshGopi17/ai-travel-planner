import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import Itinerary from '../models/Itinerary';
import { generateItineraryWithAI, regenerateDayWithAI } from '../services/aiService';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// 1. Generate and Save New Trip Itinerary
// POST /api/itineraries
router.post('/', async (req: AuthRequest, res: Response) => {
  const { destination, duration, budgetType, interests } = req.body;
  const userId = req.user?.id;

  if (!destination || !duration || !budgetType || !interests || !Array.isArray(interests)) {
    return res.status(400).json({ message: 'Destination, duration, budgetType, and interests are required' });
  }

  const durationNum = parseInt(duration);
  if (isNaN(durationNum) || durationNum <= 0 || durationNum > 30) {
    return res.status(400).json({ message: 'Duration must be a positive number (max 30 days)' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY || '';
    
    // Call AI generation service
    const generatedData = await generateItineraryWithAI(
      destination,
      durationNum,
      budgetType,
      interests,
      apiKey
    );

    // Save to Database
    const newItinerary = new Itinerary({
      userId,
      destination,
      duration: durationNum,
      budgetType,
      interests,
      days: generatedData.days,
      estimatedBudget: generatedData.estimatedBudget,
      suggestedHotels: generatedData.suggestedHotels,
      packingList: generatedData.packingList,
      expenses: []
    });

    await newItinerary.save();

    return res.status(201).json(newItinerary);
  } catch (error) {
    console.error('Failed to create itinerary:', error);
    return res.status(500).json({ message: 'Failed to generate itinerary. Please try again.' });
  }
});

// 2. Get All Trip Itineraries of the Authenticated User
// GET /api/itineraries
router.get('/', async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  try {
    const itineraries = await Itinerary.find({ userId }).sort({ createdAt: -1 });
    return res.json(itineraries);
  } catch (error) {
    console.error('Failed to fetch itineraries:', error);
    return res.status(500).json({ message: 'Failed to fetch itineraries' });
  }
});

// 3. Get Specific Itinerary Detail
// GET /api/itineraries/:id
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    const itinerary = await Itinerary.findOne({ _id: id, userId });
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found or unauthorized' });
    }
    return res.json(itinerary);
  } catch (error) {
    console.error('Failed to fetch itinerary:', error);
    return res.status(500).json({ message: 'Error retrieving itinerary details' });
  }
});

// 4. Update Activities (Add or Remove)
// PUT /api/itineraries/:id/activities
router.put('/:id/activities', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { dayNumber, activities } = req.body; // Full activities array for the day
  const userId = req.user?.id;

  if (dayNumber === undefined || !activities || !Array.isArray(activities)) {
    return res.status(400).json({ message: 'Day number and activities array are required' });
  }

  try {
    const itinerary = await Itinerary.findOne({ _id: id, userId });
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found or unauthorized' });
    }

    const dayIndex = itinerary.days.findIndex(d => d.dayNumber === parseInt(dayNumber));
    if (dayIndex === -1) {
      return res.status(400).json({ message: 'Invalid day number' });
    }

    // Update activities of that day
    itinerary.days[dayIndex].activities = activities;
    await itinerary.save();

    return res.json(itinerary);
  } catch (error) {
    console.error('Failed to update activities:', error);
    return res.status(500).json({ message: 'Failed to update activities' });
  }
});

// 5. Regenerate a Specific Day using AI or local templates
// POST /api/itineraries/:id/regenerate-day
router.post('/:id/regenerate-day', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { dayNumber, prompt } = req.body;
  const userId = req.user?.id;

  if (dayNumber === undefined || !prompt) {
    return res.status(400).json({ message: 'Day number and prompt are required' });
  }

  try {
    const itinerary = await Itinerary.findOne({ _id: id, userId });
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found or unauthorized' });
    }

    const dayIndex = itinerary.days.findIndex(d => d.dayNumber === parseInt(dayNumber));
    if (dayIndex === -1) {
      return res.status(400).json({ message: 'Invalid day number' });
    }

    const apiKey = process.env.GEMINI_API_KEY || '';
    const currentActivities = itinerary.days[dayIndex].activities;

    // Regenerate using AI Service
    const newActivities = await regenerateDayWithAI(
      itinerary.destination,
      itinerary.budgetType,
      parseInt(dayNumber),
      currentActivities,
      prompt,
      apiKey
    );

    // Save back to DB
    itinerary.days[dayIndex].activities = newActivities;
    await itinerary.save();

    return res.json({
      message: 'Day regenerated successfully',
      days: itinerary.days
    });
  } catch (error) {
    console.error('Failed to regenerate day:', error);
    return res.status(500).json({ message: 'Failed to regenerate day' });
  }
});

// 6. Toggle Packed State of a Packing Item
// PUT /api/itineraries/:id/packing
router.put('/:id/packing', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { itemId, packed } = req.body;
  const userId = req.user?.id;

  if (!itemId || packed === undefined) {
    return res.status(400).json({ message: 'Item ID and packed status are required' });
  }

  try {
    const itinerary = await Itinerary.findOne({ _id: id, userId });
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found or unauthorized' });
    }

    const item = itinerary.packingList.find(p => p._id?.toString() === itemId);
    if (!item) {
      return res.status(404).json({ message: 'Packing item not found' });
    }

    item.packed = packed;
    await itinerary.save();

    return res.json({ packingList: itinerary.packingList });
  } catch (error) {
    console.error('Failed to update packing item:', error);
    return res.status(500).json({ message: 'Failed to update packing checklist' });
  }
});

// 7. Add Actual Expense
// POST /api/itineraries/:id/expenses
router.post('/:id/expenses', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { amount, category, description, date } = req.body;
  const userId = req.user?.id;

  if (amount === undefined || !category || !description) {
    return res.status(400).json({ message: 'Amount, category, and description are required' });
  }

  try {
    const itinerary = await Itinerary.findOne({ _id: id, userId });
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found or unauthorized' });
    }

    itinerary.expenses.push({
      amount: parseFloat(amount),
      category,
      description,
      date: date ? new Date(date) : new Date()
    });

    await itinerary.save();
    return res.json({ expenses: itinerary.expenses });
  } catch (error) {
    console.error('Failed to add expense:', error);
    return res.status(500).json({ message: 'Failed to add expense record' });
  }
});

// 8. Delete Actual Expense
// DELETE /api/itineraries/:id/expenses/:expenseId
router.delete('/:id/expenses/:expenseId', async (req: AuthRequest, res: Response) => {
  const { id, expenseId } = req.params;
  const userId = req.user?.id;

  try {
    const itinerary = await Itinerary.findOne({ _id: id, userId });
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found or unauthorized' });
    }

    itinerary.expenses = itinerary.expenses.filter(e => e._id?.toString() !== expenseId);
    await itinerary.save();

    return res.json({ expenses: itinerary.expenses });
  } catch (error) {
    console.error('Failed to delete expense:', error);
    return res.status(500).json({ message: 'Failed to delete expense record' });
  }
});

// 9. Delete Entire Trip Itinerary
// DELETE /api/itineraries/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    const deleted = await Itinerary.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      return res.status(404).json({ message: 'Itinerary not found or unauthorized' });
    }
    return res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Failed to delete itinerary:', error);
    return res.status(500).json({ message: 'Failed to delete trip' });
  }
});

export default router;
