import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getLeadsOverTime = async (req, res) => {
  try {
    console.log('Fetching leads over time...');
    const leadsOverTime = await prisma.lead.groupBy({
      by: ['createdAt'],
      _count: {
        id: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    console.log('Leads data:', leadsOverTime);

    if (!leadsOverTime || leadsOverTime.length === 0) {
      console.log('No leads data found');
      return res.json([{ date: new Date().toISOString().split('T')[0], count: 0 }]);
    }

    const formattedData = leadsOverTime.map(item => ({
      date: item.createdAt.toISOString().split('T')[0],
      count: item._count.id,
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error in getLeadsOverTime:', error);
    res.status(500).json({ 
      error: 'Failed to fetch leads over time data',
      details: error.message 
    });
  }
};