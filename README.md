# @swrpg-online/react-dice

React components for displaying Star Wars RPG narrative and numeric dice assets from the `@swrpg-online/art` package.

## Installation

```bash
npm install @swrpg-online/react-dice
```

## Usage

```jsx
import { Die } from '@swrpg-online/react-dice';

// Using SVG dice
<Die type="boost" format="svg" theme="light" />
<Die type="proficiency" format="svg" theme="dark" />

// Using PNG dice
<Die type="ability" format="png" theme="light" />
<Die type="challenge" format="png" theme="dark" />

// Using numeric dice
<Die type="d4" format="svg" theme="light" variant="standard" />
<Die type="d4" format="svg" theme="dark" variant="apex" />
<Die type="d4" format="svg" theme="light" variant="base" />

// Other numeric dice
<Die type="d6" format="png" theme="dark" />
<Die type="d8" format="svg" theme="light" />
<Die type="d12" format="png" theme="dark" />
<Die type="d20" format="svg" theme="light" />
<Die type="d100" format="png" theme="dark" />
```

## Props

### Die Component

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| type | string | Yes | - | The type of die to display. Can be one of: 'boost', 'proficiency', 'ability', 'setback', 'challenge', 'difficulty', 'd4', 'd6', 'd8', 'd12', 'd20', 'd100' |
| format | 'svg' \| 'png' | No | 'svg' | The format of the die asset to display |
| theme | 'light' \| 'dark' | No | 'light' | The color theme of the die |
| variant | 'standard' \| 'apex' \| 'base' | No | 'standard' | The variant of the d4 die (only applicable when type is 'd4') |
| className | string | No | - | Additional CSS class names to apply to the die |
| style | CSSProperties | No | - | Additional inline styles to apply to the die |

## Development

1. Install dependencies:
```bash
npm install
```

2. Run tests:
```bash
npm test
```

3. Build the package:
```bash
npm run build
```

## License

MIT 