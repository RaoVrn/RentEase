export default async function handler(req, res) {
    if (!['GET', 'PUT'].includes(req.method)) {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No authentication token provided' });
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    try {
        if (req.method === 'GET') {
            const response = await fetch(`${apiUrl}/api/users/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch profile');
            }

            const data = await response.json();
            return res.status(200).json(data);
        }

        if (req.method === 'PUT') {
            const formData = new FormData();
            
            // Get the form data from the request
            const body = await req.formData();
            
            // Append all fields from the form data to our new FormData
            for (const [key, value] of body.entries()) {
                formData.append(key, value);
            }

            const response = await fetch(`${apiUrl}/api/users/profile/update`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update profile');
            }

            const data = await response.json();
            return res.status(200).json(data);
        }
    } catch (error) {
        console.error('Error in profile API route:', error);
        return res.status(500).json({ message: error.message || 'Internal server error' });
    }
}