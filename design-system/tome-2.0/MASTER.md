# Tome 2.0 Design System (Master)

## Aesthetic: "Ethereal Intelligence"
- **Core Concept**: Deep space meets glass prisms. Dark, moody backgrounds with vibrant, glowing functional elements.
- **Reference**: The "My Evernote" redesign image (Purple/Amber/Glass).

## Color Palette (Tailwind Tokens)

### Backgrounds
- `bg-background`: `#0F0F16` (Deep Space Black)
- `bg-card`: `rgba(255, 255, 255, 0.03)` (Glass Surface)
- `bg-card-highlight`: `rgba(255, 255, 255, 0.08)` (Hover/Active Glass)

### Gradients (The "Vibe")
- **Purple Haze**: `from-[#4c1d95] via-[#5b21b6] to-transparent` (Context: Creative/Ideas)
- **Amber Glow**: `from-[#f59e0b] via-[#d97706] to-transparent` (Context: Action/Tasks)
- **Teal Focus**: `from-[#0d9488] via-[#0f766e] to-transparent` (Context: Success/Done)

### Text
- `text-foreground`: `#FAFAFA` (Primary)
- `text-muted`: `#A1A1AA` (Secondary)
- `text-accent`: `#C4B5FD` (Soft Purple for highlights)

## Typography
- **Font Family**: 'Outfit' (Geometric Sans)
- **Weights**: 
  - `Light (300)`: Large display numbers, subtle captions.
  - `Regular (400)`: Body text.
  - `Medium (500)`: Navigation, buttons.
  - `Bold (700)`: Headings.

## UI Patterns

### 1. The "Bento" Card
- Rounded corners (`rounded-[32px]`).
- Glass background (`bg-white/5` + `backdrop-blur-xl`).
- 1px subtle border (`border-white/10`).
- Inner padding: `p-6`.

### 2. Floating Navigation
- Not a solid bar. A floating capsule at the bottom.
- Blur effect background.

### 3. Glow Effects
- Use absolute positioned `View` with `blur-3xl` behind key elements to create "atmosphere".

## Animation (Reanimated)
- **Springs**: Damping 20, Stiffness 90 (Soft, fluid motion).
- **Transitions**: All elements should `FadeInDown` or `ZoomIn` gently.
