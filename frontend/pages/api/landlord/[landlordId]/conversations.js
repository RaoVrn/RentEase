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
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        console.log('🟢 Fetching conversations from:', `${apiUrl}/api/landlord/${landlordId}/conversations`);
        
        const response = await fetch(`${apiUrl}/api/landlord/${landlordId}/conversations`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ API Error:', errorData);
            throw new Error(errorData.message || 'Failed to fetch conversations');
        }

        const data = await response.json();
        console.log('🟢 Received conversations:', data.length);
        res.status(200).json(data);
    } catch (error) {
        console.error('❌ Error fetching conversations:', error);
        res.status(500).json({ message: error.message || 'Error fetching conversations' });
    }
}