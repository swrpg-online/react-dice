# @swrpg-online/react-dice

React components for displaying Star Wars RPG narrative and numeric dice assets from the `@swrpg-online/art` package.

## Installation

```bash
npm install @swrpg-online/react-dice
```

## Usage

```jsx
import { Die } from '@swrpg-online/react-dice';

// Using SVG dice with Arabic numerals
<Die type="boost" format="svg" theme="white-arabic" />
<Die type="proficiency" format="svg" theme="black-arabic" />

// Using SVG dice with Aurebesh numerals
<Die type="boost" format="svg" theme="white-aurebesh" />
<Die type="proficiency" format="svg" theme="black-aurebesh" />

// Using movie themes with Arabic numerals
<Die type="ability" format="png" theme="anh-arabic" />
<Die type="challenge" format="png" theme="tfa-arabic" />

// Using movie themes with Aurebesh numerals
<Die type="ability" format="png" theme="anh-aurebesh" />
<Die type="challenge" format="png" theme="tfa-aurebesh" />

// Using numeric dice with different variants
<Die type="d4" format="svg" theme="white-arabic" variant="standard" />
<Die type="d4" format="svg" theme="black-aurebesh" variant="apex" />
<Die type="d4" format="svg" theme="rots-arabic" variant="base" />

// Other numeric dice examples
<Die type="d6" format="png" theme="tesb-arabic" />
<Die type="d8" format="svg" theme="rotj-aurebesh" />
<Die type="d12" format="png" theme="tpm-arabic" />
<Die type="d20" format="svg" theme="tlj-aurebesh" />
<Die type="d100" format="png" theme="tros-arabic" />
```

## Props

### Die Component

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| type | string | Yes | - | The type of die to display. Can be one of: 'boost', 'proficiency', 'ability', 'setback', 'challenge', 'difficulty', 'd4', 'd6', 'd8', 'd12', 'd20', 'd100' |
| format | 'svg' \| 'png' | No | 'svg' | The format of the die asset to display |
| theme | string | No | 'white-arabic' | The theme and numeral system of the die. Format is '{color}-{numerals}' or '{movie}-{numerals}' where numerals is either 'arabic' or 'aurebesh'. Movies: anh (A New Hope), rotj (Return of the Jedi), etc. |
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