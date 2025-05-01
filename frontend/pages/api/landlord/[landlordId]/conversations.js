export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { landlordId } = req.query;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token || !landlordId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tenant/landlord/${landlordId}/conversations`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch conversations');
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ message: 'Error fetching conversations' });
    }
}