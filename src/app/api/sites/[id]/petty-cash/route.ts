import { NextResponse } from 'next/server';
import { connectToDB, PettyCashTransaction, Site } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();
    const { id } = await params;

    const transactions = await PettyCashTransaction.find({ siteId: id }).sort({ date: -1 }).lean();
    
    // Calculate summary
    let allocated = 0;
    let spent = 0;
    
    transactions.forEach((tx: { type: string, amount: number }) => {
      if (tx.type === 'Allocation') {
        allocated += tx.amount;
      } else if (tx.type === 'Expense') {
        spent += tx.amount;
      }
    });
    
    const balance = allocated - spent;

    return NextResponse.json({
        transactions,
        summary: {
            allocated,
            spent,
            balance
        }
    });
  } catch (error) {
    console.error('Error fetching petty cash:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();
    const { id } = await params;
    const body = await request.json();

    const transaction = await PettyCashTransaction.create({
      siteId: id,
      title: body.title,
      amount: body.amount,
      type: body.type, // 'Allocation' or 'Expense'
      loggedBy: body.loggedBy || 'System', // Could extract from token in real app
      date: body.date || new Date()
    });

    if (body.type === 'Allocation') {
        await Site.findByIdAndUpdate(id, { $inc: { budget: body.amount } });
    }

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Error creating petty cash transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
