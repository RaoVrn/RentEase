export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const token = req.headers.authorization?.split(' ')[1];
    const { tenantId, text } = req.body;

    if (!token || !tenantId || !text) {
        return res.status(401).json({ message: 'Unauthorized or missing required fields' });
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/landlord/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ tenantId, text })
        });

        if (!response.ok) {
            throw new Error('Failed to send message');
        }

        const data = await response.json();
        res.status(201).json(data);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Error sending message' });
    }
} 