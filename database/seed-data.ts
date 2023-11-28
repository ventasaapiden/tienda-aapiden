import bcript from 'bcryptjs';

interface SeedProduct {
    description: string;
    images: string[];
    inStock: number;
    weight: number;
    price: number;
    slug: string;
    tags: string[];
    title: string;
    state: ValidStates;
}

interface SeedProductType {
    name: string;
    tax: number;
    state: ValidStates;
}

type ValidStates = 'activo'|'inactivo';

interface SeedUser {
    name: string;
    email: string;
    password: string;
    phone: string;
    freeShipping: boolean;
    role: 'admin'|'client';
}

interface SeedData {
    users: SeedUser[];
    productTypes: SeedProductType[];
    products: SeedProduct[];
}

export const initialData: SeedData = {
    users: [
        {
            name: 'Faynier Rojas Rodríguez',
            email: 'ventas@aapiden.org',
            phone: '85192804',
            password: bcript.hashSync('12345678'),
            role: 'admin',
            freeShipping: false,
        },
    ],
    productTypes: [
        {
            name: 'Miel',
            tax: 1,
            state: 'activo'
        },
        {
            name: 'Cera',
            tax: 13,
            state: 'activo'
        },
        {
            name: 'Propóleos',
            tax: 13,
            state: 'activo'
        },
        {
            name: 'Polen',
            tax: 13,
            state: 'activo'
        },
        {
            name: 'Insumos',
            tax: 13,
            state: 'activo'
        },
        {
            name: 'Cosméticos',
            tax: 13,
            state: 'activo'
        },
        {
            name: 'Apitoxinas',
            tax: 13,
            state: 'activo'
        },
    ],
    products: [
        {
            description: "Descubre la pureza en cada gota con nuestro producto estrella: 1 kg de miel de abeja. Proveniente de colmenas seleccionadas con cuidado, esta miel es una deliciosa fusión de sabores florales. Recolectada y procesada artesanalmente, ofrece no solo dulzura sino también beneficios antioxidantes y antibacterianos para tu bienestar. Disfruta de la autenticidad de la miel de abeja, directamente en tu mesa.",
            images: [
                'Miel-100-1024x1024.jpg',
                'Miel-100-1024x1024.jpg',
            ],
            inStock: 100,
            price: 3000,
            slug: "1kg_miel_de_abeja",
            tags: ['miel', 'abeja'],
            title: "1kg de Miel de Abeja",
            state: 'activo',
            weight: 1
        },
        {
            description: "Descubre la pureza en cada gota con nuestro producto estrella: 2 kg de miel de abeja. Proveniente de colmenas seleccionadas con cuidado, esta miel es una deliciosa fusión de sabores florales. Recolectada y procesada artesanalmente, ofrece no solo dulzura sino también beneficios antioxidantes y antibacterianos para tu bienestar. Disfruta de la autenticidad de la miel de abeja, directamente en tu mesa.",
            images: [
                'Miel-100-1024x1024.jpg',
                'Miel-100-1024x1024.jpg',
            ],
            inStock: 100,
            price: 5000,
            slug: "2kg_miel_de_abeja",
            tags: ['miel', 'abeja'],
            title: "2kg de Miel de Abeja",
            state: 'activo',
            weight: 2
        },
        {
            description: "Descubre la pureza en cada gota con nuestro producto estrella: 3 kg de miel de abeja. Proveniente de colmenas seleccionadas con cuidado, esta miel es una deliciosa fusión de sabores florales. Recolectada y procesada artesanalmente, ofrece no solo dulzura sino también beneficios antioxidantes y antibacterianos para tu bienestar. Disfruta de la autenticidad de la miel de abeja, directamente en tu mesa.",
            images: [
                'Miel-100-1024x1024.jpg',
                'Miel-100-1024x1024.jpg',
            ],
            inStock: 100,
            price: 7000,
            slug: "3kg_miel_de_abeja",
            tags: ['miel', 'abeja'],
            title: "3kg de Miel de Abeja",
            state: 'activo',
            weight: 3
        },
    ]
}