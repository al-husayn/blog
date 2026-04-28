import type { Author, AuthorKey } from '@/types/authors';

export const authors: Record<AuthorKey, Author> = {
    al: {
        name: 'Al-Hussein',
        position: 'Software Engineer',
        avatar: '/authors/AL.png',
    },
    'al-hussein': {
        name: 'Al-Hussein',
        position: 'Software Engineer',
        avatar: '/authors/AL.png',
    },
    hamdan: {
        name: 'Hamdan W.A',
        position: 'Design System Engineer',
        avatar: '/authors/Hamdan.jpeg',
    },
} as const;

export function getAuthor(key: AuthorKey): Author {
    return authors[key];
}

export function isValidAuthor(key: string): key is AuthorKey {
    return Object.hasOwn(authors, key);
}
