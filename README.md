# Deal or No Deal – Simulation and Analysis

An interactive implementation of *Deal or No Deal*, developed using JavaScript and p5.js. The project combines game development with probability, statistical analysis and decision-making under uncertainty.

## Overview

The game recreates the main mechanics of Deal or No Deal, allowing players to open boxes, receive offers from the Banker and decide whether to accept an offer or continue playing.

It supports different versions of the game, with configurable rules and additional mechanics. The project also explores how a Banker might determine offers based on the remaining prize distribution and the progression of the game.

## Features

- **Interactive gameplay:** Recreates the main game, with different prize-box sets and configurable game settings.
- **Banker offer model:** Calculates offers using the mean of the remaining prizes, board safety, game progression, random variation and Banker mood.
- **Board risk analysis:** Evaluates the spread of remaining prize values, concentration of value in the largest prizes and jackpot-related risk.
- **Additional game mechanics:** Includes swapping, gambling, counter-offers, mid-round offers, the Button Game and Box 23 / Golden Case.
- **Special games:** Introduces additional rules and interactions, including a special Banker information mechanic.
- **Persistent settings and history:** Uses browser local storage to save game settings and previous game results.
- **Audio and visual elements:** Uses images, sound effects and background music to recreate the atmosphere of the game.

## Mathematical and Statistical Analysis

The Banker offer model incorporates several mathematical factors:

- **Expected value:** Calculates the mean of the remaining prize values as a reference for the offer.
- **Variance and spread:** Assesses the uncertainty associated with the remaining prizes.
- **Board safety:** Combines measures of prize dispersion, concentration and jackpot value to estimate the relative risk of the remaining board.
- **Game progression:** Adjusts offers according to the stage of the game and changes in the remaining prize distribution.
- **Random variation and Banker mood:** Introduces variation into offers rather than producing an identical offer for every equivalent board.

The model has also been compared against actual Banker offers from more than 70 episodes, providing observations to inform its development.

## Technologies

- JavaScript
- p5.js
- p5.sound
- HTML and CSS
- Browser Local Storage

## Running the Game

1. Download or clone this repository.
2. Open `index.html` in a web browser.
3. Ensure an internet connection is available, as p5.js and p5.sound are loaded from external CDNs.

## Future Development

- **Improve the offer model:** Analyse additional episodes to refine the model and improve the accuracy of predicted Banker offers.
- **Refine game timing:** Improve the timing and coordination of timeouts and transitions throughout gameplay.
- **Player risk tolerance:** Develop dynamic Banker offers that take estimated player risk tolerance into account.
- **Special-game mini-games:** Introduce skill-based mini-games during special games.
- **Box-opening animations:** Add animations to make box reveals more engaging.
- **Online leaderboard:** Allow players to compare results through an online leaderboard.
- **Visual improvements:** Improve the game's background and overall presentation.
