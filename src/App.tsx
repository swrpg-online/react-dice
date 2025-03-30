import { Die, DieType } from '@swrpg-online/react-dice';
import './App.css';

const narrativeDice: DieType[] = ['boost', 'proficiency', 'ability', 'setback', 'challenge', 'difficulty'];
const numericDice: DieType[] = ['d4', 'd6', 'd8', 'd12', 'd20', 'd100'];
const d4Variants = ['standard', 'apex', 'base'] as const;

function App() {
  return (
    <div className="app">
      <h1>Star Wars RPG Dice Viewer</h1>
      
      <section>
        <h2>Narrative Dice</h2>
        <div className="dice-grid">
          {narrativeDice.map((type) => (
            <div key={type} className="die-container">
              <h3>{type}</h3>
              <div className="die-variants">
                <div>
                  <p>Light Theme (SVG)</p>
                  <Die type={type} theme="light" format="svg" />
                </div>
                <div>
                  <p>Dark Theme (SVG)</p>
                  <Die type={type} theme="dark" format="svg" />
                </div>
                <div>
                  <p>Light Theme (PNG)</p>
                  <Die type={type} theme="light" format="png" />
                </div>
                <div>
                  <p>Dark Theme (PNG)</p>
                  <Die type={type} theme="dark" format="png" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Numeric Dice</h2>
        <div className="dice-grid">
          {numericDice.map((type) => (
            <div key={type} className="die-container">
              <h3>{type}</h3>
              <div className="die-variants">
                {type === 'd4' ? (
                  d4Variants.map((variant) => (
                    <div key={variant}>
                      <p>{variant} variant (SVG)</p>
                      <Die type={type} variant={variant} theme="light" format="svg" />
                    </div>
                  ))
                ) : (
                  <>
                    <div>
                      <p>Light Theme (SVG)</p>
                      <Die type={type} theme="light" format="svg" />
                    </div>
                    <div>
                      <p>Dark Theme (SVG)</p>
                      <Die type={type} theme="dark" format="svg" />
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App; 