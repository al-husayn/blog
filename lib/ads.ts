export interface PromoAd {
    id: string;
    title: string;
    description: string;
    image: string;
    imageAlt: string;
    href: string;
}

/** Edit this list to add, remove, or update the promos shown beside articles. */
export const promoAds: PromoAd[] = [
    {
        id: 'usa-visa',
        title: 'Fast Track USA Visa Appointment Services',
        description:
            'Kindly contact us if you need help with expedited USA visa appointment. We can help you get an appointment quickly.',
        image: '/thumbnails/USA Visa.png',
        imageAlt: 'USA visa services advertisement',
        href: '#',
    },
    {
        id: 'visa-app',
        title: 'Fast Track Your USA Visa Appointment',
        description:
            'Let us take care of your Visa appointment with express Visa Interview Date, hassle free priority rescheduling. We are trusted and secured with 100% success rate. We can help you get an appointment quickly.',
        image: '/thumbnails/VISA App.png',
        imageAlt: 'Visa App advertisement',
        href: '#',
    },
    {
        id: 'expedited-visa',
        title: 'Stucked with a USA Visa Appointment Date? We can help!',
        description:
            "Link up with us to get your USA Visa appointment date expedited. Don't change youur travelplans because of delayed visa appointment. Just link up",
        image: '/thumbnails/US Visa.jpg',
        imageAlt: 'Visa App advertisement',
        href: '#',
    },
    {
        id: 'sltv-decoder',
        title: 'Need a SLTV, Naija Dstv(Hotel Packaage & Normal single person), Moreplex Decoder? Get it now!',
        description:
            'We deals in  SLTV, Naija Dstv(Hotel Packaage & Normal single person), Moreplex Decoders. Get it now! Watch all live matches. UCL, EPL, La Liga, Serie A, Ligue 1, FIFA World, UEFA Euro and more. Movies, Series, Kids, News, Music, Documentaries and more. We have the best decoders for you. Get it now!',
        image: '/thumbnails/SLTV Flyer.png',
        imageAlt: 'SLTV Flyer advertisement',
        href: '#',
    },
];
