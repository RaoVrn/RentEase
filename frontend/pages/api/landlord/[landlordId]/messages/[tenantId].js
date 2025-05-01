export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { landlordId, tenantId } = req.query;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token || !landlordId || !tenantId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tenant/messages/landlord/${landlordId}/tenant/${tenantId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch messages');
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Error fetching messages' });
    }
}