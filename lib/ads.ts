export interface PromoAd {
    id: string;
    title: string;
    description: string;
    image: string;
    imageAlt: string;
    href: string;
    phone: string;
}

const contactPhone = '+233249046210';
const whatsappNumber = '233249046210';

/** Edit this list to add, remove, or update the promos shown beside articles. */
export const promoAds: PromoAd[] = [
    {
        id: 'usa-visa',
        title: 'Fast Track USA Visa Appointment Services',
        description:
            'Kindly contact us if you need help with expedited USA visa appointment. We can help you get an appointment quickly.',
        image: '/thumbnails/USA Visa.png',
        imageAlt: 'USA visa services advertisement',
        href: `https://wa.me/${whatsappNumber}?text=Hi%2C%20I%27m%20interested%20in%20help%20with%20a%20U.S.%20visa%20appointment.`,
        phone: contactPhone,
    },
    {
        id: 'visa-app',
        title: 'Fast Track Your USA Visa Appointment',
        description:
            'Let us take care of your Visa appointment with express Visa Interview Date, hassle free priority rescheduling. We are trusted and secured with 100% success rate. We can help you get an appointment quickly.',
        image: '/thumbnails/VISA App.png',
        imageAlt: 'Visa App advertisement',
        href: `https://wa.me/${whatsappNumber}?text=Hi%2C%20I%27m%20interested%20in%20visa%20appointment%20support.`,
        phone: contactPhone,
    },
    {
        id: 'expedited-visa',
        title: 'Stuck with a USA Visa Appointment Date? We can help!',
        description:
            "Contact us to get your USA visa appointment date expedited. Don't change your travel plans because of a delayed visa appointment. Just get in touch.",
        image: '/thumbnails/US Visa.jpg',
        imageAlt: 'Visa App advertisement',
        href: `https://wa.me/${whatsappNumber}?text=Hi%2C%20I%27d%20like%20to%20ask%20about%20an%20earlier%20visa%20appointment.`,
        phone: contactPhone,
    },
    {
        id: 'sltv-decoder',
        title: 'Need a SLTV, Naija Dstv(Hotel Packaage & Normal single person), Moreplex Decoder? Get it now!',
        description:
            'We deals in  SLTV, Naija Dstv (Hotel Packaage & Normal single person), Moreplex Decoders. Get it now! Watch all live matches. UCL, EPL, La Liga, Serie A, Ligue 1, FIFA World, UEFA Euro and more. Movies, Series, Kids, News, Music, Documentaries and more. We have the best decoders for you. Get it now!',
        image: '/thumbnails/SLTV Flyer.png',
        imageAlt: 'SLTV Flyer advertisement',
        href: `https://wa.me/${whatsappNumber}?text=Hi%2C%20I%27m%20interested%20in%20your%20decoder%20options.`,
        phone: contactPhone,
    },
];
