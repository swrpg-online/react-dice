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

## Asset Handling (Important!)

This component library (`@swrpg-online/react-dice`) renders dice by generating image paths at runtime (e.g., `/assets/@swrpg-online/art/dice/numeric/white-arabic/D20-20-Arabic-White.svg`). It **does not** bundle the actual image assets from `@swrpg-online/art`.

Therefore, **it is the responsibility of the consuming application** to ensure that the dice assets from the `@swrpg-online/art` package are copied into its build output or public directory, making them accessible via the expected URL path structure: `/assets/@swrpg-online/art/dice/...`.

Most modern build tools (like Vite, Webpack, Parcel) require explicit configuration to copy static assets from `node_modules` into the final build.

### Example: Vite Configuration

If you are using Vite, you can use the `vite-plugin-static-copy` plugin:

1.  **Install the plugin:**
    ```bash
    npm install -D vite-plugin-static-copy
    # or
    yarn add -D vite-plugin-static-copy
    ```

2.  **Configure `vite.config.js`:**
    ```javascript
    // vite.config.js
    import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react';
    import { viteStaticCopy } from 'vite-plugin-static-copy';
    import path from 'path';

    export default defineConfig({
      plugins: [
        react(),
        // Add other plugins like svgr if needed...
        viteStaticCopy({
          targets: [
            {
              // Copy the dice assets from the art package
              src: path.resolve(__dirname, 'node_modules/@swrpg-online/art/dice'),
              // Place them in the 'assets/@swrpg-online/art' directory within your build output (e.g., dist)
              dest: 'assets/@swrpg-online/art' 
            }
          ]
        })
      ],
      // ... other vite config
    });
    ```

### Other Build Tools

If you are using a different build tool (e.g., Webpack, Parcel, Create React App with customization), you will need to find the equivalent method for copying directory contents from `node_modules` into your public/static assets folder during the build process, ensuring the final path matches `/assets/@swrpg-online/art/dice/...`. Consult your build tool's documentation for handling static assets.

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