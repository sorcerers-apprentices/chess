# Chess

This is a web-based chess game built with **Angular** and powered by **chess.js** for the core game logic.  
The application uses **Supabase** as a backend database for storing game sessions, player data, and match history.  
The UI is implemented with **Taiga UI**, providing a clean and modern user experience.  
The project demonstrates a full-stack setup where Angular manages the client-side logic and Supabase handles persistence and real-time updates.

## Technology stack used

The project uses the following technologies:

#### Сore stack:

- Angular `v20.x`
- TypeScript
- RxJS
- NgRX
- SCSS

#### UI Kit:

- Taiga UI

#### Stack for testing:

- Jest

#### State Management Rationale

This project uses **Angular Signals** as the primary reactive primitive for local and component-level state.  
Signals were chosen for their simplicity, direct integration into Angular templates, and performance benefits due to fine-grained change detection.  
**RxJS** is still used where streams are a natural fit: handling async events, effects, and complex data flows (e.g., API calls, NgRx).  
This hybrid approach combines the clarity and ergonomics of signals with the expressive power of RxJS, ensuring both readability and scalability.

#### AI Assistance Notice

AI tools were used during the development of the backend part of this project. All generated code and suggestions were carefully reviewed and adapted by the development team.

## Setup and Running

Use `node 21.x` or higher.

### Client

- Clone this repo: `$ git clone https://github.com/sorcerers-apprentices/chess.git` (you need branch `develop`)
- Install dependencies: `$ npm install`
- Start server: `$ npm run start`
- Now you can open the client side to the address: `http://localhost:4200/` (if this port will be used by another application, the builder will automatically select another port and show it in the console)

## Available scripts

- `$ npm run start` — Starts the development server and automatically opens the project in the browser.
- `$ npm run start:host` — Starts the development server on the specified IP, useful for testing on a local network.
- `$ npm run build` — Builds the production version of the project into the `dist/` folder.
- `$ npm run watch` — Builds the project in `watch` mode with the `development` configuration.
- `$ npm run format` — Automatically formats all files using Prettier.
- `$ npm run format:check` — Checks if the files follow the Prettier formatting rules (no changes are applied).
- `$ npm run lint` — Runs Angular ESLint to check the project for code issues.
- `$ npm run lint:fix` — Fixes automatically correctable ESLint errors in TypeScript files.
- `$ npm run lint:scss` — Lints all `.scss` and `.css` files using Stylelint.
- `$ npm run lint:scss:fix` — Automatically fixes correctable Stylelint issues in `.scss` and `.css` files.
- `$ npm run prepare` — Initializes Husky and sets up Git hooks.
