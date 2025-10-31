# **App Name**: ClubConnect

## Core Features:

- Multi-Tenant Club Setup: Allows a 'userAdmin' to register a new club, automatically creating a unique 'clubID' to isolate and manage club-specific data. Guarantees that data from one club is never visible to users of another club.
- Member Management: Enables the 'userAdmin' to add and manage members, each assigned a unique 'clientID' within the club. Includes ID photo capture during registration. Also allows registering members which might already be members of a different club
- Inventory Management: Manages the club's inventory, allowing the addition of items with details like name, group, category, minimum sale unit, and price per unit. Refill function to update stock levels.
- Point of Sale (POS) System: Facilitates sales with a form for member, item, and quantity input. Includes a shopping cart and a 'confirm dispense' button to update inventory in real time. A confirmation screen must also be displayed, showing final quantities of the items dispensed
- Sales Statistics Dashboard: Generates visualizations of sales data, stock levels, and low-stock item rankings. Data-driven insights based on 'members' and 'inventory' data, starting from zero upon app creation.
- Transaction History: Logs all refill and dispense transactions for audit and record-keeping purposes.
- User Engagement and Rewards: Incorporates a rewards system to encourage daily interaction, task completion, and app engagement. This includes unlocking UI customization features. AI tool will be used to choose how and when to apply points and level benefits, tailored to user habits and expressed preferences.

## Style Guidelines:

- Primary color: Rich Gold (#D4AF37) to evoke sophistication and exclusivity.
- Background color: Onyx (#353839), a very dark and desaturated color to set a dark theme and let the other elements stand out.
- Accent color: Vibrant Green (#39FF14) for highlighting key actions and elements, such as buttons or important data points.
- Headline font: 'Poppins', a geometric sans-serif, provides a precise, contemporary, and fashionable look for headlines and titles.
- Body font: 'Inter', a grotesque-style sans-serif for a neutral and readable style. Note: currently only Google Fonts are supported.
- Use minimalist icons that align with the theme.
- Clean and organized layout with clear sections for easy navigation.