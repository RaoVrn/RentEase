export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { landlordId } = req.query;
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'No authorization token provided' });
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tenant/landlord/${landlordId}/maintenance-requests`, {
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch maintenance requests');
        }

        res.status(response.status).json(data);
    } catch (error) {
        console.error('Error in maintenance requests API route:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
}