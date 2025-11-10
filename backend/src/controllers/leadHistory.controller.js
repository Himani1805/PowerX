import leadService from '../services/leadService.js';

// @desc    Get lead history
// @route   GET /api/leads/:leadId/history
// @access  Private
export const getLeadHistory = async (req, res) => {
  try {
    const { leadId } = req.params;
    
    // Verify user has access to this lead
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { ownerId: true }
    });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Check permissions
    if (req.user.role === 'SALES' && lead.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this lead' });
    }

    const history = await leadService.getLeadHistory(leadId);
    res.json(history);
  } catch (error) {
    console.error('Get lead history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};