export default async function handler(req, res) {
    if (req.method !== 'PATCH') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { requestId } = req.query;
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'No authorization token provided' });
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tenant/maintenance/request/${requestId}`, {
            method: 'PUT',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update maintenance request status');
        }

        res.status(response.status).json(data);
    } catch (error) {
        console.error('Error in maintenance request status update API route:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
}