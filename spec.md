# @swrpg-online/react-dice Specification

## Purpose

The `@swrpg-online/react-dice` library provides React components for displaying Star Wars RPG dice assets in web applications. It serves as a visual interface layer for the `@swrpg-online/art` package, which contains the actual dice assets. The library is designed to make it easy to render both numeric dice (d4, d6, d8, d12, d20, d100) and narrative dice (boost, ability, proficiency, setback, difficulty, challenge) with various themes and display formats.

## Components

### Die Component

The library currently provides a single component, `Die`, which renders dice with various configurations:

#### Features

- Supports all standard numeric dice types (d4, d6, d8, d12, d20, d100)
- Supports all Star Wars RPG narrative dice types (boost, ability, proficiency, setback, difficulty, challenge)
- Configurable themes and numeral systems (e.g., white-arabic, black-aurebesh, movie-themed variants)
- Multiple D4 variants (standard, apex, base)
- Format switching (SVG or PNG)
- Graceful fallback when assets can't be loaded
- Automatic format fallback (tries PNG if SVG fails)
- Loading and error states

#### Implementation Details

The `Die` component:
1. Validates input props for dice type, face value, theme, and format
2. Constructs a path to the relevant asset in the `@swrpg-online/art` package
3. Renders an `<img>` element with the correct asset path
4. Provides loading and error states with appropriate visual feedback
5. Attempts to recover from load failures by trying alternative formats

## Architecture Decisions

### Image Path Construction

The library uses a convention-based approach to constructing image paths:

```
./node_modules/@swrpg-online/art/dice/[numeric|narrative]/[theme]/[DieType]-[FaceValue]-[Script]-[Style].[format]
```

The component includes multiple fallback strategies for path resolution:
1. First tries with `./node_modules/` prefix (relative path)
2. If that fails, tries without the `node_modules/` prefix 
3. If SVG format fails, tries PNG format

This approach allows for:
- Predictable asset locations
- Consistent naming conventions
- Compatibility with different build configurations
- Easy addition of new dice types or themes

### Standard HTML Elements vs. Dynamic Imports

The library uses standard `<img>` tags rather than dynamic imports for several reasons:

1. **Compatibility**: Standard HTML elements work reliably across different bundlers and frameworks
2. **Simplicity**: The code is easier to maintain without complex dynamic import logic
3. **Build Configuration Independence**: Works with any React application regardless of build setup
4. **Error Handling**: Native image loading provides built-in error events for better recovery

### Error Handling and Fallbacks

The library implements multiple fallbacks:
1. Format fallback: If SVG fails, attempts PNG
2. Visual fallback: If all image loading fails, shows an exclamation mark in an error-styled container

This ensures that users always get some visual feedback, even if the assets can't be loaded.

## Usage Examples

### Basic Usage

```jsx
import { Die } from '@swrpg-online/react-dice';

// Numeric dice
<Die type="d20" face={20} />
<Die type="d6" face={3} />

// Narrative dice
<Die type="boost" face="Success" />
<Die type="challenge" face="Failure-Despair" />
```

### With Custom Styling

```jsx
<Die 
  type="d20" 
  face={20} 
  className="large-die" 
  style={{ width: '100px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }} 
/>
```

### With Alternate Themes

```jsx
// Movie-themed dice with Aurebesh numerals
<Die type="d20" face={20} theme="rotj-aurebesh" />

// Black dice with Arabic numerals
<Die type="d8" face={8} theme="black-arabic" />
```

### D4 Variants

```jsx
<Die type="d4" face={4} variant="standard" />
<Die type="d4" face={4} variant="apex" />
<Die type="d4" face={4} variant="base" />
```

## Dependencies

The library relies on:
- React (>=16.8.0) and React DOM as peer dependencies
- `@swrpg-online/art` (^0.3.0) for the actual dice assets

## Asset Requirements

The library expects dice assets to be organized in the following structure in the `@swrpg-online/art` package:

```
/dice
  /numeric
    /white-arabic
      D4-01-Arabic-White.svg
      D4-02-Arabic-White.svg
      ...
    /black-aurebesh
      ...
  /narrative
    /Boost
      Boost-Success.svg
      ...
    /Challenge
      ...
```

Each die type follows a naming convention:
- Numeric dice: `[DieType]-[FaceNumber]-[Script]-[Style].[format]`
- Narrative dice: `[DieType]-[FaceResult].[format]`

## Design Considerations

### Performance

- The library avoids expensive operations during rendering
- Images are loaded asynchronously with appropriate loading states
- No runtime dependencies beyond React

### Accessibility

- Appropriate alt text is provided for screen readers
- Loading and error states use appropriate ARIA roles
- Visual error states have clear contrast

### Extensibility

The library is designed to be easily extended:
- New dice types can be added by expanding the `DieType` type
- New themes require only the addition of appropriate assets in the art package

## Future Improvements

Potential future enhancements include:
1. Animation support for dice rolls
2. Sound effects for dice rolls
3. Additional component variants (DicePool, DiceTable, etc.)
4. Server-side rendering optimizations
5. Data URL asset embedding for offline usage

## Asset Attribution

The library uses dice assets from the `@swrpg-online/art` package. Any usage should adhere to the licensing terms of that package. 