/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            'res.cloudinary.com',
            'cloudinary.com',
            'images.unsplash.com',
        ],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'uxbthcaodpunbuykuiop.supabase.co',
                pathname: '/storage/v1/object/public/avatars/**',
            },
        ],
    },
};

export default nextConfig;