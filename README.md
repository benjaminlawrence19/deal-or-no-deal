# Deal or No Deal — Interactive Simulation and Banker Offer Model

A browser-based implementation of *Deal or No Deal*, built with JavaScript and p5.js. The project recreates the core game and adds configurable rule sets, optional game mechanics, persistent game history and a custom Banker offer model.

The project also explores probability and decision-making under uncertainty. The Banker model evaluates the remaining prize board and adjusts its offers as the game progresses.

## Overview

The player selects a box, opens other boxes over a sequence of rounds and receives offers from the Banker. At each offer, the player can accept the deal or continue in the hope that their own box contains a higher prize. Depending on the selected settings, the game can also include swaps, counter-offers, a Button Game, a Gamble, a special-game sequence, Box 23 / the Golden Case and Jackpot Chase.

Three prize-board configurations are supported:

| Box set | Number of money boxes | Top prize |
|---|---:|---:|
| ITV | 22 | £100,000 |
| Channel 4 | 22 | £250,000 |
| US | 26 | $1,000,000 |

The separate Box 23 / Golden Case is additional to the money boxes. The selected box set determines the currency, prize distribution and certain game rules.

## Features

### Core gameplay

- Select a player box and keep it throughout the game unless a swap is accepted.
- Open the required number of boxes in each round to reveal their values.
- Receive Banker offers at the relevant points in the game.
- Choose to deal or reject the offer and continue.
- View the remaining prize board and offer history as the game develops.
- Complete the end-game reveal and see the final outcome.

### Configurable versions and rules

The settings menu supports ITV, Channel 4 and US prize boards. The round schedule can also be selected for the UK boards; the US schedule is fixed.

| Round structure | Boxes opened per round |
|---|---|
| ITV | 5, 3, 3, 3, 3, 2, 1 |
| Channel 4 | 5, 3, 3, 3, 3, 3 |
| US | 6, 5, 4, 3, 2, 1, 1, 1, 1 |

The game includes built-in presets such as the classic ITV, Channel 4 and US configurations, expanded configurations and Jackpot Chase variants. Three custom preset slots can be named and saved in the browser.

### Optional game mechanics

Each mechanic can be enabled or disabled in Settings. Changes apply to the next game.

- **Swap:** When two money boxes remain, the Banker may offer the player the opportunity to exchange their chosen box for the other remaining box.
- **Button Game:** After the first round, the player predicts the Banker's offer. A guess within 10% of the actual offer succeeds and unlocks the option to request a mid-round offer later in the game.
- **Counter Offer:** The player can propose an alternative amount to the Banker. The acceptance probability depends on the counter-offer relative to the current offer, the model's fair-offer reference and the mean of the remaining prizes. A rejected counter-offer means the original offer is no longer available.
- **Random mid-round offers:** When enabled, the game can trigger an additional offer between normal round offers if the remaining board changes sufficiently. The trigger is probabilistic and applies an adjustment to the offer.
- **Gamble:** After dealing, the player may be offered the chance to return to live play by giving back the amount already accepted. The remaining two-box outcome then determines the risk of continuing.
- **Special Game:** Adds a special sequence involving either the Clown Game or a Second Chance Button Game, depending on the settings and the game's selection. The Banker can inspect selected boxes and make claims about their values. The player can test those claims by opening boxes.
- **Box 23 / Golden Case:** After the main game, the player can choose whether to accept the additional case and apply its randomly selected effect to their winnings.
- **Jackpot Chase:** If the jackpot is not won, the next game can contain an additional jackpot in place of the next-highest prize. The number of jackpots can build over successive games, up to half of the money boxes.

### Box 23 / Golden Case outcomes

In a standard game, the possible effects depend on the selected box set:

| Box set | Possible effects |
|---|---|
| ITV | Double, +£5,000, Money Back, Half, Nothing |
| Channel 4 | Double, +£10,000, Money Back, Half, Nothing |
| US | Double, +$25,000, Money Back, Half, Nothing |

The Special Game uses a different set of five effects. It includes Double, Half, Quarter and Nothing, together with either one larger fixed bonus or two copies of a smaller fixed bonus. The bonus amounts depend on the selected box set.

## Banker Offer Model

The Banker offer model is a central part of the project. Rather than using only a fixed percentage of the average remaining prize, it combines information about the remaining board with game progression, randomness and a changing Banker mood.

### 1. Remaining-board analysis

For each offer, the model calculates the mean, minimum and maximum of the unopened money-box values. It also calculates a board-safety score from three measures:

- **Prize spread (70% of the risk score):** the standard deviation of the base-10 logarithms of the remaining prizes, scaled to represent the spread of values.
- **Largest-prize concentration (20%):** how dominant the largest remaining prize is relative to an equal share of the total remaining value.
- **Jackpot/value effect (10%):** an adjustment based on the size of the largest remaining prize.

These components are combined into an overall risk score and converted into a safety multiplier. A more dispersed or concentrated board generally receives a lower safety score. The calculation is a heuristic measure used by the offer model; it is not a probability of winning or a formal measure of player utility.

### 2. Offer calculation

The initial fair-offer estimate is based on the mean remaining prize, adjusted by several factors:

- the number of boxes remaining;
- the board-safety multiplier;
- the change in the logarithmic mean of the board since the start of the game;
- a round-specific adjustment in one of the six-round configurations.

The fair estimate is restricted relative to the mean, with an additional lower-bound adjustment when six or fewer money boxes remain. A small random factor is then applied, followed by the current Banker mood multiplier.

The result is rounded to a suitable denomination before being displayed. This produces offers that respond to both the composition of the remaining board and the sequence of boxes opened, rather than simply tracking the arithmetic mean.

### 3. Banker mood

The Banker's starting mood is influenced by the outcomes of previous games. The five most recent mood changes are weighted, with more recent games having greater influence. The resulting multiplier is constrained to a range of 0.875 to 1.125.

The mood change after a game depends on the result category and how the player's final amount compares with the offers and box value. The mood history is saved locally, so previous games can affect later offers in the same browser.

### 4. Special-game information

During a Special Game, the Banker may gain information about selected unopened boxes or the player's box. The offer model can use this information to adjust its estimate. The Second Chance version uses the Banker's stated claim about the player's box rather than directly substituting the actual box value into the calculation.

### 5. Mid-round adjustments

When Random Mid-Round Offers are enabled, the game compares the board before and after a box is opened. Large changes in the mean or board-safety score can create a chance of an additional offer. The adjustment depends on the type and size of the change.

The Button Game provides a separate, player-triggered route to a mid-round offer. These two mechanics are handled separately in the implementation.

## Episode Comparison and Development

The original project notes describe comparing the offer model with actual Banker offers from more than 70 episodes. Those observations informed the development and refinement of the offer behaviour.

The supplied project archive contains the game implementation and its assets, but does not include the episode-level comparison dataset or a separate analysis notebook. The episode comparison therefore cannot be independently reproduced from this archive alone.

## Statistics and Saved Data

The Statistics screen records completed games and displays an overall record, a game-history table and summaries by box set. The saved game history includes:

- selected box set and whether Jackpot Chase was active;
- the player's box value;
- the highest Banker offer;
- the amount taken home;
- the final result category.

Results are classified as **Spanked**, **Beat**, **Drew**, **Lost** or **Humbled**. The screen also groups outcomes into wins, draws and losses.

Settings, custom presets, game history and Banker mood history are stored using browser `localStorage`. This means the data is associated with the browser and device being used; it is not synchronised to an online account or server.

## Project Structure

```text
.
├── index.html
├── sketch.js
├── style.css
├── images/
│   ├── Background_Image.jpg
│   ├── Start_Screen_Background.jpg
│   ├── Box_1.jpg ... Box_23.jpg
│   ├── Case_1.jpg ... Case_26.jpg
│   └── Golden_Case.jpg
└── sound/
    ├── background music
    ├── box-opening sounds
    ├── Banker phone / offer sounds
    └── crowd reactions
```

- **`index.html`** loads p5.js, p5.sound, the stylesheet and the main JavaScript file.
- **`sketch.js`** contains the game model, state machine, Banker offer calculations, game mechanics, user-interface rendering and statistics.
- **`style.css`** provides the basic page and canvas styling.
- **`images/`** contains the box and case artwork, backgrounds and Golden Case image.
- **`sound/`** contains music, sound effects and crowd reactions.

The implementation uses a `GameModel` to manage the game state, a state machine to control the different screens and interactions, and separate audio and UI systems. The game is organised around p5.js lifecycle functions such as `preload()`, `setup()` and `draw()`.

## Technologies

- **JavaScript** — game logic, offer calculations and interactive behaviour
- **p5.js** — canvas rendering and interaction
- **p5.sound** — music and sound effects
- **HTML and CSS** — page structure and presentation
- **Browser `localStorage`** — settings, presets, game history and Banker mood history

## Running the Game

1. Download or clone the project.
2. Keep `index.html`, `sketch.js`, `style.css`, `images/` and `sound/` in the same directory structure.
3. Open `index.html` in a modern browser.
4. Ensure an internet connection is available: p5.js and p5.sound are loaded from external CDNs.

The supplied `index.html` references p5.js 1.11.5 and p5.sound 1.11.3 from public CDNs. A local web server can be used if preferred:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/` in the browser.

## Limitations and Possible Extensions

The Banker model is a hand-designed heuristic, not a trained predictive model or an optimisation of expected utility. Random variation and the mood system are intended to create variation in gameplay. The model's comparison with real episodes is not packaged as a reproducible data-analysis workflow in this repository.

Possible future improvements include:

- adding the episode-level offer dataset and a reproducible comparison script;
- quantifying prediction error between simulated and observed Banker offers;
- testing alternative offer-model parameters against held-out episodes;
- exploring player risk preferences and how they affect deal decisions;
- improving animation timing, transitions and visual presentation;
- adding an online leaderboard or a persistent cross-device save system.
