from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from properties.models import PropertyCategory, PropertyAmenity, Property, PropertyImage, AgentProfile, Inquiry, Favorite
from decimal import Decimal

User = get_user_model()

CITIES = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Kakamega']
AGENT_NAMES = [
    ('John', 'Mwangi'), ('Jane', 'Ochieng'), ('Michael', 'Kimani'),
    ('Sarah', 'Wanjiku'), ('David', 'Otieno'), ('Emily', 'Njoroge'),
    ('Robert', 'Kariuki'), ('Grace', 'Muthoni'),
]
LANDLORD_NAMES = [
    ('Peter', 'Kamau'), ('Mary', 'Wambui'), ('James', 'Kiprop'),
]
CLIENT_NAMES = [
    ('Alice', 'Kamau'), ('Brian', 'Otieno'), ('Carol', 'Njeri'),
    ('Daniel', 'Wambua'), ('Eve', 'Chebet'),
]

AMENITIES = [
    ('Swimming Pool', 'Pool'), ('Gym', 'Dumbbell'), ('Parking', 'Car'),
    ('Security', 'Shield'), ('Garden', 'Tree'), ('WiFi', 'Wifi'),
    ('Balcony', 'Sun'), ('Elevator', 'ArrowUpFromLine'), ('Generator', 'Zap'),
    ('Clubhouse', 'Building2'),
]

CATEGORIES = [
    ('Residential', 'residential'), ('Commercial', 'commercial'),
    ('Industrial', 'industrial'), ('Land', 'land'),
]

PROPERTY_TEMPLATES = [
    {
        'title': 'Luxury Apartment in {}',
        'desc': 'Stunning modern apartment with panoramic city views. Features premium finishes, open-plan living, and top-tier amenities including a gym, pool, and 24-hour security.',
        'type': 'apartment', 'listing': 'rent', 'price': 85000, 'beds': 2, 'baths': 2, 'sqft': 1200,
        'cat': 'Residential',
    },
    {
        'title': 'Modern House in {}',
        'desc': 'Beautiful family home with a spacious garden, modern kitchen, and elegant living areas. Located in a quiet, well-established neighborhood.',
        'type': 'house', 'listing': 'sale', 'price': 25000000, 'beds': 4, 'baths': 3, 'sqft': 2500,
        'cat': 'Residential',
    },
    {
        'title': 'Cozy Villa in {}',
        'desc': 'Charming villa with private pool, landscaped garden, and stunning views. Perfect for those seeking luxury and tranquility.',
        'type': 'villa', 'listing': 'sale', 'price': 45000000, 'beds': 5, 'baths': 4, 'sqft': 3500,
        'cat': 'Residential',
    },
    {
        'title': 'Commercial Space in {}',
        'desc': 'Prime commercial space in the heart of the city. Ideal for retail, office, or restaurant use with high foot traffic.',
        'type': 'commercial', 'listing': 'rent', 'price': 200000, 'beds': 0, 'baths': 2, 'sqft': 2000,
        'cat': 'Commercial',
    },
    {
        'title': 'Studio Apartment in {}',
        'desc': 'Affordable and cozy studio apartment perfect for young professionals. Fully furnished with modern amenities.',
        'type': 'apartment', 'listing': 'rent', 'price': 35000, 'beds': 1, 'baths': 1, 'sqft': 450,
        'cat': 'Residential',
    },
    {
        'title': 'Spacious House in {}',
        'desc': 'Large family home with 5 bedrooms, modern finishes, and a beautiful backyard. Great for entertaining.',
        'type': 'house', 'listing': 'rent', 'price': 150000, 'beds': 5, 'baths': 3, 'sqft': 3000,
        'cat': 'Residential',
    },
    {
        'title': 'Land Parcel in {}',
        'desc': 'Prime development land with excellent road access and utilities. Suitable for residential or commercial development.',
        'type': 'land', 'listing': 'sale', 'price': 8000000, 'beds': 0, 'baths': 0, 'sqft': 10000,
        'cat': 'Land',
    },
    {
        'title': 'Executive Office in {}',
        'desc': 'Premium office space in a modern building with state-of-the-art facilities, conference rooms, and parking.',
        'type': 'office', 'listing': 'rent', 'price': 180000, 'beds': 0, 'baths': 2, 'sqft': 1500,
        'cat': 'Commercial',
    },
]

UNSPLASH_IMAGES = [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c',
    'https://images.unsplash.com/photo-1600573472550-8090b5e0745e',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3',
]


class Command(BaseCommand):
    help = 'Seed the database with sample users, properties, categories, and amenities'

    def handle(self, *args, **options):
        if User.objects.exists():
            self.stdout.write(self.style.WARNING('Database already has data. Skipping seed.'))
            return

        with transaction.atomic():
            self._create_categories()
            self._create_amenities()
            admin = self._create_admin()
            agents = self._create_agents()
            landlords = self._create_landlords()
            self._create_clients()
            self._create_properties(agents, landlords)
            self._create_inquiries(agents)

        self.stdout.write(self.style.SUCCESS('Seed data created successfully!'))
        self.stdout.write(f'  Admin:     admin@kejapoa.com / admin123')
        self.stdout.write(f'  Agents:    agent1@kejapoa.com ... agent{len(AGENT_NAMES)}@kejapoa.com / password123')
        self.stdout.write(f'  Landlords: landlord1@kejapoa.com ... / password123')
        self.stdout.write(f'  Clients:   client1@kejapoa.com ... client{len(CLIENT_NAMES)}@kejapoa.com / password123')

    def _create_admin(self):
        user, _ = User.objects.get_or_create(
            username='admin',
            defaults=dict(
                email='admin@kejapoa.com', first_name='System', last_name='Admin',
                role='super_admin', phone='+254700000000', is_staff=True, is_superuser=True,
            ),
        )
        user.set_password('admin123')
        user.save()
        return user

    def _create_categories(self):
        for name, slug in CATEGORIES:
            PropertyCategory.objects.get_or_create(name=name, slug=slug)

    def _create_amenities(self):
        for name, icon in AMENITIES:
            PropertyAmenity.objects.get_or_create(name=name, icon=icon)

    def _make_user(self, first_name, last_name, role, idx):
        username = f'{role}{idx}'
        email = f'{username}@kejapoa.com'
        user, _ = User.objects.get_or_create(
            username=username,
            defaults=dict(
                email=email, first_name=first_name, last_name=last_name,
                role=role, phone=f'+254700{1000 + idx:06d}',
            ),
        )
        user.set_password('password123')
        user.save()
        return user

    def _create_agents(self):
        agents = []
        for i, (first, last) in enumerate(AGENT_NAMES, 1):
            user = self._make_user(first, last, 'agent', i)
            profile, _ = AgentProfile.objects.get_or_create(
                user=user,
                defaults=dict(
                    agency_name=['Kejapoa Realty', 'Prime Properties', 'Elite Homes', 'Urban Living'][i % 4],
                    license_number=f'LIC{2000 + i}',
                    bio=f'Experienced real estate professional with {5 + i} years in the industry.',
                    rating=Decimal(f'{4.0 + (i % 10) / 10:.1f}'),
                    verified=i % 3 != 0,
                ),
            )
            agents.append(user)
        return agents

    def _create_landlords(self):
        return [self._make_user(first, last, 'landlord', i) for i, (first, last) in enumerate(LANDLORD_NAMES, 1)]

    def _create_clients(self):
        for i, (first, last) in enumerate(CLIENT_NAMES, 1):
            self._make_user(first, last, 'client', i)

    def _create_properties(self, agents, landlords):
        amenities = list(PropertyAmenity.objects.all())
        categories = {c.name: c for c in PropertyCategory.objects.all()}

        for i, tmpl in enumerate(PROPERTY_TEMPLATES):
            city = CITIES[i % len(CITIES)]
            agent = agents[i % len(agents)]
            landlord = landlords[i % len(landlords)]

            lat_val = 2800 + i * 50
            lng_val = 8100 + i * 30
            prop = Property.objects.create(
                title=tmpl['title'].format(city),
                description=tmpl['desc'],
                price=Decimal(tmpl['price']),
                listing_type=tmpl['listing'],
                property_type=tmpl['type'],
                category=categories.get(tmpl['cat']),
                bedrooms=tmpl['beds'],
                bathrooms=tmpl['baths'],
                area_sqft=tmpl['sqft'],
                address=f'{100 + i} {["Kenyatta Avenue", "Moi Road", "Victoria Street", "Nyerere Road", "Kaunda Street", "Biashara Street"][i % 6]}',
                city=city,
                state=city,
                zip_code=f'{10000 + i:05d}',
                latitude=Decimal(f'-1.{lat_val:04d}'),
                longitude=Decimal(f'36.{lng_val:04d}'),
                agent=agent,
                landlord=landlord,
                status='approved',
                featured=i % 3 == 0,
            )

            for j, url in enumerate(UNSPLASH_IMAGES[:3]):
                PropertyImage.objects.create(
                    property=prop,
                    image=f'properties/{prop.id}/image_{j}.jpg',
                    alt=f'{prop.title} - Image {j + 1}',
                    is_primary=j == 0,
                    order=j,
                )

            prop.amenities.set(amenities[:min(len(amenities), (i % 5) + 2)])

    def _create_inquiries(self, agents):
        properties = list(Property.objects.all()[:3])
        sample_inquiries = [
            ('Alice Kamau', 'alice@example.com', '+254711111111', 'Is this property still available? I am very interested in scheduling a viewing.'),
            ('Brian Otieno', 'brian@example.com', '+254722222222', 'Can you provide more details about the amenities and the neighborhood?'),
            ('Carol Njeri', 'carol@example.com', '+254733333333', 'I would like to know if the price is negotiable and what payment terms are available.'),
        ]
        for i, (name, email, phone, msg) in enumerate(sample_inquiries):
            Inquiry.objects.create(
                property=properties[i % len(properties)],
                sender_name=name,
                sender_email=email,
                sender_phone=phone,
                message=msg,
                status=['new', 'read', 'replied'][i],
            )
