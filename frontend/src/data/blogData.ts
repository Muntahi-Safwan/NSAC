export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  image: string;
  featured: boolean;
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  type: 'precaution' | 'research' | 'guide' | 'news';
  category: string;
  date: string;
  readTime: string;
  author: string;
  image: string;
  priority: 'high' | 'medium' | 'low';
}

export const blogPosts: BlogPost[] = [
  {
    id: 'understanding-aqi',
    title: 'Understanding Air Quality Index: A Complete Guide',
    excerpt: 'Learn how to interpret AQI readings and make informed decisions about outdoor activities based on air quality conditions.',
    content: `The Air Quality Index (AQI) is a standardized system used to communicate air pollution levels to the public. Understanding AQI readings can help you make informed decisions about outdoor activities and protect your health.

## What is AQI?

The AQI is a numerical scale that runs from 0 to 500, where higher values indicate worse air quality. The scale is divided into six categories, each represented by a different color:

- **Good (0-50)**: Green - Air quality is satisfactory
- **Moderate (51-100)**: Yellow - Acceptable for most people
- **Unhealthy for Sensitive Groups (101-150)**: Orange - May cause problems for sensitive individuals
- **Unhealthy (151-200)**: Red - Everyone may experience health effects
- **Very Unhealthy (201-300)**: Purple - Health alert for everyone
- **Hazardous (301-500)**: Maroon - Emergency conditions

## Key Pollutants Measured

The AQI considers five major pollutants:
1. **Ground-level ozone (O3)**
2. **Particle pollution (PM2.5 and PM10)**
3. **Carbon monoxide (CO)**
4. **Sulfur dioxide (SO2)**
5. **Nitrogen dioxide (NO2)**

## Health Recommendations by AQI Level

### Good to Moderate (0-100)
- Safe for outdoor activities
- Perfect time for exercise and recreation

### Unhealthy for Sensitive Groups (101-150)
- People with respiratory conditions should limit outdoor activities
- Consider moving intense activities indoors

### Unhealthy and Above (151+)
- Everyone should avoid outdoor activities
- Keep windows closed and use air purification systems

## Making Informed Decisions

Use real-time AQI data to:
- Plan outdoor activities
- Adjust exercise routines
- Protect vulnerable family members
- Make travel decisions

Remember, air quality can change rapidly, so check current conditions before heading outdoors.`,
    author: 'Dr. Sarah Chen',
    date: '2024-01-15',
    readTime: '8 min read',
    category: 'Education',
    tags: ['AQI', 'Health', 'Air Quality', 'Guide'],
    image: 'https://images.unsplash.com/photo-1597149552128-db52d2fdc80f',
    featured: true
  },
  {
    id: 'nasa-satellite-monitoring',
    title: 'How NASA Satellites Monitor Global Air Quality',
    excerpt: 'Discover the cutting-edge satellite technology that enables real-time air quality monitoring across the globe.',
    content: `NASA's fleet of Earth-observing satellites provides unprecedented insight into global air quality patterns. These sophisticated instruments monitor atmospheric conditions 24/7, delivering crucial data for environmental protection and public health.

## The Earth Observing System

NASA's Earth Observing System (EOS) consists of multiple satellites working together to monitor our planet's atmosphere:

### Key Satellites for Air Quality Monitoring

1. **Terra and Aqua Satellites**
   - Launched in 1999 and 2002 respectively
   - Carry MODIS instruments for aerosol detection
   - Provide daily global coverage

2. **Aura Satellite**
   - Specialized for atmospheric chemistry
   - Monitors ozone, nitrogen dioxide, and other pollutants
   - Critical for understanding air quality trends

3. **Suomi NPP and JPSS Series**
   - Next-generation weather and climate satellites
   - Enhanced air quality monitoring capabilities
   - Improved spatial and temporal resolution

## How Satellite Monitoring Works

### Spectral Analysis
Satellites use spectroscopic techniques to identify atmospheric components by analyzing how they absorb and scatter light at different wavelengths.

### Data Processing
Raw satellite data undergoes complex processing to:
- Remove cloud interference
- Calibrate atmospheric conditions
- Convert measurements to concentration levels

### Validation
Ground-based measurements validate satellite data to ensure accuracy and reliability.

## Benefits of Satellite Monitoring

### Global Coverage
- Monitor remote and inaccessible areas
- Track transboundary pollution
- Provide comprehensive global datasets

### Real-time Data
- Rapid data processing and dissemination
- Early warning systems for pollution events
- Support for emergency response

### Long-term Trends
- Climate change monitoring
- Policy effectiveness assessment
- Scientific research support

## Applications

Satellite air quality data supports:
- Public health protection
- Environmental policy development
- Climate research
- Emergency response planning
- International cooperation

The integration of satellite technology with ground-based monitoring creates a comprehensive air quality surveillance network that protects communities worldwide.`,
    author: 'Dr. Michael Rodriguez',
    date: '2024-01-10',
    readTime: '12 min read',
    category: 'Technology',
    tags: ['NASA', 'Satellites', 'Monitoring', 'Technology'],
    image: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2',
    featured: true
  },
  {
    id: 'protecting-children-air-pollution',
    title: 'Protecting Children from Air Pollution: A Parent\'s Guide',
    excerpt: 'Essential strategies and tips for parents to protect their children from harmful air pollution effects.',
    content: `Children are particularly vulnerable to air pollution due to their developing respiratory systems and higher breathing rates. This comprehensive guide provides parents with practical strategies to protect their children's health.

## Why Children Are More Vulnerable

### Physiological Factors
- **Developing lungs**: Children's respiratory systems are still maturing
- **Higher breathing rate**: Children breathe more air per body weight than adults
- **More time outdoors**: Children spend more time in outdoor activities
- **Mouth breathing**: Young children often breathe through their mouths, bypassing nasal filtration

### Health Impacts
Air pollution can cause:
- Asthma development and exacerbation
- Reduced lung function
- Respiratory infections
- Allergic reactions
- Long-term developmental issues

## Protective Strategies

### Monitor Air Quality Daily
- Check AQI levels before outdoor activities
- Use reliable air quality apps and websites
- Sign up for air quality alerts
- Plan activities based on pollution levels

### Indoor Air Quality Management
- **Use air purifiers** with HEPA filters
- **Keep windows closed** during high pollution days
- **Maintain HVAC systems** regularly
- **Eliminate indoor pollution sources** (smoking, strong chemicals)
- **Add air-purifying plants** to living spaces

### Outdoor Activity Planning
- **Schedule activities** during low pollution hours (early morning or evening)
- **Choose locations wisely** - parks away from busy roads
- **Limit intense exercise** on high pollution days
- **Consider indoor alternatives** for sports and recreation

### School and Commute Safety
- **Choose routes** with less traffic when possible
- **Time school pickup/dropoff** to avoid rush hour pollution
- **Advocate for school air quality measures**
- **Use public transportation** or carpool to reduce overall emissions

## Emergency Preparedness

### High Pollution Days
When AQI exceeds 150:
- Keep children indoors
- Close all windows and doors
- Run air purifiers on high settings
- Avoid outdoor sports and activities
- Watch for symptoms of respiratory distress

### Symptoms to Watch For
Contact healthcare providers if children experience:
- Persistent cough
- Difficulty breathing
- Chest tightness
- Wheezing
- Fatigue during normal activities

## Building Healthy Habits

### Education
- Teach children about air quality
- Explain the importance of clean air
- Make air quality monitoring a family activity
- Encourage environmental stewardship

### Community Action
- Support clean air policies
- Participate in community environmental initiatives
- Advocate for better public transportation
- Promote active transportation (walking, cycling) when air quality permits

## Technology Tools for Parents

### Air Quality Apps
- Real-time AQI monitoring
- Location-based alerts
- Health recommendations
- Activity planning features

### Indoor Air Quality Monitors
- Track indoor pollution levels
- Monitor temperature and humidity
- Receive alerts for poor air quality
- Integration with smart home systems

## Long-term Health Investment

Protecting children from air pollution is an investment in their long-term health and wellbeing. By implementing these strategies, parents can significantly reduce their children's exposure to harmful pollutants and support healthy development.

Remember: Even small actions can make a big difference in protecting your child's respiratory health.`,
    author: 'Dr. Lisa Park',
    date: '2024-01-05',
    readTime: '15 min read',
    category: 'Health',
    tags: ['Children', 'Health', 'Parents', 'Protection', 'Safety'],
    image: 'https://images.unsplash.com/photo-1544968503-7f2eae8dd0d7',
    featured: false
  }
];

export const articles: Article[] = [
  {
    id: 'wildfire-smoke-protection',
    title: 'Wildfire Smoke Protection: Essential Precautions',
    excerpt: 'Learn how to protect yourself and your family during wildfire smoke events with these critical safety measures.',
    content: `Wildfire smoke contains dangerous particles and gases that can seriously impact your health. Here are essential precautions to take during wildfire smoke events.

## Immediate Actions

### Stay Indoors
- Keep all windows and doors closed
- Avoid using fans that bring outdoor air inside
- Run air conditioning on recirculate mode
- Create a "clean room" with minimal outside air infiltration

### Air Filtration
- Use portable air cleaners with HEPA filters
- Replace HVAC filters with high-efficiency options
- Avoid activities that create more particles (smoking, frying, candles)

### Monitor Air Quality
- Check AQI levels hourly during events
- Use N95 or P100 masks when outdoor exposure is unavoidable
- Pay attention to official health advisories

## Vulnerable Populations

### High-Risk Groups
- Children and infants
- Adults over 65
- People with respiratory conditions
- Individuals with heart disease
- Pregnant women

### Special Precautions
- Have emergency medications readily available
- Consider temporary relocation if conditions are severe
- Maintain communication with healthcare providers
- Keep emergency contact information accessible

## Long-term Strategies

### Home Preparation
- Install whole-house air filtration systems
- Seal air leaks around windows and doors
- Prepare emergency kits with masks and medications
- Identify local clean air shelters

### Community Resources
- Know evacuation routes and procedures
- Stay informed through official channels
- Participate in community preparedness programs
- Support fire prevention and forest management initiatives`,
    type: 'precaution',
    category: 'Emergency Preparedness',
    date: '2024-01-20',
    readTime: '10 min read',
    author: 'Emergency Response Team',
    image: 'https://images.unsplash.com/photo-1574798834926-b39501d8eda2',
    priority: 'high'
  },
  {
    id: 'air-pollution-exercise-guide',
    title: 'Exercise and Air Pollution: Safe Workout Guidelines',
    excerpt: 'Guidelines for maintaining your fitness routine while protecting yourself from air pollution health risks.',
    content: `Regular exercise is crucial for health, but air pollution can pose risks during physical activity. Learn how to exercise safely while protecting your respiratory system.

## Understanding the Risks

### Why Exercise Increases Risk
- Increased breathing rate during exercise
- Deeper breathing patterns
- More air processed through lungs
- Reduced nasal filtration during mouth breathing

### Pollution Impact on Performance
- Reduced oxygen delivery to muscles
- Increased inflammation in airways
- Potential for exercise-induced asthma
- Long-term cardiovascular effects

## Safe Exercise Guidelines

### Check AQI Before Exercise
- **AQI 0-50 (Good)**: All activities safe
- **AQI 51-100 (Moderate)**: Normal activities for most people
- **AQI 101-150 (Unhealthy for Sensitive Groups)**: Sensitive individuals should reduce intensity
- **AQI 151+ (Unhealthy)**: Everyone should avoid outdoor exercise

### Timing Your Workouts
- Exercise early morning or evening when pollution levels are typically lower
- Avoid rush hours and peak traffic times
- Check wind patterns and air quality forecasts
- Consider seasonal variations in air quality

### Location Selection
- Choose parks and areas away from busy roads
- Avoid exercising near industrial areas
- Seek higher elevation areas when possible
- Use indoor facilities during high pollution days

## Indoor Exercise Alternatives

### Home Workouts
- Bodyweight exercises and calisthenics
- Yoga and stretching routines
- Online fitness classes and apps
- Resistance band training

### Gym and Indoor Facilities
- Ensure good ventilation and air filtration
- Choose facilities with clean air certifications
- Avoid overcrowded spaces during peak pollution
- Consider off-peak hours for better air quality

### Air Quality Management
- Use air purifiers in exercise spaces
- Ensure proper ventilation
- Monitor indoor air quality
- Keep windows closed during high pollution days

## Protective Measures

### Breathing Techniques
- Practice nasal breathing when possible
- Use controlled breathing patterns
- Consider breathing exercises to strengthen respiratory system
- Warm up gradually to prepare airways

### Equipment and Gear
- Use N95 masks for light outdoor activities when AQI is moderate
- Remove masks during intense exercise (move indoors instead)
- Stay hydrated to help the body process pollutants
- Shower immediately after outdoor workouts

## Recognizing Warning Signs

### Stop Exercise If You Experience:
- Difficulty breathing beyond normal exertion
- Chest tightness or pain
- Persistent cough
- Dizziness or lightheadedness
- Excessive fatigue

### Seek Medical Attention For:
- Severe respiratory symptoms
- Chest pain
- Signs of heat exhaustion combined with poor air quality
- Worsening of pre-existing conditions

## Long-term Strategies

### Building Resilience
- Maintain overall cardiovascular fitness
- Support lung health with proper nutrition
- Stay informed about local air quality patterns
- Develop flexible exercise routines that adapt to conditions

### Advocacy and Community Action
- Support policies for cleaner air
- Promote active transportation during good air quality days
- Participate in community fitness initiatives
- Educate others about air quality and exercise safety

Remember: Staying active is important for health, but protecting yourself from air pollution is equally crucial. Adapt your routine based on current conditions and prioritize long-term health over short-term fitness goals.`,
    type: 'guide',
    category: 'Fitness & Health',
    date: '2024-01-18',
    readTime: '12 min read',
    author: 'Dr. Jennifer Kim',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
    priority: 'medium'
  },
  {
    id: 'indoor-air-quality-plants',
    title: 'Best Air-Purifying Plants for Your Home',
    excerpt: 'Discover which houseplants can naturally improve your indoor air quality and create a healthier living environment.',
    content: `Indoor plants can naturally improve air quality by removing common pollutants and increasing oxygen levels. Here's your guide to the most effective air-purifying plants.

## NASA's Clean Air Study

NASA's research identified plants that effectively remove common indoor air pollutants including:
- Formaldehyde
- Benzene
- Trichloroethylene
- Xylene
- Ammonia

## Top Air-Purifying Plants

### Easy-Care Options

#### Spider Plant (Chlorophytum comosum)
- **Removes**: Formaldehyde, xylene
- **Care**: Low light, infrequent watering
- **Benefits**: Safe for pets, produces baby plants
- **Placement**: Hanging baskets, shelves

#### Snake Plant (Sansevieria trifasciata)
- **Removes**: Formaldehyde, nitrogen oxide
- **Care**: Very low maintenance, drought tolerant
- **Benefits**: Releases oxygen at night
- **Placement**: Bedrooms, low-light areas

#### Pothos (Epipremnum aureum)
- **Removes**: Formaldehyde, benzene, xylene
- **Care**: Thrives in various light conditions
- **Benefits**: Fast-growing, easy propagation
- **Placement**: Hanging baskets, climbing supports

### High-Performance Purifiers

#### Peace Lily (Spathiphyllum)
- **Removes**: Ammonia, benzene, formaldehyde, trichloroethylene
- **Care**: Moderate light, regular watering
- **Benefits**: Beautiful white flowers, humidity indicator
- **Placement**: Bathrooms, living rooms

#### Rubber Plant (Ficus elastica)
- **Removes**: Formaldehyde
- **Care**: Bright, indirect light
- **Benefits**: Large leaves for maximum air contact
- **Placement**: Living rooms, offices

#### Boston Fern (Nephrolepis exaltata)
- **Removes**: Formaldehyde, xylene
- **Care**: High humidity, indirect light
- **Benefits**: Natural humidifier
- **Placement**: Bathrooms, kitchens

### Specialty Options

#### Bamboo Palm (Chamaedorea seifrizii)
- **Removes**: Formaldehyde, benzene, trichloroethylene
- **Care**: Medium light, regular watering
- **Benefits**: Non-toxic to pets
- **Placement**: Living areas, offices

#### English Ivy (Hedera helix)
- **Removes**: Formaldehyde, benzene
- **Care**: Cool temperatures, bright light
- **Benefits**: Reduces airborne mold
- **Placement**: Hanging baskets (keep away from pets)

## Maximizing Air Purification

### Plant Placement Strategy
- Use 15-18 plants in an 1,800 square foot home
- Place larger plants in main living areas
- Position plants near pollution sources (furniture, carpets)
- Ensure adequate light for plant health

### Care for Maximum Effectiveness
- Keep leaves clean by wiping or gentle showering
- Ensure proper drainage to prevent mold
- Rotate plants periodically for even growth
- Replace soil annually to maintain plant health

### Combining with Other Methods
- Use plants alongside air purifiers for maximum effect
- Maintain proper ventilation
- Control humidity levels (40-60%)
- Regular cleaning to reduce dust and allergens

## Common Mistakes to Avoid

### Overwatering
- Leads to mold growth and root rot
- Can increase indoor humidity excessively
- May create breeding grounds for pests

### Wrong Plant Selection
- Consider light conditions in your space
- Account for pet safety and allergies
- Choose plants appropriate for your care level

### Unrealistic Expectations
- Plants supplement but don't replace mechanical air purification
- Effects are gradual and cumulative
- Requires multiple plants for noticeable impact

## Additional Benefits

### Mental Health
- Reduces stress and anxiety
- Improves mood and productivity
- Creates connection with nature indoors

### Physical Environment
- Increases humidity in dry conditions
- Reduces noise levels
- Improves overall indoor aesthetics

### Economic Advantages
- Low-cost air purification method
- Long-term investment in health
- Many plants can be propagated for expansion

## Getting Started

### Beginner's Approach
1. Start with 2-3 easy-care plants
2. Learn proper care techniques
3. Gradually add more plants as you gain experience
4. Monitor improvements in air quality and comfort

### Resources for Success
- Local nurseries for plant selection and advice
- Online communities for care tips and troubleshooting
- Air quality monitors to track improvements
- Plant care apps for reminders and guidance

Remember: While plants are excellent natural air purifiers, they work best as part of a comprehensive indoor air quality strategy that includes proper ventilation, regular cleaning, and source control of pollutants.`,
    type: 'guide',
    category: 'Indoor Air Quality',
    date: '2024-01-12',
    readTime: '10 min read',
    author: 'Green Living Team',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b',
    priority: 'low'
  }
];

export const categories = [
  'All',
  'Health',
  'Technology',
  'Education',
  'Emergency Preparedness',
  'Fitness & Health',
  'Indoor Air Quality'
];

export const articleTypes = [
  { value: 'all', label: 'All Articles' },
  { value: 'precaution', label: 'Precautionary Steps' },
  { value: 'research', label: 'Research & Studies' },
  { value: 'guide', label: 'Guides & Tips' },
  { value: 'news', label: 'News & Updates' }
];